export const TreeCard: React.ComponentType<(Pick<Pick<PropTypes.InferProps<{
    media: PropTypes.Validator<object>;
    leadingIcons: PropTypes.Validator<(...args: any[]) => any>;
    tnode: PropTypes.Validator<object>;
    parent: PropTypes.Validator<object>;
    columns: PropTypes.Validator<any[]>;
    toEdit: PropTypes.Validator<(...args: any[]) => any>;
}>, "media" | "columns" | "parent" | "toEdit" | "tnode" | "leadingIcons"> & import("@material-ui/core").StyledComponentProps<"row" | "root" | "rowHead" | "folder" | "folderHead" | "treeItem">, "media" | "columns" | "parent" | "toEdit" | "tnode" | "leadingIcons" | keyof import("@material-ui/core").StyledComponentProps<"row" | "root" | "rowHead" | "folder" | "folderHead" | "treeItem">> | Pick<Pick<PropTypes.InferProps<{
    media: PropTypes.Validator<object>;
    leadingIcons: PropTypes.Validator<(...args: any[]) => any>;
    tnode: PropTypes.Validator<object>;
    parent: PropTypes.Validator<object>;
    columns: PropTypes.Validator<any[]>;
    toEdit: PropTypes.Validator<(...args: any[]) => any>;
}>, "media" | "columns" | "parent" | "toEdit" | "tnode" | "leadingIcons"> & import("@material-ui/core").StyledComponentProps<"row" | "root" | "rowHead" | "folder" | "folderHead" | "treeItem"> & {
    children?: React.ReactNode;
}, "media" | "columns" | "children" | "parent" | "toEdit" | "tnode" | "leadingIcons" | keyof import("@material-ui/core").StyledComponentProps<"row" | "root" | "rowHead" | "folder" | "folderHead" | "treeItem">>) & import("@material-ui/core").WithWidthProps>;
export class TreeCardComp extends React.Component<any, any, any> {
    constructor(props: any);
    newCard: any;
    toUp(e: any): void;
    toDown(e: any): void;
    toTop(e: any): void;
    toBottom(e: any): void;
}
export namespace TreeCardComp {
    export { AnContext as contextType };
    export namespace propTypes {
        const media: PropTypes.Validator<object>;
        const leadingIcons: PropTypes.Validator<(...args: any[]) => any>;
        const tnode: PropTypes.Validator<object>;
        const parent: PropTypes.Validator<object>;
        const columns: PropTypes.Validator<any[]>;
        const toEdit: PropTypes.Validator<(...args: any[]) => any>;
    }
}
export const AnTreeditor: React.ComponentType<(Pick<Pick<PropTypes.InferProps<{
    uri: PropTypes.Validator<string>;
    mtabl: PropTypes.Validator<string>;
    columns: PropTypes.Validator<any[]>;
    fields: PropTypes.Validator<any[]>;
    pk: PropTypes.Validator<object>;
    isMidNode: PropTypes.Requireable<(...args: any[]) => any>;
}>, "columns" | "uri" | "mtabl" | "fields" | "pk" | "isMidNode"> & import("@material-ui/core").StyledComponentProps<"row" | "root" | "rowHead" | "folder" | "folderHead" | "treeItem">, "columns" | "uri" | "mtabl" | "fields" | "pk" | keyof import("@material-ui/core").StyledComponentProps<"row" | "root" | "rowHead" | "folder" | "folderHead" | "treeItem"> | "isMidNode"> | Pick<Pick<PropTypes.InferProps<{
    uri: PropTypes.Validator<string>;
    mtabl: PropTypes.Validator<string>;
    columns: PropTypes.Validator<any[]>;
    fields: PropTypes.Validator<any[]>;
    pk: PropTypes.Validator<object>;
    isMidNode: PropTypes.Requireable<(...args: any[]) => any>;
}>, "columns" | "uri" | "mtabl" | "fields" | "pk" | "isMidNode"> & import("@material-ui/core").StyledComponentProps<"row" | "root" | "rowHead" | "folder" | "folderHead" | "treeItem"> & {
    children?: React.ReactNode;
}, "columns" | "children" | "uri" | "mtabl" | "fields" | "pk" | keyof import("@material-ui/core").StyledComponentProps<"row" | "root" | "rowHead" | "folder" | "folderHead" | "treeItem"> | "isMidNode">) & import("@material-ui/core").WithWidthProps>;
export class AnTreeditorComp extends React.Component<any, any, any> {
    constructor(props: any);
    th(columns: any[], classes: any, media: any): JSX.Element;
    folderHead(columns: any[], tnode: any, open: any, classes: any, media: any): JSX.Element;
    toExpandItem(e: any): void;
    toAddChild(e: any): void;
    toEdit(e: any): void;
    leadingIcons(treeItem: any, expand: any, expIcon: any): any;
    /**
     * @param {object} classes
     * @param {media} media
     */
    treeNodes(classes: object, media: any): any;
    toSearch(): void;
    addForm: JSX.Element;
    toDel(e: any): void;
}
export namespace AnTreeditorComp {
    export { AnContext as contextType };
    export namespace propTypes_1 {
        export const uri: PropTypes.Validator<string>;
        export const mtabl: PropTypes.Validator<string>;
        const columns_1: PropTypes.Validator<any[]>;
        export { columns_1 as columns };
        export const fields: PropTypes.Validator<any[]>;
        export const pk: PropTypes.Validator<object>;
        export const isMidNode: PropTypes.Requireable<(...args: any[]) => any>;
    }
    export { propTypes_1 as propTypes };
}
import PropTypes from "prop-types";
import React from "react";
import { AnContext } from "../reactext";
