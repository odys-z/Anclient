#pragma once

#include <thread>

#include <io/odysz/clients.h>

#include <QObject>
#include <QDebug>
#include <QUrl>

#include <QQmlEngine>
#include <QJSValue>
#include <QJSValueIterator>

#include <QFile>
#include <QTextStream>
#include <io/odysz/semantic/tier/docs.h>

#define QMLConst QString
/**
 * @brief The AppConstants class
 * Constants for communication between QML and C++.
 *
 * Usage:
 * in main.cpp, qmlRegisterType<AppConstants>("FilesystModule", 1, 0, "AppConstants");
 */
class AppConstants : public QObject {
    Q_OBJECT
    // 1. Define the property for QML
    Q_PROPERTY(QString PUSHING READ pushing CONSTANT)
    Q_PROPERTY(QString PUBLISH READ publish CONSTANT)
    Q_PROPERTY(QString UNKNOWN READ unknown CONSTANT)

public:
    explicit AppConstants(QObject *parent = nullptr) : QObject(parent) {}

    QString pushing() const { return QString::fromStdString(anson::ShareFlag::pushing); } // { return anson::ShareFlag::pushing.c_str(); }
    QString publish() const { return anson::ShareFlag::publish.c_str(); }
    QString unknown() const { return anson::ShareFlag::unknown.c_str(); }

    static bool check_jsvalue(QJSValue v);
    static QMLConst nameof(anson::ShareFlag s) { return s.name().c_str(); }

    #ifdef QT_DEBUG
    /**
     * @brief qlog
     * Adding logs to ./debug_log.txt. Can be useful as Qt Creator output pans has utf-8 encoding limits, say:
     *
     * UTF-8: café na?ve résumé こんにちは  Слава Укра?н?! "??" "??"
     *               ï                             ї і   ⇈   🌎
     * @param log
     * @param log2
     */
    static void qlog(string log, string log2) {
        QFile file("debug_log.txt");
        if (file.open(QIODevice::WriteOnly | QIODevice::Append | QIODevice::Text)) {
            QTextStream out(&file);
            out.setEncoding(QStringConverter::Utf8);
            QString timestamp = QDateTime::currentDateTime().toString("yyyy-MM-dd HH:mm:ss");
            out << timestamp << " std: [" << log2.c_str() << "] " << log.c_str() << Qt::endl <<
             "                    qt : [" << QString::fromStdString(log2)<< "] " << QString::fromStdString(log) << Qt::endl;
            file.close();
        }
    }
    #endif

};


using namespace anson;
// using synst = AppConstants::SyncState;

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
            AppConstants s;
            emit fileStatusChanged(currentPath, s.pushing());
        }
    }

    Q_INVOKABLE void push_files(QJSValue paths) {

        if (!AppConstants::check_jsvalue(paths)) return;

        this->syncing_paths = map<string, vector<string>>{};
        QJSValueIterator it(paths);
        while (it.next()) {
            qDebug() << "cpp handling: " << it.name();
            this->syncing_paths[it.name().toStdString()] = {anson::ShareFlag::pushing, _device.toStdString(), "now()"};
        }

        clientier.push_files(this->syncing_paths,
            [paths, this] (const string& p, string status) {
                #ifdef QT_DEBUG
                    AppConstants::qlog(p, status);
                #endif
                emit this->fileStatusChanged(QString::fromStdString(p), QString::fromStdString(status));
            });
    }

signals:
    void deviceChanged(); // 4. The signal
    void fileStatusChanged(QString path, QMLConst status);
};
