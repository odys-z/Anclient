export const RoleDetails: React.ComponentType<(Pick<Pick<PropTypes.InferProps<{
    width: PropTypes.Validator<string>;
}>, "width"> & import("@material-ui/core/styles").StyledComponentProps<"buttons" | "content" | "title" | "root" | "dialogPaper">, keyof import("@material-ui/core/styles").StyledComponentProps<"buttons" | "content" | "title" | "root" | "dialogPaper">> | Pick<Pick<PropTypes.InferProps<{
    width: PropTypes.Validator<string>;
}>, "width"> & import("@material-ui/core/styles").StyledComponentProps<"buttons" | "content" | "title" | "root" | "dialogPaper"> & {
    children?: React.ReactNode;
}, "children" | keyof import("@material-ui/core/styles").StyledComponentProps<"buttons" | "content" | "title" | "root" | "dialogPaper">>) & import("@material-ui/core/withWidth").WithWidthProps>;
export class RoleDetailsComp extends DetailFormW {
    constructor(props?: {});
    tier: any;
    toSave(e: any): void;
    toCancel(e: any): void;
    showOk(txt: any): void;
    ok: JSX.Element;
}
export namespace RoleDetailsComp {
    export { AnContext as contextType };
}
import PropTypes from "prop-types";
import React from "react";
import { DetailFormW } from "../../react/crud";
import { AnContext } from "../../react/reactext";
