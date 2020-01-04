Project for anclient.js. Previously name jclient which is deprecated for package
name conflicting.

There are two version of webpack config.

## quick start

Anclient.js currently only has the EasyUI versiion can working. The client template
is provided as a project template for client.

To get kick started,

1. [download ansample-easui template](https://github.com/odys-z/jclient/blob/master/js/test/ansample-easyui.zip)

2. unpack and check server url.

In <upacked-dir>/easyui/app-common/jsample-easyui.js/

```
    jconsts = {
        ...
        serv: 'http://localhost:8080/jsample',
    }
```
where the url is the root path to your semantic.jserv server.

3. open easyui/login.html.

All configuration should working.

See also [troubleshootings](https://odys-z.github.io/notes/jclient/issue-trouble.html)

<hr>

Also some vue client can be used as example:

TODO: docs ...

~~~
    npm i anclient
~~~

Check test/vue/index.html and test/vue/home.html

His plan to implement anclient.vue is adjusted recently. The vue version doesn't
has a clear milestone until some newer plan detail added. Sorry...

## webpack.test.config.js (Vue)

This configuration is for building the test page: ./test/vue/index.js

- demo page (Vue)

./test/vue/index.html

## webpack.config.js

This configuration is for building the anclient library, with presentation layer
implemented with EasyUI.

## His Home page

[It's here!](https://odys-z.github.io)
