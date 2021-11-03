export const TRecordForm: React.ComponentType<(Pick<Pick<import("@material-ui/types").ConsistentWith<{
    uri: string;
}, {
    classes: import("@material-ui/styles").ClassNameMap<never>;
}>, "uri"> & import("@material-ui/core/styles").StyledComponentProps<never>, "uri" | keyof import("@material-ui/core/styles").StyledComponentProps<never>> | Pick<Pick<import("@material-ui/types").ConsistentWith<{
    uri: string;
}, {
    classes: import("@material-ui/styles").ClassNameMap<never>;
}> & {
    children?: React.ReactNode;
}, "children" | "uri"> & import("@material-ui/core/styles").StyledComponentProps<never>, "children" | "uri" | keyof import("@material-ui/core/styles").StyledComponentProps<never>> | Pick<Pick<import("@material-ui/types").ConsistentWith<{
    uri: string;
}, {
    classes: import("@material-ui/styles").ClassNameMap<never>;
}>, "uri"> & import("@material-ui/core/styles").StyledComponentProps<never> & {
    children?: React.ReactNode;
}, "children" | "uri" | keyof import("@material-ui/core/styles").StyledComponentProps<never>> | Pick<Pick<import("@material-ui/types").ConsistentWith<{
    uri: string;
}, {
    classes: import("@material-ui/styles").ClassNameMap<never>;
}> & {
    children?: React.ReactNode;
}, "children" | "uri"> & import("@material-ui/core/styles").StyledComponentProps<never> & {
    children?: React.ReactNode;
}, "children" | "uri" | keyof import("@material-ui/core/styles").StyledComponentProps<never>>) & import("@material-ui/core/withWidth").WithWidthProps>;
/**
 * A Tiered record component is designed for UI record layout rendering, handling
 * user action (change text, etc.) in a levle-up style. It's parent's responsibilty
 * to load all binding data in sychronous.
 * TRecordForm won't resolving FK's auto-cbb.
 * But TRecordFormComp do has a state for local udpating, See performance issue:
 * https://stackoverflow.com/a/66934465
 *
 * In case of child relation table, this component currently is not planned to supprt.
 * <p>Usally a CRUD process needs to update multiple tables in one transaction,
 * so this component leveled up state for saving. Is this a co-accident with React
 * or is required by semantics?</p>
 * <p>Issue: FK binding are triggered only once ? What about cascade cbbs ineraction?</p>
 *
 * NOTE: Desgin Memo
 * Level-up way is NOT working! So having tier as the common state/data manager. 
 */
export class TRecordFormComp extends CrudCompW {
    constructor(props?: {});
    tier: any;
    formFields(rec: any, classes: any): any[];
    getField(f: any, rec: any, classes: any): JSX.Element;
}
export namespace TRecordFormComp {
    namespace propTypes {
        const width: PropTypes.Validator<string>;
        const tier: PropTypes.Validator<object>;
        const dense: PropTypes.Requireable<boolean>;
        const enableValidate: PropTypes.Requireable<boolean>;
    }
}
import React from "react";
import { CrudCompW } from "../crud";
import PropTypes from "prop-types";
