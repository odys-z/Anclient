import React from 'react';
import { Comprops, DetailFormW } from '../../react/crud';
import { UsersTier } from './users';
/**
 * Tiered record form is a component for UI record layout, automaitcally bind data,
 * resolving FK's auto-cbb. As to child relation table, this component currently
 * is not planned to supprt. See performance issue: https://stackoverflow.com/a/66934465
 * <p>Issue: FK binding are triggered only once ? What about cascade cbbs ineraction?</p>
 */
declare class UserDetailstComp extends DetailFormW<Comprops> {
    state: {
        record: {};
    };
    crud: any;
    tier: UsersTier;
    confirm: JSX.Element;
    handleClose: (event: {}, reason: "backdropClick" | "escapeKeyDown") => void;
    constructor(props: Comprops);
    componentDidMount(): void;
    toSave(e: React.MouseEvent<HTMLElement>): void;
    toCancel(e: any): void;
    showConfirm(msg: any): void;
    render(): JSX.Element;
}
declare const UserDetailst: React.ComponentType<(Pick<Pick<Comprops, keyof Comprops> & import("@material-ui/core/styles").StyledComponentProps<"hide" | "row" | "root" | "labelText" | "labelText_dense" | "rowHead" | "folder">, string | number | symbol> | Pick<Pick<Comprops, keyof Comprops> & import("@material-ui/core/styles").StyledComponentProps<"hide" | "row" | "root" | "labelText" | "labelText_dense" | "rowHead" | "folder"> & {
    children?: React.ReactNode;
}, string | number | symbol>) & import("@material-ui/core/withWidth").WithWidthProps>;
export { UserDetailst, UserDetailstComp };
