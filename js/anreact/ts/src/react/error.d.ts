import React from 'react';
import { Comprops, CrudComp } from './crud';
declare class ErrorComp extends CrudComp<Comprops> {
    state: {
        details: string;
        info: string;
        desc: string;
        msg: any;
        sysName: string;
    };
    constructor(props: any);
    /** A simulation of error triggering (used for error handling test). */
    toShowError(): void;
    toSubmit(): void;
    render(): JSX.Element;
}
declare const Error: React.ComponentType<Pick<Comprops, keyof Comprops> & import("@material-ui/core").StyledComponentProps<"root">>;
export { Error, ErrorComp };
