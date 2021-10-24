export const UserDetailst: React.ComponentType<(Pick<Pick<PropTypes.InferProps<{
    uri: PropTypes.Validator<string>;
    tier: PropTypes.Validator<object>;
    crud: PropTypes.Validator<string>;
    dense: PropTypes.Requireable<boolean>;
}>, "dense" | "uri" | "tier" | "crud"> & import("@material-ui/core/styles").StyledComponentProps<"hide" | "row" | "root" | "rowHead" | "folder" | "labelText" | "labelText_dense">, "dense" | "uri" | "tier" | "crud" | keyof import("@material-ui/core/styles").StyledComponentProps<"hide" | "row" | "root" | "rowHead" | "folder" | "labelText" | "labelText_dense">> | Pick<Pick<PropTypes.InferProps<{
    uri: PropTypes.Validator<string>;
    tier: PropTypes.Validator<object>;
    crud: PropTypes.Validator<string>;
    dense: PropTypes.Requireable<boolean>;
}>, "dense" | "uri" | "tier" | "crud"> & import("@material-ui/core/styles").StyledComponentProps<"hide" | "row" | "root" | "rowHead" | "folder" | "labelText" | "labelText_dense"> & {
    children?: React.ReactNode;
}, "children" | "dense" | "uri" | "tier" | "crud" | keyof import("@material-ui/core/styles").StyledComponentProps<"hide" | "row" | "root" | "rowHead" | "folder" | "labelText" | "labelText_dense">>) & import("@material-ui/core/withWidth").WithWidthProps>;
/**
 * Tiered record form is a component for UI record layout, automaitcally bind data,
 * resolving FK's auto-cbb. As to child relation table, this component currently
 * is not planned to supprt. See performance issue: https://stackoverflow.com/a/66934465
 * <p>Issue: FK binding are triggered only once ? What about cascade cbbs ineraction?</p>
 */
export class UserDetailstComp extends DetailFormW {
    constructor(props?: {});
    tier: any;
    toCancel(e: any): void;
    toSave(e: any): void;
    showConfirm(msg: any): void;
    confirm: JSX.Element;
}
export namespace UserDetailstComp {
    namespace propTypes {
        const uri: PropTypes.Validator<string>;
        const tier: PropTypes.Validator<object>;
        const crud: PropTypes.Validator<string>;
        const dense: PropTypes.Requireable<boolean>;
    }
}
import PropTypes from "prop-types";
import React from "react";
import { DetailFormW } from "../../react/crud";
