#pragma once

#include <io/odysz/jprotocol.h>
#include <vector>
#include <map>

namespace anson {

class PathsPage : public Anson {
public:
    PathsPage(const string& device) : Anson(), device(device) {}

    string device;
    size_t start;
    size_t end;

    /**
     * {key: client-path, value: [device, share-flag, share-by, share-date, isRef]}
     */
    map<string, vector<string>>clientPaths;

    PathsPage* append(const string& pth, const string& shareflag) {
        clientPaths[pth] = {device, shareflag, "by", "now", "false"};
        return this;
    }
};

/**
 * @brief The DocSyncReq class
 * java type: io.odysz.semantics.SemanticObject
 */
class DocsReq : public UserReq {
public:
    struct A {
        /** Query client paths, the sync-page */
        inline static const string selectSyncs = "r/syncflags";

        /** Requests works start synodes' synchronization
         * @since semantics-jserv 1.5.17, anclient.cmake 0.1.0,
         * this is used for IPC to get ready to push ({@link #blockStart}).
         */
        inline static const string requestSyn = "u/syn";
    };

    string synuri;
    string docTabl;

    PathsPage syncingPage;

    DocsReq(string device, string a) : UserReq(a), syncingPage(device) {}
};

}
