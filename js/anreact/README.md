# About

Refactored:

@anclient/react: React View + Jsample depending on @anclient/semantier.

### TIP

- To generate jsdoc
~~~
    node_modules/.bin/jsdoc -d ../../pages.github/odys-z.github.io/javadoc/jclient/js lib -r --readme lib/README.md
~~~

- Don't install @anclient/semantier

Link it with npm!

Otherwise the test project, jsample won't work as Protocol are
modified when initializing Protocol.sk by app.jsx. DatasetCombo etc. won't see it
if Protocol are actually different.

- Don't install React and ReactDOM here

Will report hook error in test if installed.

```
    Uncaught Error: Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:
    1. You might have mismatching versions of React and the renderer (such as React DOM)
    2. You might be breaking the Rules of Hooks
    3. You might have more than one copy of React in the same app
```
