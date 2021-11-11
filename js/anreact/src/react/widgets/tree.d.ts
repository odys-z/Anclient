export const AnTreeIcons: {
    expand: JSX.Element;
    collapse: JSX.Element;
    "menu-lv0": JSX.Element;
    "menu-lv1": JSX.Element;
    "menu-leaf": JSX.Element;
    deflt: JSX.Element;
    "-": JSX.Element;
    F: JSX.Element;
    "|": JSX.Element;
    T: JSX.Element;
    L: JSX.Element;
    "|-": JSX.Element;
    E: JSX.Element;
    "+": JSX.Element;
    ".": JSX.Element;
};
export const AnTree: React.ComponentType<Pick<any, string | number | symbol> & import("@material-ui/core/styles").StyledComponentProps<"hide" | "row" | "root" | "rowHead" | "folder" | "folderHead" | "treeItem" | "treeLabel">>;
export class AnTreeComp extends React.Component<any, any, any> {
    constructor(props: any);
    toExpandItem(e: any): void;
    /**
     * @param {object} classes
     */
    buildTree(classes: object): any[];
}
import React from "react";
