import React from 'react';
import { AnClient, OnCommitOk } from '@anclient/semantier-st';
import { SessionClient } from '@anclient/semantier-st';
import { Comprops } from './crud';
interface LoginProps extends Comprops {
    onLogin: OnCommitOk;
}
/**
 * Anclinet logging-in component
 * @class
 */
declare class LoginComp extends React.Component<LoginProps> {
    state: {
        loggedin: boolean;
        show: boolean;
        pswd: string;
        userid: string;
        alert: string;
        showAlert: boolean;
        hasError: boolean;
        errHandler: {};
    };
    an: AnClient;
    ssClient: SessionClient;
    confirm: JSX.Element;
    /**
     * initialize a instance of Anclient visition jserv service.
     * @param props
     * @param props.jserv e.g. "http://127.0.0.1:8080/jserv-quiz"); url to service root.
     * @constructor
     */
    constructor(props: LoginProps);
    componentDidMount(): void;
    alert(): void;
    onErrorClose(): void;
    /**
     * Login and go main page (sys.jsx). Target html page is first specified by
     * login.serv (SessionInf.home).
     */
    onLogin(): void;
    onLogout(): void;
    update(val: any): void;
    render(): JSX.Element;
}
declare const Login: React.ComponentType<Pick<LoginProps, keyof LoginProps> & import("@material-ui/core/styles").StyledComponentProps<"root" | "field1" | "field2">>;
export { Login, LoginComp };
