Issues & Handling
=================

Invalid hook call
-----------------

To solve the "Invalid hook call" error and helping example tests, Anclient/js now
break into 2 module, @anclient/semantier & @anclient/anreact.
( :ref:`the next section<about-invalid-hook-call>` can be a good example shows
how this issue is a big trouble)

For details on structure used to meet independent unit test and test with local
npm link, see :ref:`How is @anclient/aneact evolved<how-anreact-evolved>`.

.. _about-invalid-hook-call:

React Issue #13991 - Invalid hook call
--------------------------------------

.. attention:: Since @anclient/react verified, this issue is closed.
..

.. attention:: [deprecated] Since new example of North is verified. This issue is closed.
..

.. note:: To test with test/jsample, use
    [ npm link anclient ]
..

About the error
_______________

With webpack transpiled package, both via NPM and minified js, referencing component
will reporting error.

::

    NorthApp
      |-> AnCliant package
          |-> SysComp
          |   |-> AppBar (Material UI Function)
          |   |-> WithStyles()  (of Material UI)
          |-> Sys (withStyle(SysComp))

Error report:

.. image:: ./imgs/00-react-hook-warning.png
    :height: 400px
..

Where AppBar is exported from Material UI, SysComp, extending React.Component,
from Anclient.js lib.

The React document didn't solve this problem, and redirected to issue 13991.
Webpack also have similar issue report. See
`Rreact Document <https://reactjs.org/link/error-boundaries>`_ and issues:

`Facebook issue 13991 <https://github.com/facebook/react/issues/13991>`_ and

`Webpack issue 13868 <https://github.com/webpack/webpack/issues/13868>`_

Cause of Error
______________

This error is suppressed by resolving react of NorthApp to Anclient's node_modules/react.

In example.js/north-star/webpack.config.js:

.. code-block:: javascript

	resolve: {
		alias: { react: path.resolve('../../../js/node_modules/react') }
	},

..

This can be explained as duplicated react libs been used.

Solution
________

In Anclient, react, react-dom & material-ui/core are transpiled as external by webpack, see webpack.config.js.

.. code-block:: javascript

    module.exports = {
        externals: {
            'react': 'react',
            'react-dom' : 'reactDOM',
            "@material-ui/core": "MaterialUI"
        },

        ...

    }
..

In NorthApp, react & react-dom are installed locally. Then Anclient can be imported like:

.. code-block:: javascript

    import {
        an, AnClient, SessionClient, Protocol,
        L, Langstrs,
        AnContext, AnError, AnReactExt,
        Sys, SysComp, Domain, Roles, Orgs, Users
    } from 'anclient';
..

Similar of React Issue #13991
_____________________________

A tried scenario:

1. publish test/react-app as @anclient/test-react

2. install anclient in test/react-app

3. AnContext.anReact is undefined for <QueryForm /> in <Domain />

.. code-block:: javascript

    componentDidMount() {
      if (!this.context || !this.context.anReact)
        throw new Error('AnQueryFormComp can\'t bind controls without AnContext initialized with AnReact.');
      ...
    }
..

ReferenceError: regeneratorRuntime is not defined
-------------------------------------------------

About the error
_______________

When handling D3 with Babel 8.2.2 or later, the async functions requiring
`regenerator runtime <https://babeljs.io/docs/en/babel-plugin-transform-regenerator>`_.

There are similar reports like `here <https://stackoverflow.com/questions/53558916/babel-7-referenceerror-regeneratorruntime-is-not-defined>`_.

Solution
________

Follow `the answer <https://stackoverflow.com/a/54490329>`_.

install core-js & regenerator-runtime

.. code-block:: bash

    npm install --save core-js
    npm install --save regenerator-runtime
..

In histogram.jsx:

.. code-block:: javascript

    import "core-js/stable";
    import "regenerator-runtime/runtime";
..

These 2 steps should solve the problem.
