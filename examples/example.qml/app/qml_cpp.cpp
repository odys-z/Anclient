#include <QJSValue>
#include "qml_cpp.h"

bool AppConstants::check_jsvalue(QJSValue v) {
    if (v.isUndefined()) {
        qDebug() << "CPP: paths is Undefined";
        return false;
    }
    if (v.isNull()) {
        qDebug() << "CPP: paths is Null";
        return false;
    }
    if (!v.isObject()) {
        // This will tell you if it's a string, number, etc.
        qDebug() << "CPP: paths is not an object. It is a:" << v.toString();
        return false;
    }
    return true;
}
