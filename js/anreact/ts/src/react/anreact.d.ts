/** React helpers of AnClient
 * AnReact uses AnContext to expose session error. So it's helpful using AnReact
 * in an An-React application (which handle error in top level).
 */
export class AnReact {
    /**Try figure out serv root, then bind to html tag.
     * First try ./private/host.json<serv-id>,
     * then  ./github.json/<serv-id>,
     * where serv-id = this.context.servId || host
     *
     * For test, have elem = undefined
     * @param {string} elem html element id, null for test
     * @param {object} opts {serv, home, parent window}
     * @param {string} [opts.serv='host'] serv id
     * @param {string} [opts.home='main.html'] system main page
     * @param {string} [opts.portal='index.html'] portal page
     * @param {function} onJsonServ function to render React Dom, i. e.
     * <pre>(elem, json) => {
            let dom = document.getElementById(elem);
            ReactDOM.render(<LoginApp servs={json} servId={opts.serv} iparent={opts.parent}/>, dom);
    }</pre>
     */
    static bindDom(elem: string, opts: {
        serv?: string;
        home?: string;
        portal?: string;
    }, onJsonServ: Function): void;
    /**@param {SessionClient} ssClient client created via login
     * @param {object} errCtx, AnContext.error, the app error handler
     */
    constructor(ssClient: any, errCtx: object);
    client: any;
    ssInf: any;
    err: any;
    /** @deprecated new tiered way don't need any more.
     * set component.state with request's respons.rs, or call req.onLoad.
     */
    bindTablist(req: any, comp: any, errCtx: any): void;
    /**
     * Post a request, qmsg.req of AnsonMsg to jserv.
     * If suceed, call qmsg.onOk (onLoad) or set rs in respons to component's state.
     * This is a helper of simple form load & bind a record.
     * @param {object} qmsg
     * @param {AnContext.error} errCtx
     * @param {React.Component} compont
     * @return {AnReact} this
     * */
    bindStateRec(qmsg: object, errCtx: any, compont: React.Component): AnReact;
    /**TODO move this to a semantics handler, e.g. shFK.
     * Generate an insert request according to tree/forest checked items.
     * @param {object} forest of node, the forest / tree data, tree node: {id, node}
     * @param {object} opts options
     * @param {object} opts.check checking column name
     * @param {object} opts.columns, column's value to be inserted
     * @param {object} opts.rows, n-v rows to be inserted
     * @param {object} opts.reshape set middle tree node while traverse.
     * @return {InsertReq} subclass of AnsonBody
     */
    inserTreeChecked(forest: object, opts: {
        check: object;
        columns: object;
        rows: object;
        reshape: object;
    }): any;
}
/**Ectending AnReact with dataset & sys-menu, the same of layers extinding of jsample.
 * @class
 */
export class AnReactExt extends AnReact {
    extendPorts(ports: any): AnReactExt;
    /** Load jsample menu. (using DatasetReq & menu.serv)
     * @param {string} sk menu sk (semantics key, see dataset.xml), e.g. 'sys.menu.jsample'
     * @param {function} onLoad
     * @param {AnContext} errCtx
     * @return {AnReactExt} this
     */
    loadMenu(sk: string, onLoad: Function, errCtx: any): AnReactExt;
    /** Load jsample.serv dataset. (using DatasetReq or menu.serv)
     * @param {object} ds dataset info {port, sk, sqlArgs}
     * @param {AnContext} errCtx
     * @param {CrudComp} component
     * @return {AnReactExt} this
     */
    dataset(ds: object, onLoad: any, errCtx: any): AnReactExt;
    /** Load jsample.serv dataset. (using DatasetReq or menu.serv).
     * If opts.onOk is provided, will try to bind stree like this:
     <pre>
    let onload = onOk || function (c, resp) {
        if (compont)
            compont.setState({stree: resp.Body().forest});
    }</pre>
     * @param {object} opts dataset info {sk, sqlArgs, onOk}
     * @param {string} opts.sk
     * @param {string} opts.sqlArgs
     * @param {function} opts.onOk
     * @param {AnContext} errCtx
     * @param {CrudComp} component
     * @return {AnReactExt} this
     */
    stree(opts: {
        sk: string;
        sqlArgs: string;
        onOk: Function;
    }, errCtx: any, component: any): AnReactExt;
    rebuildTree(opts: any, onOk: any): void;
    /**Bind dataset to combobox options (comp.state.condCbb).
     * Option object is defined by opts.nv.
     *
     * <h6>About React Rendering Events</h6>
     * This method will update opts.cond.loading and clean.
     * When success, set loading false, clean true. this 2 flags are helper for
     * handling react rendering / data-loading events asynchronously.
     *
     * <p> See AnQueryFormComp.componentDidMount() for example. </p>
     *
     * @param {object} opts options
     * @param {string} opts.sk semantic key (dataset id)
     * @param {object} opts.cond the component's state.conds[#] of which the options need to be updated
     * @param {object} [opts.nv={n: 'name', v: 'value'}] option's name and value, e.g. {n: 'domainName', v: 'domainId'}
     * @param {function} [opts.onDone] on done event's handler: function f(cond)
     * @param {boolean} [opts.onAll] no 'ALL' otion item
     * @param {AnContext.error} errCtx error handling context
     * @param {React.Component} [compont] the component needs to be updated on ok, if provided
     * @return {AnReactExt} this
     */
    ds2cbbOptions(opts: {
        sk: string;
        cond: object;
        nv?: object;
        onDone?: Function;
        onAll?: boolean;
    }, errCtx: any, compont?: React.Component): AnReactExt;
}
import React from "react";
