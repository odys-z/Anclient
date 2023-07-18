About Anreact
=============

Anreact, npm package @ancllient/anreact, is a collection of ReactJs UI components
used for binding json data provided by @anclient/semantier, the semantic data layer
at typescript client.

Running the Tests
-----------------

The @anclient/anreact (typescript) is test with three types of test::

    mocha tests
    jsample
    session-less widgets
..

To run mocha tests, in js/anreact folder, run::

    npm test
..

For jsample (jserv-sample), see Quick Start.

For React Controls, run tests in js/anreact/test/sessionless.

Test: AnTreeditor
_________________

In the js/anreact/test/sessionless folder,

::
    npm i
    webpack
..

Install Docker, start the container with scripts::

    ./docker-start
..

This will pull a docker image, odysz/jsandbox:treeditor, into local container.

Then start VS Code, load dist/widgets.html with Anprism.

You should see a tree like this:

.. image:: ../imags/04-treeditor-1.jpg
   :height: 20em
..

.. image:: ../imags/04-treeditor-2.jpg
   :height: 20em
..

.. image:: ../imags/04-treeditor-3.jpg
   :height: 20em
..
