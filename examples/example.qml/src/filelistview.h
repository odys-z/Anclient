#pragma once

#include <QObject>
#include <QDebug>
#include <QUrl>

#include <QFileSystemModel>
#include <QQmlEngine>

class FileHandler : public QObject
{
    Q_OBJECT
    QML_ELEMENT
    // QML_SINGLETON ### trouble only
    // Q_PROPERTY(QModelString currentPath READ currentPath WRITE setCurrentPath NOTIFY currentPathChanged)
public:
    explicit FileHandler(QObject *parent = nullptr) : QObject(parent) {}

    // Q_INVOKABLE makes this function accessible from QML
    Q_INVOKABLE void on_double_click(const QString &path, bool isDir) {
        if (isDir) {
            qDebug() << "C++ handling directory navigation:" << path;
            // You could perform additional checks or logging here
        } else {
            qDebug() << "C++ handling file opening:" << path;
            // You could trigger system processes to open the file here
        }
    }
};

