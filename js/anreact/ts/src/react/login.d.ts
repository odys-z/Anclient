export const Login: React.ComponentType<Pick<any, string | number | symbol> & import("@material-ui/core/styles").StyledComponentProps<"root" | "field1" | "field2">>;
/**
 * Anclinet logging-in component
 * @class
 */
export class LoginComp extends React.Component<any, any, any> {
    /**
     * initialize a instance of Anclient visition jserv service.
     * @param {object} props
     * @param {string} props.jserv e.g. "http://127.0.0.1:8080/jserv-quiz"); url to service root.
     * @constructor
     */
    constructor(props: {
        jserv: string;
    });
    an: any;
    alert(): void;
    onErrorClose(): void;
    /**
     * Login and go main page (sys.jsx). Target html page is first specified by
     * login.serv (SessionInf.home).
     */
    onLogin(): void;
    onLogout(): void;
    update(val: any): void;
}
export namespace LoginComp {
    export { AnContext as contextType };
}
import React from "react";
import { AnContext } from "./reactext.jsx";
