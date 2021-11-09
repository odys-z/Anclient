import React from 'react';
import { CrudCompW } from '../../react/crud';
declare class RolesComp extends CrudCompW {
    state: {
        condName: {
            type: string;
            val: string;
            label: string;
        };
        condOrg: {
            type: string;
            sk: string;
            nv: {
                n: string;
                v: string;
            };
            val: {
                n: string;
                v: string;
            };
            options: {
                n: string;
                v: string;
            }[];
            label: string;
        };
        buttons: {
            add: boolean;
            edit: boolean;
            del: boolean;
        };
        total: number;
        pageInf: {
            page: number;
            size: number;
            total: number;
        };
        selected: {
            Ids: Set<unknown>;
        };
    };
    constructor(props: any);
    componentDidMount(): void;
    toSearch(e: any, q: any): void;
    onPageInf(page: any, size: any): void;
    onTableSelect(rowIds: any): void;
    toDel(e: any, v: any): void;
    toAdd(e: any, v: any): void;
    toEdit(e: any, v: any): void;
    closeDetails(): void;
    render(): JSX.Element;
}
declare const Roles: React.ComponentType<(Pick<Pick<import("@material-ui/types").ConsistentWith<{}, {
    classes: import("@material-ui/styles").ClassNameMap<"button" | "buttons" | "root" | "container">;
}>, never> & import("@material-ui/core").StyledComponentProps<"button" | "buttons" | "root" | "container">, keyof import("@material-ui/core").StyledComponentProps<"button" | "buttons" | "root" | "container">> | Pick<Pick<import("@material-ui/types").ConsistentWith<{}, {
    classes: import("@material-ui/styles").ClassNameMap<"button" | "buttons" | "root" | "container">;
}> & {
    children?: React.ReactNode;
}, "children"> & import("@material-ui/core").StyledComponentProps<"button" | "buttons" | "root" | "container">, "children" | keyof import("@material-ui/core").StyledComponentProps<"button" | "buttons" | "root" | "container">> | Pick<Pick<import("@material-ui/types").ConsistentWith<{}, {
    classes: import("@material-ui/styles").ClassNameMap<"button" | "buttons" | "root" | "container">;
}>, never> & import("@material-ui/core").StyledComponentProps<"button" | "buttons" | "root" | "container"> & {
    children?: React.ReactNode;
}, "children" | keyof import("@material-ui/core").StyledComponentProps<"button" | "buttons" | "root" | "container">> | Pick<Pick<import("@material-ui/types").ConsistentWith<{}, {
    classes: import("@material-ui/styles").ClassNameMap<"button" | "buttons" | "root" | "container">;
}> & {
    children?: React.ReactNode;
}, "children"> & import("@material-ui/core").StyledComponentProps<"button" | "buttons" | "root" | "container"> & {
    children?: React.ReactNode;
}, "children" | keyof import("@material-ui/core").StyledComponentProps<"button" | "buttons" | "root" | "container">>) & import("@material-ui/core").WithWidthProps>;
export { Roles, RolesComp };
