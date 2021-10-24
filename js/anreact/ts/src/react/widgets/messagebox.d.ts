export const ConfirmDialog: React.ComponentType<Pick<any, string | number | symbol> & import("@material-ui/core/styles").StyledComponentProps<"root" | "dialogTitle" | "centerbox" | "dlgAct">>;
export class ConfirmDialogComp extends React.Component<any, any, any> {
    constructor(props?: {});
    toCancel(e: any): void;
    toOk(e: any): void;
    textLines(msg: any): any;
}
export const QrSharing: React.ComponentType<Pick<any, string | number | symbol> & import("@material-ui/core/styles").StyledComponentProps<"root" | "dialogTitle" | "centerbox" | "dlgAct">>;
export class QrSharingComp extends React.Component<any, any, any> {
    constructor(props?: {});
    handleClose(e: any): void;
    url(): string;
    onCopy(): void;
}
import React from "react";
