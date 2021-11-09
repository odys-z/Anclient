import React from 'react';
import { Comprops, DetailFormW } from '../../react/crud';
/**
 * Adding-only file list shared for every users.
 */
declare class MyPswdComp extends DetailFormW<Comprops> {
    state: {
        sizeOptions: number[];
        total: number;
        page: number;
        size: number;
    };
    selected: any;
    tier: any;
    confirm: JSX.Element;
    static propTypes: {};
    constructor(props: any);
    componentDidMount(): void;
    getTier: () => void;
    showConfirm(msg: string | string[]): void;
    changePswd(e: React.MouseEvent<HTMLElement>): void;
    render(): JSX.Element;
}
declare const MyPswd: React.ComponentType<Pick<Comprops, keyof Comprops> & import("@material-ui/core/styles").StyledComponentProps<"ok" | "notNull" | "maxLen" | "anyErr" | "minLen">>;
export { MyPswd, MyPswdComp };
