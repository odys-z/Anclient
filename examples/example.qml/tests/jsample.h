#pragma once

#include <io/odysz/anson.h>

namespace anson {

class SampleSettings : public Anson {

public:
    inline static const string _type_ = "io.odysz.jsample.SampleSetttings";

    SampleSettings() : Anson(_type_) {}

    string vol_name;
    string volume;
    string conn;
    int    port;
    string rootkey;

};
}
