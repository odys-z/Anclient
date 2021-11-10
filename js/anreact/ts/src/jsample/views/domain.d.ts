import React from 'react';
import { Comprops, CrudCompW } from '../../react/crud';
import { QueryConditions } from '@anclient/semantier-st';
declare class DomainComp extends CrudCompW<Comprops> {
    state: {
        condTxt: {
            type: string;
            val: string;
            text: string;
            label: string;
        };
        condCbb: {
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
        condAuto: {
            type: string;
            nv: {
                n: string;
                v: string;
            };
            val: {
                n: string;
                v: string;
            };
            options: ({
                n: string;
                v: string;
            } | {
                n: string;
                v: number;
            })[];
            label: string;
        };
        condDate: {
            type: string;
            val: string;
            label: string;
        };
        pageInf: {
            page: number;
            size: number;
            total: number;
        };
        selected: {
            Ids: Set<unknown>;
        };
    };
    queryReq: QueryConditions;
    constructor(props: Comprops);
    toSearch(e: any, query: any): void;
    onPageInf(page: any, size: any): void;
    render(): JSX.Element;
}
declare const Domain: React.ComponentType<(Pick<Pick<Comprops, keyof Comprops> & import("@material-ui/core/styles").StyledComponentProps<"root">, string | number | symbol> | Pick<Pick<Comprops, keyof Comprops> & import("@material-ui/core/styles").StyledComponentProps<"root"> & {
    children?: React.ReactNode;
}, string | number | symbol>) & import("@material-ui/core/withWidth").WithWidthProps>;
export { Domain, DomainComp };
