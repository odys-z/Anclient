# Quick Start

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
      cmake -G "MinGW Makefiles" -B build -DFETCHCONTENT_BASE_DIR="~/CMakeCache" -DFETCHCONTENT_FULLY_DISCONNECTED=FALSE
      # to avoid github downloading
      cmake -G "MinGW Makefiles" -B build -DFETCHCONTENT_BASE_DIR="~/CMakeCache" -DFETCHCONTENT_FULLY_DISCONNECTED=ON
      cmake --build build
      build/album_slint.exe
    ```

1. Generate anclient.cmake

    ```
      cd ../tests
      py -m semantier_gen settings/gen-settings.json ../ast
    ```
