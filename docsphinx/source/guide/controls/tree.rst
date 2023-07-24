Trees
=====

In the js/anreact/test/sessionless folder,

::

    npm i
    webpack

.. _controls_treeditor:

Test AnTreeditor
----------------

Test page::

    js/anreact/test/sessionless/dist/widgets.html

This front page work with `jserv-sandbox <https://github.com/odys-z/semantic-jserv/tree/master/jserv-sandbox>`_.
For @anclient/anreact v0.4.36, a docker image, `jsandbox:treeditor <https://hub.docker.com/r/odysz/jsandbox/tags>`_,
for testing AnTreeditor is published.

To install Docker, start the container with scripts::

    ./docker-start

This will pull a docker image, odysz/jsandbox:treeditor, into local container.

Start VS Code, load dist/widgets.html with Anprism. Follwing is what is expected:

.. image:: ../imgs/04-treeditor-1.jpg
   :height: 10em

.. image:: ../imgs/04-treeditor-2.jpg
   :height: 10em

.. image:: ../imgs/04-treeditor-3.jpg
   :height: 10em

To deploy docker container behind a Nginx proxy for https protocol,
see :ref:`Tip: deploy docker as Nginx backend server working as a https domain<tip-docker-https>`

Customize Tree Grid
-------------------

See `Anclient/examples/example.js/album/app.tsx <https://github.com/odys-z/Anclient/blob/master/examples/example.js/album/src/app.tsx>`_,
function rander().typeParser().

.. _controls_typeparser:

.. code-block:: typescript

    function typeParser(c: AnTreegridCol, n: AnTreeNode, opt: {classes: ClassNames, media: Media}) {
        if (n.node.children?.length as number > 0) return <></>;
        else return that.docIcon.typeParser(c, n, opt);
    }
..
