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

3. query the user's basic information (role)
