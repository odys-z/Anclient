declare const MyInfTier_base: any;
export class MyInfTier extends MyInfTier_base {
    [x: string]: any;
    constructor(comp: any);
    rec: {};
    imgProp: string;
    mtabl: string;
    pk: string;
    /**
     * Format an image upload component.
     * @param {object} record for the form
     * @param {object} field difinetion, e.g. field of tier._fileds
     * @param {Semantier} tier not necessarily this class's object - this method will be moved
     * @return {React.component} ImageUpload
     */
    loadAvatar(rec: any, field: object, tier: any): any;
    _fields: ({
        field: string;
        label: any;
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
        label: any;
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
        label: any;
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
        label: any;
        grid: {
            md: number;
            sm?: undefined;
            lg?: undefined;
        };
        formatter: (rec: any, field: object, tier: any) => any;
        disabled?: undefined;
        cbbStyle?: undefined;
        type?: undefined;
        sk?: undefined;
        nv?: undefined;
    })[];
    record(conds: any, onLoad: any): void;
    saveRec(opts: any, onOk: any): void;
}
export const MyInfCard: React.ComponentType<(Pick<Pick<PropTypes.InferProps<{
    uri: PropTypes.Validator<string>;
    width: PropTypes.Validator<string>;
    ssInf: PropTypes.Validator<object>;
}>, "width" | "ssInf" | "uri"> & import("@material-ui/core").StyledComponentProps<"actionButton">, "ssInf" | "uri" | keyof import("@material-ui/core").StyledComponentProps<"actionButton">> | Pick<Pick<PropTypes.InferProps<{
    uri: PropTypes.Validator<string>;
    width: PropTypes.Validator<string>;
    ssInf: PropTypes.Validator<object>;
}>, "width" | "ssInf" | "uri"> & import("@material-ui/core").StyledComponentProps<"actionButton"> & {
    children?: React.ReactNode;
}, "children" | "ssInf" | "uri" | keyof import("@material-ui/core").StyledComponentProps<"actionButton">>) & import("@material-ui/core").WithWidthProps>;
/** Simple session info card. Jsample use this to show user's personal info.
 * As UserDetails handling data binding by itself, and quit with data persisted
 * at jserv, this component is used to try the other way - no data persisting,
 * but with data automated data loading and state hook.
 */
export class MyInfCardComp extends React.Component<any, any, any> {
    constructor(props: any);
    uri: any;
    toSave(e: any): void;
    showConfirm(msg: any): void;
    confirm: JSX.Element;
    getTier: () => void;
    tier: MyInfTier;
}
export namespace MyInfCardComp {
    export { AnContext as context };
    export namespace propTypes {
        const uri: PropTypes.Validator<string>;
        const width: PropTypes.Validator<string>;
        const ssInf: PropTypes.Validator<object>;
    }
}
import PropTypes from "prop-types";
import React from "react";
import { AnContext } from "../../react/reactext";
export {};
