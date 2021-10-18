export const Orgs: React.ComponentType<(Pick<Pick<import("@material-ui/types").ConsistentWith<{
    uri: string;
}, {
    classes: import("@material-ui/styles").ClassNameMap<"root">;
}>, "uri"> & import("@material-ui/core").StyledComponentProps<"root">, "uri" | keyof import("@material-ui/core").StyledComponentProps<"root">> | Pick<Pick<import("@material-ui/types").ConsistentWith<{
    uri: string;
}, {
    classes: import("@material-ui/styles").ClassNameMap<"root">;
}> & {
    children?: React.ReactNode;
}, "children" | "uri"> & import("@material-ui/core").StyledComponentProps<"root">, "children" | "uri" | keyof import("@material-ui/core").StyledComponentProps<"root">> | Pick<Pick<import("@material-ui/types").ConsistentWith<{
    uri: string;
}, {
    classes: import("@material-ui/styles").ClassNameMap<"root">;
}>, "uri"> & import("@material-ui/core").StyledComponentProps<"root"> & {
    children?: React.ReactNode;
}, "children" | "uri" | keyof import("@material-ui/core").StyledComponentProps<"root">> | Pick<Pick<import("@material-ui/types").ConsistentWith<{
    uri: string;
}, {
    classes: import("@material-ui/styles").ClassNameMap<"root">;
}> & {
    children?: React.ReactNode;
}, "children" | "uri"> & import("@material-ui/core").StyledComponentProps<"root"> & {
    children?: React.ReactNode;
}, "children" | "uri" | keyof import("@material-ui/core").StyledComponentProps<"root">>) & import("@material-ui/core").WithWidthProps>;
export class OrgsComp extends CrudCompW {
    toSearch(e: any, query: any): void;
}
export namespace OrgsComp {
    export { AnContext as contextType };
}
import React from "react";
import { CrudCompW } from "../../react/crud";
import { AnContext } from "../../react/reactext";
