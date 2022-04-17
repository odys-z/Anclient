.. _uri-mapping

Func URI & Datasource Mapping
=============================

About
-----

The client uses it to specify the function group; The jserv uses the configured
datasource mapping to retieve data.

Function group (uri) should be the same granuity with Semantier.

Implementation
--------------

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

- JServ decide which datasource to access, according to WEB-INF/connects

.. code-block:: xml

    <t id="conn-uri" pk='uri' columns="uri, conn">
   	<c>
  		<uri>/local/*</uri>
  		<conn>sys-sqlite</conn>
  	</c>
   	<c>
  		<uri>/cloud/*</uri>
  		<conn>album-cloud</conn>
  	</c>
    </t>
..
