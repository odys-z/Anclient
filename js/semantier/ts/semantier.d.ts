export const override = < Sup >( sup : { prototype : Sup } ) => <
    Field extends keyof Sup ,
    Proto extends { [ key in Field ] : Sup[ Field ] } ,
>(
    proto : Proto ,
    field : Field ,
    descr : TypedPropertyDescriptor< Sup[ Field ] > ,
)=> {}

/**
 * @type ErrorCtx = { msg: string, }
 *
 * Base class of semantic tier
 * @class
 */
export class Semantier {
    static invalidStyles: {
        ok: {};
        anyErr: {
            border: string;
        };
        notNull: {
            backgroundColor: string;
        };
        maxLen: {
            border: string;
        };
        minLen: {
            border: string;
        };
    };
    /**
     *
     * @param {uri: string} props
     */
    constructor(props: any);
    _cols: any;
    _fields: any;
    uri: any;
    pkval: any;
    /**
     *
     * @param {client: SessionClient | InsecureClient, anReact: AnReact, errCtx : ErrorCtx } context
     */
    setContext(context: any): void;
    client: any;
    anReact: any;
    errCtx: any;
    validate(rec: any, fields: any): boolean;
    /** Get list's column data specification
     * @param {object} modifier {field, function | object }
     * @param {object | function} modifier.field user provided modifier to change column's style etc.
     * callback function signature: (col, index) {} : return column's properties.
     */
    columns(modifier: {
        field: object | Function;
    }): any;
    /** Get form fields data specification
     * @param {object} modifier {field, function | object }
     * @param {object | function} modifier.field see #columns().
     */
    fields(modifier: {
        field: object | Function;
    }): any;
    /** Load relationships */
    relations(opts: any, onOk: any): void;
    /** save form with a relationship table */
    saveRec(opts: any, onOk: any): void;
    /**
     * @param {object} opts
     * @param {string} [opts.uri] overriding local uri
     * @param {set} opts.ids record id
     * @param {function} onOk: function(AnsonResp);
     */
    del(opts: {
        uri?: string;
        ids: any;
    }, onOk: Function): void;
    resetFormSession(): void;
    rec: {};
    rels: any[];
    crud: any;
}
