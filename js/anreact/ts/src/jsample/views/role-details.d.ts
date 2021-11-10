import React from 'react';
import { CRUD } from '@anclient/semantier-st';
import { DetailFormW } from '../../react/crud';
declare class RoleDetailsComp extends DetailFormW {
    state: {
        crud: CRUD;
        dirty: boolean;
        closed: boolean;
        pk: any;
        record: {};
    };
    constructor(props?: {});
    componentDidMount(): void;
    toSave(e: any): void;
    toCancel(e: any): void;
    showOk(txt: any): void;
    render(): JSX.Element;
}
declare const RoleDetails: React.ComponentType<(Pick<Pick<import("@material-ui/types").ConsistentWith<{}, {
    classes: import("@material-ui/styles").ClassNameMap<"buttons" | "content" | "title" | "root" | "dialogPaper">;
}>, never> & import("@material-ui/core/styles").StyledComponentProps<"buttons" | "content" | "title" | "root" | "dialogPaper">, keyof import("@material-ui/core/styles").StyledComponentProps<"buttons" | "content" | "title" | "root" | "dialogPaper">> | Pick<Pick<import("@material-ui/types").ConsistentWith<{}, {
    classes: import("@material-ui/styles").ClassNameMap<"buttons" | "content" | "title" | "root" | "dialogPaper">;
}> & {
    children?: React.ReactNode;
}, "children"> & import("@material-ui/core/styles").StyledComponentProps<"buttons" | "content" | "title" | "root" | "dialogPaper">, "children" | keyof import("@material-ui/core/styles").StyledComponentProps<"buttons" | "content" | "title" | "root" | "dialogPaper">> | Pick<Pick<import("@material-ui/types").ConsistentWith<{}, {
    classes: import("@material-ui/styles").ClassNameMap<"buttons" | "content" | "title" | "root" | "dialogPaper">;
}>, never> & import("@material-ui/core/styles").StyledComponentProps<"buttons" | "content" | "title" | "root" | "dialogPaper"> & {
    children?: React.ReactNode;
}, "children" | keyof import("@material-ui/core/styles").StyledComponentProps<"buttons" | "content" | "title" | "root" | "dialogPaper">> | Pick<Pick<import("@material-ui/types").ConsistentWith<{}, {
    classes: import("@material-ui/styles").ClassNameMap<"buttons" | "content" | "title" | "root" | "dialogPaper">;
}> & {
    children?: React.ReactNode;
}, "children"> & import("@material-ui/core/styles").StyledComponentProps<"buttons" | "content" | "title" | "root" | "dialogPaper"> & {
    children?: React.ReactNode;
}, "children" | keyof import("@material-ui/core/styles").StyledComponentProps<"buttons" | "content" | "title" | "root" | "dialogPaper">>) & import("@material-ui/core/withWidth").WithWidthProps>;
export { RoleDetails, RoleDetailsComp };
