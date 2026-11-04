#!/usr/bin/env python3
"""
Compare the @anclient/* packages a project builds with against their sources in this
repository (Anclient/js/<package>), and open the differences in VS Code.

Temporarily also semantic-doc, the doc-tree editor, until it moves into anreact: album installs
it from its tarball (album/node_modules/semantic-doc, a copy), compared with its sources,
github/semantic-doc/src (--sdoc-src). It is listed only for the projects that install it.

Projects can use @anclient/* from different locations, and different versions:
    <project>/node_modules/@anclient/*      its own npm install, a copy (each project installs its own;
                                            example.js/node_modules has no @anclient/* since 0.8.0)
    a symlink to the sources                npm link / "file:" dependencies (album, registry.ts)
    ../../js/anreact                        the sources, aliased in webpack.config.js

Release lines: anreact 0.7.x (React 17, MUI 4, ag-grid: north-star, curriculum) and
0.8.x (React 19, MUI 9: album, registry.ts, the sources). A copy of another release line than the
sources is marked, and can be compared, but s / u won't copy files between them: that would
break the receiving side. Compare it with a checkout of its own release line instead, e.g.
    git worktree add /tmp/anclient-0.7 <commit of 0.7.x>
    python3 diff-anclient.py album --src /tmp/anclient-0.7/js

For each project, the location is found the way the build finds it: the resolve.alias of
webpack.config.js first, then the node_modules of the project folder and its parents.

Usage (in examples/example.js):
    python3 diff-anclient.py                 list the projects and their @anclient locations, pick one
    python3 diff-anclient.py album           compare album's @anclient/* with the sources
    python3 diff-anclient.py album -p anreact
    python3 diff-anclient.py album -p semantic-doc
    python3 diff-anclient.py album --sdoc-src ~/github/semantic-doc/src
    python3 diff-anclient.py --src ~/github/anclient/js
    python3 diff-anclient.py -h

Then it lists the files that differ, and asks:
    3         open file 3 in VS Code's diff editor
    1 4 7     several
    a         all modified files
    s 3 5     copy files 3 and 5 from the source into the project's copy (source only, modified)
    u 4       copy file 4 from the project's copy into the source (used only, modified)
    s a, u a  all the files that can be copied that way
    x         swap the sides of the diff editor (which file is on the right)
    f         open the whole package pair in VS Code, with the Compare Folders extension
    r         rescan
    q         quit

Editing in both directions, in VS Code:
  - diff editor (3, a): the right side is the one to edit; the arrows in the gutter between
    the sides copy a change from the left to the right. To copy the other way, x swaps the sides.
    By default the copy used by the project is on the left, the Anclient source on the right.
  - folder view (f): extension moshfeu.compare-folders (installed when asked), listing the
    files that differ or exist on one side only. "Take My File / Take Compared File" and
    "Copy to My / Compared Folder" copy whole files in both directions; clicking a file
    opens it in the diff editor. "My folder" is the project's copy, "compared" the source.
    Exclude noise with the user setting
        "compareFolders.excludeFilter": ["**/node_modules", "**/dist", "**/.git"]

s and u list what they will copy, and ask before writing; overwritten files are marked.
A copy installed from npm is overwritten by the next npm install: take what is worth keeping
into the source (and publish it). A copy that is a symlink to the source (npm link, "file:"
dependencies, e.g. registry.ts) is the source itself; then the shadowed copy, if any, e.g.
an older install, is compared instead.

Versions: a copy (not a link to the source) older than its source, of the same release line, is
marked "source is newer", with the bash commands to pack the source and install the tarball, e.g.
    (cd ../../../semantic-doc/src && npm run pack)
    (cd album && npm install ../../../../semantic-doc/src/dist-pack/semantic-doc-0.1.1.tgz)
For semantic-doc the commands are also printed when the version is the same but files differ:
the tarball is out of date (repack, then reinstall: npm checks the tarball's integrity).

Files only in one side are opened with `code <file>`. Without VS Code's `code` command
on PATH, the unified diff is printed instead. Line endings are ignored.
"""

import argparse
import difflib
import json
import os
import shutil
import subprocess
import sys

here = os.path.dirname(os.path.abspath(__file__))
packages = ['anreact', 'semantier', 'semantic-doc']

# npm names; semantic-doc: TEMP, until the doc-tree editor moves into anreact
npm_names = {'anreact': '@anclient/anreact', 'semantier': '@anclient/semantier', 'semantic-doc': 'semantic-doc'}
# listed only for the projects that install them
optional = {'semantic-doc'}
# package -> its source folder, set by main()
sources = {}

skip_dirs = {'node_modules', '.git', 'dist', 'ts', 'test', 'tests', '.vscode', '__pycache__'}
skip_files = {'package-lock.json', '.DS_Store'}


# ---------------------------------------------------------------- locations

def pkg_root(path: str, pkg: str):
    """The folder with package.json of the package, at or above path (an alias can name a file)."""
    folder = path if os.path.isdir(path) else os.path.dirname(path)
    while True:
        try:
            with open(os.path.join(folder, 'package.json'), encoding='utf-8') as f:
                if json.load(f).get('name') == npm_names[pkg]:
                    return folder
        except (OSError, ValueError):
            pass
        parent = os.path.dirname(folder)
        if parent == folder:
            return path
        folder = parent


def webpack_aliases(project: str) -> dict:
    """
    resolve.alias of the project's webpack.config.js, by loading it with node.
    :return: {alias: absolute path}; {'?': message} if the config can't be loaded
    """
    cfg = os.path.join(project, 'webpack.config.js')
    if not os.path.isfile(cfg):
        return {}
    with open(cfg, encoding='utf-8') as f:
        cfg_js = f.read()
        if '@anclient/' not in cfg_js and 'semantic-doc' not in cfg_js:
            return {}
    node = shutil.which('node')
    if not node:
        return {'?': 'node is not found to read webpack.config.js'}
    js = ("const c = require(process.argv[1]); const r = (Array.isArray(c) ? c[0] : c).resolve || {};"
          "console.log(JSON.stringify(r.alias || {}))")
    try:
        out = subprocess.run([node, '-e', js, cfg], cwd=project, capture_output=True, text=True, timeout=20)
        if out.returncode == 0:
            alias = json.loads(out.stdout.strip().splitlines()[-1])
            return {k.rstrip('$'): v for k, v in alias.items() if isinstance(v, str)}
        return {'?': out.stderr.strip().splitlines()[-1] if out.stderr.strip() else 'failed'}
    except (OSError, ValueError, IndexError, subprocess.SubprocessError) as e:
        return {'?': str(e)}


def node_chain(pkg: str, project: str) -> list:
    """node_modules/<npm name> in the project folder and its parents, nearest first."""
    found, folder = [], os.path.abspath(project)
    while True:
        p = os.path.join(folder, 'node_modules', *npm_names[pkg].split('/'))
        if os.path.isdir(p):
            found.append(p)
        parent = os.path.dirname(folder)
        if parent == folder:
            return found
        folder = parent


class Location:
    def __init__(self, pkg: str, path: str, how: str):
        self.pkg, self.path, self.how = pkg, path, how   # how: alias | node_modules
        self.real = os.path.realpath(path)

    def is_source(self, source: str) -> bool:
        return os.path.realpath(source) == self.real

    def label(self, source: str) -> str:
        rel = os.path.relpath(self.path)
        if self.how == 'alias':
            return f'{rel}  (webpack alias){"  = source" if self.is_source(source) else ""}'
        link = f'  -> {os.path.relpath(self.real)}' if self.real != os.path.abspath(self.path) else ''
        return f'{rel}{link}{"  = source" if self.is_source(source) else ""}'


def locate(pkg: str, project: str):
    """
    :return: (the location used by the build, the shadowed ones), or (None, [], message)
    """
    alias = webpack_aliases(project)
    chain = [Location(pkg, p, 'node_modules') for p in node_chain(pkg, project)]
    if npm_names[pkg] in alias:
        return Location(pkg, pkg_root(alias[npm_names[pkg]], pkg), 'alias'), chain, None
    note = f'webpack.config.js not read: {alias["?"]}' if '?' in alias else None
    return (chain[0] if chain else None), chain[1:], note


def release_line(v: str) -> str:
    """
    The release line of a version: major.minor for 0.x (npm's ^0.7.2 never reaches 0.8),
    otherwise the major, e.g. 0.7.2 -> 0.7, 1.0.6 -> 1.
    """
    parts = v.split('.')
    if not parts or not parts[0].isdigit():
        return v
    return '.'.join(parts[:2]) if parts[0] == '0' else parts[0]


def line_note(pkg_dir: str, source: str) -> str:
    """:return: '' for the release line of the source, otherwise a note, e.g. '(0.7.x, source 0.8.x)'"""
    a, b = release_line(version(pkg_dir)), release_line(version(source))
    return '' if a == b else f'({a}.x, source {b}.x)'


def semver(v: str) -> tuple:
    """Comparable version: 0.8.0 -> (0, 8, 0, 1); a pre-release, 0.8.0-beta.1 -> (0, 8, 0, 0)."""
    core, _, pre = v.partition('-')
    nums = []
    for x in core.split('.')[:3]:
        nums.append(int(x) if x.isdigit() else 0)
    return tuple(nums + [0] * (3 - len(nums))) + (0 if pre else 1,)


def source_newer(copy_dir: str, source: str) -> bool:
    """The source's version is newer than the copy's."""
    a, b = version(copy_dir), version(source)
    return '?' not in (a, b) and semver(b) > semver(a)


def tarball(pkg: str, source: str) -> str:
    """Path of the tarball npm pack makes for the source's version."""
    if pkg == 'semantic-doc':
        # npm run pack in semantic-doc/src: npm pack --pack-destination dist-pack
        return os.path.join(source, 'dist-pack', f'semantic-doc-{version(source)}.tgz')
    # npm pack of a scoped package: @anclient/anreact -> anclient-anreact-<version>.tgz
    return os.path.join(source, f'{npm_names[pkg][1:].replace("/", "-")}-{version(source)}.tgz')


def update_commands(pkg: str, copy: 'Location', source: str, project: str, files_differ=False) -> list:
    """
    Bash commands bringing the project's copy up to the source: pack the source, install the tarball.
    :return: [] if the copy is a link to the source, of another release line, or not older
             (for semantic-doc: also when the same version has differing files)
    """
    if copy.is_source(source) or line_note(copy.path, source):
        return []
    if not source_newer(copy.path, source) and not (pkg == 'semantic-doc' and files_differ):
        return []
    tgz = os.path.relpath(tarball(pkg, source), project)
    pack = 'npm run pack' if pkg == 'semantic-doc' else 'npm pack'
    cmds = [f'(cd {os.path.relpath(source)} && {pack})',
            f'(cd {os.path.relpath(project)} && npm install {tgz})']
    if pkg == 'semantic-doc' and source_newer(copy.path, source):
        cmds.append(f'# then in {os.path.relpath(project)}/package.json, scripts.install-sdoc: '
                    f'npm install {tgz}')
    elif pkg != 'semantic-doc':
        cmds.append(f'# or, once published: (cd {os.path.relpath(project)} && '
                    f'npm install {npm_names[pkg]}@{version(source)})')
    return cmds


def print_commands(pkg: str, copy: 'Location', source: str, project: str, files_differ=False, indent=4):
    cmds = update_commands(pkg, copy, source, project, files_differ)
    if not cmds:
        return
    pad = ' ' * indent
    why = (f'source is newer, {version(copy.path)} -> {version(source)}' if source_newer(copy.path, source)
           else 'same version, files differ: the tarball is out of date')
    print(f'{pad}{why}; to update the copy:')
    for c in cmds:
        print(f'{pad}    {c}')


def version(pkg_dir: str) -> str:
    try:
        with open(os.path.join(pkg_dir, 'package.json'), encoding='utf-8') as f:
            return json.load(f).get('version', '?')
    except (OSError, ValueError):
        return '?'


def projects_here() -> list:
    return sorted(d for d in os.listdir(here)
                  if not d.startswith('.') and d != 'node_modules'
                  and os.path.isfile(os.path.join(here, d, 'package.json')))


def overview(src_root: str):
    names = projects_here()
    print(f'Sources: {src_root}  ' +
          '  '.join(f'{p} {version(sources[p])}' for p in packages if p not in optional))
    for p in optional:
        print(f'         {p} {version(sources[p])}  {sources[p]}')
    for i, name in enumerate(names, 1):
        print(f'\n{i:3}  {name}')
        for pkg in packages:
            used, shadowed, note = locate(pkg, os.path.join(here, name))
            source = sources[pkg]
            if used is None and pkg in optional:
                continue
            if used is None:
                print(f'       {pkg:12} not found{"  (" + note + ")" if note else ""}')
                continue
            note = line_note(used.path, source)
            if not note and not used.is_source(source) and source_newer(used.path, source):
                note = f'(source is newer: {version(source)})'
            print(f'       {pkg:12} {version(used.path):8} {used.label(source)}{"  " + note if note else ""}')
            if not used.is_source(source):
                print_commands(pkg, used, source, os.path.join(here, name), indent=20)
            for s in shadowed:
                print(f'       {"":12} {version(s.path):8} {s.label(source)}  (shadowed)')
    return names


# ---------------------------------------------------------------- compare

def files_under(root: str):
    out = set()
    for d, dirs, files in os.walk(root):
        dirs[:] = [x for x in dirs if x not in skip_dirs]
        for f in files:
            if f not in skip_files:
                out.add(os.path.relpath(os.path.join(d, f), root))
    return out


def same(a: str, b: str) -> bool:
    with open(a, 'rb') as fa, open(b, 'rb') as fb:
        return fa.read().replace(b'\r\n', b'\n') == fb.read().replace(b'\r\n', b'\n')


def compare(installed: str, source: str):
    """
    :return: list of (state, rel, installed path, source path); state: M, I (installed only), S (source only)
    """
    inst = files_under(installed)
    # only the source files in the folders / top-level files the published package has,
    # e.g. src/** for anreact, *.ts for semantier
    tops = {r.split(os.sep)[0] for r in inst if os.sep in r}
    root_exts = {os.path.splitext(r)[1] for r in inst if os.sep not in r} - {'.json', '.md', ''}
    src = {r for r in files_under(source)
           if (os.sep in r and r.split(os.sep)[0] in tops)
           or (os.sep not in r and (r in inst or os.path.splitext(r)[1] in root_exts
                                    and not r.endswith('.d.ts')))}

    rows = []
    for r in sorted(inst | src):
        a, b = os.path.join(installed, r), os.path.join(source, r)
        if r in inst and r in src:
            if not same(a, b):
                rows.append(('M', r, a, b))
        elif r in inst:
            rows.append(('I', r, a, b))
        else:
            rows.append(('S', r, a, b))
    return rows


# packages of the last scan whose copy is of another release line than the source
other_lines = {}


def scan(project: str, pkgs, src_root, pairs=None):
    rows = []
    other_lines.clear()
    print(f'\nProject {os.path.relpath(project)}')
    for pkg in pkgs:
        source = sources[pkg]
        used, shadowed, note = locate(pkg, project)
        if used is None and pkg in optional:
            continue
        if not os.path.isdir(source):
            print(f'{npm_names[pkg]}: source {source} not found, use '
                  f'{"--sdoc-src <semantic-doc/src>" if pkg == "semantic-doc" else "--src <Anclient/js>"}.')
            continue
        if used is None:
            print(f'{npm_names[pkg]}: not found by webpack alias or node_modules'
                  f'{" (" + note + ")" if note else ""}.')
            continue
        left = used
        if used.is_source(source):
            # built from the sources: nothing to compare, unless an installed copy is shadowed
            others = [s for s in shadowed if not s.is_source(source)]
            print(f'\n{npm_names[pkg]}  built from the source: {used.label(source)}')
            if not others:
                continue
            left = others[0]
            print(f'    comparing the shadowed copy instead: {left.label(source)}')

        if pairs is not None:
            pairs.append((left.real, os.path.realpath(source)))
        r = compare(left.path, source)
        side = 'used  ' if left is used else 'copy  '
        print(f'\n{npm_names[pkg]}  {side} {version(left.path):8} {left.label(source)}\n'
              f'{" " * (len(npm_names[pkg]) + 2)}source {version(source):8} {os.path.relpath(source)}')
        note = line_note(left.path, source)
        if note:
            other_lines[pkg] = note
            print(f'    another release line {note}: differences are expected; s / u are disabled.\n'
                  f'    Compare with a checkout of {release_line(version(left.path))}.x, see --src (-h).')
        if not r:
            print('    identical')
        print_commands(pkg, left, source, project, files_differ=bool(r))
        rows += [(pkg,) + x for x in r]

    labels = {'M': 'modified', 'I': 'used only', 'S': 'source only'}
    if rows:
        print()
    for i, (pkg, st, rel, _, _) in enumerate(rows, 1):
        print(f'{i:4}  {labels[st]:11}  {pkg}/{rel}')
    return rows


compare_folders_ext = 'moshfeu.compare-folders'


def has_extension(code: str, ext: str) -> bool:
    try:
        out = subprocess.run([code, '--list-extensions'], capture_output=True, text=True, timeout=60)
        return ext.lower() in out.stdout.lower().split()
    except (OSError, subprocess.SubprocessError):
        return False


def open_folders(code, pairs):
    """
    Open each (copy, source) package pair with the Compare Folders extension, in a new window.
    """
    if not code:
        print("VS Code's `code` command is not on PATH.")
        return
    if not has_extension(code, compare_folders_ext):
        if ask(f'VS Code extension {compare_folders_ext} (Compare Folders) is not installed. Install it? [y/N] ') != 'y':
            return
        subprocess.run([code, '--install-extension', compare_folders_ext])
    for copy, source in pairs:
        print(f'Compare Folders: my folder {os.path.relpath(copy)}  <->  compared {os.path.relpath(source)}')
        subprocess.Popen([code, '--new-window', copy, source], env=dict(os.environ, COMPARE_FOLDERS='DIFF'))


def open_rows(picks, code, swap=False):
    for pkg, st, rel, a, b in picks:
        if code:
            left, right = (b, a) if swap else (a, b)
            subprocess.Popen([code, '--reuse-window', '--diff', left, right] if st == 'M'
                             else [code, '--reuse-window', a if st == 'I' else b])
        elif st == 'M':
            with open(a, encoding='utf-8', errors='replace') as fa, \
                 open(b, encoding='utf-8', errors='replace') as fb:
                sys.stdout.writelines(difflib.unified_diff(
                    fa.read().splitlines(True), fb.read().splitlines(True),
                    f'used/{pkg}/{rel}', f'source/{pkg}/{rel}'))
        else:
            print(f'{"used" if st == "I" else "source"} only: {a if st == "I" else b}')


def copy_rows(rows, picks, to_source: bool) -> bool:
    """
    Copy the picked files: the project's copy -> source (to_source), or source -> the project's copy.
    Only the rows that can go that way: used only / modified, or source only / modified.
    :return: whether anything was copied
    """
    can = ('I', 'M') if to_source else ('S', 'M')
    todo = [r for r in picks if r[1] in can and r[0] not in other_lines]
    for r in picks:
        if r[0] in other_lines:
            print(f'  skip {rows.index(r) + 1}: {r[0]}/{r[2]}, another release line {other_lines[r[0]]}.')
        elif r not in todo:
            print(f'  skip {rows.index(r) + 1}: {r[0]}/{r[2]} is {"source" if r[1] == "S" else "used"} only.')
    if not todo:
        return False

    where = 'to the source' if to_source else "into the project's copy"
    print(f'\nCopy {where}:')
    for pkg, st, rel, a, b in todo:
        src, dst = (a, b) if to_source else (b, a)
        print(f'  {rows.index((pkg, st, rel, a, b)) + 1:3}  {os.path.relpath(src)}\n'
              f'       -> {os.path.relpath(dst)}{"   (overwrite)" if st == "M" else "   (new)"}')
    if ask(f'Copy {len(todo)} file(s)? [y/N] ') != 'y':
        return False

    for pkg, st, rel, a, b in todo:
        src, dst = (a, b) if to_source else (b, a)
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        shutil.copy2(src, dst)
    print(f'Copied {len(todo)} file(s).')
    return True


def ask(prompt: str) -> str:
    try:
        return input(prompt).strip().lower()
    except (EOFError, KeyboardInterrupt):
        print()
        return 'q'


def main():
    ap = argparse.ArgumentParser(
        description='Diff the @anclient/* a project builds with against Anclient/js sources, in VS Code.')
    ap.add_argument('project', nargs='?', help='project folder, e.g. album; default: list the projects here')
    ap.add_argument('-p', '--packages', nargs='+', default=packages, choices=packages,
                    help='packages, default: anreact semantier, and semantic-doc where installed')
    ap.add_argument('--sdoc-src', help='semantic-doc package sources, default: github/semantic-doc/src next to Anclient')
    ap.add_argument('--src', help='folder of the package sources, default: Anclient/js of this checkout')
    args = ap.parse_args()

    src_root = os.path.abspath(os.path.expanduser(args.src)) if args.src else \
               os.path.normpath(os.path.join(here, '..', '..', 'js'))
    if not os.path.isdir(src_root):
        sys.exit(f'Cannot find {src_root}, use --src <path to Anclient/js>.')
    for p in packages:
        sources[p] = os.path.join(src_root, p)
    sources['semantic-doc'] = os.path.abspath(os.path.expanduser(args.sdoc_src)) if args.sdoc_src else \
                              os.path.normpath(os.path.join(here, '..', '..', '..', 'semantic-doc', 'src'))

    project = args.project
    if not project:
        names = overview(src_root)
        cmd = ask(f'\nProject to compare, 1 - {len(names)}, q to quit: ')
        if not cmd.isdigit() or not 1 <= int(cmd) <= len(names):
            return
        project = os.path.join(here, names[int(cmd) - 1])
    elif not os.path.isdir(project) and os.path.isdir(os.path.join(here, project)):
        project = os.path.join(here, project)
    project = os.path.abspath(project)

    code = shutil.which('code')
    if not code:
        print("VS Code's `code` command is not on PATH, diffs are printed instead.\n"
              "(VS Code: Command Palette > Shell Command: Install 'code' command in PATH)")

    pairs = []
    rows = scan(project, args.packages, src_root, pairs)
    swap = False
    while rows:
        sides = 'left: source, right: copy' if swap else 'left: copy, right: source'
        cmd = ask(f'\nNumbers to open ({sides}), a = all modified, x = swap sides, f = folders,\n'
                  f's <numbers|a> = source -> copy, u <numbers|a> = copy -> source, r = rescan, q = quit: ')
        if cmd in ('q', ''):
            break
        if cmd == 'r':
            pairs = []
            rows = scan(project, args.packages, src_root, pairs)
            continue
        if cmd == 'x':
            swap = not swap
            continue
        if cmd == 'f':
            open_folders(code, pairs)
            continue
        if cmd[:1] in ('s', 'u') and (len(cmd) == 1 or cmd[1] == ' '):
            to_source, arg = cmd[0] == 'u', cmd[1:].strip()
            try:
                picks = rows if arg == 'a' else [rows[int(n) - 1] for n in arg.replace(',', ' ').split()]
            except (ValueError, IndexError):
                picks = None
            if not picks:
                print(f'Type e.g. "{cmd[0]} 1 3" or "{cmd[0]} a".')
                continue
            if copy_rows(rows, picks, to_source):
                pairs = []
                rows = scan(project, args.packages, src_root, pairs)
                if not rows:
                    print('\nNo differences left.')
            continue
        if cmd == 'a':
            picks = [r for r in rows if r[1] == 'M']
        else:
            try:
                picks = [rows[int(n) - 1] for n in cmd.replace(',', ' ').split()]
            except (ValueError, IndexError):
                print(f'Type 1 - {len(rows)}, a, x, f, s <numbers>, u <numbers>, r or q.')
                continue
        open_rows(picks, code, swap)


if __name__ == '__main__':
    main()
