"""
Invoke tasks for building album_gui and assembling a runnable dist/ folder.

Usage:
    inv configure                 # cmake configure (Debug by default)
    inv build                     # cmake build (runs configure if needed)
    inv copy-dlls                 # locate + copy runtime DLLs into dist/
    inv dist                      # build + copy-dlls in one shot
    inv clean                     # remove the build directory

    inv build --config=Release
    inv dist --config=Release

Install once:
    pip install invoke
"""

import shutil
import subprocess
from pathlib import Path

from invoke import task

# ---------------------------------------------------------------------------
# Project layout — adjust these two if your repo is laid out differently.
# ---------------------------------------------------------------------------
ROOT_DIR = Path(__file__).resolve().parent
BUILD_DIR = ROOT_DIR / "build"
DIST_DIR = BUILD_DIR / "dist"

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


@task
def dist(ctx, config="Debug", target=TARGET_NAME, generator="MinGW Makefiles", reconfigure=False):
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
def clean(ctx):
    """Remove the build directory entirely."""
    if BUILD_DIR.exists():
        shutil.rmtree(BUILD_DIR, onerror=_rmtree_onerror)
        print(f"Removed {BUILD_DIR}")
    else:
        print("Nothing to clean.")
