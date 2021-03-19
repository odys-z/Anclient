About Anclient
==============

Anclient is the client side API for semantic-jserv service like JSample, which
including:

* anclient.java,

the java client.

* anclient.js,

the low level js client API for accessing service at jerver.sample.

It's for other presentation tier extension, such as HandsonTable, which is also
been used in commercial project. All the clients are tested together with
jserv.sample (All? Not True) and can be configured to a different jserv service.

* anclient.js.easui,

the `JQuery EasyUI <https://www.jeasyui.com/index.php>`_ API lib that take care
of communicating with semantic-\*, binding UI widgets, based on anclient.js.

The EasyUI version is implemented as a basic enterprise webapp's client, including
a role based function privilege management and a cheap workflow extension. It's
a good starting point for a commercial webapp.

* anclient.cs,

the planned c# client.

* anclient.js.vue,

the planned vue components can communicate with sematic-\*, based on anclient.js.

The sample project's client side located in the anclient/test folder.

.. _anclient-quickstart-js:

JS Quick Start
==============

Start with the basic API
------------------------

1. Deploy a web application of Semantic-jserv

Say, :ref:`jsample<jsample-quick-start>`.

2. Install Anclient.

It's a npm package::

    npm install --save-dev anclient

3. Create a client

The client is based upon the plain js API.

.. code-block:: javascript

    // initialize a client of jsample
    var $J = new $J();
    $J.init(null, "http://127.0.0.1:8080/jsample");

    var ssClient;

    function login() {
        $J.login(
            "admin", // user name
            "",      // password (won't sent on line - already set at server)
            // callback parameter is a session client initialized with session token
            // client.ssInf has session Id, token & user information got from server
            function(client){
                ssClient = client;
                console.log(ssClient.ssInf);
                query();
            });
    }

    /** Create a query request and post back to server. */
    function query(conn) {
        var req = ssClient.query(conn, "a_user", "u", {page: 0, size: 20});
        req.body[0]
            .expr("userName", "un").expr("userId", "uid").expr("roleName", "role")
            .j("a_roles", "r", "u.roleId = r.roleId")
            .whereCond("=", "u.userId", "'admin'");

        $J.post(req,
            // success callback. resp is a server message
            function(resp) {
                console.log(resp);
            });
    }
..

It's doing 3 things:

1. create a client of jsample

2. login with the user's login name and password

The session is managed by Semantic.jserv and Anclient together. Each user's action
will touch the time stamp at jserv's session information. If user stop action for
a time (configured at server side), the session will expired

3. query the user's basic information (role)

The query is a simple SQL example. It's wrapped by upper widget binding layer to
produce automatic data bindings.

Example: x-visual
-----------------

Copy the released template project form the `release section <https://github.com/odys-z/Anclient/releases/tag/An-example.js1.0>`_.

Anclient has multiple samples (in the future) sharing node's modules. You can also
install those like this ::

    -+- examples.js
     |--- x-visual
     |--- sampel-TODO

To install dependencies::

    cd examples.js
    npm install jquery
    npm install d3 earcut oboe
    npm install anclient
    npm install x-visual@0.3.81
    npm install babel-plugin-syntax-jsx babel-preset-env --save-dev

**Note:** This example depends on x-visual webgl1 branch, version 0.3.81.

Install webpack for the sample project::

    cd x-visual
    npm init
    npm install webpack webpack-cli --save-dev

Then use webpack transpile the source::

    npm run build

or::

    webpack

There are many way to host the index.html page, e.g. start a python server in
examples.js (index.html used 2 level parent path)::

    python3 -m http.server 8080

Then browse to::

    http://localhost:8080/x-visual/bar-chart/

This example also will visiting the jserv-sample data service.
See :ref:`JSample quick start <jsample-quick-start>` for how to setup it.
