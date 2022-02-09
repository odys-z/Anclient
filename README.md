[![License](http://img.shields.io/:license-apache-blue.svg)](http://www.apache.org/licenses/LICENSE-2.0.html)

# About

Clients of semantic-\*. Including a Java and Javascript version. The C# version
is also been verified.

- Anclient.js

@anclient/semantier-st:
[![npm](https://img.shields.io/npm/v/@anclient/semantier-st?logo=npm)](https://npmjs.org/package/@anclient/semantier-st)

(sunsetting js version: @anclient/semantier
[![npm](https://img.shields.io/npm/v/@anclient/semantier?logo=npm)](https://npmjs.org/package/@anclient/semantier))

together with

@anclient/anreact:
[![npm](https://img.shields.io/npm/v/@anclient/anreact?logo=npm)](https://npmjs.org/package/@anclient/anreact)

- Anprism

VS Code extension:
[![install](https://vsmarketplacebadge.apphb.com/version-short/ody-zhou.anprism.svg)](https://marketplace.visualstudio.com/items?itemName=ody-zhou.anprism)

- Anclient.java

Anclient for Java:
[![Maven Central](https://maven-badges.herokuapp.com/maven-central/io.github.odys-z/Anclient/badge.svg)](https://maven-badges.herokuapp.com/maven-central/io.github.odys-z/anclient.java/)

# Repository Structure

This repository has multiple clients, it's planed all can work independently.

With the protocol based on json, we are planning to implement the clients:

- Anclient/csharp

The C# client API runing on .net framework 4.7.1.

The Visual Studio solution is

```
    csharp/anclient/anclient.sln
```

There are 3 clients in the solution:

- java

Java client (not for Android yet)

- js

js client API depending on jquery. The test project is using React.

Check js/test & examples/example.js for running tests and examples.

# Examples

- example.js

    Examples using Anclient.js.

 -- North Star

    Example using Anclient + React.

- example.cs

-- gltf-export

    A [Revit](https://en.wikipedia.org/wiki/Autodesk_Revit) plugin using anclient.net
    exporting gltf and communicate with semantic-\* server with Antson for protocol
    packages handling.

    To run this example, user must have Revit installed. This example is running
    on Revit 2017 and has no plan to upgrade.

-- file.upload

    The trying and testing project of gltf-export, also used to test jserv-sample
    project's file uploading function. Jserv-sample project source can be downloaded
    [here](https://github.com/odys-z/semantic-jserv/releases).

# Document

[Anclient Documents](https://odys-z.github.io/Anclient)
