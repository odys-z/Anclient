# About example.js

This folder includes multiple js client based sample projects. Can be used as
templates for quick start.

# start from Docker image

- Build examples:

```
    cd examples
	docker build -t anclient-examples .
	docker run --name ancleint -dp 80:80 --rm anclient-examples
	docker pull odysz/jserv-sample:1.1
	docker run --name jserv-sample -dp 8080:8080 --rm odys/jserv-sample
```

Go

```
	http://localhost/react-quiz/editor.html
	http://localhost/x-visual/bar-chart/docker.html
```

- Pull from Docker Hub:

Coming soon ...

# start from source

Folder *example.js* should be your npm project root folder and multiple projects
here sharing the same node's modules. See [the question answer](https://stackoverflow.com/a/29787493/7362888).

# Documents

Partly available [here](https://odys-z.github.io/Anclient/), currently only
"quick start".

## x-visual

Integrating [x-visual](https://github.com/odys-z/x-visual) with Anclient.js
