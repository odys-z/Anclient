export const Error: React.ComponentType<Pick<any, string | number | symbol> & import("@material-ui/core/styles").StyledComponentProps<"root">>;
export class ErrorComp extends CrudComp {
    constructor(props: any);
    onDetails: any;
    /** A simulation of error triggering (used for error handling test). */
    toShowError(): void;
    toSubmit(): void;
}
export namespace ErrorComp {
    export { AnContext as contextType };
}
import React from "react";
import { CrudComp } from "./crud";
import { AnContext } from "./reactext";
