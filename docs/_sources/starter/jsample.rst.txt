About JSample
=============

The JSample is an example project showing how to use the semantic-jserv API to
implement data service.

Before flowing steps in the Anclient's quick start tutorial, you need to setup the
sever. The 2 parts must work together though they can be deployed separately.

JSample is the semantic-\* server side sample project, implemented ports like::

    menu (menu.serv)
    tools
    ...

Check `javadoc: Samport <https://odys-z.github.io/javadoc/jserv.sample/io/odysz/jsample/protocol/Samport.html>`_
for what JSample can do.

.. _jsample-quick-start:

JSample Quick Start
===================

The process is tested using Eclipse and Tomcat.

1. Clone and Import Eclipse Project

You can clone and import the project from here:
`semantic-jserv repository <https://github.com/odys-z/semantic-jserv>`_.

The repository contains 2 Eclipse project, the semantic-jserv server library and
the sample web application's sample project, jserv-sample, showing how to use the
library.

Just import the sample project located in folder "jserv-sample".

2. Check JDBC Connections

JSample using a sqlite3 db file as the default datasource for test. The provided
project has some ready to run configurations.

For the first time beginner, it's nothing to do here. More datasource configuration
based on JDBC (both connection pool and driver manager mode) can be found in
semantic-DA documents.

It's recommended have a look at the JDBC connection file, located in::

    src/main/webapp/WEB-INF/connects.xml

3.Update Maven Dependencies

Right click the imported project, then "Maven -> Update Project...".

Wait for the project refreshed. Now the project should be ready to be deployed.

4. Deploy the Web Application

In this step, you need to check the url path, which will be used to configure
the client. The tomcat server.xml in Eclipse's server configuration section may
look like this:

.. code-block:: XML

    <Server>
      <Service>
        <Engine>
          ...
          <Host appBase="webapps" autoDeploy="true" name="localhost" unpackWARs="true">
             <Context docBase="jserv-sample" path="/jsample" reloadable="true"
                      source="org.eclipse.jst.jee.server:jserv-sample"/>
          </Host>
        </Engine>
      </Service>
    </Server>
..

If everything goes ok, the console should showing message like this::

    JSingleton initializing...
    INFO - JDBC initialized using inet (mysql) as default connection.
    config file : .../.metadata/.plugins/org.eclipse.wst.server.core/tmp1/wtpwebapps/jserv-sample/WEB-INF/config.xml
    Loading Semantics:
    	.../.metadata/.plugins/org.eclipse.wst.server.core/tmp1/wtpwebapps/jserv-sample/WEB-INF/semantics.xml
    show tables
    show columns from a_attaches
    show columns from ...

Note: while handling requests, you may find some error message in console like::

    line 1:19 mismatched input '<EOF>' expecting '.'

That's because of a warning message from `antlr4 <https://github.com/antlr/antlr4>`_
upon which semantic-\* are heavily based. Till now we find is safe to ignore it.

Now, using a browser visiting::

    http://localhost:8080/jsample/login.serv

and should get some error message like this:

.. raw:: html

    <img src='https://odys-z.github.io/notes/semantics/jserv/imgs/001-jsample%20ok.png'/>

That's all! The sample service are running now. Next you should visit the service
using one of the different version of Anclient. See the
:ref:`js client quick start<anclient-quickstart-js>` and the java client (TODO doc).
