import { Semantier, DatasetOpts, isEmpty, UIComponent, AnDatasetResp, AnsonMsg, Protocol, UserReq, LogAct } from "@anclient/semantier";
import { Comprops, CrudComp } from "../../../../src/react/crud";
import { AnContextType } from "../../../../src/an-components";


/**
 * Light weight wrapper of Anreact.stree(), in consists with Semantier style.
 * A helper of binding tree data to anreact Treeditor.
 */
export class StreeTier extends Semantier {
    static reqFactories: {[t: string]: (v: DatasetOpts & {sk: string, sqlArgs?: string[]}) => UserReq} = {};
    static registTierequest(port: string, factory: (v: DatasetOpts & {sk: string, sqlArgs?: string[]}) => UserReq) {
        if (this.reqFactories[port])
            console.warn("Replacing new facotry of ", port, factory);

        this.reqFactories[port] = factory;

        Protocol.registerBody(factory({uri: '', sk: ''}).type, factory);
    }
    static A = {
        stree: 'r',
    }

    /** DESIGN MEMO: Once semantier can be generated, port will be force to be required. */
    port: string;

    /**
     * 
     * @param opts uri: client id; port: jserv port
     * DESIGN MEMO: Once semantier can be generated, port will be force to be required.
     */
    constructor(opts: UIComponent & {uri: string, port: string}) {
        super(opts);
        this.port = opts.port || 'stree';
    }

    /**
     * New version Semantier.stree(), using the pattern of tier + UserReq, to load a semantic
     * tree, using request type of differnt tier, instead of fixed the type, AnDatasetReq.
     * 
     * Note: Response of stree() must be subclass of AnDatasetResp.
     * 
     * @param opts 
     * @param comp 
     */
	stree(opts: DatasetOpts & {act?: LogAct}, comp: CrudComp<Comprops>): void {
        if (isEmpty(this.uiHelper))
            this.uiHelper = comp?.context?.uiHelper;
        opts.port = opts.port || this.port;

		let onload = opts.onOk || function (resp: AnsonMsg<AnDatasetResp>) {
			comp?.setState({forest: resp.Body().forest});
		}

		// Semantier.stree(opts, this.client, onload, this.errCtx);
        // implemention 2:
        if (!opts.port)
		 	throw Error('Decision since @anclient/anreact 0.4.25, port name is needed to load a tree.');
        if (!StreeTier.reqFactories[opts.port])
		 	throw Error('User request factory must registered. Need request factory for port:' + opts.port);

		let reqbody = StreeTier.reqFactories[opts.port](opts).A(StreeTier.A.stree);

		let jreq = this.client.userReq(this.uri, opts.port, reqbody, opts.act);

        let context = comp.context as AnContextType;
		this.client.an.post(jreq, onload, context.error);
    }
}