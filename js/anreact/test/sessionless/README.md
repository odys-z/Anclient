# About

A test project for @anclient/anreact.

This project is also used as an example for @anclient/anreact
[quick start tutorial][def], the session-less way.

[def]: https://odys-z.github.io/Anclient/starter/client.html#js-quick-start

# Release Notes

- Feb 27, 2023

v 1.0.1, working together with sandbox v0.2.1.

1. moved from js/test/sessionless to here, fix "Invalid Hook Call Warning" of ReactJs.

2. Fixed Protocol.sk is undefined bug (use @anClient/semantier).

3. remove duplicate UserstReq at server side.

# Setup source project

```
    npm i typescript --save-dev
    npx tsc --init
    npx tsc index.ts  # problem?
    npx tsc -w        # compile in watch mode
    npm i tslint --save-dev
    npx tslint --init
```

# load HTML page with Anprism

Setup vs code project in test/sessionless by copy this to ./vscode/launch.json::

    {
      "version": "0.2.0",
      "configurations": [
        { "name": "Launch Chrome",
          "request": "launch",
          "type": "pwa-chrome",
          "url": "http://localhost:8888",
          "webRoot": "${workspaceFolder}/dist"
        },
    }

Then load treegrid.html etc. with Anprism. (Right click the file)
