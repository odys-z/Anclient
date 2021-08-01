# About React Issue-13991

This branch is used only for issue tracking, will be deleted in the future.

With webpack transpiled package, both via NPM and minified js, referencing component
will reporting error:

'''
    anreact-1.0.0.min.js:90874 Uncaught Error: Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:
    1. You might have mismatching versions of React and the renderer (such as React DOM)
    2. You might be breaking the Rules of Hooks
    3. You might have more than one copy of React in the same app
    See https://reactjs.org/link/invalid-hook-call for tips about how to debug and fix this problem.
        at resolveDispatcher (anreact-1.0.0.min.js:90874)
        at Object.useContext (anreact-1.0.0.min.js:90882)
        at useTheme (anreact-1.0.0.min.js:25398)
        at useStyles (anreact-1.0.0.min.js:25048)
        at WithStyles (anreact-1.0.0.min.js:25487)
        at renderWithHooks (react-dom.development.js:14985)
        at updateForwardRef (react-dom.development.js:17044)
        at beginWork (react-dom.development.js:19098)
        at HTMLUnknownElement.callCallback (react-dom.development.js:3945)
        at Object.invokeGuardedCallbackDev (react-dom.development.js:3994)
    resolveDispatcher @ anreact-1.0.0.min.js:90874
    useContext @ anreact-1.0.0.min.js:90882
    useTheme @ anreact-1.0.0.min.js:25398
    useStyles @ anreact-1.0.0.min.js:25048
    WithStyles @ anreact-1.0.0.min.js:25487
    renderWithHooks @ react-dom.development.js:14985
    updateForwardRef @ react-dom.development.js:17044
    beginWork @ react-dom.development.js:19098
    callCallback @ react-dom.development.js:3945
    invokeGuardedCallbackDev @ react-dom.development.js:3994
    invokeGuardedCallback @ react-dom.development.js:4056
    beginWork$1 @ react-dom.development.js:23964
    performUnitOfWork @ react-dom.development.js:22776
    workLoopSync @ react-dom.development.js:22707
    renderRootSync @ react-dom.development.js:22670
    performSyncWorkOnRoot @ react-dom.development.js:22293
    scheduleUpdateOnFiber @ react-dom.development.js:21881
    updateContainer @ react-dom.development.js:25482
    (anonymous) @ react-dom.development.js:26021
    unbatchedUpdates @ react-dom.development.js:22431
    legacyRenderSubtreeIntoContainer @ react-dom.development.js:26020
    render @ react-dom.development.js:26103
    onJsonServ @ north-app.jsx:151
    (anonymous) @ anreact-1.0.0.min.js:30369
    fire @ anreact-1.0.0.min.js:40192
    fireWith @ anreact-1.0.0.min.js:40322
    done @ anreact-1.0.0.min.js:46488
    (anonymous) @ anreact-1.0.0.min.js:46749
    load (async)
    send @ anreact-1.0.0.min.js:46768
    ajax @ anreact-1.0.0.min.js:46382
    bindDom @ anreact-1.0.0.min.js:30365
    bindHtml @ north-app.jsx:147
    (anonymous) @ north.html:16
    react-dom.development.js:20085 The above error occurred in the <WithStyles(ForwardRef(AppBar))> component:

        at WithStyles (http://192.168.0.201:8888/north-star/dist/north-0.1.0.min.js:12451:571)
        at div
        at SysComp (http://192.168.0.201:8888/north-star/dist/north-0.1.0.min.js:13287:160)
        at ThemeProvider (http://192.168.0.201:8888/north-star/dist/north-0.1.0.min.js:5419:24)
        at NorthApp (http://192.168.0.201:8888/north-star/dist/north-0.1.0.min.js:69785:5)

    Consider adding an error boundary to your tree to customize error handling behavior.
    Visit https://reactjs.org/link/error-boundaries to learn more about error boundaries.
    logCapturedError @ react-dom.development.js:20085
    update.callback @ react-dom.development.js:20118
    callCallback @ react-dom.development.js:12318
    commitUpdateQueue @ react-dom.development.js:12339
    commitLifeCycles @ react-dom.development.js:20736
    commitLayoutEffects @ react-dom.development.js:23426
    callCallback @ react-dom.development.js:3945
    invokeGuardedCallbackDev @ react-dom.development.js:3994
    invokeGuardedCallback @ react-dom.development.js:4056
    commitRootImpl @ react-dom.development.js:23151
    unstable_runWithPriority @ scheduler.development.js:468
    runWithPriority$1 @ react-dom.development.js:11276
    commitRoot @ react-dom.development.js:22990
    performSyncWorkOnRoot @ react-dom.development.js:22329
    scheduleUpdateOnFiber @ react-dom.development.js:21881
    updateContainer @ react-dom.development.js:25482
    (anonymous) @ react-dom.development.js:26021
    unbatchedUpdates @ react-dom.development.js:22431
    legacyRenderSubtreeIntoContainer @ react-dom.development.js:26020
    render @ react-dom.development.js:26103
    onJsonServ @ north-app.jsx:151
    (anonymous) @ anreact-1.0.0.min.js:30369
    fire @ anreact-1.0.0.min.js:40192
    fireWith @ anreact-1.0.0.min.js:40322
    done @ anreact-1.0.0.min.js:46488
    (anonymous) @ anreact-1.0.0.min.js:46749
    load (async)
    send @ anreact-1.0.0.min.js:46768
    ajax @ anreact-1.0.0.min.js:46382
    bindDom @ anreact-1.0.0.min.js:30365
    bindHtml @ north-app.jsx:147
    (anonymous) @ north.html:16
    react-dom.development.js:20085 The above error occurred in the <WithStyles(ForwardRef(Drawer))> component:

        at WithStyles (http://192.168.0.201:8888/north-star/dist/north-0.1.0.min.js:12451:571)
        at Router (http://192.168.0.201:8888/north-star/dist/north-0.1.0.min.js:22506:342)
        at MemoryRouter (http://192.168.0.201:8888/north-star/dist/north-0.1.0.min.js:22513:344)
        at div
        at SysComp (http://192.168.0.201:8888/north-star/dist/north-0.1.0.min.js:13287:160)
        at ThemeProvider (http://192.168.0.201:8888/north-star/dist/north-0.1.0.min.js:5419:24)
        at NorthApp (http://192.168.0.201:8888/north-star/dist/north-0.1.0.min.js:69785:5)

    Consider adding an error boundary to your tree to customize error handling behavior.
    Visit https://reactjs.org/link/error-boundaries to learn more about error boundaries.
    logCapturedError @ react-dom.development.js:20085
    update.callback @ react-dom.development.js:20118
    callCallback @ react-dom.development.js:12318
    commitUpdateQueue @ react-dom.development.js:12339
    commitLifeCycles @ react-dom.development.js:20736
    commitLayoutEffects @ react-dom.development.js:23426
    callCallback @ react-dom.development.js:3945
    invokeGuardedCallbackDev @ react-dom.development.js:3994
    invokeGuardedCallback @ react-dom.development.js:4056
    commitRootImpl @ react-dom.development.js:23151
    unstable_runWithPriority @ scheduler.development.js:468
    runWithPriority$1 @ react-dom.development.js:11276
    commitRoot @ react-dom.development.js:22990
    performSyncWorkOnRoot @ react-dom.development.js:22329
    scheduleUpdateOnFiber @ react-dom.development.js:21881
    updateContainer @ react-dom.development.js:25482
    (anonymous) @ react-dom.development.js:26021
    unbatchedUpdates @ react-dom.development.js:22431
    legacyRenderSubtreeIntoContainer @ react-dom.development.js:26020
    render @ react-dom.development.js:26103
    onJsonServ @ north-app.jsx:151
    (anonymous) @ anreact-1.0.0.min.js:30369
    fire @ anreact-1.0.0.min.js:40192
    fireWith @ anreact-1.0.0.min.js:40322
    done @ anreact-1.0.0.min.js:46488
    (anonymous) @ anreact-1.0.0.min.js:46749
    load (async)
    send @ anreact-1.0.0.min.js:46768
    ajax @ anreact-1.0.0.min.js:46382
    bindDom @ anreact-1.0.0.min.js:30365
    bindHtml @ north-app.jsx:147
    (anonymous) @ north.html:16
    anreact-1.0.0.min.js:90874 Uncaught Error: Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:
    1. You might have mismatching versions of React and the renderer (such as React DOM)
    2. You might be breaking the Rules of Hooks
    3. You might have more than one copy of React in the same app
    See https://reactjs.org/link/invalid-hook-call for tips about how to debug and fix this problem.
        at resolveDispatcher (anreact-1.0.0.min.js:90874)
        at Object.useContext (anreact-1.0.0.min.js:90882)
        at useTheme (anreact-1.0.0.min.js:25398)
        at useStyles (anreact-1.0.0.min.js:25048)
        at WithStyles (anreact-1.0.0.min.js:25487)
        at renderWithHooks (react-dom.development.js:14985)
        at updateForwardRef (react-dom.development.js:17044)
        at beginWork (react-dom.development.js:19098)
        at HTMLUnknownElement.callCallback (react-dom.development.js:3945)
        at Object.invokeGuardedCallbackDev (react-dom.development.js:3994)
    resolveDispatcher @ anreact-1.0.0.min.js:90874
    useContext @ anreact-1.0.0.min.js:90882
    useTheme @ anreact-1.0.0.min.js:25398
    useStyles @ anreact-1.0.0.min.js:25048
    WithStyles @ anreact-1.0.0.min.js:25487
    renderWithHooks @ react-dom.development.js:14985
    updateForwardRef @ react-dom.development.js:17044
    beginWork @ react-dom.development.js:19098
    callCallback @ react-dom.development.js:3945
    invokeGuardedCallbackDev @ react-dom.development.js:3994
    invokeGuardedCallback @ react-dom.development.js:4056
    beginWork$1 @ react-dom.development.js:23964
    performUnitOfWork @ react-dom.development.js:22776
    workLoopSync @ react-dom.development.js:22707
    renderRootSync @ react-dom.development.js:22670
    performSyncWorkOnRoot @ react-dom.development.js:22293
    scheduleUpdateOnFiber @ react-dom.development.js:21881
    updateContainer @ react-dom.development.js:25482
    (anonymous) @ react-dom.development.js:26021
    unbatchedUpdates @ react-dom.development.js:22431
    legacyRenderSubtreeIntoContainer @ react-dom.development.js:26020
    render @ react-dom.development.js:26103
    onJsonServ @ north-app.jsx:151
    (anonymous) @ anreact-1.0.0.min.js:30369
    fire @ anreact-1.0.0.min.js:40192
    fireWith @ anreact-1.0.0.min.js:40322
    done @ anreact-1.0.0.min.js:46488
    (anonymous) @ anreact-1.0.0.min.js:46749
    load (async)
    send @ anreact-1.0.0.min.js:46768
    ajax @ anreact-1.0.0.min.js:46382
    bindDom @ anreact-1.0.0.min.js:30365
    bindHtml @ north-app.jsx:147
    (anonymous) @ north.html:16
'''

Where AppBar is exported from Material UI, SysComp, extending React.Component,
from Anclient.js lib.

The React document didn't solve this problem, and redirected to issue 13991.
Webpack also have similar issue report. See

[Facebook issue 13991](https://github.com/facebook/react/issues/13991)

[Webpack issue 13868](https://github.com/webpack/webpack/issues/13868)
