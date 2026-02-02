#pragma once

#include <thread>

#include <io/odysz/clients.h>

#include <QObject>
#include <QDebug>
#include <QUrl>

#include <QQmlEngine>
#include <QJSValue>
#include <QJSValueIterator>

class AppConstants : public QObject {
    Q_OBJECT
    QML_SINGLETON
public:
    enum SyncState {
        Synching = 1,
        Synced = 2
    };
    Q_ENUM(SyncState)
    
    static bool check_jsvalue(QJSValue v);
    static string nameof(SyncState s);
};

using namespace anson;
using synst = AppConstants::SyncState;

class QDoclientier : public QObject {
    Q_OBJECT
    QML_ELEMENT

    QString _device;
    // 1. Define the property
    Q_PROPERTY(QString device READ device WRITE setDevice NOTIFY deviceChanged)

    Doclientier clientier;

    map<string, vector<string>> syncing_paths;

public:
    explicit QDoclientier(QObject *parent = nullptr) : QObject(parent), clientier("NA") {}
    QDoclientier(QString device) : clientier(device.toStdString()) {}

    // 2. Add Getter
    QString device() const { return _device; }

    // 3. Add Setter
    void setDevice(const QString &device) {
        if (_device == device) return;
        _device = device;
        emit deviceChanged();
    }

    Q_INVOKABLE void push_files_TDD(QJSValue paths) {

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

            // emit fileStatusChanged(currentPath, "synching");
            emit fileStatusChanged(currentPath, AppConstants::SyncState::Synching);
        }
    }

    Q_INVOKABLE void push_files(QJSValue paths) {

        if (!AppConstants::check_jsvalue(paths)) return;

        this->syncing_paths = map<string, vector<string>>{};
        QJSValueIterator it(paths);
        while (it.hasNext()) {
            // this->syncing_paths.push_back(it.name().toStdString());
            this->syncing_paths[it.name().toStdString()] = {AppConstants::nameof(synst::Synching), ""};
        }

        clientier.push_files(this->syncing_paths,
            [paths, this] (const string& p, string status) {
                emit this->fileStatusChanged(p.c_str(), status.c_str());
            });
    }

signals:
    void deviceChanged(); // 4. The signal
    // Signal sends the specific path and success/fail
    void fileStatusChanged(QString path, QString status);
    void fileStatusChanged(QString path, synst status);
};
