#pragma once

#include <iostream>
#include <string>
#include <filesystem>
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
#endif

#include <io/odysz/utils.h>
#include "gen/app_settings.hpp"
#include "wsclients.h"

/**
 * @brief Resolves the tilde (~) prefix in file paths across different platforms.
 * On Windows, it expands '~' to the USERPROFILE directory.
 * On Unix/Linux/macOS, it expands '~' to the HOME directory.
 */
inline static string resolveHomePath(const std::string& inputPath) {
    if (inputPath.empty() || inputPath[0] != '~') {
        u8string u8_str = fs::path(inputPath).u8string();
        std::string regular_str(u8_str.begin(), u8_str.end());
        return regular_str;
    }

    std::string homeDir;

    #ifdef _WIN32
        // Windows conditional compilation
        char* userProfile = std::getenv("USERPROFILE");
        if (userProfile) {
            homeDir = userProfile;
        }
    #else
        // Linux / macOS conditional compilation
        char* home = std::getenv("HOME");
        if (home) {
        homeDir = home;
        }
    #endif

    if (homeDir.empty()) {
        u8string u8_str = fs::path(inputPath).u8string();
        return std::string(u8_str.begin(), u8_str.end());
    }

    size_t offset = (inputPath.size() > 1 && (inputPath[1] == '/' || inputPath[1] == '\\')) ? 2 : 1;

    u8string u8_str = (fs::path(homeDir) / inputPath.substr(offset)).u8string();
    return std::string(u8_str.begin(), u8_str.end());
}
 
class JavaAgentController {
private:
    std::string m_java_exe;
    std::string m_agent_jar;

#ifdef _WIN32
    HANDLE m_agent_process_handle = nullptr;
    DWORD m_agent_pid = 0;
#else
    pid_t m_agent_pid = -1;
#endif
    bool m_is_running = false;

public:
    JavaAgentController() {}

    JavaAgentController(const std::string& java_exe, const std::string& agent_jar)
        : m_java_exe(java_exe), m_agent_jar(agent_jar) {}

    ~JavaAgentController() {
        // Fallback protection
        if (m_is_running) {
            stop_agent();
        }
    }

    /**
     * Starts the background Java IPC Agent process.
     * Uses a completely hidden window context on Windows.
     */
    bool start_agent(const std::string& jarg_agentsetting_path = "") {
        anlog("[AgentUtil] Starting Java Agent background worker...");

    #ifdef _WIN32
        std::string cmd = std::format("{} -jar {} {}", 
                                      resolveHomePath(m_java_exe), m_agent_jar, jarg_agentsetting_path);

        STARTUPINFOA si = { sizeof(STARTUPINFOA) };
        si.dwFlags = STARTF_USESHOWWINDOW;
        si.wShowWindow = SW_HIDE; // Completely invisible window context
        PROCESS_INFORMATION pi = { 0, 0, 0, 0 };

        std::string full_cmd = std::format("cmd.exe /c \"{}\" > java_agent_start.log 2>&1", cmd);
        anlog("[AgentUtil]: "s + full_cmd);

        if (CreateProcessA(NULL, const_cast<char*>(full_cmd.c_str()), NULL, NULL, TRUE, 
                           CREATE_NO_WINDOW, NULL, NULL, &si, &pi)) {
            m_agent_process_handle = pi.hProcess;
            m_agent_pid = pi.dwProcessId;
            CloseHandle(pi.hThread); // Release thread handle resource mapping safely
            m_is_running = true;
            std::this_thread::sleep_for(std::chrono::milliseconds(500));
            anlog("[AgentUtil] Background Agent started. PID (Windows): "s + std::to_string(m_agent_pid));
            return true;
        } else {
            anwarn("[AgentUtil] Failed to start Agent! Error: "s + std::to_string(GetLastError()));
            return false;
        }
    #else
        m_agent_pid = fork();
        if (m_agent_pid == 0) {
            // Child process: close standard streams or redirect if necessary
            execl(m_java_exe.c_str(), m_java_exe.c_str(), "-cp", m_agent_jar.c_str(), 
                  "io.oz.anclient.ipcagent.AnsiIpcAgent", extra_args.c_str(), (char*)NULL);
            
            anwarn("[AgentUtil] Failed to execute background process via execl!");
            exit(1);
        } else if (m_agent_pid < 0) {
            anwarn("[AgentUtil] Failed to fork background Agent process!");
            return false;
        } else {
            m_is_running = true;
            std::this_thread::sleep_for(std::chrono::milliseconds(500));
            anlog("[AgentUtil] Background Agent started. PID (POSIX): "s + m_agent_pid);
            return true;
        }
    #endif
    }

    /**
     * Executes the stop command to gracefully signal the agent to shut down.
     * Falls back to a forced process termination if it hangs.
     */
    void stop_agent() {
        anlog("[AgentUtil] Stopping Java Agent gracefully...");

    #ifdef _WIN32
        // Clean UTF-8 console context string chaining with proper output logging redirection
        std::string stop_cmd = std::format(
            "cmd.exe /c \"chcp 65001 > NUL && {} -cp {} io.oz.anclient.ipcagent.StopAgent > java_agent_stop.log 2>&1\"",
            m_java_exe, m_agent_jar);

        STARTUPINFOA si = { sizeof(STARTUPINFOA) };
        si.dwFlags = STARTF_USESHOWWINDOW;
        si.wShowWindow = SW_HIDE;
        PROCESS_INFORMATION pi = { 0, 0, 0, 0 };
            
        anlog("[AgentUtil] Executing Stop Hook Command Line Process...");
        
        if (CreateProcessA(NULL, const_cast<char*>(stop_cmd.c_str()), NULL, NULL, TRUE, 
                           CREATE_NO_WINDOW, NULL, NULL, &si, &pi)) {
            CloseHandle(pi.hThread);
            
            // Wait up to 5 seconds for the StopAgent command to successfully communicate and finish
            DWORD wait_result = WaitForSingleObject(pi.hProcess, 5000);
            CloseHandle(pi.hProcess);

            if (wait_result == WAIT_TIMEOUT) {
                anwarn("[AgentUtil] Stop hook command timed out! Forcing termination...");
                if (m_agent_process_handle) {
                    TerminateProcess(m_agent_process_handle, 0);
                }
            }
        } else {
            anwarn(std::format("[AgentUtil] Failed to run Stop Hook executable! Error: {}", GetLastError() ));
            // Immediate fallback to hard process kill if stop command hook itself fails to launch
            if (m_agent_process_handle) {
                TerminateProcess(m_agent_process_handle, 0);
            }
        }

        if (m_agent_process_handle) {
            CloseHandle(m_agent_process_handle);
            m_agent_process_handle = nullptr;
        }
    #else
        // POSIX Implementation
        pid_t stop_pid = fork();
        if (stop_pid == 0) {
            // Inside child execution context: execute stop utility class mapping
            execl(m_java_exe.c_str(), m_java_exe.c_str(), "-cp", m_agent_jar.c_str(), 
                  "io.oz.anclient.ipcagent.StopAgent", (char*)NULL);
            exit(1);
        } else if (stop_pid > 0) {
            int status;
            // Wait up to 5 seconds for normal execution cycle tracking
            std::this_thread::sleep_for(std::chrono::seconds(5));
            pid_t return_pid = waitpid(stop_pid, &status, WNOHANG);
            
            if (return_pid == 0) { // Still running, force terminate stop agent
                kill(stop_pid, SIGKILL);
            }
        }

        // Clean up the main background worker process
        if (m_agent_pid > 0) {
            kill(m_agent_pid, SIGTERM); // Ask nicely
            std::this_thread::sleep_for(std::chrono::milliseconds(500));
            kill(m_agent_pid, SIGKILL); // Ensure dead
        }
    #endif

        m_is_running = false;
        anlog("[AgentUtil] Java Agent stopped successfully.");
    }
};