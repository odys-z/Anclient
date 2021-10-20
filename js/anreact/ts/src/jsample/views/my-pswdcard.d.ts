export const MyPswd: React.ComponentType<Pick<PropTypes.InferProps<{}>, never> & import("@material-ui/core/styles").StyledComponentProps<never>>;
/**
 * Adding-only file list shared for every users.
 */
export class MyPswdComp extends React.Component<any, any, any> {
    constructor(props: any);
    selected: any;
    uri: any;
    changePswd(e: any): void;
    showConfirm(msg: any): void;
    getTier: () => void;
    tier: PswdTier;
    confirm: JSX.Element;
}
export namespace MyPswdComp {
    const propTypes: {};
}
import PropTypes from "prop-types";
import React from "react";
declare class PswdTier extends MyInfTier {
    rows: any;
    changePswd(opts: any, onOk: any): boolean;
}
import { MyInfTier } from "./my-infcard";
export {};
