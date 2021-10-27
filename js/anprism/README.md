
 [![install](https://vsmarketplacebadge.apphb.com/version-short/ody-zhou.anprism.svg)](https://marketplace.visualstudio.com/items?itemName=ody-zhou.anprism)



# About Anprism

Anprism is a light weight helper for editing morden (webpack transpiled) web pages in vscode.

![see repository/js/anprism/readme for screenshot](res/00-anprism-0.2.0.png)

For live editing, there are other [similar (better) implementation](https://marketplace.visualstudio.com/items?itemName=ms-vscode.live-server).

Currently the difference is that Anprism uses Python for web server.

[Screenshot](https://github.com/odys-z/Anclient/tree/master/js/anprism)

## install

In VS Code extension manager, search 'Anprism'.

## Quic Start

If you haven't add a debug configuration, add one with VS Code. Anprism use the first
"pwa-chrome" type's webroot as it's server root. E.g, if in launch.json,

```
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Attach to Chrome",
            "port": 9222,
            "request": "attach",
            "type": "pwa-chrome",
            "url": "http://localhost:8888",
            "webRoot": "${workspaceFolder}/dist"
        }
    ]
}
```

Then, in VS Code explorer, right click html page to be viewed, say "dist/index.htm", select "Load Anprism".

Or

```
    Ctr + Shift + p

    Anprism: Load Anprism
```

Anprism will not transpile or call npm scripts. You need take care of your package manually, i. e. if you are using webpack, you need start the watch task by yourself. 

**Troubleshootings**

- Nothing shown in panel

The VS Code webview looks like heavily caching browsing history locally. For currrent version, please close the Anprism panel and re-load it if not worksing. Also, make sure the latest webpack output is been also loaded. 

**Anprism Log**

In VS Code output window, click the dropdown options for extensions, select *Anprism*.

**Enjoy!**
