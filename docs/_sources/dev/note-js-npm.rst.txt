Hard learnt lessons: JS
=======================

.. _anreact-tree:

@anclient/anreact decision
__________________________

Since @anclient/anreact v0.2.0, Anclient/js is using the following structure, for
both test, shareing Protocol and avoid "invalid hook call".

The basic idea of resolve "invalid hook call" is sharing React package for both
@anclient/anreact & depending application.

::

    js
    ├── anreact
    |   ├── node_modules
    |   |   └── react & react-dom
    │   ├── src
    │   │   ├── an-components.js
    │   │   ├── jsample
    │   │   ├── patch
    │   │   ├── react
    │   │   └── utils
    |   ├── test
    |   │   ├── app.jsx
    |   │   ├── dist
    |   │   ├── login-app.jsx
    |   │   ├── package.json
    |   │   └── webpack.config.js
    │   └── webpack.config.js
    └── semantier
        ├── anclient.js
        ├── package.json
        ├── protocol.js
        ├── semantier.js
        └── test
            ├── all-jsunits.js
            └── jsunit
                ├── 00-aes.mocha.js
                └── ...

in anreact/test/jsample::

    npm link @anclient/anreact
    npm link @anclient/semantier

(Because we need update lib frequently while testing and npm don't support SNAPSHOT)

In example.js, users need to install::

    npm install react react-dom react-router react-router-dom
    npm install @anclient/anreact @anclient/semantier

This makes Protocol and React been shared between Anclient/js and application.
