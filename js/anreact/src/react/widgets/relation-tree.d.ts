/**
 * Tiered relationshp tree is a component for UI relation tree layout, automaitcally bind data,
 * resolving FK's auto-cbb.
 *
 * See also {@link AnRelationTreeComp}
 */
export class AnRelationTreeComp extends CrudCompW<any> {
    constructor(props: any);
    tier: any;
    toExpandItem(e: any): void;
    /**
     * @param {object} classes
     */
    buildTree(classes: object): any;
}
export namespace AnRelationTreeComp {
    namespace propTypes {
        const uri: PropTypes.Validator<string>;
        const tier: PropTypes.Validator<object>;
        const dense: PropTypes.Requireable<boolean>;
    }
}
import { CrudCompW } from "../crud";
import PropTypes from "prop-types";
export const AnRelationTree: React.ComponentType<(Pick<Pick<PropTypes.InferProps<{
    mtabl:PropTypes.Validator<string>; 
    reltabl:PropTypes.Validator<string>; 
    uri: PropTypes.Validator<string>;
    tier: PropTypes.Validator<object>;
    dense: PropTypes.Requireable<boolean>;
}>, "mtabl" | "reltabl" | "dense" | "uri" | "tier"> & import("@material-ui/core/styles").StyledComponentProps<"hide" | "row" | "root" | "rowHead" | "folder" | "folderHead" | "treeItem" | "treeLabel">, "dense" | "uri" | "tier" | keyof import("@material-ui/core/styles").StyledComponentProps<"hide" | "row" | "root" | "rowHead" | "folder" | "folderHead" | "treeItem" | "treeLabel">> | Pick<Pick<PropTypes.InferProps<{
    mtabl:PropTypes.Validator<string>; 
    reltabl:PropTypes.Validator<string>; 
    uri: PropTypes.Validator<string>;
    tier: PropTypes.Validator<object>;
    dense: PropTypes.Requireable<boolean>;
}>, "mtabl" | "reltabl" | "dense" | "uri" | "tier"> & import("@material-ui/core/styles").StyledComponentProps<"hide" | "row" | "root" | "rowHead" | "folder" | "folderHead" | "treeItem" | "treeLabel"> & {
    children?: React.ReactNode;
}, "children" | "mtabl" | "reltabl" | "dense" | "uri" | "tier" | keyof import("@material-ui/core/styles").StyledComponentProps<"hide" | "row" | "root" | "rowHead" | "folder" | "folderHead" | "treeItem" | "treeLabel">>) & import("@material-ui/core/withWidth").WithWidthProps>;
import React from "react";
