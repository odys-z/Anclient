# Release Notes

- Feb 27, 2023

v 1.0.1, working together with sandbox v0.2.1.

1. moved from js/test/sessionless to here, fix "Invalid Hook Call Warning" of ReactJs.

2. Fixed Protocol.sk is undefined bug (use @anClient/semantier).

3. remove duplicate UserstReq at server side.

# Setup source project

```
    npm i typescript --save-dev
    npx tsc --init
    npx tsc index.ts  # problem?
    npx tsc -w        # compile in watch mode
    npm i tslint --save-dev
    npx tslint --init
```
