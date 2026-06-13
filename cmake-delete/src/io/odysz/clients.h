#pragma once

#include <functional>
#include <thread>
#include <chrono>
#include <string>

#include "semantier.h"

using namespace std;

namespace anson {


/**
 * TODO move to a stand alone protocol tier?
 * JProtocol.OnProgress
 */
using OnProgress = std::function<void(const string& path, std::string status)>;

class WSClient {

};

class Doclientier : public WSClient {

    string device;
public:
    Doclientier(string device) : device(device) {}

    // void push_files_TDD(string paths, OnProgress onprc) {

    //     // Get an iterator for the JavaScript object
    //     QJSValueIterator it(paths);

    //     while (it.hasNext()) {
    //         it.next();
    //         QString currentPath = it.name();
    //         // Directly set the property in the JS engine to 'true'
    //         // This modifies the original object in QML memory
    //         cout << "You are in cpp" << currentPath;
    //         paths.setProperty(it.name(), true);

    //         std::this_thread::sleep_for(std::chrono::milliseconds(400));

    //         // emit fileStatusChanged(currentPath, "synching");
    //         onprc(currentPath, "synching");
    //     }
    // }

    // void push_files(QJSValue paths, OnProgress onprc) {

    //     // PathsPage sync_page(device);
    //     DocsReq reqbd{device, DocsReq::A::requestSyn};

    //     QJSValueIterator it(paths);
    //     while (it.hasNext()) {
    //         it.next();
    //         QString pth = it.name();

    //         reqbd.syncingPage.append(pth.toStdString(), "synching");

    //         onprc(pth, "synching");
    //     }
    // }

// signals:
//     // Signal sends the specific path and success/fail
//     void fileStatusChanged(QString path, string status);
};
}
