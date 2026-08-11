# Test with Sources

```
[INFO] ---------------------< io.github.odys-z:ws-agent >----------------------
[INFO] io.github.odys-z:ws-agent:jar:0.0.1-SNAPSHOT
[INFO] +- io.github.odys-z:anclient.java:jar:0.5.20-SNAPSHOT:compile
[INFO] |  \- io.github.odys-z:semantic.jserv:jar:1.5.17-SNAPSHOT:compile
[INFO] |     +- io.github.odys-z:semantics.transact:jar:1.5.77-SNAPSHOT:compile
[INFO] |     |  \- io.github.odys-z:antson:jar:1.0.6:compile
[INFO] |     +- io.github.odys-z:semantic.DA:jar:1.5.22:compile
[INFO] \- io.github.odys-z:jserv-sample:jar:1.5.8:compile
```
In example.desktop/src/test/resources:

```
    $ java -jar ../../../target/ws-agent-0.0.1-SNAPSHOT.jar 
```

To stop:

```
    java -cp ws-agent-0.0.1-SNAPSHOT.jar io.oz.anclient.ipcagent.StopAgent
```
