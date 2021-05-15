# About

Clients of semantic-\*. Including a Java and Javascript version. The C# version is in intensive development.

# Repository Structure

This repository has multiple clients, all of which can work indpendently.

With the protocol based on json, we are planning to implement the cliens:

- Anclient/csharp

The C# client API runing on .net framework 4.7.1.

The Visual Studio solution is

```
    csharp/anclient/anclient.sln
```

There are 4 projects in the solution:

-- anclient.net

    The c# version of anclient, for .netframework 4.7.1. The project name is also
    the assembly name can be referenced with C# reflection.

-- Antest.Ancleint

	Anclient unit test project.

-- gltf-export

    A [Revit](https://en.wikipedia.org/wiki/Autodesk_Revit) plugin using anclient.net
    exprting gltf and communicate with semantic-\* server with Antson for protocol
    packages handling.

    To run this example, user must have Revit installed. This example is running
	on Revit 2017 and has no plan to upgrade.

-- file.upload

    The trying and testing project of gltf-export.

- Anclient/js


js client API depending on jquery.

Of which the jclient/js/easyui can basically working, providing the semantic-jsample
server is running. See it's [readme](./js/README.md) for quick start.

- Anclient/java

Java client API.

# Document

[Anclient Documents](https://odys-z.github.io/Anclient)
