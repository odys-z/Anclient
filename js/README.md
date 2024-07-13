Project for anclient.js. Previously name jclient which is deprecated for package
name conflicting.

# About

Anclient.js is the client (web page) for building web applications using semantic.jserv data service.
It comes with the protocol layer, @anclient/semantier, and UI presentation layer, @anclient/anreact,
which is a UI widget lib built upon React.js. Both layers now are using Typescript and provide types
and semantics checking, by which the development process can be carried upon user's data structure and
be more efficient.

Anclient.js comes with two package, @anclient/anreact & @anclient/semantier.

To install, run:

```
    npm install @anclient/anreact @anclient/semantier
```

## quick start from source (only ReactJS version currently)

To get kick started,

1. In Anclient/js

```
    npm install
    npm link
    cd test/jsample
    npm link anclient
    npm run build
```

2. start the web server.

e.g.

```
    cd dist
    python3 -m http.server 8888
```

Open

    http://localhost:8888

The jsapmple server side is needed to login. (Docker image avialable)

## Documents

[Tutorials & Guide](https://odys-z.github.io/Anclient/)

# Credits

* [PDF.js](https://github.com/mozilla/pdf.js)

* [docx4j](https://www.docx4java.org/trac/docx4j)
