import { Semantier, DatasetOpts, isEmpty, UIComponent } from "@anclient/semantier";
import { Comprops, CrudComp } from "../../../../src/react/crud";
import { AnReactExt } from "../../../../src/react/anreact";


/** Light weight wrapper of Anreact.stree(), in consists with Semantier style. */
export class StreeTier extends Semantier {
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

	stree(opts: DatasetOpts, comp: CrudComp<Comprops>): void {
        if (isEmpty(this.uiHelper))
            this.uiHelper = comp?.context?.uiHelper;
        opts.port = this.port;
        (this.uiHelper as AnReactExt).stree(opts, comp);
    }
}