#if defined(_MSC_VER) && (_MSC_VER >= 1600)
#pragma execution_character_set("utf-8")
#endif

#include "filesysmodel.h"

#include <string>
#include <windows.h>
#include <QGuiApplication>
#include <QCommandLineParser>
#include <QQmlApplicationEngine>

#define FilesystMod "FilesystModule"

#include "qml_cpp.h"

int main(int argc, char *argv[])
{
#ifdef Q_OS_WIN
    SetConsoleOutputCP(CP_UTF8);
    SetConsoleCP(CP_UTF8);
#endif

    // Initialize the static application object.
    QGuiApplication app(argc, argv);
    QGuiApplication::setOrganizationName("io.github.odys-z");
    QGuiApplication::setApplicationName("File System Explorer");
    // FilesystModule
    QGuiApplication::setWindowIcon(QIcon((std::string(":/qt/qml/") + FilesystMod + "/icons/album.svg").c_str()));

    // Setup the parser and parse the command-line arguments.
    QCommandLineParser parser;
    parser.setApplicationDescription("Qt Filesystemexplorer Example");
    parser.addHelpOption();
    parser.addVersionOption();
    parser.addPositionalArgument("", QGuiApplication::translate(
                "main", "Initial directory"),"[path]");
    parser.process(app);
    const auto args = parser.positionalArguments();

    // Load the QML entry point.
    QQmlApplicationEngine engine;
    // engine.loadFromModule("FilesystModule", "Main");
    engine.loadFromModule(FilesystMod, "Main");

    if (engine.rootObjects().isEmpty())
        return -1;

    // Set the initial directory if provided
    if (args.length() == 1) {
        auto *fileSystemModel = engine.singletonInstance<FilesystModel*>(
            // "FilesystModule", "FilesystModel");
            FilesystMod, FilesystMod);
        fileSystemModel->setInitialDirectory(args[0]);
    }

    // qmlRegisterType<AppConstants>("FilesystModule", 1, 0, "AppConstants");
    AppConstants qml_cpp;
    qmlRegisterSingletonInstance ("FilesystModule", 1, 0, "AppConstants", &qml_cpp);

    #ifdef QT_DEBUG
        // qDebug() << "UTF-8: café naïve résumé こんにちは " << "Слава Україні!" << qml_cpp.publish() << qml_cpp.publish();
        AppConstants::qlog("UTF-8: café naïve résumé こんにちは", anson::ShareFlag::pushing);
        AppConstants::qlog("Слава Україні!" , anson::ShareFlag::publish);
    #endif

    return QGuiApplication::exec(); // Start the event loop.
}
