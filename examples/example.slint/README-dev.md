# Debug from Source

This is a cmake project, using gcc 16.1.0, in path ".../mingw64-gcc16.1.0/bin/gdb.exe".
See CMakeLists.txts and .vscode/launch.json

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

Tip:

1. The ipc-agent binds the first free port from "wsport" in app-settings.json (up to wsport + 1000),
   and writes it into build/app/log/ipc-agent.port:

   ```
     8700     <- websocket port, read by the desktop app
     8701     <- jetty stop port, read by StopAgent
   ```

   If no port is free, build/app/log/ipc_agent_java.log reports:

   ```
     Exception in thread "main" java.io.IOException: No free port in [8700, 9700]
   ```

   To stop an agent started by hand:

   ```
     java -cp ws-agent-#.#.#.jar io.oz.anclient.ipcagent.StopAgent build/app/log/ipc-agent.port
   ```

# Build

```
    rm -rf build
    cmake -S . -B build -G "MinGW Makefiles" -DCMAKE_BUILD_TYPE=Debug
    cmake --build build --config Debug
```

Or skip tests, cmake --build build --target album_gui --config Debug

For release

    cmake -S . -B build -G "MinGW Makefiles" -DCMAKE_BUILD_TYPE=Release
    cmake --build build --config Release`

