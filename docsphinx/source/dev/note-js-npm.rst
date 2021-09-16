Hard learnt lessons: JS
=======================

[v0.9.92] Protocol Instances
-----------------------------

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

This is using different instance.

.. code-block:: javascript
..
