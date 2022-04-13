Func URI & Datasource Mapping
=============================

- Client provide function uri

TS: @anclient/semantier-st

(currently decleared as uri: stirng)

.. code-block:: typescript

    export class AnsonBody {
        constructor(body?: {type: string, a?: string, parent?: string, uri: string}) {
            ...

            this.parent = body?.parent;
            this.uri = body?.uri;
        }
    }
..

.. code-block:: java

    public abstract class AnsonBody extends Anson {
        protected AnsonBody(AnsonMsg<? extends AnsonBody> parent, String uri) {
            this.parent = parent;
            this.uri = uri;
        }
    }
..

.. code-block:: c#

    public AnsonBody Parent(AnsonMsg p, string uri)
    {
        parent = p;
        return this;
    }
..

Function uri holds the same granuity with Semantier.

- JServ decide which datasource to access, according to WEB-INF/connects

.. code-block:: xml

..
