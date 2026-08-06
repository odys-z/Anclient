#include "slingleton.h"

using namespace anson;

AstMap  Slingleton::asts;
JsonOpt Slingleton::opts{&asts};
Slingleton* Slingleton::instance = nullptr;
DesktopSettings Slingleton::appsettings;

