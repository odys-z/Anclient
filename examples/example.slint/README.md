# Debug from Source

This is a cmake project.

With VS Code, CMake & Slint Plugin, setup .vscode/settings.json,

```
    "cmake.debugConfig": {
        "args": ["settings/app-settings.json"]
    }
```

Create the configuration file, see *settings/app-settings-template.json*, then debug with GDB.
