"""
Invoke tasks for building album_gui and assembling a runnable dist/ folder.

Usage:
    inv configure                 # cmake configure (Debug by default)
    inv build                     # cmake build (runs configure if needed)
    inv copy-dlls                 # locate + copy runtime DLLs into dist/
    inv dist                      # build + copy-dlls in one shot
    inv clean                     # remove the build directory
    inv keepgit-clean             # remove build/, but keep _deps/ and cargo/
                                  # (avoids re-cloning from GitHub / re-compiling
                                  # every Rust crate on a slow connection)

    inv build --config=Release
    inv dist --config=Release

Install once:
    pip install invoke
"""

import os
import shutil
import sys
from pathlib import Path
from typing import cast

from anson.io.odysz.anson import Anson, AnsonException
from anson.io.odysz.common import passwd_allow_ext, LangExt, Utils
from anson.io.odysz.utils import zip2
from invoke import task
from semanticshare.io.odysz.semantic.x import SemanticException
from semanticshare.io.oz.anclient.app import DesktopSettings
from semanticshare.io.odysz.semantic.jprotocol import JServUrl
from semanticshare.io.oz.invoke import SynodeTask


taskcfg = cast(SynodeTask, None)

# ---------------------------------------------------------------------------
# Project layout — adjust these two if your repo is laid out differently.
# ---------------------------------------------------------------------------
ROOT_DIR = Path(__file__).resolve().parent
BUILD_DIR = ROOT_DIR / "qt-build"
'''
@deprecated Use the configure from tasks.json, by calling pth_buildir()
'''
def pth_buildir(taskconfig: SynodeTask = None) -> Path:
    '''
    :param taskconfig:
    :return: e.g. qt-build/dist
    '''
    global taskcfg
    if taskconfig is None:
        taskconfig = taskcfg

    if taskconfig is None:
        warn("No task configure can be found")
        sys.exit(-1)

    return Path(taskconfig.desktop_dist_dir)


def pth_packagedir(taskconfig: SynodeTask = None) -> Path:
    global taskcfg
    if taskconfig is None:
        taskconfig = taskcfg

    if taskconfig is None:
        warn("No task configure can be found")
        sys.exit(-1)

    return Path(taskconfig.package_dir)


DIST_DIR = BUILD_DIR / "dist"
'''
@deprecated Use the configure from tasks.json
'''

# Matches VCPKG_INSTALLED_DIR in the root CMakeLists.txt
# (${CMAKE_SOURCE_DIR}/../../../vcpkg/installed)
VCPKG_INSTALLED_DIR = ROOT_DIR / "../../../vcpkg/installed"
VCPKG_TRIPLET = "x64-mingw-dynamic"

TARGET_NAME = "album_gui"

# DLLs pulled from vcpkg's install tree (names may drift with library
# version bumps — adjust if a `where`/`find` shows a different filename).
VCPKG_DLL_NAMES = [
    "libboost_url-*.dll",
    "libcrypto-3-x64.dll",
    "libssl-3-x64.dll",
    "libz*.dll",
]

# DLLs that come from CMake FetchContent-built subprojects (searched for
# under build/_deps rather than a fixed path, since the exact subbuild
# folder name can change).
FETCHCONTENT_DLL_NAMES = [
    "slint_cpp.dll",
    "libcpr.dll",
]

# MinGW compiler runtime DLLs — must come from the SAME g++ that built the
# exe. See tasks below: located next to whatever `where g++` resolves to.
MINGW_RUNTIME_DLL_NAMES = [
    "libgcc_s_seh-1.dll",
    "libgcc_s_dw2-1.dll",  # alternate exception model name, one of the two will exist
    "libstdc++-6.dll",
    "libwinpthread-1.dll",
]

# Top-level entries directly under build/ to preserve when doing a
# "clean but keep what's expensive to re-fetch/re-build" reset:
#   _deps  — FetchContent-downloaded sources + their subbuild stamp files
#            (deleting these forces re-cloning from GitHub on reconfigure)
#   cargo  — Corrosion/cargo target dir for Slint's Rust crates (deleting
#            this forces a full recompile of every crate, not a re-download,
#            but it's just as slow to rebuild)
KEEP_DIRS_ON_CLEAN = {"_deps", "cargo"}


def _gxx_bin_dir():
    """Directory containing the g++ that's actually on PATH (mirrors `where g++`)."""
    gxx = shutil.which("g++") or shutil.which("g++.exe")
    if not gxx:
        raise RuntimeError("g++ not found on PATH — cannot locate matching MinGW runtime DLLs")
    return Path(gxx).resolve().parent


def _vcpkg_bin_dir(config):
    """vcpkg's DLL output dir for the active triplet + build type."""
    base = (VCPKG_INSTALLED_DIR / VCPKG_TRIPLET).resolve()
    return (base / "debug" / "bin") if config.lower() == "debug" else (base / "bin")


def _copy_if_found(src_dir, name_patterns, dest, label):
    """Glob src_dir for each pattern and copy first match to dest. Warns if none found."""
    dest.mkdir(parents=True, exist_ok=True)
    copied = []
    for pattern in name_patterns:
        matches = list(src_dir.glob(pattern)) if src_dir.exists() else []
        if not matches:
            print(f"  [WARN] {label}: no match for '{pattern}' in {src_dir}")
            continue
        for m in matches:
            shutil.copy2(m, dest / m.name)
            copied.append(m.name)
    return copied


def _copy_from_tree(search_root, filenames, dest):
    """Recursively search search_root for exact filenames (used for FetchContent
    build outputs, whose folder names vary), copy first match of each."""
    dest.mkdir(parents=True, exist_ok=True)
    copied = []
    for name in filenames:
        matches = list(search_root.rglob(name)) if search_root.exists() else []
        if not matches:
            print(f"  [WARN] fetchcontent dll: '{name}' not found under {search_root}")
            continue
        shutil.copy2(matches[0], dest / name)
        copied.append(name)
    return copied


def _generator_output_exists(generator):
    """The actual file cmake --build depends on for this generator — a partial/
    failed configure can leave CMakeCache.txt behind without this file."""
    if generator.lower() == "ninja":
        return (BUILD_DIR / "build.ninja").exists()
    if "makefiles" in generator.lower():
        return (BUILD_DIR / "Makefile").exists()
    # Visual Studio / other generators: fall back to cache-only check
    return (BUILD_DIR / "CMakeCache.txt").exists()


@task
def configure(ctx, config="Debug", generator="MinGW Makefiles"):
    """cmake configure step."""
    BUILD_DIR.mkdir(parents=True, exist_ok=True)
    ctx.run(
        f'cmake -S "{ROOT_DIR}" -B "{BUILD_DIR}" -G "{generator}" '
        f'-DCMAKE_BUILD_TYPE={config}'
    )


@task
def build(ctx, config="Debug", target=TARGET_NAME, generator="MinGW Makefiles", reconfigure=False):
    """cmake build step (configures first if missing, incomplete, or --reconfigure)."""
    if reconfigure or not _generator_output_exists(generator):
        configure(ctx, config=config, generator=generator)
    ctx.run(f'cmake --build "{BUILD_DIR}" --target {target} --config {config}')


@task
def copy_dlls(ctx, config="Debug"):
    """
    Locate and copy every runtime DLL album_gui.exe needs into dist/:
      - MinGW compiler runtime, from the same g++ currently on PATH
      - vcpkg-built dependencies (boost_url, openssl, zlib, ...)
      - FetchContent-built libraries (slint_cpp, cpr)
    """
    DIST_DIR.mkdir(parents=True, exist_ok=True)

    print(f"dist dir: {DIST_DIR}")

    gxx_dir = _gxx_bin_dir()
    print(f"g++ bin dir: {gxx_dir}")
    mingw_copied = _copy_from_tree(gxx_dir, MINGW_RUNTIME_DLL_NAMES, DIST_DIR)
    print(f"  copied MinGW runtime: {mingw_copied}")

    vcpkg_bin = _vcpkg_bin_dir(config)
    print(f"vcpkg bin dir: {vcpkg_bin}")
    vcpkg_copied = _copy_if_found(vcpkg_bin, VCPKG_DLL_NAMES, DIST_DIR, "vcpkg")
    print(f"  copied vcpkg dlls: {vcpkg_copied}")

    deps_dir = BUILD_DIR / "_deps"
    print(f"FetchContent deps dir: {deps_dir}")
    fc_copied = _copy_from_tree(deps_dir, FETCHCONTENT_DLL_NAMES, DIST_DIR)
    print(f"  copied FetchContent dlls: {fc_copied}")

    missing = (
        [n for n in MINGW_RUNTIME_DLL_NAMES if n not in mingw_copied
         and n != "libgcc_s_dw2-1.dll"]  # one of the two exception-model DLLs is expected to miss
        + [n for n in FETCHCONTENT_DLL_NAMES if n not in fc_copied]
    )
    if missing:
        print(f"\n[WARN] still missing, copy manually if the exe fails to start: {missing}")
    else:
        print("\nAll expected DLLs copied.")

    # global taskcfg
    # if taskcfg is None:
    #     taskcfg = cast(SynodeTask, Anson.from_file(deploy))
    # cp_wsagent_jar(taskcfg)


@task
def dist(ctx, config="Debug", target=TARGET_NAME, generator="Ninja", reconfigure=False):
    """Build the exe, then assemble dist/ with all required DLLs and assets."""
    build(ctx, config=config, target=target, generator=generator, reconfigure=reconfigure)
    copy_dlls(ctx, config=config)
    print(f"\nDone. Run: {DIST_DIR / (target + '.exe')}")


def _rmtree_onerror(func, path, exc_info):
    """shutil.rmtree error handler: git marks pack files read-only on Windows,
    which blocks os.unlink. Clear the attribute and retry once."""
    import os
    import stat

    os.chmod(path, stat.S_IWRITE)
    func(path)


@task
def clean(ctx, deploy: str = 'tasks.json'):
    """Remove the build directory entirely."""
    # if BUILD_DIR.exists():
    #     shutil.rmtree(BUILD_DIR, onerror=_rmtree_onerror)
    #     print(f"Removed {BUILD_DIR}")
    # else:
    #     print("Nothing to clean.")

    global taskcfg
    if taskcfg is None:
        taskcfg = cast(SynodeTask, Anson.from_file(deploy))

    buildir = pth_buildir(taskcfg)
    if buildir.exists():
        shutil.rmtree(buildir, onerror=_rmtree_onerror)
        print(f"Removed {buildir}")
    else:
        print("Nothing to clean.")

    pkg_dir = pth_packagedir()
    if pkg_dir.exists():
        shutil.rmtree(pkg_dir, onerror=_rmtree_onerror)
        print(f"Removed {pkg_dir}")
    else:
        print("Nothing to clean.")


@task(name="keepgit-clean")
def keepgit_clean(ctx):
    """
    Remove everything under build/ EXCEPT _deps/ and cargo/, then leave build/
    itself in place. Use this instead of `clean` when reconfiguring is needed
    (e.g. after a CMakeLists.txt change) but re-downloading FetchContent
    sources from GitHub, or recompiling every Rust crate under cargo/, would
    be too slow to redo.

    Note: FetchContent tracks whether a dependency is already populated via
    stamp files inside _deps/<name>-subbuild/, not via CMakeCache.txt, so
    wiping the rest of build/ and keeping _deps/ still gets you a genuinely
    clean reconfigure without re-triggering clones for content that hasn't
    changed.
    """
    if not BUILD_DIR.exists():
        print("Nothing to clean.")
        return

    removed = []
    kept = []
    for item in BUILD_DIR.iterdir():
        if item.name in KEEP_DIRS_ON_CLEAN:
            kept.append(item.name)
            continue
        if item.is_dir():
            shutil.rmtree(item, onerror=_rmtree_onerror)
        else:
            item.unlink()
        removed.append(item.name)

    print(f"Removed: {removed}")
    print(f"Kept (preserved to avoid re-fetch/re-build): {kept}")

    wsjar_path = ROOT_DIR / 'test' / 'res'
    copied = Utils.copy_anyway('../example.wsagent/target/ws-agent-?.?.?.jar', wsjar_path)
    print(f"Copied:", copied)

def validsettings(s: DesktopSettings):
    '''
    For latest requirement, see slint app slingleton::validsettings()
    bool validsettings() {
        // can only be hacked
        langext::mustnonull(appsettings.market);
        langext::mustnonull(appsettings.synuri);
        langext::mustnonull(appsettings.sysuri);
        langext::mustnonull(appsettings.java_path);
        langext::mustnonull(appsettings.wsagent_jar);
        langext::mustnonull(appsettings.wshost);
        langext::mustin(appsettings.wsport, 1024, 65536);
        LangExt::mustnonull(appsettings.regiserv);
    :param s:
    :return:
    '''
    if LangExt.isblank(s.market_id): raise SemanticException('market id is empty')
    if LangExt.isblank(s.synuri): raise SemanticException('client syn func-id is empty')
    if LangExt.isblank(s.sysuri): raise SemanticException('client sys func-id is empty')
    if LangExt.isblank(s.java_path): raise SemanticException('java-path is empty')
    if LangExt.isblank(s.wsagent_jar): raise SemanticException('wsagent_jar is empty')
    if LangExt.isblank(s.wshost): raise SemanticException('wshost is empty')
    if s.wsport < 1024 or s.wsport >= 65536: raise SemanticException('wsport is not in range of [1024, 65536).')
    if LangExt.isblank(s.regiserv): raise SemanticException('regiserv is empty')

def create_desktop_settings(taskcfg: SynodeTask) -> str:
    """
    Create an app-settings.json for desktop, return the relative file path, for slint/tasks.py --appsettings arg.

    Initial package only setup market, market-id, java_path, regiserv, centralPswd, wshost, wsport, wsagent_jar.

    Installer needs to setup synode-id and vol, jserv, etc.
    :return: the generated json's relative path to desktop dir
    """
    relative_pth = "dist-settings-temp.json"

    desksets = cast(DesktopSettings, Anson.from_file('app/settings/app-settings.github.json'))
    try: validsettings(desksets)
    except SemanticException as e:
        Utils.warn(f'**** ERROR **** Desktop settings is invalid: ' + e.msg)
        sys.exit(-1)

    desksets.market = taskcfg.deploy.market_id
    desksets.market_name = taskcfg.deploy.market
    desksets.org = taskcfg.deploy.orgid
    desksets.synode_id = ""
    desksets.device = ""
    desksets.admin = taskcfg.deploy.admin
    desksets.domain_token = taskcfg.deploy.domain_token # default, overwrite by installer

    desksets.java_path = 'jre17/bin/java'
    desksets.doctier_jar = f'not used'
    desksets.regiserv = JServUrl(https= False, iport =taskcfg.deploy.central_iport,
                                 protocolroot = taskcfg.deploy.central_path).jserv()
    desksets.synode_vol = ''
    desksets.synode_jserv = ''
    desksets.album_web = str(taskcfg.deploy.web_port)
    desksets.wshost = '127.0.0.1'
    desksets.wsport = taskcfg.deploy.ws_port
    desksets.wsagent_jar = f'res/ws-agent-{taskcfg.ipcagent_ver}.jar'

    # Portfolio 0.8.0, changing central pswd is not implemented
    try:
        LangExt.only_passwdlen(taskcfg.deploy.central_pswd, minlen=6, maxlen=16)
    except AnsonException:
        Utils.warn(f"token length must be in [8 ~ 16], allowed special chars: [{passwd_allow_ext}]")
        sys.exit()
    desksets.centralPswd = taskcfg.deploy.central_pswd

    desksets.toFile(relative_pth)

    Utils.logi("============= Desktop Settings:", Path(relative_pth).absolute())
    Utils.logi(desksets.toBlock())
    return relative_pth


@task
def deploy_settings(ctx, deploy: str = "tasks.json"):
    global taskcfg
    if taskcfg is None:
        taskcfg = cast(SynodeTask, Anson.from_file(deploy))

    new_sets = create_desktop_settings(taskcfg)
    dist_dir = Path(taskcfg.desktop_dist_dir)
    Utils.rm_any(dist_dir / 'settings')
    Utils.copy_anyway(new_sets, dist_dir / 'settings' / 'app-settings.json')


@task(name="shallow-pack")
def shallow_pack(ctx,
                 deploy: str = 'tasks.json',
                 config="Debug", target=TARGET_NAME, generator="Ninja"
                 ):
    """
    Assemble dist/ for to, e.g. qt-build/dist, in which the resources for final packing,
    while avoiding the expensive build step when possible:
    builds only if the target exe isn't already present, then always
    (re)copies the runtime DLLs.

    The app-settings.json for packaging must be generated and is ready for distribution.
    """

    exe_path = DIST_DIR / (target + ".exe")

    if exe_path.exists():
        print(f"{exe_path} already exists — skipping build.")
    else:
        print(f"{exe_path} not found — building first.")
        build(ctx, config=config, target=target, generator=generator)

    copy_dlls(ctx, config=config)
    deploy_settings(ctx, deploy)
    print(f"\nDone. Run: {exe_path}")

app_name: str = 'album-desktop'

@task
def zip_standalone(ctx, deploy: str = 'tasks.json'):
    """
    Create a the stand alone GUI app package, into dist_zip(), e.g. build-0.8.0.
    
    Args:
        c: Invoke Context object for running commands.
        zip: Name of the output ZIP file.
    """
    shallow_pack(ctx, deploy=deploy)
    global  taskcfg, app_name
    if taskcfg is None:
        taskcfg = cast(SynodeTask, Anson.from_file(deploy))

    zip = taskcfg.deskzip_name() # f'{app_name}-{taskcfg.version}.zip'
    resources = {
        ".": f"{taskcfg.desktop_dist_dir}/*",
        # TODO fix this
        # "jre17": taskcfg.jre_release
    }
    excludes = ['*.log', 'report.html', '*.github.json']

    try:
        print('------------ packing desktop --------------')
        print(resources)

        err = False

        # Ensure the output directory for the ZIP exists
        output_dir = os.path.dirname(zip) or "."
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)
        
        if os.path.isfile(zip):
            os.remove(zip)

        print(Path(zip).absolute())
        zip2(zip, {**resources}, excludes)

        zip = Utils.move_anyway(zip, pth_packagedir(), log=True)

        print('****************************************************************************************************',
             f'* Stand alone ZIP package is created successfully: {zip}' if not err else 'Errors while making target (creaded zip file)',
              '****************************************************************************************************',
              sep='\n')

    except Exception as e:
        print(f"Error creating ZIP file: {str(e)}", file=sys.stderr)
        raise


