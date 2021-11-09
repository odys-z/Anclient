export const Roles: React.ComponentType<(Pick<Pick<any, string | number | symbol> & import("@material-ui/core").StyledComponentProps<"button" | "buttons" | "root" | "container">, string | number | symbol> | Pick<Pick<any, string | number | symbol> & import("@material-ui/core").StyledComponentProps<"button" | "buttons" | "root" | "container"> & {
    children?: React.ReactNode;
}, string | number | symbol>) & import("@material-ui/core").WithWidthProps>;
export class RolesComp extends CrudCompW<any> {
    constructor(props: any);
    closeDetails(): void;
    toSearch(e: any, query: any): void;
    onPageInf(page: any, size: any): void;
    onTableSelect(rowIds: any): void;
    toAdd(e: any, v: any): void;
    toEdit(e: any, v: any): void;
    toDel(e: any, v: any): void;
    confirm: JSX.Element;
    roleForm: JSX.Element;
}
export namespace RolesComp {
    export { AnContext as contextType };
}
import React from "react";
import { CrudCompW } from "../../react/crud";
import { AnContext } from "../../react/reactext";
