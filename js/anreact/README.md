# About

The Typescript + React.js client for semantic-jserv.

* Refactored:

@anclient/react: React View + Jsample depending on @anclient/semantier,

of which the protocol layer are actually different.

# Buid & test

- To test


```
	cd test
	npm run build
	npm test
```

- Testing Sessionless

It's multiple React Applications for testing React Widgets included in @anclient/anreact.

```
    cd test/sessionless
    webpack
```

The generated testing reaources are located in album-web-0.4, a folder renamed for testing with 
Portfolio Synode/web service, which requires all resource located in a subfolder, *album-web-0.4*.

Install Portfolio-synode,

```
    path-to-pytho-scripts/synode-start-web
```

Go to: http://localhost:8900/[testing-html].html

### Tip

- React warn about invalid hook call.

```
    Uncaught Error: Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:
    1. You might have mismatching versions of React and the renderer (such as React DOM)
    2. You might be breaking the Rules of Hooks
    3. You might have more than one copy of React in the same app
```

To solve this problem, make sure everything always referencing to a sole copy of ReactJs.

# Demo

Docker image

- @Anclient/anreact test: [Jsample client (TS) docker image](https://hub.docker.com/r/odysz/jserv-sample)
