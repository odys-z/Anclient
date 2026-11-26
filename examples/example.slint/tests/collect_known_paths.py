#!/usr/bin/env python3
"""Collect known user directories across Windows and POSIX platforms."""

import argparse
import ctypes
import json
import os
import sys
from pathlib import Path
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


def _windows_known_posixfolder(guid_hex: str) -> str | None:
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
        if p_path.value:
            ole32.CoTaskMemFree(p_path)
        return None
    try:
        return Path(p_path.value).as_posix()
    finally:
        ole32.CoTaskMemFree(p_path)


def _xdg_user_dirs() -> dict:
    """Parse ~/.config/user-dirs.dirs on POSIX systems if present."""
    result = {}
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


def _win_folder_path(home: str, guid: str, require_exists: bool) -> str:
    #     kf = _windows_known_folder(guid)
    #     raw = Path(kf) if kf else (Path(home) / fallback_name)
    return _normalize(raw, require_exists=require_exists)


def _xdg_folder_path(xdg: dict, xdg_key: str, require_exists: bool) -> str:
    raw = xdg.get(xdg_key)
    # if raw is None:
    #     raw = Path(home) / fallback_name
    return _normalize(raw, require_exists=require_exists)


def collect_known_paths(require_exists: bool = False) -> DesknownPaths:
    """Populate and return a DesknownPaths instance for Windows or POSIX."""
    home = os.environ.get("USERPROFILE") if sys.platform == "win32" else os.environ.get("HOME")
    if not home:
        home = str(Path.home())

    known = DesknownPaths()
    known.home = _normalize(home, require_exists=require_exists)
    known.desktop_settings = _normalize(Path("settings/app-settings.json"), require_exists=require_exists)

    if sys.platform == "win32":
        known.desktop = _windows_known_posixfolder("{B4BFCC3A-DB2C-424C-B029-7FE99A87C641}", require_exists)
        known.documents = _windows_known_posixfolder("{FDD39AD0-238F-46AF-ADB4-6C85480369C7}", require_exists)
        known.download = _windows_known_posixfolder("{374DE290-123F-4565-9164-39C4925E467B}", require_exists)
        known.pictures = _windows_known_posixfolder("{33E28130-4E1E-4676-835A-98395C3BC3BB}", require_exists)
        known.music = _windows_known_posixfolder("{4BD8D571-6D19-48D3-BE97-422220080E43}", require_exists)
        known.video = _windows_known_posixfolder("{18989B1D-99B5-455B-841C-AB7C74E4DDFC}", require_exists)
    else:
        xdg = _xdg_user_dirs()
        known.desktop = _xdg_folder_path(xdg, "XDG_DESKTOP_DIR", require_exists)
        known.documents = _xdg_folder_path(xdg, "XDG_DOCUMENTS_DIR", require_exists)
        known.download = _xdg_folder_path(xdg, "XDG_DOWNLOAD_DIR", require_exists)
        known.pictures = _xdg_folder_path(xdg, "XDG_PICTURES_DIR", require_exists)
        known.music = _xdg_folder_path(xdg, "XDG_MUSIC_DIR", require_exists)
        known.video = _xdg_folder_path(xdg, "XDG_VIDEOS_DIR", require_exists)

    return known


def main() -> int:
    parser = argparse.ArgumentParser(description="Collect known user folders.")
    parser.add_argument(
        "--existing-only",
        action="store_true",
        help="Only include directories that currently exist on disk.",
    )
    parser.add_argument(
        "--out",
        default="known_paths_dump.json",
        help="Output JSON file path (default: known_paths_dump.json).",
    )
    args = parser.parse_args()

    known = collect_known_paths(require_exists=args.existing_only)
    known.toFile(args.out)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())