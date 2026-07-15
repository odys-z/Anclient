# Debug from Source

This is a cmake project.

With VS Code, CMake & Slint Plugins, setup .vscode/settings.json as

```
    "cmake.debugConfig": {
        "args": ["settings/app-settings.json"]
    }
```

The *settings/app-settings.json* is the configuration where the user ID and token is saved. 

Create the configuration file, see *settings/app-settings-template.json*, then debug with GDB.

FYI, the .vscode/c_cpp_properties.json example

```
  {
    "configurations": [
        {
            "name": "MinGW",
            "includePath": [
                "${workspaceFolder}/**",
                "app/src/**",
                "path-to/mingw64-gcc16.1.0/include/**",
                "~/github/vcpkg/installed/x64-mingw-dynamic/include/**"
            ],
            "defines": [],
            "compilerPath": "path-to/mingw64-gcc16.1.0/bin/g++.exe",
            "cStandard": "c17",
            "cppStandard": "c++20",
            "intelliSenseMode": "windows-gcc-x64"
        }
    ],
    "version": 4
  }
```
