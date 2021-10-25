declare const UsersTier_base: any;
export class UsersTier extends UsersTier_base {
    [x: string]: any;
    constructor(comp: any);
    port: string;
    mtabl: string;
    pk: string;
    checkbox: boolean;
    rows: any[];
    pkval: any;
    rec: {};
    _fields: ({
        type: string;
        field: string;
        label: any;
        validator: {
            len: number;
            notNull: boolean;
        };
        grid?: undefined;
        defaultStyle?: undefined;
        sk?: undefined;
        nv?: undefined;
    } | {
        type: string;
        field: string;
        label: any;
        validator?: undefined;
        grid?: undefined;
        defaultStyle?: undefined;
        sk?: undefined;
        nv?: undefined;
    } | {
        type: string;
        field: string;
        label: any;
        validator: {
            notNull: boolean;
            len?: undefined;
        };
        grid?: undefined;
        defaultStyle?: undefined;
        sk?: undefined;
        nv?: undefined;
    } | {
        type: string;
        field: string;
        label: any;
        grid: {
            md: number;
        };
        defaultStyle: {
            marginTop: string;
            width: number;
        };
        sk: any;
        nv: {
            n: string;
            v: string;
        };
        validator: {
            notNull: boolean;
            len?: undefined;
        };
    })[];
    _cols: ({
        text: any;
        field: string;
        checked: boolean;
        sk?: undefined;
        nv?: undefined;
    } | {
        text: any;
        field: string;
        checked?: undefined;
        sk?: undefined;
        nv?: undefined;
    } | {
        text: any;
        field: string;
        sk: any;
        nv: {
            n: string;
            v: string;
        };
        checked?: undefined;
    })[];
    columns(): ({
        text: any;
        field: string;
        checked: boolean;
        sk?: undefined;
        nv?: undefined;
    } | {
        text: any;
        field: string;
        checked?: undefined;
        sk?: undefined;
        nv?: undefined;
    } | {
        text: any;
        field: string;
        sk: any;
        nv: {
            n: string;
            v: string;
        };
        checked?: undefined;
    })[];
    records(conds: any, onLoad: any): void;
    record(conds: any, onLoad: any): void;
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
}
declare const UserstReq_base: any;
export class UserstReq extends UserstReq_base {
    [x: string]: any;
    static type: string;
    static __init__: any;
    static A: {
        records: string;
        rec: string;
        update: string;
        insert: string;
        del: string;
        mykids: string;
    };
    constructor(uri: any, args?: {});
    type: string;
    uri: any;
    userId: any;
    userName: any;
    orgId: any;
    roleId: any;
    hasTodos: any;
    pk: any;
    record: any;
    relations: any;
    deletings: any;
}
export const Userst: React.ComponentType<(Pick<Pick<import("@material-ui/types").ConsistentWith<{
    uri: string;
}, {
    classes: import("@material-ui/styles").ClassNameMap<"button" | "root">;
}>, "uri"> & import("@material-ui/core").StyledComponentProps<"button" | "root">, "uri" | keyof import("@material-ui/core").StyledComponentProps<"button" | "root">> | Pick<Pick<import("@material-ui/types").ConsistentWith<{
    uri: string;
}, {
    classes: import("@material-ui/styles").ClassNameMap<"button" | "root">;
}> & {
    children?: React.ReactNode;
}, "children" | "uri"> & import("@material-ui/core").StyledComponentProps<"button" | "root">, "children" | "uri" | keyof import("@material-ui/core").StyledComponentProps<"button" | "root">> | Pick<Pick<import("@material-ui/types").ConsistentWith<{
    uri: string;
}, {
    classes: import("@material-ui/styles").ClassNameMap<"button" | "root">;
}>, "uri"> & import("@material-ui/core").StyledComponentProps<"button" | "root"> & {
    children?: React.ReactNode;
}, "children" | "uri" | keyof import("@material-ui/core").StyledComponentProps<"button" | "root">> | Pick<Pick<import("@material-ui/types").ConsistentWith<{
    uri: string;
}, {
    classes: import("@material-ui/styles").ClassNameMap<"button" | "root">;
}> & {
    children?: React.ReactNode;
}, "children" | "uri"> & import("@material-ui/core").StyledComponentProps<"button" | "root"> & {
    children?: React.ReactNode;
}, "children" | "uri" | keyof import("@material-ui/core").StyledComponentProps<"button" | "root">>) & import("@material-ui/core").WithWidthProps>;
export class UserstComp extends CrudCompW {
    tier: any;
    closeDetails(): void;
    /** If condts is null, use the last condts to query.
     * on succeed: set state.rows.
     * @param {object} condts the query conditions collected from query form.
     */
    toSearch(condts: object): void;
    toAdd(e: any, v: any): void;
    toEdit(e: any, v: any): void;
    onTableSelect(rowIds: any): void;
    toDel(e: any, v: any): void;
    del(): void;
    getTier: () => void;
    q: any;
    confirm: JSX.Element;
    recForm: JSX.Element;
}
export namespace UserstComp {
    export { AnContext as contextType };
}
import React from "react";
import { CrudCompW } from "../../react/crud";
import { AnContext } from "../../react/reactext";
export {};
