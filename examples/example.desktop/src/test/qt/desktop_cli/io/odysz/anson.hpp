#ifndef io_odysz_anson_hpp
#define io_odysz_anson_hpp

#include <memory>
#include <string>
#include <sstream>
#include <concepts>
#include <stdexcept>
#include <glaze/glaze.hpp>
// #include<glaze/util/any.hpp>
#include <glaze/util/type_traits.hpp>
#include <bits/stl_map.h>

using namespace std;

class JsonOpt;

class IJsonable {
public:
    virtual ~IJsonable() = default;

public:
    class JsonableFactory {
        virtual unique_ptr<IJsonable> fromJson(const string& json);
    };

    // IJsonable toBlock(ostream& stream, JsonOpt& opt) {
    //     // glz::write<glz::opts{}>(this, stream);
    //     glz::basic_ostream_buffer os_buf{stream};
    //     glz::write(this, os_buff);
    // }

    void toBlock(ostream& stream, JsonOpt& opt) {
        // 1. Wrap the stream in a Glaze-optimized buffer
        glz::basic_ostream_buffer os_buf{stream};

        // 2. Dereference 'this' and pass the instance of your options
        // Using glz::write_json is the standard for JSON specifically
        glz::write_json(glz::to_any{*this}, os_buf);

        // Note: The buffer flushes to the stream automatically when it goes out of scope.
    }

    // default
    string toBlock(JsonOpt* opt)
    {
        ostringstream bos;// = new ByteArrayOutputStream();
        this->toBlock(bos, opt);
        return bos.str();
    }

    string toBlock()
    {
        JsonOpt* defaultopt = nullptr;
        return this->toBlock(defaultopt);
    }

    virtual IJsonable toJson(string buf);
};

#define GLZ_REGISTER_JSONABLE(T) \
void dispatch_write(glz::basic_ostream_buffer<std::ostream>& buf) const override { \
        glz::write_json(*static_cast<const T*>(this), buf); \
}

class Anson : public IJsonable {
public:
    virtual ~Anson() = default;

    template<std::derived_from<Anson> T = Anson>
    static std::unique_ptr<T> fromPath(const std::string& path) {
        auto p = std::make_unique<T>();

        constexpr auto options = glz::opts{
            .error_on_unknown_keys = false,
            .error_on_missing_keys = false,
            .partial_read = true
        };

        auto ec = glz::read_file_json<options>(*p, path, std::string{});

        if (ec) {
            throw std::runtime_error("Glaze parse error at file: " + path);
        }

        return p;
    }
};

class JsonOpt : public Anson {
public:
   virtual ~JsonOpt() = default;
};
// template <>
// struct glz::meta<IJsonable*> {
//     static constexpr auto value = glz::object(
//         "DerivedA", [](auto&& v) { return static_cast<DerivedA*>(v); },
//         "DerivedC", [](auto&& v) { return static_cast<DerivedC*>(v); }
//         );
// };

#endif // ANSON_HPP
