// Copyright (C) 2023 The Qt Company Ltd.
// SPDX-License-Identifier: LicenseRef-Qt-Commercial OR BSD-3-Clause

#include "filesysmodel.h"

#include <string>
#include <QGuiApplication>
#include <QCommandLineParser>
#include <QQmlApplicationEngine>

#define FilesystMod "FilesystModule"


int main(int argc, char *argv[])
{
    // Initialize the static application object.
    QGuiApplication app(argc, argv);
    QGuiApplication::setOrganizationName("QtProject");
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

    return QGuiApplication::exec(); // Start the event loop.
}
