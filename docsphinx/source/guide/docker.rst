Deploy docker layers
====================

Building & Publishing
---------------------

For running Docker Nginx.

::

    docker build -t react-quiz .
    docker rm quiz
    docker run --name quiz -dp 80:80 -t react-quiz

For building *Jserv-sample* image, in semantic-jserv/jserv-sample/::

    docker pull tomcat:9.0
    docker build -t jserv-sample .
    docker run --name jserv-sample -d -p 8080:8080 --rm jserv-sample

    docker system prune -a
    docker tag e62 odysz/jserv-sample:1.1
    docker push odysz/jserv-sample:1.1

Docker Labs Quick Start
-----------------------

::

   docker pull odysz/jserv-sample:1.1
   docker run --name jserv-sample -d -p 8080:8080 --rm jserv-sample

.. image:: imgs/01-docker-labs.png

Copy and go the url, visiting

::

    http://ip172-18-0-123-c2mc....direct.labs.play-with-docker.com/jserv-sample/menu.serv

Ending with */jserv-sample/menu.serv*.

.. image:: imgs/02-docker-labs-xv.png

Troubleshootings
----------------

No Container is bring up by Docker run
______________________________________

Error: There is insufficient memory for the JRE::

    $ docker run --name album -v ...:/var/local/volume -p 127.0.0.1:8083:80 -d --rm odysz/...
    722e46b76cd9dab4d18a463953c6cc5782d135cfe2874223c193b54f39ddf3e0
    $ docker ps
    CONTAINER ID   IMAGE     COMMAND   CREATED   STATUS    PORTS     NAMES
    $ docker run --name album -v ...:/var/local/volume -p 127.0.0.1:8080:80 -it --rm odysz/...
    Using CATALINA_BASE:   /usr/local/tomcat
    Using CATALINA_HOME:   /usr/local/tomcat
    Using CATALINA_TMPDIR: /usr/local/tomcat/temp
    Using JRE_HOME:        /opt/java/openjdk
    Using CLASSPATH:       /usr/local/tomcat/bin/bootstrap.jar:/usr/local/tomcat/bin/tomcat-juli.jar
    Using CATALINA_OPTS:
    NOTE: Picked up JDK_JAVA_OPTIONS:  --add-opens=java.base/java.lang=ALL-UNNAMED --add-opens=java.base/java.io=ALL-UNNAMED --add-opens=java.base/java.util=ALL-UNNAMED --add-opens=java.base/java.util.concurrent=ALL-UNNAMED --add-opens=java.rmi/sun.rmi.transport=ALL-UNNAMED
    [0.002s][warning][os,thread] Failed to start thread "GC Thread#0" - pthread_create failed (EPERM) for attributes: stacksize: 1024k, guardsize: 4k, detached.
    #
    # There is insufficient memory for the Java Runtime Environment to continue.
    # Cannot create worker GC thread. Out of system resources.
    # An error report file with more information is saved as:
    # /usr/local/tomcat/hs_err_pid1.log

See `problem discussion <https://stackoverflow.com/a/72841934/7362888>`_.
