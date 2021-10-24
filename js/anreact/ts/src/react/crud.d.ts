/**Common base class of function pages.
 * @member uri: string
 */
export class CrudComp extends React.Component<any, any, any> {
    constructor(props: any);
    constructor(props: any, context: any);
}
export namespace CrudComp {
    export { AnContext as contextType };
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
export class CrudCompW extends React.Component<{
    uri: string;
}, any, any> {
    static setWidth(width: any): {
        isLg: boolean;
        isMd: boolean;
        isSm: boolean;
        isXs: boolean;
        isXl: boolean;
    };
    constructor(props: any);
}
export namespace CrudCompW {
    export { AnContext as contextType };
    export namespace propTypes {
        const width: PropTypes.Validator<string>;
    }
}
/**
 * To popup modal dialog, see
 * https://codesandbox.io/s/gracious-bogdan-z1xsd?file=/src/App.js
 */
export class DetailFormW extends React.Component<any, any, any> {
    constructor(props: any);
}
export namespace DetailFormW {
    export { AnContext as contextType };
    export namespace propTypes_1 {
        const width_1: PropTypes.Validator<string>;
        export { width_1 as width };
        export const uri: PropTypes.Validator<string>;
    }
    export { propTypes_1 as propTypes };
}
export const Home: React.ComponentType<Pick<any, string | number | symbol> & import("@material-ui/core/styles").StyledComponentProps<"root">>;
export class HomeComp extends CrudComp {
}
export const Domain: React.ComponentType<Pick<any, string | number | symbol> & import("@material-ui/core/styles").StyledComponentProps<"root">>;
export class DomainComp extends CrudComp {
}
export const Roles: React.ComponentType<Pick<any, string | number | symbol> & import("@material-ui/core/styles").StyledComponentProps<"root">>;
export class RolesComp extends CrudComp {
}
export const Users: React.ComponentType<Pick<any, string | number | symbol> & import("@material-ui/core/styles").StyledComponentProps<"root">>;
export class UsersComp extends CrudComp {
}
export const UserInfo: React.ComponentType<Pick<any, string | number | symbol> & import("@material-ui/core/styles").StyledComponentProps<"root">>;
export class UserInfoComp extends CrudComp {
}
export const Orgs: React.ComponentType<Pick<any, string | number | symbol> & import("@material-ui/core/styles").StyledComponentProps<"root">>;
export class OrgsComp extends CrudComp {
}
export const CheapFlow: React.ComponentType<Pick<any, string | number | symbol> & import("@material-ui/core/styles").StyledComponentProps<"root">>;
export class CheapFlowComp extends CrudComp {
}
import React from "react";
import { AnContext } from "./reactext.jsx";
import PropTypes from "prop-types";
