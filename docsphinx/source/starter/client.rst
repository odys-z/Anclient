About Anclient
==============

Anclient is the client side API for semantic-jserv service like JSample, which
including:

* anclient.java,

the java client.

* @anclient/semantier,

the semantics supported protocol layer, and *Semantier* is short for Semantics Tier,
a low level js client API for accessing service providen by semantic-jserver.

Since 0.9.42, it's ported to Typescript, with types for better user experience with
support of VS Code Intellisense.

* @anclient/anreact,

A presentation tier package for accessing semantier API, built on Material UI + ReactJS.

* anclient.cs,

the planned c# client.

Anclient.js Quick Start
=======================

There are 2 built-in typescript packages for testing come with the installed npm packages,
which can be useful for kick start.

Start with session managed sample
---------------------------------

This sample project consists two part, one from the test project of semantic-jserv,
one from the test of @anclient/anreact.

1. Deploy a data service using Semantic-jserv

Say, :ref:`tsample <jsample-quick-start>`.

2. Install Anclient.js.

Anclient.js is actually implemented in Typescript.

It's two npm packages::

    npm install react react-dom
    npm install @anclient/semantier @anclient/anreact

3. Create a Typescript client

See `Anclient/js/areact/test/tsample/dist/.html <https://github.com/odys-z/Anclient/blob/master/js/test/sessionless/dist/index.html>`_
for a reactJS client, which can accessing data service, a implementation based
on semantic-jserv.

Start with the session less client
----------------------------------

This way uses jserv-sandbox (`src <https://github.com/odys-z/Anclient/tree/master/js/anreact/test/sessionless>`_)
as example for quick start, which won't verify http request at server side.

1. Deploy a web application of jserv-sandbox

Download the java web project and deploy to a servlet container,
:download:`jserv-sandbox java project <https://github.com/odys-z/Anclient>`,
and open as an existing maven project,

::

    Eclipse -> File -> Open Projects from File System

and install maven package, then deploy to a Tomcat server.

To run the server, set **VOLUME_HOME** environment variable to the volume folder
path, like::

    -DVOLUME_HOME="C:\\Users\\Ody\\jserv-sandbox\\volume"

.. image:: ./imgs/01-eclipse-import-sandbox.jpg 
    :height: 120px

.. image:: ./imgs/04-sandbox-tomcat.png 
    :height: 120px

And don't forget to allow CROS if planning to deploy the servicer side at a different
domain to the web page server, where the html pages are loaded from.

In web application's web.xml,

.. code-block:: xml

    <filter>
	  <filter-name>CorsFilter</filter-name>
	  <filter-class>org.apache.catalina.filters.CorsFilter</filter-class>
    </filter>

    <filter-mapping>
      <filter-name>CorsFilter</filter-name>
      <url-pattern>/*</url-pattern>
    </filter-mapping>
..

2. Install Anclient.js.

See above.

3. Build the Typescript client

Download the sessionless client and extract, build with::

    webpack

Then load App with a HTML page like
`Anclient/js/anreact/test/sessionless/dist/main.html <https://github.com/odys-z/Anclient/blob/master/js/anreact/test/sessionless/dist/index.html>`_.

.. code-block:: html

    <div id="app"></div>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <script src="AnHome-1.0.0.min.js"></script>
    <script>
        // let searchParams = new URLSearchParams(window.location.search)
        // let serv = searchParams ? searchParams.get('serv') : undefined;
        less.App.bindHtml('app', {
            jsonUrl: 'http://localhost:8889/github.json',
            serv: 'sandbox', Window, portal: 'index.html'});
    </script>
..

where the function *bindHtml(div, {jsonUrl, serv})* is implemented in
`less-app.tsx <https://github.com/odys-z/Anclient/blob/master/js/anreact/test/sessionless/src/less-app.tsx>`_.

The *jsonUrl* is a configure variable that can tells *bindHtml()* where to find
json data service, the *jserv-sandbox*.

The final result load with `Anprism <https://marketplace.visualstudio.com/items?itemName=ody-zhou.anprism>`_
should like this:

.. image:: ./imgs/05-sessionless-vscode.png
    :height: 160px

.. image:: ./imgs/03-sessionless.png
    :height: 160px
