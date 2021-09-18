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
