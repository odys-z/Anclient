#include "slingleton.h"

AstMap  Slingleton::asts;
JsonOpt Slingleton::opts{&asts};
Slingleton* Slingleton::instance = nullptr;
QMLAppSettings Slingleton::qmlsettings;
