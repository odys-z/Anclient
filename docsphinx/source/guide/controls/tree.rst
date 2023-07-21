Trees
=====

In the js/anreact/test/sessionless folder,

::
    npm i
    webpack

Test AnTreeditor
----------------

Test page::

    js/anreact/test/sessionless/dist/widgets.html

This front page work with `jserv-sandbox <https://github.com/odys-z/semantic-jserv/tree/master/jserv-sandbox>`_.
For @anclient/anreact v0.4.36, a docker image for testing AnTreeditor is published.

To install Docker, start the container with scripts::

    ./docker-start

This will pull a docker image, odysz/jsandbox:treeditor, into local container.

Then start VS Code, load dist/widgets.html with Anprism.

You should see a tree like this:

.. image:: ../../imgs/04-treeditor-1.jpg
   :height: 240px

.. image:: ../../imgs/04-treeditor-2.jpg
   :height: 20em

.. image:: ../../imgs/04-treeditor-3.jpg
   :height: 20em

To deploy docker container behind a Nginx proxy for https protocol,
see :ref: `Tip: deploy docker as Nginx backend server working as a https domain <tip-docker-https>` 