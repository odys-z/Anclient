#pragma once

#include <string>
// #include <io/odysz/jprotocol.hpp>
// #include <semantier.h>
#include <QObject>
#include <QDebug>
#include <QUrl>

#include <QFileSystemModel>
#include <QQmlEngine>
#include <QJSValue>
#include <QJSValueIterator>

#include <thread>
#include <chrono>

using namespace std;

class AppConstants : public QObject {
    Q_OBJECT
    QML_ELEMENT
    QML_SINGLETON
public:
    enum SyncState {
        Synching = 1,
        Synced = 2
    };
    Q_ENUM(SyncState)
};

namespace anson {

class WSClient : public QObject {

};

class Doclientier : public WSClient {
    Q_OBJECT
    QML_ELEMENT

public:
    Q_INVOKABLE void push_files(QJSValue paths) {if (paths.isUndefined()) {
            qDebug() << "CPP: paths is Undefined";
            return;
        }
        if (paths.isNull()) {
            qDebug() << "CPP: paths is Null";
            return;
        }
        if (!paths.isObject()) {
            // This will tell you if it's a string, number, etc.
            qDebug() << "CPP: paths is not an object. It is a:" << paths.toString();
            return;
        }

        // Get an iterator for the JavaScript object
        QJSValueIterator it(paths);

        while (it.hasNext()) {
            it.next();
            QString currentPath = it.name();
            // Directly set the property in the JS engine to 'true'
            // This modifies the original object in QML memory
            qDebug() << "You are in cpp" << currentPath;
            paths.setProperty(it.name(), true);

            std::this_thread::sleep_for(std::chrono::milliseconds(400));

            emit fileStatusChanged(currentPath, true);
        }
    }

signals:
    // Signal sends the specific path and success/fail
    void fileStatusChanged(QString path, bool success);
};
}
