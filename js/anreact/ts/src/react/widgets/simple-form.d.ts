export const SimpleForm: React.ComponentType<(Pick<Pick<PropTypes.InferProps<{
    uri: PropTypes.Validator<string>;
    mtabl: PropTypes.Validator<string>;
}>, "uri" | "mtabl"> & import("@material-ui/core/styles").StyledComponentProps<"hide" | "row" | "root" | "rowHead" | "folder" | "folderHead" | "labelText">, "uri" | "mtabl" | keyof import("@material-ui/core/styles").StyledComponentProps<"hide" | "row" | "root" | "rowHead" | "folder" | "folderHead" | "labelText">> | Pick<Pick<PropTypes.InferProps<{
    uri: PropTypes.Validator<string>;
    mtabl: PropTypes.Validator<string>;
}>, "uri" | "mtabl"> & import("@material-ui/core/styles").StyledComponentProps<"hide" | "row" | "root" | "rowHead" | "folder" | "folderHead" | "labelText"> & {
    children?: React.ReactNode;
}, "children" | "uri" | "mtabl" | keyof import("@material-ui/core/styles").StyledComponentProps<"hide" | "row" | "root" | "rowHead" | "folder" | "folderHead" | "labelText">>) & import("@material-ui/core/withWidth").WithWidthProps>;
/**Simple form is a dialog.
 * Use record form for UI record layout.
 */
export class SimpleFormComp extends DetailFormW {
    constructor(props?: {});
    uri: any;
    funcId: any;
    formFields(rec: any, classes: any): any[];
    getField(f: any, rec: any): JSX.Element;
    validate(invalidStyle: any): boolean;
    toSave(e: any): void;
    toCancel(e: any): void;
    showOk(txt: any): void;
    ok: JSX.Element;
}
export namespace SimpleFormComp {
    export { AnContext as contextType };
    export namespace propTypes {
        const uri: PropTypes.Validator<string>;
        const mtabl: PropTypes.Validator<string>;
    }
}
import PropTypes from "prop-types";
import React from "react";
import { DetailFormW } from "../crud";
import { AnContext } from "../reactext.jsx";
