#!/usr/bin/env python3
"""Collect known user directories across Windows and POSIX platforms."""

from __future__ import annotations

import argparse
import ctypes
import json
import os
import sys
from pathlib import Path
# from semanticshare.io.odysz.anson import Anson
from semanticshare.io.oz.anclient.app import DesknownPaths


def _normalize(p: Path | str | None, require_exists: bool) -> str | None:
    if not p:
        return None
    try:
        path = Path(p).expanduser()
        if require_exists and not path.exists():
            return None
        # Resolve when possible without failing on broken symlinks
        try:
            resolved = path.resolve(strict=False)
        except OSError:
            resolved = path.absolute()
        return resolved.as_posix()
    except OSError:
        return None


def _windows_known_folder(guid_hex: str) -> str | None:
    """Query a Windows KNOWNFOLDERID via SHGetKnownFolderPath."""
    if sys.platform != "win32":
        return None

    class GUID(ctypes.Structure):
        _fields_ = [
            ("Data1", ctypes.c_ulong),
            ("Data2", ctypes.c_ushort),
            ("Data3", ctypes.c_ushort),
            ("Data4", ctypes.c_ubyte * 8),
        ]

    # Parse standard 8-4-4-4-12 UUID string
    parts = guid_hex.replace("{", "").replace("}", "").split("-")
    if len(parts) != 5:
        return None
    d1 = int(parts[0], 16)
    d2 = int(parts[1], 16)
    d3 = int(parts[2], 16)
    d4_bytes = bytes.fromhex(parts[3] + parts[4])
    d4 = (ctypes.c_ubyte * 8)(*d4_bytes)
    guid = GUID(d1, d2, d3, d4)

    p_path = ctypes.c_wchar_p()
    shell32 = ctypes.windll.shell32
    ole32 = ctypes.windll.ole32

    # KF_FLAG_DONT_VERIFY = 0x00004000
    hr = shell32.SHGetKnownFolderPath(ctypes.byref(guid), 0x00004000, None, ctypes.byref(p_path))
    if hr != 0 or not p_path.value:
        return None
    try:
        return p_path.value
    finally:
        ole32.CoTaskMemFree(p_path)


def _xdg_user_dirs() -> dict[str, Path]:
    """Parse ~/.config/user-dirs.dirs on POSIX systems if present."""
    result: dict[str, Path] = {}
    cfg = Path(os.environ.get("XDG_CONFIG_HOME", Path.home() / ".config")) / "user-dirs.dirs"
    if not cfg.is_file():
        return result

    home = Path.home()
    try:
        for raw_line in cfg.read_text(encoding="utf-8", errors="replace").splitlines():
            line = raw_line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, val = line.split("=", 1)
            key = key.strip()
            val = val.strip().strip('"')
            val = val.replace("$HOME", home.as_posix()).replace("${HOME}", home.as_posix())
            if val:
                result[key] = Path(val)
    except OSError:
        pass
    return result


def collect_known_paths(require_exists: bool = False) -> list[dict[str, str]]:
    """Return ordered, deduplicated list of {label, path} entries."""
    candidates: list[tuple[str, str | Path | None]] = []

    home = os.environ.get("USERPROFILE") if sys.platform == "win32" else os.environ.get("HOME")
    if not home:
        home = str(Path.home())
    candidates.append(("Home", home))

    if sys.platform == "win32":
        # Windows KNOWNFOLDERID GUIDs
        win_folders: list[tuple[str, str, str]] = [
            ("Desktop", "{B4BFCC3A-DB2C-424C-B029-7FE99A87C641}", "Desktop"),
            ("Documents", "{FDD39AD0-238F-46AF-ADB4-6C85480369C7}", "Documents"),
            ("Downloads", "{374DE290-123F-4565-9164-39C4925E467B}", "Downloads"),
            ("Pictures", "{33E28130-4E1E-4676-835A-98395C3BC3BB}", "Pictures"),
            ("Music", "{4BD8D571-6D19-48D3-BE97-422220080E43}", "Music"),
            ("Videos", "{18989B1D-99B5-455B-841C-AB7C74E4DDFC}", "Videos"),
        ]
        for label, guid, fallback_name in win_folders:
            p = _windows_known_folder(guid)
            if not p:
                p = Path(home) / fallback_name
            candidates.append((label, p))
    else:
        xdg = _xdg_user_dirs()
        '''
        posix_folders: list[tuple[str, str, str]] = [
            ("Desktop", "XDG_DESKTOP_DIR", "Desktop"),
            ("Documents", "XDG_DOCUMENTS_DIR", "Documents"),
            ("Downloads", "XDG_DOWNLOAD_DIR", "Downloads"),
            ("Pictures", "XDG_PICTURES_DIR", "Pictures"),
            ("Music", "XDG_MUSIC_DIR", "Music"),
            ("Videos", "XDG_VIDEOS_DIR", "Videos"),
        ]
        posix_folders = DesknownPaths()
        for label, xdg_key, fallback_name in posix_folders:
            p: str | Path | None = xdg.get(xdg_key)
            if p is None:
                p = Path(home) / fallback_name
            candidates.append((label, p))

            -----------------

        This is DesknownPaths. You create a key field initialization according to the dataclass fields.
            @dataclass
            class DesknownPaths(Anson):
                home: str             # need JSON-PIKING-0.8.3 ?
                desktop: str          # need JSON-PIKING-0.8.3 ?
                desktop_settings: str # need JSON-PIKING-0.8.3 ?
                download: str         # need JSON-PIKING-0.8.3 ?
                documents: str        # need JSON-PIKING-0.8.3 ?
                pictures: str         # need JSON-PIKING-0.8.3 ?
                music: str            # need JSON-PIKING-0.8.3 ?
                video: str            # need JSON-PIKING-0.8.3 ?

                def __init__(self):
                    super().__init__()

        seen_paths: set[str] = set()
        entries: list[dict[str, str]] = []
        for label, raw_path in candidates:
            norm = _normalize(raw_path, require_exists=require_exists)
            if not norm or norm in seen_paths:
                continue
            seen_paths.add(norm)
            entries.append({"label": label, "path": norm})

        return entries
        '''
        posix_folders = DesknownPaths()
        return posix_folders


def main() -> int:
    parser = argparse.ArgumentParser(description="Collect known user folders.")
    parser.add_argument(
        "--existing-only",
        action="store_true",
        help="Only include directories that currently exist on disk.",
    )
    parser.add_argument(
        "--paths-only",
        action="store_true",
        help="Print only normalized paths (one per line) instead of JSON objects.",
    )
    args = parser.parse_args()

    items = collect_known_paths(require_exists=args.existing_only)
    if args.paths_only:
        for item in items:
            print(item["path"])
    else:
        print(json.dumps(items, indent=2, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())