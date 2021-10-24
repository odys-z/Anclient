export const Roles: React.ComponentType<(Pick<Pick<import("@material-ui/types").ConsistentWith<{
    uri: string;
}, {
    classes: import("@material-ui/styles").ClassNameMap<"button" | "buttons" | "root" | "container">;
}>, "uri"> & import("@material-ui/core").StyledComponentProps<"button" | "buttons" | "root" | "container">, "uri" | keyof import("@material-ui/core").StyledComponentProps<"button" | "buttons" | "root" | "container">> | Pick<Pick<import("@material-ui/types").ConsistentWith<{
    uri: string;
}, {
    classes: import("@material-ui/styles").ClassNameMap<"button" | "buttons" | "root" | "container">;
}> & {
    children?: React.ReactNode;
}, "children" | "uri"> & import("@material-ui/core").StyledComponentProps<"button" | "buttons" | "root" | "container">, "children" | "uri" | keyof import("@material-ui/core").StyledComponentProps<"button" | "buttons" | "root" | "container">> | Pick<Pick<import("@material-ui/types").ConsistentWith<{
    uri: string;
}, {
    classes: import("@material-ui/styles").ClassNameMap<"button" | "buttons" | "root" | "container">;
}>, "uri"> & import("@material-ui/core").StyledComponentProps<"button" | "buttons" | "root" | "container"> & {
    children?: React.ReactNode;
}, "children" | "uri" | keyof import("@material-ui/core").StyledComponentProps<"button" | "buttons" | "root" | "container">> | Pick<Pick<import("@material-ui/types").ConsistentWith<{
    uri: string;
}, {
    classes: import("@material-ui/styles").ClassNameMap<"button" | "buttons" | "root" | "container">;
}> & {
    children?: React.ReactNode;
}, "children" | "uri"> & import("@material-ui/core").StyledComponentProps<"button" | "buttons" | "root" | "container"> & {
    children?: React.ReactNode;
}, "children" | "uri" | keyof import("@material-ui/core").StyledComponentProps<"button" | "buttons" | "root" | "container">>) & import("@material-ui/core").WithWidthProps>;
export class RolesComp extends CrudCompW {
    closeDetails(): void;
    toSearch(e: any, q: any): void;
    onPageInf(page: any, size: any): void;
    onTableSelect(rowIds: any): void;
    toAdd(e: any, v: any): void;
    toEdit(e: any, v: any): void;
    toDel(e: any, v: any): void;
    tier: any;
    q: any;
    confirm: JSX.Element;
    roleForm: JSX.Element;
}
export namespace RolesComp {
    export { AnContext as contextType };
}
import React from "react";
import { CrudCompW } from "../../react/crud";
import { AnContext } from "../../react/reactext";
