Hard learnt lessons: JS
=======================

.. _how-anreact-evolved:

How is @anclient/aneact evolved
-------------------------------

[v0.9.92] Protocol Instances
____________________________

Solved: Example app can test protocol depending on @anclient/semantier.

Problem: Protocol not shared between @anclient/semantier and example app.

This structure can leads to Protocol referencing error, though it's a nice try to
separate core parts for js unit test - without depending on document & window.

::

    anclient/js
      |--> lib/.../userst.jsx : constructor
      |      : import { Protocol } from '../../../semantier/protocol';
      |      |
      |      |--> anclient/js/semantier/protocol.js : Protocol.sk
      |
      |--> test/jsample/app.jsx : constructor
             : import { Protocol } from '@anclient/semantier'; (npm link @anclient/semantier)

Where anclient/js/semantier in v0.9.92 is a separate scope module::

    @anclient/semantier

Obviously the above code referencing the same Protocol module.

This structure results in the following node modules' tree in example.js::

    node_modules
      |--> @anclient
      |       |--> semantier
      |              |--> protocol.js : Protocol.sk
      |
      |--> anclient
              |--> lib/.../userst.jsx
              |      : import { Protocol } from '../../../semantier/protocol';
              |
              |--> semantier
                     |--> protocol.js : Protocol.sk

This results in using different instance.

@anclient/anreact decision
__________________________

Since @anclient/anreact v0.2.0, Anclient/js is using the following structure, for
both test, shareing Protocol and avoid "invalid hook call".

The basic idea of resolve "invalid hook call" is sharing React package for both
@anclient/anreact & depending application.

::

    js
    ├── anreact
    │   ├── src
    │   │   ├── an-components.js
    │   │   ├── jsample
    │   │   ├── patch
    │   │   ├── react
    │   │   └── utils
    │   └── webpack.config.js
    ├── semantier
    │   ├── anclient.js
    │   ├── package.json
    │   ├── protocol.js
    │   └── semantier.js
    └── test
        ├── all-jsunits.js
        ├── jsample
        │   ├── app.jsx
        │   ├── dist
        │   ├── login-app.jsx
        │   ├── package.json
        │   └── webpack.config.js
        └── jsunit
            ├── 00-aes.mocha.js
            └── ...

Both @anclient/anreact & @anclient/semantier are published separately. To transpile
test/jsample, in both anreact & semantier folder::

    npm link

in test/jsample::

    npm link @anclient/anreact
    npm link @anclient/semantier

(Because we need update lib frequently while testing and npm don't support SNAPSHOT)

In example.js, users need to install::

    npm install react react-dom react-router react-router-dom
    npm install @anclient/anreact @anclient/semantier

This makes Protocol and React been shared between Anclient/js and application.

Tips for test/jample trouble
____________________________

Additionally, if @anlient/semantier is installed in js/anreact/node_modules, the
testing project, jsample won't work as Protocol.sk been populated by test/jsample/app.jsx.

test/jsample will use different Protocol than @anclient/anreact.

For @anclient/anreact, it will use::

    js/anreact/node_modules/@anclient/semantier/protocol.js/Protocol

For test/jsample, it will use (via npm link)::

    js/semantier/protocol.js/Protocol

This will leads to failed on binding DatasetCombos.

**Solution**

To avoid this, link from anreact to semantier.

In js/anreact::

    npm link @anclient/semantier

.. note:: Load such things from server at runtime?
..
