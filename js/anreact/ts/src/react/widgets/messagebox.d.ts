import React from 'react';
import { Comprops, CrudComp, CrudCompW } from '../crud';
import { AnContext } from '../reactext';
export interface DialogProps extends Comprops {
    onOk?: (sender: React.ReactNode) => void;
    onCancel?: (sender: React.ReactNode) => void;
    onClose?: () => void;
    /**Open dialog */
    title: string;
    /**with cancel button label ("false" will disable button) */
    cancel?: string | false;
    ok?: string;
    /**dialog message */
    msg: string;
    fullScreen?: boolean;
    fullWidth?: boolean;
}
declare class ConfirmDialogComp extends React.Component<DialogProps, any, any> {
    state: {
        closed: boolean;
    };
    handleClose: (event: {}, reason: "backdropClick" | "escapeKeyDown") => void;
    constructor(props: any);
    toOk(e: React.MouseEvent<HTMLElement>): void;
    toCancel(e: any): void;
    textLines(msg: any): any;
    render(): JSX.Element;
}
declare const ConfirmDialog: React.ComponentType<Pick<DialogProps, keyof DialogProps> & import("@material-ui/core/styles").StyledComponentProps<"root" | "dialogTitle" | "centerbox" | "dlgAct">>;
export { ConfirmDialog, ConfirmDialogComp };
export interface ErrorProps extends DialogProps {
    onClose: () => void;
    fullScreen: boolean;
}
export declare class AnError extends CrudCompW<ErrorProps> {
    context: React.ContextType<typeof AnContext>;
    state: {};
    constructor(props: any);
    render(): JSX.Element;
}
declare class QrSharingComp extends CrudComp<DialogProps & {
    imgId: string;
    qr: {
        serv: string;
        quiz: string;
        origin: string;
        path: string;
        page: string;
    };
}> {
    state: {
        closed: boolean;
        url: string;
    };
    constructor(props?: {});
    url(): string;
    onCopy(): void;
    handleClose(e: any): void;
    render(): JSX.Element;
}
declare const QrSharing: React.ComponentType<Pick<DialogProps & {
    imgId: string;
    qr: {
        serv: string;
        quiz: string;
        origin: string;
        path: string;
        page: string;
    };
}, keyof DialogProps> & import("@material-ui/core/styles").StyledComponentProps<"root" | "dialogTitle" | "centerbox" | "dlgAct">>;
export { QrSharing, QrSharingComp };
