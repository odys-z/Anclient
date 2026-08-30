# Quick Start

*Currently only for Windows 10 and above.*

1. Start from Sources

    See SurrealismUI/tests for latest version.

    Download code zip, extract to, say, surrealism-0.5.3.

    Config .vscode/settings.json & CMakeLists.txt.

    ```
      {
        "slint.libraryPaths": {
            "surrealism": "../surrealism-0.5.3"
        }
      }
    ```
    ```
      get_filename_component(SURREALISM_UI_DIR 
        "${CMAKE_CURRENT_SOURCE_DIR}/../surrealism-0.5.3" 
        ABSOLUTE
      )
    ```

1. Compile with MinGW + GCC 16.1.0 (Win32 Only)

    ```
      export PATH="/c/Qt-6.10/Tools/CMake_64/bin:$PATH"
      export PATH="/c/Qt-6.10/mingw64-gcc16.1.0/bin:$PATH"
      rustup target add --toolchain stable-x86_64-pc-windows-msvc x86_64-pc-windows-gnu
      # WIN32 for the first time or any fetch contents updata
      cmake -G "Ninja" -B build -DFETCHCONTENT_BASE_DIR="~/CMakeCache" -DFETCHCONTENT_FULLY_DISCONNECTED=FALSE
      # to avoid github downloading
      cmake -G "Ninja" -B build -DFETCHCONTENT_BASE_DIR="~/CMakeCache" -DFETCHCONTENT_FULLY_DISCONNECTED=ON
      cmake --build build
      build/album_slint.exe
    ```
    
    or simply

    ```
      invoke build
    ```

1. Generate Semantier (C++ Reflection with ASTs)

    ```
      cd ../tests
      py -m semantier_gen settings/gen-settings.json ../ast
    ```

1. Copy the lib of MinGW GCC 16.1.0.

   Install Python Invoke.

   Then optionally, 

   ```
     Invoke copy-dlls.
   ```

   This process is configured in *.vscode/launch.json*. The file is used by vs code in the debug & run pannel.
   
   Deprecated: Also tried in *.vscode/settings.json*, the GDB debugger should running faster
   as system dlls' symbols loading is disabled. 

# Build on Ubuntu

1. System packages

    ```
      sudo apt update
      sudo apt install -y build-essential ninja-build git curl zip unzip tar \
          pkg-config autoconf automake libtool python3
      sudo apt install -y libwebkit2gtk-4.1-dev
    ```

    `libwebkit2gtk-4.1-dev` provides the WebKitGTK API the `webview` dependency
    needs. If it's unavailable on your Ubuntu release, check
    `apt-cache search webkit2gtk` / `webkitgtk` for the closest match
    (`libwebkit2gtk-4.0-dev` or `libwebkitgtk-6.0-dev` on some releases).

1. CMake

    Verfified with CMake v4.4.2.

1. Rust

    Slint's C++ bindings are built from Rust via Corrosion, so a Rust toolchain
    is required:

    ```
      curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
      source "$HOME/.cargo/env"
    ```

    Verify with `rustc --version` (this project currently needs 1.92+).

1. vcpkg

    Clone vcpkg as a sibling directory to `anclient/` and bootstrap it:

    ```
      git clone https://github.com/microsoft/vcpkg.git
      cd vcpkg
      ./bootstrap-vcpkg.sh
    ```

    Install the dependencies for the Linux triplet:

    ```
      ./vcpkg install openssl:x64-linux boost-url:x64-linux \
          entt:x64-linux nlohmann-json:x64-linux
      ./vcpkg install "ixwebsocket[core,openssl]:x64-linux"
    ```

    `CMakeLists.txt` auto-selects the `x64-linux` triplet on Linux, so no extra
    `-DVCPKG_TARGET_TRIPLET` flag is needed for a native build.

1. Build

  Use this as a Qt project.

# Tips

1. Speedup GDB session by exclude Windows Definder Scanning:

   In powershell

   ```
    Add-MpPreference -ExclusionPath "$env:USERPROFILE\github\anclient\examples\example.slint\build"
    # or
    # Add-MpPreference -ExclusionPath "$env:USERPROFILE\github\**\build"
   ```

   To verify the path is exists:

   ```
    Write-Host "$env:USERPROFILE\github\anclient\examples\example.slint\build"
    .\github\anclient\examples\example.slint\build
   ```

1. Turn off automatic shared-library symbol loading

   Add set auto-solib-add off to your launch.json's setupCommands

   ```
    {
      "text": "set auto-solib-add off",
      "description": "Don't eagerly parse symbols for every loaded system/driver DLL — huge speedup",
      "ignoreFailures": true
    }
   ```

   and settings.json

   ```
    "cmake.debugConfig": {
      "cwd": "${command:cmake.launchTargetDirectory}",
      "args": ["settings/app-settings-reddish.json"],
      "environment": [
        {
            "name": "PATH",
            "value": "${command:cmake.launchTargetDirectory};${env:PATH}"
        }
      ],
      "setupCommands": [
        {
            "text": "-enable-pretty-printing",
            "ignoreFailures": true
        },
        {
            "text": "set auto-solib-add off",
            "ignoreFailures": false
        }
      ]
    }
   ```
  
1. clear sources

   ```
     rm -rf build/_deps/anson.cmake-src build/_deps/anson.cmake-build build/_deps/anson.cmake-subbuild
     rm -rf build/_deps/anclient.cmake-src build/_deps/anclient.cmake-build build/_deps/anclient.cmake-subbuild

     rm -rf qt-build/_deps/anson.cmake-src qt-build/_deps/anson.cmake-build qt-build/_deps/anson.cmake-subbuild
     rm -rf qt-build/_deps/anclient.cmake-src qt-build/_deps/anclient.cmake-build qt-build/_deps/anclient.cmake-subbuild
   ```
