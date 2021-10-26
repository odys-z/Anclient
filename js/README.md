Project for anclient.js. Previously name jclient which is deprecated for package
name conflicting.

# About

Anclient.js comes with two package, @anclient/anreact & @anclient/semantier.



Both need to be install separately.

install:

```
    npm install @anclient/anreact @anclient/semantier
```

Both published with .d.ts file. Typescript modules are declared in index.d.ts.

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

## His Home page

[It's here!](https://odys-z.github.io)
