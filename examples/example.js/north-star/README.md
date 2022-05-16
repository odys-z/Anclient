# About

A sample app that can be used for start up new app developement.

v1.0 (docker image 0.6.1):

Works with docker image odysz/connect-polestar:0.6.1.

# quick start

To deploy this on your server, make sure the server is docker enabled. Then
upload & extract emr-0.1.0.zip on to a server with docker installed, and follow
this steps:

1. change /dist/private/host.json, replace your server IP like this:

host: http://[your-server-ip]:8080/connects

2. execute these two scripts command:

```
    ./docker-start
    ./docker-webstart
```

To use the data server with docker image, ***odysz/connect-polestar*** wich is
available at docker hub. The server side docker image must work with these two
[sqlite3 db file](./polestar-docker/volume/polestar.zip) - put it in the volume configured
for the docker container.

3. check both of your docker containers are runing:

```
    docker ps
```

Please note there are totally 2 containers runing, one for web pages, one for json
data service.

# start from source

This folder is the source of North Start, the example project.

There issue of invalid hook makes the test project in trouble linking the lib. So
to run this example from source, it's needed to install React manually::

```
    npm install react react-dom react-router react-router-dom
    npm install @anclient/anreact @anclient/semantier
```

# Release Log

- v0.5

    docker image:

```
	odysz/connect-polestar:0.5
	odysz/emr-web:0.5
```

Volume north.sqlite can be found in Polestar.
