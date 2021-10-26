@anclient/semantier 
[![npm](https://img.shields.io/npm/v/@anclient/semantier?logo=npm)](https://npmjs.org/package/@anclient/semantier)
+
@anclient/anreact 
[![npm](https://img.shields.io/npm/v/@anclient/anreact?logo=npm)](https://npmjs.org/package/@anclient/anreact)

# About
 
Clients of semantic-\*. Including a Java and Javascript version. The C# version
is also been verified.

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

- csharp

The c# version of anclient.

- java

Java client (not for Android yet)

- js

js client API depending on jquery. The test project is using React.

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
