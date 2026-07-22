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

Tip:

1. Start Eclipse ipc-agent for bind first at 8700

   File build/app/log/ipc_agent_java.log should report:

   ```
     [main] INFO org.eclipse.jetty.server.Server - jetty-12.0.21; built: 2025-05-09T00:32:00.688Z; 
     Exception in thread "main" java.io.IOException: Failed to bind to 0.0.0.0/0.0.0.0:8700
	 at org.eclipse.jetty.server.ServerConnector.openAcceptChannel(ServerConnector.java:349)
	 at org.eclipse.jetty.server.ServerConnector.open(ServerConnector.java:313)
	 at org.eclipse.jetty.server.Server.lambda$doStart$0(Server.java:571)
     ...
   ```