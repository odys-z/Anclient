#ifndef io_oz_anclient_ipcagent
#define io_oz_anclient_ipcagent

#include <string>
#include <map>

using namespace std;

struct TestSettings {
    string type;
    string qtclient;
    int ipc_port;
    map<string, string> ipc_session;
};

#endif
