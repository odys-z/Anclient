export const AnContext: React.Context<{
    an: any;
    ssInf: any;
    pageOrigin: string;
    iparent: {};
    ihome: string;
    servId: string;
    servs: {
        host: string;
    };
    anReact: any;
    error: {
        onError: any;
        msg: any;
    };
    hasError: boolean;
    setServ: (servId: any, json: any) => void;
    uuid: () => number;
}>;
export class AnError extends React.Component<any, any, any> {
    constructor(props: any);
}
export namespace AnError {
    export { AnContext as contextType };
}
import React from "react";
