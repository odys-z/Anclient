#pragma once

#include <string>
#include <vector>
#include <optional>
#include <filesystem>
#include <fstream>
#include <atomic>
#include <system_error>
#include <thread>
#include <chrono>
#include <cstdlib>
#include <format>

#ifdef _WIN32
#include <windows.h>
#else
#include <unistd.h>
#include <sys/types.h>
#include <sys/wait.h>
#include <signal.h>
#include <fcntl.h>
#endif

#include <io/odysz/utils.h>
#include "gen/app_settings.hpp"

namespace fs = std::filesystem;

namespace anson {
/** UTF-8 std::string (as read from the settings json) -> fs::path, without the ANSI code page. */
inline fs::path u8_to_path(const std::string& s) {
    return fs::path(std::u8string(s.begin(), s.end()));
}

/** fs::path -> UTF-8 std::string, for logging. */
inline std::string path_to_u8(const fs::path& p) {
    std::u8string u = p.u8string();
    return std::string(u.begin(), u.end());
}

/** Folder of the running executable (not the working folder). */
inline fs::path exe_dir() {
#ifdef _WIN32
    std::wstring buf(MAX_PATH, L'\0');
    DWORD n = 0;
    while ((n = GetModuleFileNameW(nullptr, buf.data(), (DWORD)buf.size())) >= buf.size())
        buf.resize(buf.size() * 2);
    buf.resize(n);
    return fs::path(buf).parent_path();
#else
    std::error_code ec;
    fs::path p = fs::read_symlink("/proc/self/exe", ec);
    return ec ? fs::current_path() : p.parent_path();
#endif
}

/**
 * Resolves a (possibly relative) path from the settings to an existing, absolute file.
 *
 * Absolute paths (incl. '~' expanded) are taken as is. Relative paths are tried against,
 * in order:
 *   1. the working folder        - dev runs and tests, which start in their own folder;
 *   2. the exe's folder          - stand-alone zip: album_gui.exe, jre17/, res/, settings/ side by side,
 *                                  started from a shortcut or another folder;
 *   3. the exe's parent folder   - synode package: <install>/desktop/album_gui.exe, <install>/jre17,
 *                                  only if parent_fallback (used for java).
 *
 * @param tried receives every candidate, for the error message.
 * @return the existing file, or nullopt.
 */
inline std::optional<fs::path> locate_file(const std::string& setting, bool parent_fallback,
                                           std::vector<fs::path>& tried) {
    fs::path p = u8_to_path(EnvPath::replaceEnv(setting));
    std::vector<fs::path> candidates;
    if (p.is_absolute())
        candidates.push_back(p);
    else {
        std::error_code ec;
        fs::path cwd = fs::current_path(ec);
        fs::path exe = exe_dir();
        if (!ec) candidates.push_back(cwd / p);
        candidates.push_back(exe / p);
        if (parent_fallback) candidates.push_back(exe.parent_path() / p);
    }

    for (auto& c : candidates) {
        fs::path n = c.lexically_normal();
        n.make_preferred();     // backslashes on Windows
        tried.push_back(n);
        std::error_code ec;
        if (fs::is_regular_file(n, ec))
            return fs::absolute(n, ec);
    }
    return std::nullopt;
}

#ifdef _WIN32
/** Quotes one argument for CreateProcessW / CommandLineToArgvW (MSVCRT rules). */
inline std::wstring quote_arg(const std::wstring& arg) {
    if (!arg.empty() && arg.find_first_of(L" \t\n\v\"") == std::wstring::npos)
        return arg;
    std::wstring q = L"\"";
    size_t slashes = 0;
    for (wchar_t ch : arg) {
        if (ch == L'\\') { slashes++; continue; }
        if (ch == L'"') q.append(slashes * 2 + 1, L'\\');
        else            q.append(slashes, L'\\');
        slashes = 0;
        q.push_back(ch);
    }
    q.append(slashes * 2, L'\\');
    q.push_back(L'"');
    return q;
}

/**
 * Starts exe with args directly (no cmd.exe, so '/', spaces and non-ASCII paths are safe),
 * with stdout and stderr redirected into log_file.
 */
inline bool spawn_logged(const fs::path& exe, const std::vector<std::wstring>& args,
                         const fs::path& log_file, PROCESS_INFORMATION& pi) {
    SECURITY_ATTRIBUTES sa{ sizeof(sa), nullptr, TRUE };   // inheritable, for the child's stdout/stderr
    HANDLE hlog = CreateFileW(log_file.c_str(), GENERIC_WRITE, FILE_SHARE_READ | FILE_SHARE_WRITE,
                              &sa, CREATE_ALWAYS, FILE_ATTRIBUTE_NORMAL, nullptr);
    if (hlog == INVALID_HANDLE_VALUE) {
        anwarn(std::format("[***** Agent Controller *****] Cannot open log file {}, error: {}",
                           path_to_u8(log_file), GetLastError()));
        return false;
    }

    std::wstring cmdline = quote_arg(exe.wstring());
    for (auto& a : args) cmdline += L" " + quote_arg(a);

    STARTUPINFOW si{};
    si.cb = sizeof(si);
    si.dwFlags = STARTF_USESHOWWINDOW | STARTF_USESTDHANDLES;
    si.wShowWindow = SW_HIDE;
    si.hStdInput  = nullptr;
    si.hStdOutput = hlog;
    si.hStdError  = hlog;

    pi = PROCESS_INFORMATION{};
    BOOL ok = CreateProcessW(exe.c_str(), cmdline.data(), nullptr, nullptr, TRUE,
                             CREATE_NO_WINDOW, nullptr, nullptr, &si, &pi);
    DWORD err = ok ? 0 : GetLastError();
    CloseHandle(hlog);   // the child holds its own copy

    if (!ok) {
        anwarn(std::format("[***** Agent Controller *****] CreateProcess failed for {}, error: {}",
                           path_to_u8(exe), err));
        return false;
    }
    CloseHandle(pi.hThread);
    pi.hThread = nullptr;
    return true;
}
#endif

class JavaAgentController {
private:
    /** As configured, for messages. */
    std::string m_java_setting;
    std::string m_jar_setting;

    /** Resolved, absolute, existing files; empty if not found. */
    fs::path m_java_cmd;
    fs::path m_agent_jar;

#ifdef _WIN32
    HANDLE m_agent_process_handle = nullptr;
    DWORD m_agent_pid = 0;
#else
    pid_t m_agent_pid = -1;
#endif
    std::atomic<bool> m_is_running = false;

    /** Written by the agent: line 1, the websocket port it bound; line 2, its stop port (for StopAgent only). */
    fs::path m_port_file;
    std::atomic<int> m_wsport = 0;

    /** Settings' java_path, with the platform's executable name: java.dll / java -> java.exe on Windows. */
    static std::string java_exe_name(std::string java) {
        #ifdef _WIN32
        if (LangExt::endwith(java, "java.dll")) {
            // Only replace when the trailing filename is exactly "java.dll"
            java.resize(java.size() - 8); // strip "java.dll"
            java += "java.exe";
        } else if (!LangExt::endwith(java, ".exe")) {
            java += ".exe";
        }
        #else
        if (java.size() >= 4 && java.compare(java.size() - 4, 4, ".exe") == 0)
            java.erase(java.size() - 4, 4);
        #endif
        return java;
    }

    static std::string tried_list(const std::vector<fs::path>& tried) {
        std::string s;
        for (auto& t : tried) s += "\n    " + path_to_u8(t);
        return s;
    }

    /** Resolves java and the agent jar, logging what was not found. @return both found */
    bool resolve_paths() {
        bool ok = true;
        std::vector<fs::path> tried;

        if (auto j = locate_file(m_java_setting, true, tried))
            m_java_cmd = *j;
        else {
            m_java_cmd.clear();
            anwarn("[***** Agent Controller *****] Java not found for java_path: " + m_java_setting
                   + ". Tried:" + tried_list(tried));
            ok = false;
        }

        tried.clear();
        if (auto j = locate_file(m_jar_setting, false, tried))
            m_agent_jar = *j;
        else {
            m_agent_jar.clear();
            anwarn("[***** Agent Controller *****] IPC agent jar not found for wsagent_jar: " + m_jar_setting
                   + ". Tried:" + tried_list(tried));
            ok = false;
        }
        return ok;
    }

public:
    JavaAgentController() {}

    JavaAgentController(const DesktopSettings& settings) {
        m_java_setting = java_exe_name(settings.java_path);
        m_jar_setting  = settings.wsagent_jar;
    }

    ~JavaAgentController() {
        // Fallback protection
        if (m_is_running) {
            stop_agent();
        }
    }

    /**
     * Starts the background Java IPC Agent process.
     * Uses a completely hidden window context on Windows.
     * @return false if java / the jar can't be found, or the process can't start or exits at once.
     */
    bool start_agent(const std::string& jarg_agentsetting_path) {
        anlog("[AgentUtil] Starting Java Agent background worker...");

        if (!resolve_paths())
            return false;

        // The agent's settings: an absolute path, so it doesn't depend on the agent's working folder.
        std::vector<fs::path> tried;
        fs::path settings_file;
        if (auto s = locate_file(jarg_agentsetting_path, false, tried))
            settings_file = *s;
        else {
            anwarn("[***** Agent Controller *****] Settings for the agent not found: " + jarg_agentsetting_path
                   + ". Tried:" + tried_list(tried));
            return false;
        }

        std::error_code ec;
        fs::create_directories("log", ec);
        fs::path log_file = fs::absolute(fs::path("log") / "ipc_agent_java.log", ec).make_preferred();

        // The agent binds the first free port from settings.wsport, and reports it in this file.
        m_port_file = fs::absolute(fs::path("log") / "ipc-agent.port", ec).make_preferred();
        fs::remove(m_port_file, ec);   // a stale file from a crashed run must not be read
        m_wsport = 0;

        aninfo(std::format("[***** Agent Controller *****]: {} -jar {} {} {} > {}",
                           path_to_u8(m_java_cmd), path_to_u8(m_agent_jar),
                           path_to_u8(settings_file), path_to_u8(m_port_file), path_to_u8(log_file)));

    #ifdef _WIN32
        PROCESS_INFORMATION pi{};
        if (!spawn_logged(m_java_cmd,
                          { L"-jar", m_agent_jar.wstring(), settings_file.wstring(), m_port_file.wstring() },
                          log_file, pi))
            return false;

        m_agent_process_handle = pi.hProcess;
        m_agent_pid = pi.dwProcessId;   // java.exe itself, not a cmd.exe wrapper

        // A bad jar, wrong Java version, or a port in use makes java exit at once.
        if (WaitForSingleObject(m_agent_process_handle, 500) == WAIT_OBJECT_0) {
            DWORD code = 0;
            GetExitCodeProcess(m_agent_process_handle, &code);
            anwarn(std::format("[***** Agent Controller *****] Java Agent exited immediately, code {}. See {}",
                               code, path_to_u8(log_file)));
            CloseHandle(m_agent_process_handle);
            m_agent_process_handle = nullptr;
            m_agent_pid = 0;
            return false;
        }

        m_is_running = true;
        aninfo("[***** Agent Controller *****] Background Agent started. PID (Windows): "s + std::to_string(m_agent_pid));
        return true;
    #else
        std::string java = m_java_cmd.string();
        std::string jar  = m_agent_jar.string();
        std::string sets = settings_file.string();
        std::string logf = log_file.string();
        std::string portf = m_port_file.string();

        m_agent_pid = fork();
        if (m_agent_pid == 0) {
            // Child process: redirect stdout/stderr to the same log file as on Windows,
            // so CI can upload it when the agent fails to start.
            int log_fd = open(logf.c_str(), O_WRONLY | O_CREAT | O_TRUNC, 0644);
            if (log_fd >= 0) {
                dup2(log_fd, STDOUT_FILENO);
                dup2(log_fd, STDERR_FILENO);
                close(log_fd);
            }
            execl(java.c_str(), java.c_str(), "-jar", jar.c_str(), sets.c_str(), portf.c_str(), (char*)NULL);
            std::perror("execl failed");
            _exit(127);
        } else if (m_agent_pid < 0) {
            anwarn("[***** Agent Controller *****] Failed to fork background Agent process!");
            return false;
        }

        std::this_thread::sleep_for(std::chrono::milliseconds(500));
        int status = 0;
        if (waitpid(m_agent_pid, &status, WNOHANG) == m_agent_pid) {
            anwarn(std::format("[***** Agent Controller *****] Java Agent exited immediately, status {}. See {}",
                               status, logf));
            m_agent_pid = -1;
            return false;
        }

        m_is_running = true;
        aninfo("[***** Agent Controller *****] Background Agent started. PID (POSIX): "s + std::to_string(m_agent_pid));
        return true;
    #endif
    }

    /**
     * Blocks until the agent reports the port it is listening at.
     * @return the port, or 0 if the agent is not running or didn't report within timeout.
     */
    int wait_wsport(std::chrono::milliseconds timeout = std::chrono::seconds(30)) {
        auto deadline = std::chrono::steady_clock::now() + timeout;
        while (m_wsport == 0 && m_is_running && std::chrono::steady_clock::now() < deadline) {
            std::ifstream f(m_port_file);
            int p = 0;
            if (f >> p && p > 0) m_wsport = p;
            else std::this_thread::sleep_for(std::chrono::milliseconds(200));
        }
        return m_wsport;
    }

    /**
     * Executes the stop command to gracefully signal the agent to shut down.
     * Falls back to a forced process termination if it hangs.
     */
    void stop_agent() {
        if (!m_is_running) {
            anlog("[***** Agent Controller *****] Java Agent is not running, nothing to stop.");
            return;
        }
        aninfo("[***** Agent Controller *****] Stopping Java Agent gracefully...");

    #ifdef _WIN32
        anlog("[***** Agent Controller *****] Executing Stop Hook Command Line Process...");

        std::error_code ec;
        fs::path stop_log = fs::absolute("java_agent_stop.log", ec).make_preferred();

        PROCESS_INFORMATION pi{};
        if (spawn_logged(m_java_cmd,
                         { L"-cp", m_agent_jar.wstring(), L"io.oz.anclient.ipcagent.StopAgent",
                           m_port_file.wstring() },
                         stop_log, pi)) {
            // Wait up to 5 seconds for the StopAgent command to successfully communicate and finish
            WaitForSingleObject(pi.hProcess, 5000);
            CloseHandle(pi.hProcess);
        } else {
            anwarn("[***** Agent Controller *****] Failed to run Stop Hook, forcing termination.");
        }

        if (m_agent_process_handle) {
            // Give the agent itself a moment to exit after the stop hook, then force it.
            if (WaitForSingleObject(m_agent_process_handle, 3000) == WAIT_TIMEOUT) {
                anwarn("[***** Agent Controller *****] Java Agent didn't exit! Forcing termination...");
                TerminateProcess(m_agent_process_handle, 0);
            }
            CloseHandle(m_agent_process_handle);
            m_agent_process_handle = nullptr;
        }
    #else
        std::string java = m_java_cmd.string();
        std::string jar  = m_agent_jar.string();
        std::string portf = m_port_file.string();

        // POSIX Implementation
        pid_t stop_pid = fork();
        if (stop_pid == 0) {
            // Inside child execution context: execute stop utility class mapping
            execl(java.c_str(), java.c_str(), "-cp", jar.c_str(),
                  "io.oz.anclient.ipcagent.StopAgent", portf.c_str(), (char*)NULL);
            _exit(1);
        } else if (stop_pid > 0) {
            int status;
            // Wait up to 5 seconds for normal execution cycle tracking
            std::this_thread::sleep_for(std::chrono::seconds(5));
            pid_t return_pid = waitpid(stop_pid, &status, WNOHANG);

            if (return_pid == 0) { // Still running, force terminate stop agent
                kill(stop_pid, SIGKILL);
                waitpid(stop_pid, &status, 0);
            }
        }

        // Clean up the main background worker process
        if (m_agent_pid > 0) {
            kill(m_agent_pid, SIGTERM); // Ask nicely
            std::this_thread::sleep_for(std::chrono::milliseconds(500));
            kill(m_agent_pid, SIGKILL); // Ensure dead
            int status;
            waitpid(m_agent_pid, &status, 0);
            m_agent_pid = -1;
        }
    #endif

        std::error_code rm;
        fs::remove(m_port_file, rm);
        m_wsport = 0;
        m_is_running = false;
        aninfo("[***** Agent Controller *****] Java Agent stopped successfully.");
    }
};
}
