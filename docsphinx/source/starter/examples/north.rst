Example: North Star
===================

*North star* is a sample project must work with a jserv serice, ever-connect,
which is provided as a docker image (Github private repo, MIT).

::

    -+- north-star
     |--- dist
     |--- package.json
     |--- Dockerfile
     |--- ...

Use the package.json to install packages or user Dockerfile to run as web server
(for front pages web server).

Start Docker Container
----------------------

Nort-star is actually running on two web server, provided with two docker images.

If you are familiar with docker command, you can pull the two images::

    odysz/connects-polestar
    odysz/emr-web

The emr-#.#.#.zip is helpful for docker scripts example, which can be downloaded
from the release section. (Only tested on Ubuntu & CentOS 7)

1. change /dist/private/host.json, replace your server IP like this:

host::

   http://[your-server-ip]:8080/connects

2. execute these two scripts command comes from the zip file: ::

    ./docker-start
    ./docker-webstart

The jserv docker container also mounted a volume for persisting sqlite data file.
You may need to input password to copy volume file into system directory.

3. check both of your docker containers are running::

    docker ps

Please note that there are totally 2 containers running, one for web pages, one
for json data service.
