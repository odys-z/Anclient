export const Orgs: React.ComponentType<(Pick<Pick<any, string | number | symbol> & import("@material-ui/core").StyledComponentProps<"root">, string | number | symbol> | Pick<Pick<any, string | number | symbol> & import("@material-ui/core").StyledComponentProps<"root"> & {
    children?: React.ReactNode;
}, string | number | symbol>) & import("@material-ui/core").WithWidthProps>;
export class OrgsComp extends CrudCompW<any> {
    constructor(props: any);
    toSearch(e: any, query: any): void;
}
export namespace OrgsComp {
    export { AnContext as contextType };
}
import React from "react";
import { CrudCompW } from "../../react/crud";
import { AnContext } from "../../react/reactext";
