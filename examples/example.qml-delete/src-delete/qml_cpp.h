#pragma once

#include "clients.h"

#include <QObject>
#include <QDebug>
#include <QUrl>

#include <QQmlEngine>
#include <QJSValue>
#include <QJSValueIterator>

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
    
    static bool check_jsvalue(QJSValue v);
};

using namespace anson;

class QDoclientier : public QObject {
    Q_OBJECT
    QML_ELEMENT

    string device;
    Doclientier clientier;
public:
    QDoclientier(string device) : clientier(device) {}

    Q_INVOKABLE void push_files_TDD(QJSValue paths) {
        if (!AppConstants::check_jsvalue(paths)) return;
        clientier.push_files_TDD(paths, [paths, this](QString pth, string state) {
            emit this->fileStatusChanged(pth, state);
        });
    }

    Q_INVOKABLE void push_files(QJSValue paths) {
        if (!AppConstants::check_jsvalue(paths)) return;
        clientier.push_files(paths, [paths, this] (QString p, string status) {
            emit this->fileStatusChanged(p, status);
        });
    }

signals:
    // Signal sends the specific path and success/fail
    void fileStatusChanged(QString path, string status);
};
