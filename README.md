[![License](http://img.shields.io/:license-apache-blue.svg)](http://www.apache.org/licenses/LICENSE-2.0.html)

# About

Clients of semantic-\*. Including a Java and Javascript version. The C# version
is also been verified.

- Anclient.ts

[![npm](https://img.shields.io/npm/v/@anclient/semantier?logo=npm)](https://npmjs.org/package/@anclient/semantier)
@anclient/semantier 

together with

[![npm](https://img.shields.io/npm/v/@anclient/anreact?logo=npm)](https://npmjs.org/package/@anclient/anreact)
@anclient/anreact

- Anprism

[![install](https://vsmarketplacebadge.apphb.com/version-short/ody-zhou.anprism.svg)](https://marketplace.visualstudio.com/items?itemName=ody-zhou.anprism)
VS Code extension

- Anclient.java

[![Maven Central](https://maven-badges.herokuapp.com/maven-central/io.github.odys-z/anclient.java/badge.svg)](https://maven-badges.herokuapp.com/maven-central/io.github.odys-z/anclient.java/)
Anclient for Java

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

Java client (also working for Android)

- js (Typescript)

Ts client API depending on jquery. The test project is using React.

Check js/test & examples/example.js for running tests and examples.

- c#

published as nuget package (coming).

# Examples

- example.js

    Examples using Anclient.js.

 -- North Star

    Example using Anclient + React.

- example.cs

    Example for Winform built upon Anclient.cs

# Document

[Anclient Documents](https://odys-z.github.io/Anclient)
