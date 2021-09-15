Example: North Star
===================

*North star* is a sample project work with jserv ever-connect, which is provided
as docker image (MIT).

::

    -+- north-star
     |--- dist
     |--- package.json
     |--- Dockerfile
     |--- ...

User the package.json to install or Dockerfile to run as web server (for front
pages).

Start Docker Container
----------------------

Image::

    odysz/emr-web

The transpile results located in dist folder.

The emr-#.#.#.zip is helpful for docker scripts example.

1. change /dist/private/host.json, replace your server IP like this:

host: http://[your-server-ip]:8080/connects

2. execute these two scripts command comes from the zip file:

```
    ./docker-start
    ./docker-webstart
```

3. check both of your docker containers are runing:

```
    docker ps
```

Please note there are totally 2 containers runing, one for web pages, one for json
data service.
