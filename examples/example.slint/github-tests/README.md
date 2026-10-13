# github-tests

The desktop's test clients without Slint, webview or SurrealismUI, built as a standalone CMake
project so that GitHub Actions runners can build them in a few minutes.

They are used by the workflows of `odys-z/semantic-jserv`:

| Workflow | Target | What it checks |
|---|---|---|
| `version-revival-7days.yml` (every 6 days) | `revial_tests` | anson.cmake and Anclient.cmake build; echo to the registry central |
| `synodes-linux-closed-test.yml` (by hand) | `doclient_tests` | the desktop pushes a file through the IPC agent; it is synchronized to the peers |

Both workflows check out this repository at `portfolio-0.8` (or the branch typed in the run form),
and build it with semantic-jserv's `.github/actions/build-github-tests`.

## Targets

| Target | Sources |
|---|---|
| `revial_tests` | `test_00_echo_central.cpp` |
| `doclient_tests` | `../app/src/wsclients.cpp`, `../app/src/doctier.cpp`, `../tests/test_01_wsclient_ipcagent.cpp` |

`doclient_tests` is the same test code as `album_tests` (`../tests`), without the Slint parts.
`test_01_wsclient_ipcagent.cpp` has its own `main()`, so it links `gtest`, not `gtest_main`.

The build copies `../ast`, `../tests/settings` and `../tests/res` beside the binaries; run them from
the build folder.

## Build

Requirements, as for example.slint:

- CMake 3.30+, Ninja;
- GCC 14 or newer (C++20 `std::chrono::parse` in anson.cmake);
- vcpkg (commit `7e43e0768a`, triplet `x64-linux`):
  `vcpkg install openssl boost-url entt nlohmann-json "ixwebsocket[core,openssl]"`.

vcpkg is found at `../../../../vcpkg` (beside the `Anclient` folder, the layout of `../tasks.py`),
unless `CMAKE_TOOLCHAIN_FILE` is given.

```
cd Anclient/examples/example.slint/github-tests
CC=gcc-14 CXX=g++-14 cmake -S . -B build -G Ninja -DCMAKE_BUILD_TYPE=Release
cmake --build build --target revial_tests doclient_tests
```

anson.cmake and Anclient.cmake are fetched at `portfolio-0.8`; another tag with
`-DANCLIENT_GIT_TAG=<tag>`. googletest is v1.15.2.

## revial_tests

Needs a running central (semantic-jserv `.github/actions/start-central`, or a local one).

```
cd build
CENTRAL_URL=http://127.0.0.1:1991/regist-central ./revial_tests
```

| Env | Default |
|---|---|
| `CENTRAL_URL` | `http://127.0.0.1:1991/regist-central` |
| `CENTRAL_ECHO` | `revial_tests echo` (the message, expected back in `resp.m`) |

## doclient_tests

Needs the IPC agent jar (`ws-agent-*.jar`, from the desktop release zip `res/`), Java 17, and a
running synode domain (hub + a peer) for `Ipclient.E2E_PushSync`.

```
cd build
ALBUM_TEST_SETTINGS=settings/ci-settings.json \
SYNODE_E2E_HOME_VOL=<hub>/vol SYNODE_E2E_PEER_VOL=<prv1>/vol SYNODE_E2E_TIMEOUT=240 \
  ./doclient_tests --gtest_filter='Ipclient.Echo:Ipclient.E2E_PushSync'
```

| Env | Default | |
|---|---|---|
| `ALBUM_TEST_SETTINGS` | `settings/desktop-settings.gitignore.json` | DesktopSettings json: `java_path`, `wsagent_jar`, `synode_jserv`, `synode_id`, `synode_vol`, `device`, ... |
| `ALBUM_AGENT_WAIT_MS` | `30000` | wait for the IPC agent to listen |
| `SYNODE_E2E_PEER_VOL` | (none: `E2E_PushSync` is skipped) | volume of the peer that must receive the file |
| `SYNODE_E2E_HOME_VOL` | (none) | volume of the hub the file is pushed to, checked first |
| `SYNODE_E2E_TIMEOUT` | `180` | seconds to wait for the file in the volumes |

The closed test makes `settings/ci-settings.json` from the released desktop's
`settings/app-settings.json`, pointed at the hub (`synode_id` `closed-1-hub`, device `ci-desktop`).

`E2E_PushSync` pushes a copy of `res/182x121.png` with a unique name (`182x121_e2e_<time>_<nonce>.png`
and a unique trailer), and finds it in the volumes by size and SHA-256. The IPC agent's output is in
`log/ipc_agent_java.log`.
