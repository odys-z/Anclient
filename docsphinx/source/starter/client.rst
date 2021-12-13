About Anclient
==============

Anclient is the client side API for semantic-jserv service like JSample, which
including:

* anclient.java,

the java client.

* @anclient/semantier,

Semantier is short for Semantics Tier, a low level js client API for accessing service
providen by semantic-jserver.

Since 0.9.42, it's ported to Typescript, with types for better user experience with
support of VS Code Intellisense. 

* @anclient/anreact,

A presentation tier package for accessing semantier API, built on Material UI + ReactJS.

* anclient.cs,

the planned c# client.

JS Quick Start
==============

Start with the basic API
------------------------

1. Deploy a web application of Semantic-jserv

Say, :ref:`jsample<jsample-quick-start>`.

2. Install Anclient.

It's a npm package::

    npm install react react-dom
    npm install @anclient/semantier @anclient/anreact

3. Create a client

See Anclient/js/test/jsample/dist/main.html
