/**
 * Base class of semantic tier
 * @class
 * @type {rows: array, rec: object, pk: string, pkval: string, records: () => array}
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
    /** list's columns */
    _cols: any[];
    /** client function / CRUD identity */
    uri: string;
    /** maintable's record fields */
    _fields: any[];
    /** optional main table's pk */
    pk: string;
    /** current crud */
    crud: string;
    /** current list's data */
    rows: any[];
    /** current record */
    rec: {};
    /** current pk value */
    pkval: any;
    /** current relations */
    rels: any[];
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
    }): any[];
    /** Get form fields data specification
     * @param {object} modifier {field, function | object }
     * @param {object | function} modifier.field see #columns().
     */
    fields(modifier: {
        field: object | Function;
    }): any[];
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
}
