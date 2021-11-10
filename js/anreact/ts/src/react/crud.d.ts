import React from 'react';
import { StandardProps } from '@material-ui/core';
import { Breakpoint } from '@material-ui/core/styles/createBreakpoints';
import { Media } from './anreact';
import { CRUD } from '@anclient/semantier-st';
export interface ClassNames {
    [c: string]: string;
}
export interface Comprops extends StandardProps<any, string> {
    /**Component uri usually comes from function configuration (set by SysComp.extendLinks) */
    readonly uri?: string;
    /**The matching url in React.Route */
    match?: {
        path: string;
    };
    /** CRUD */
    crud?: CRUD;
    /** Semantier */
    classes?: ClassNames;
    readonly tier?: any;
    readonly width?: Breakpoint;
}
/**Common base class of function pages.
 * About URI:
 * 1. Every root CRUD must has a uri.
 * 2. Uri is immediately bridged to Semantier.
 * 3. All data accessing must provid the token.
 * @member uri: string
 */
declare class CrudComp<T extends Comprops> extends React.Component<T> {
    state: {};
    uri: any;
    constructor(props: any);
    render(): JSX.Element;
}
/**
 * @augments {React.Component<{uri: string}, media: {}>}
 * <pre>CrudCompW.prototype.media = {
    isXs: false,
    isSm: false,
    isMd: false,
    isLg: false,
    isXl: false,
   };</pre>
 * So this can be used like:<pre>super.media</pre>
 * FIXME looks like in chrome responsive device mode simulator, withWidth() can't
 * get "width"?
 */
declare class CrudCompW<T extends Comprops> extends CrudComp<T> {
    media: Media;
    constructor(props: any);
    static getMedia(width: string): Media;
    /**A simple helper: Array.from(ids)[x]; */
    getByIx(ids: Set<string>, x?: number): string;
}
declare class HomeComp extends CrudComp<Comprops> {
    render(): JSX.Element;
}
declare const Home: React.ComponentType<Pick<Comprops, keyof Comprops> & import("@material-ui/core").StyledComponentProps<"root">>;
declare class DomainComp extends CrudComp<Comprops> {
    render(): JSX.Element;
}
declare const Domain: React.ComponentType<Pick<Comprops, keyof Comprops> & import("@material-ui/core").StyledComponentProps<"root">>;
declare class OrgsComp extends CrudComp<Comprops> {
    render(): JSX.Element;
}
declare const Orgs: React.ComponentType<Pick<Comprops, keyof Comprops> & import("@material-ui/core").StyledComponentProps<"root">>;
declare class RolesComp extends CrudComp<Comprops> {
    render(): JSX.Element;
}
declare const Roles: React.ComponentType<Pick<Comprops, keyof Comprops> & import("@material-ui/core").StyledComponentProps<"root">>;
declare class UsersComp extends CrudComp<Comprops> {
    render(): JSX.Element;
}
declare const Users: React.ComponentType<Pick<Comprops, keyof Comprops> & import("@material-ui/core").StyledComponentProps<"root">>;
declare class UserInfoComp extends CrudComp<Comprops> {
    render(): JSX.Element;
}
declare const UserInfo: React.ComponentType<Pick<Comprops, keyof Comprops> & import("@material-ui/core").StyledComponentProps<"root">>;
declare class CheapFlowComp extends CrudComp<Comprops> {
    render(): JSX.Element;
}
declare const CheapFlow: React.ComponentType<Pick<Comprops, keyof Comprops> & import("@material-ui/core").StyledComponentProps<"root">>;
/**
 * To popup modal dialog, see
 * https://codesandbox.io/s/gracious-bogdan-z1xsd?file=/src/App.js
 */
declare class DetailFormW<T extends Comprops> extends CrudCompW<T> {
    state: {};
    media: Media;
    constructor(props: Comprops);
}
export { CrudComp, CrudCompW, DetailFormW, Home, HomeComp, Domain, DomainComp, Roles, RolesComp, Users, UsersComp, UserInfo, UserInfoComp, Orgs, OrgsComp, CheapFlow, CheapFlowComp, };
