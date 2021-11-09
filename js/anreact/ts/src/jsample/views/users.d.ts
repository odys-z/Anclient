import React from 'react';
import { CRUD, UserReq, QueryConditions, Tierec, TierCol, OnCommitOk } from '@anclient/semantier-st';
import { Semantier } from '@anclient/semantier-st';
import { Comprops, CrudCompW } from '../../react/crud';
declare class UserstComp extends CrudCompW<Comprops> {
    state: {
        buttons: {
            add: boolean;
            edit: boolean;
            del: boolean;
        };
        pageInf: {
            page: number;
            size: number;
            total: number;
        };
        selected: {
            ids: Set<string>;
        };
    };
    tier: UsersTier;
    q: QueryConditions;
    confirm: JSX.Element;
    recForm: JSX.Element;
    pageInf: any;
    onPageInf: any;
    constructor(props: any);
    componentDidMount(): void;
    getTier: () => void;
    /** If condts is null, use the last condts to query.
     * on succeed: set state.rows.
     * @param {object} condts the query conditions collected from query form.
     */
    toSearch(condts: any): void;
    onTableSelect(rowIds: any): void;
    toDel(e: React.MouseEvent<Element, MouseEvent>): void;
    del(): void;
    toAdd(e: React.MouseEvent<Element, MouseEvent>): void;
    toEdit(e: React.MouseEvent<Element, MouseEvent>): void;
    closeDetails(): void;
    render(): JSX.Element;
}
declare const Userst: React.ComponentType<(Pick<Pick<Comprops, keyof Comprops> & import("@material-ui/core").StyledComponentProps<"button" | "root">, string | number | symbol> | Pick<Pick<Comprops, keyof Comprops> & import("@material-ui/core").StyledComponentProps<"button" | "root"> & {
    children?: React.ReactNode;
}, string | number | symbol>) & import("@material-ui/core").WithWidthProps>;
export { Userst, UserstComp };
export declare class UsersTier extends Semantier {
    port: string;
    mtabl: string;
    pk: string;
    checkbox: boolean;
    rows: any[];
    pkval: any;
    rec: Tierec;
    _fields: ({
        type: string;
        field: string;
        label: string;
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
        label: string;
        validator?: undefined;
        grid?: undefined;
        defaultStyle?: undefined;
        sk?: undefined;
        nv?: undefined;
    } | {
        type: string;
        field: string;
        label: string;
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
        label: string;
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
    _cols: TierCol[];
    constructor(comp: any);
    columns(): TierCol[];
    records(conds: any, onLoad: any): void;
    record(conds: any, onLoad: any): void;
    saveRec(opts: {
        uri: string;
        crud: CRUD;
        pkval: string;
    }, onOk: OnCommitOk): void;
    /**
     * @param opts
     * @param opts.uri overriding local uri
     * @param opts.ids record id
     * @param onOk function(AnsonResp);
     */
    del(opts: {
        uri?: string;
        [p: string]: string | Set<string> | object;
    }, onOk: OnCommitOk): void;
}
export declare class UserstReq extends UserReq {
    static __type__: string;
    static __init__: any;
    static A: {
        records: string;
        rec: string;
        update: string;
        insert: string;
        del: string;
        mykids: string;
    };
    userId: any;
    userName: any;
    orgId: any;
    roleId: any;
    hasTodos: any;
    pk: any;
    record: any;
    relations: any;
    deletings: any;
    constructor(uri: string, args: {
        record?: Tierec;
        relations?: any;
        pk?: string;
        deletings?: string[];
        userId?: string;
        userName?: string;
        orgId?: string;
        roleId?: string;
        hasTodos?: string;
    });
}
