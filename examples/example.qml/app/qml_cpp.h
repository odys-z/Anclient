#pragma once

#include "wsclients.h"
#include <thread>

#include <io/odysz/clients.h>
#include <io/odysz/common.h>
#include <io/odysz/jprotocol.h>

#include <QObject>
#include <QDebug>
#include <QUrl>

#include <QQmlEngine>
#include <QJSValue>
#include <QJSValueIterator>

#include <QFile>
#include <QTextStream>
#include <io/odysz/jclient/syn.h>
#include <io/odysz/gen/doctier.hpp>
#include <io/odysz/semantic/tier/docs.h>

#define QMLConst QString

using namespace anson;

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

    QString pushing() const { return QString::fromStdString(ShareFlag::pushing); } // { return anson::ShareFlag::pushing.c_str(); }
    QString publish() const { return ShareFlag::publish.c_str(); }
    QString unknown() const { return ShareFlag::unknown.c_str(); }

    static bool check_jsvalue(QJSValue v);
    static QMLConst nameof(ShareFlag s) { return s.name().c_str(); }

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


class QDoclientier : public QObject {
    Q_OBJECT
    QML_ELEMENT


    inline static const QString sysuri = "/sys/cpp";
    inline static const QString synuri = "/syn/cpp";

    map<string, vector<LangExt::VarType>> syncing_paths;

    QString _device;
    // property
    Q_PROPERTY(QString device READ getDevice WRITE setDevice NOTIFY deviceChanged)
public:
    // Getter
    QString getDevice() const { return _device; }

    // Setter
    void setDevice(const QString &device) {
        if (_device == device) return;
        _device = device;
        emit deviceChanged();
    }

    std::shared_ptr<WSClient> wsclient;
    std::shared_ptr<Doclientier> jservclient;

    inline static OnError onErr = [](MsgCode c, const string& e, const vector<string> &a) {
        anerror(std::format("[ERROR code {}], error: {}", AnsonJavaEnumAst::name<MsgCode>(c), e));
    };

    inline static OnProgress onprogress = [](const string& m, const string &a) {
        aninfo(std::vformat(m, std::make_format_args(a)));
    };

    explicit QDoclientier(QObject *parent = nullptr) : QObject(parent) {}

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

        // this->syncing_paths = map<string, vector<string>>{};
        QJSValueIterator it(paths);
        while (it.next()) {
            qDebug() << "cpp handling: " << it.name();
            this->syncing_paths[it.name().toStdString()] = {ShareFlag::pushing, _device.toStdString(), "now()"};
        }

        PathsPage syncingpage;
        syncingpage.clientPaths = syncing_paths;
        wsclient->on_msg([this]() -> void {
            if (wsclient->block_poll(200) > 0) {
                AnsonMsg<DocsResp> rep = wsclient->pop_envelope<DocsResp>();
                if (rep.code == MsgCode::Code::ok) {
                for (const auto& kv : rep.Body().syncingPage.clientPaths) {
                    optional<string> s = LangExt::var_str(kv.second[0]);
                    emit this->fileStatusChanged(QString::fromStdString(kv.first),
                                 QString::fromStdString(s ? s.value() : ""));
                }
                }
            }})
            ->place_tasks(syncingpage);
}

    Q_INVOKABLE void query_synode(QJSValue paths) {
        qDebug() << "'''''''''''''''''''''''''''''''''''''''''''''''";
    }

    void login_synode(const JServUrl & jserv, const string &uid, const string &pswd) noexcept {
        try {
            andebug("''''''''''''''''''  login  '''''''''''''''''''''''''''''");
            SessionClient ssclient = SessionClient::loginWithUri(jserv,
                        sysuri.toStdString(), uid, pswd, _device.toStdString(), onErr);
            jservclient = make_shared<Doclientier>(onErr);
            jservclient.get()->client = ssclient;
        } catch (const std::logic_error e) {
            anwarn(e.what());
            onErr(MsgCode::Code::exSession, e.what(), {});
        } catch (const std::exception e) {
            anerror(e.what());
            onErr(MsgCode::Code::exSession, e.what(), {});
        }
    }

    /**
     * @brief connections
     * @return [is ws conn ok, is synode conn ok]
     */
    vector<bool> connections() {
        return {wsclient != nullptr && !LangExt::isblank(jservclient.get()->client.ssInf.ssid),
             jservclient != nullptr && !LangExt::isblank(jservclient.get()->client.ssInf.ssid)};
    }

signals:
    void deviceChanged(); // 4. The signal
    void fileStatusChanged(QString path, QMLConst status);
};
