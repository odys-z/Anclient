import React from 'react';
import { Semantier, Tierec } from '@anclient/semantier-st';
import { Comprops, DetailFormW } from '../../react/crud';
/** Simple session info card. Jsample use this to show user's personal info.
 * As UserDetails handling data binding by itself, and quit with data persisted
 * at jserv, this component is used to try the other way - no data persisting,
 * but with data automated data loading and state hook.
 */
declare class MyInfCardComp extends DetailFormW<Comprops> {
    state: {};
    tier: MyInfTier;
    confirm: JSX.Element;
    constructor(props: any);
    componentDidMount(): void;
    showConfirm(msg: any): void;
    toSave(e: any): void;
    getTier: () => void;
    render(): JSX.Element;
}
declare const MyInfCard: React.ComponentType<(Pick<Pick<Comprops, keyof Comprops> & import("@material-ui/core/styles").StyledComponentProps<"actionButton">, string | number | symbol> | Pick<Pick<Comprops, keyof Comprops> & import("@material-ui/core/styles").StyledComponentProps<"actionButton"> & {
    children?: React.ReactNode;
}, string | number | symbol>) & import("@material-ui/core/withWidth").WithWidthProps>;
export { MyInfCard, MyInfCardComp };
export declare class MyInfTier extends Semantier {
    rec: Tierec;
    imgProp: string;
    constructor(comp: any);
    _fields: ({
        field: string;
        label: string;
        grid: {
            sm: number;
            lg: number;
            md?: undefined;
        };
        disabled: boolean;
        cbbStyle?: undefined;
        type?: undefined;
        sk?: undefined;
        nv?: undefined;
        formatter?: undefined;
    } | {
        field: string;
        label: string;
        grid: {
            sm: number;
            lg: number;
            md?: undefined;
        };
        disabled?: undefined;
        cbbStyle?: undefined;
        type?: undefined;
        sk?: undefined;
        nv?: undefined;
        formatter?: undefined;
    } | {
        field: string;
        label: string;
        disabled: boolean;
        grid: {
            sm: number;
            lg: number;
            md?: undefined;
        };
        cbbStyle: {
            width: string;
        };
        type: string;
        sk: any;
        nv: {
            n: string;
            v: string;
        };
        formatter?: undefined;
    } | {
        field: string;
        label: string;
        grid: {
            md: number;
            sm?: undefined;
            lg?: undefined;
        };
        formatter: (rec: any, field: any, tier: any) => JSX.Element;
        disabled?: undefined;
        cbbStyle?: undefined;
        type?: undefined;
        sk?: undefined;
        nv?: undefined;
    })[];
    /**
     * Format an image upload component.
     * @param {object} record for the form
     * @param {object} field difinetion, e.g. field of tier._fileds
     * @param {Semantier} tier not necessarily this class's object - this method will be moved
     * @return {React.component} ImageUpload
     */
    loadAvatar(rec: any, field: any, tier: any): JSX.Element;
    record(conds: any, onLoad: any): void;
    saveRec(opts: any, onOk: any): void;
}
