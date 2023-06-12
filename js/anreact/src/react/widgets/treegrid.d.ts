
import { StyledComponentProps } from "@material-ui/core";
import React from "react";

export const AnTreegrid: React.ComponentType<Pick<any, string | number | symbol>
            & StyledComponentProps<"hide" | "row" | "root" | "rowHead" | "folder" | "folderHead" | "treeItem">>;

export class AnTreegridComp extends React.Component<any, any, any> {
    constructor(props: any);
    toExpandItem(e: any): void;
    /**
     * @param {object} classes
     */
    treeNodes(classes: object): any;
}
