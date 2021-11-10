export class UsersTier extends Semantier {
    constructor(comp: any);
    port: string;
    checkbox: boolean;
}
export class UserstReq extends UserReq {
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
export const Userst: React.ComponentType<(Pick<Pick<any, string | number | symbol> & import("@material-ui/core").StyledComponentProps<"button" | "root">, string | number | symbol> | Pick<Pick<any, string | number | symbol> & import("@material-ui/core").StyledComponentProps<"button" | "root"> & {
    children?: React.ReactNode;
}, string | number | symbol>) & import("@material-ui/core").WithWidthProps>;
export class UserstComp extends CrudCompW<any> {
    constructor(props: any);
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
import { Semantier } from "@anclient/semantier-st/semantier";
import { UserReq } from "@anclient/semantier-st/protocol";
import React from "react";
import { CrudCompW } from "../../react/crud";
import { AnContext } from "../../react/reactext";
