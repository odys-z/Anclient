/// <reference types="react" />
import { Tierec, TierCol, SessionClient, InsertReq, ErrorCtx, OnCommitOk, DatasetOpts } from '@anclient/semantier-st';
import { Comprops, CrudComp } from './crud';
export interface Media {
    isLg?: boolean;
    isMd?: boolean;
    isSm?: boolean;
    isXs?: boolean;
    isXl?: boolean;
}
/**JSX.Element like row formatter results */
export interface AnRow {
}
/**(Form) field formatter
 * E.g. TRecordForm will use this to format a field in form. see also {@link AnRowFormatter}
 */
export declare type AnFieldFormatter = ((col: TierCol, colIndx: number) => AnRow);
/**TODO (list) row formatter
 * E.g. @anclient/anreact.Tablist will use this to format a row. see also {@link AnFieldFormatter}
 */
export declare type AnRowFormatter = ((rec: Tierec, rowIndx: number, classes?: any, media?: Media) => JSX.Element);
/** React helpers of AnClient
 * AnReact uses AnContext to expose session error. So it's helpful using AnReact
 * in an An-React application (which handle error in top level).
 */
export declare class AnReact {
    client: SessionClient;
    ssInf: any;
    errCtx: ErrorCtx;
    /**@param {SessionClient} ssClient client created via login
     * @param {object} errCtx, AnContext.error, the app error handler
     */
    constructor(ssClient: SessionClient, errCtx: ErrorCtx);
    /** @deprecated new tiered way don't need any more.
     * set component.state with request's respons.rs, or call req.onLoad.
     */
    bindTablist(req: any, comp: CrudComp<any>, errCtx: ErrorCtx): void;
    /**
     * Post a request, qmsg.req of AnsonMsg to jserv.
     * If suceed, call qmsg.onOk (onLoad) or set rs in respons to component's state.
     * This is a helper of simple form load & bind a record.
     * @param {object} qmsg
     * @param {AnContext.error} errCtx
     * @param {React.Component} compont
     * @return {AnReact} this
     * */
    bindStateRec(qmsg: any, errCtx: any, compont: any): this;
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
    inserTreeChecked(forest: any, opts: any): InsertReq;
    /**Try figure out serv root, then bind to html tag.
     * First try ./private/host.json<serv-id>,
     * then  ./github.json/<serv-id>,
     * where serv-id = this.context.servId || host
     *
     * For test, have elem = undefined
     * @param {string} elem html element id, null for test
     * @param {object} opts {serv, home, parent window}
     * @param {function} onJsonServ function to render React Dom, i. e.
     * <pre>(elem, json) => {
            let dom = document.getElementById(elem);
            ReactDOM.render(<LoginApp servs={json} servId={opts.serv} iparent={opts.parent}/>, dom);
    }</pre>
     */
    static bindDom(elem: string, opts: {
        /** not used */
        portal?: string;
        /** serv id */
        serv?: string;
        /** system main page */
        home?: string;
        /** path to json config file */
        jsonUrl?: string;
    }, onJsonServ: (elem: string, opts: object, json: object) => any): void;
}
/**Ectending AnReact with dataset & sys-menu, the same of layers extinding of jsample.
 * @class
 */
export declare class AnReactExt extends AnReact {
    extendPorts(ports: {
        [p: string]: string;
    }): this;
    /** Load jsample menu. (using DatasetReq & menu.serv)
     * Since v0.9.32, AnReact(Ext) won't care error handling anymore.
     * @param sk menu sk (semantics key, see dataset.xml), e.g. 'sys.menu.jsample'
     * @param uri
     * @param onLoad
     * @return this
     */
    loadMenu(sk: string, uri: string, onLoad: OnCommitOk): AnReactExt;
    /** Load jsample.serv dataset. (using DatasetReq or menu.serv)
     * @param ds dataset info {port, sk, sqlArgs}
     * @param onLoad
     * @param errCtx
     * @return this
     */
    dataset(ds: DatasetOpts, onLoad: OnCommitOk): AnReactExt;
    /** Load jsample.serv dataset. (using DatasetReq or menu.serv).
     * If opts.onOk is provided, will try to bind stree like this:
     <pre>
    let onload = onOk || function (c, resp) {
        if (compont)
            compont.setState({stree: resp.Body().forest});
    }</pre>
     * @param opts dataset info {sk, sqlArgs, onOk}
     * @param component
     * @return this
     */
    stree(opts: DatasetOpts, component: CrudComp<Comprops>): void;
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
     * @param opts options
     * @param opts.sk semantic key (dataset id)
     * @param opts.cond the component's state.conds[#] of which the options need to be updated
     * @param opts.nv {n: 'name', v: 'value'} option's name and value, e.g. {n: 'domainName', v: 'domainId'}
     * @param opts.onDone on done event's handler: function f(cond)
     * @param opts.onAll no 'ALL' otion item
     * @param errCtx error handling context
     * @return {AnReactExt} this
     */
    ds2cbbOptions(opts: {
        uri: string;
        sk: string;
        sqlArgs: string[];
        nv: {
            n: string;
            v: string;
        };
        cond: any;
        onDone: OnCommitOk;
        noAll: boolean;
    }, errCtx?: ErrorCtx): this;
}
