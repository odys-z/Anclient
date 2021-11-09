export const RoleDetails: React.ComponentType<(Pick<Pick<any, string | number | symbol> & import("@material-ui/core/styles").StyledComponentProps<"buttons" | "content" | "title" | "root" | "dialogPaper">, string | number | symbol> | Pick<Pick<any, string | number | symbol> & import("@material-ui/core/styles").StyledComponentProps<"buttons" | "content" | "title" | "root" | "dialogPaper"> & {
    children?: React.ReactNode;
}, string | number | symbol>) & import("@material-ui/core/withWidth").WithWidthProps>;
export class RoleDetailsComp extends DetailFormW<any> {
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
import React from "react";
import { DetailFormW } from "../../react/crud";
import { AnContext } from "../../react/reactext";
