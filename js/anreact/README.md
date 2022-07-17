# About

The ts client for semantic-jserv.

## Releast Notes

Refactored:

@anclient/react: React View + Jsample depending on @anclient/semantier.

if Protocol are actually different.

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
