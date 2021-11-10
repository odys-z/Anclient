import React from 'react';
import { Comprops, CrudCompW } from '../../react/crud';
declare class OrgsComp extends CrudCompW<Comprops> {
    state: {};
    constructor(props: any);
    componentDidMount(): void;
    toSearch(e: any, query: any): void;
    render(): JSX.Element;
}
declare const Orgs: React.ComponentType<(Pick<Pick<Comprops, keyof Comprops> & import("@material-ui/core/styles").StyledComponentProps<"root">, string | number | symbol> | Pick<Pick<Comprops, keyof Comprops> & import("@material-ui/core/styles").StyledComponentProps<"root"> & {
    children?: React.ReactNode;
}, string | number | symbol>) & import("@material-ui/core/withWidth").WithWidthProps>;
export { Orgs, OrgsComp };
