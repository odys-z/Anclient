#include <QGuiApplication>
#include <QCommandLineParser>
#include <QQmlApplicationEngine>

// WinMain() => main()
#if defined(_WIN32) && defined(__GNUC__)
extern "C" {
int* __imp___argc = __p___argc();
char*** __imp___argv = __p___argv();
}
#endif

int main(int argc, char *argv[])
{
    QGuiApplication app(argc, argv);

    QQmlApplicationEngine engine;
    QObject::connect(
        &engine,
        &QQmlApplicationEngine::objectCreationFailed,
        &app,
        []() { QCoreApplication::exit(-1); },
        Qt::QueuedConnection);
    engine.loadFromModule("album_qml", "Main");

    return app.exec();
}
