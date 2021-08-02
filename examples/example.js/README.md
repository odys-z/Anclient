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
	http://localhost/xvisual/bar-chart/docker.html
```

- Pull from Docker Hub:

Coming soon ...

# start from source

Folder *example.js* should be your npm project root folder and multiple projects
here sharing the same node's modules. See [the question answer](https://stackoverflow.com/a/29787493/7362888).

# Documents

Partly available [here](https://odys-z.github.io/Anclient/), currently only
"quick start".

## xvisual

Integrating [x-visual](https://github.com/odys-z/x-visual) with Anclient.js

# Troubleshootings

- Invalid Hook Call Warning

For error description, see branch issue-13991, and [here](https://reactjs.org/warnings/invalid-hook-call-warning.html).

NOTES: handling error of using duplicated React:

    1. have package's main to the main source entry, not minified js - and
    don't exclude 'node_modules' form loader test rule in depending project;
    2. have anclient package using external react, react-dom, material-ui/core;
    3. have depending project install everything;
    4. don't resolve depending project's react to source package
       - although it's always work for eliminate the error;
    5. install anclient package via npm, not linking locally

    Good luck!
