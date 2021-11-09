export const AnQueryForm: React.ComponentType<Pick<PropTypes.InferProps<{
    uri: PropTypes.Validator<string>;
    conds: PropTypes.Validator<any[]>;
    onSearch: PropTypes.Validator<(...args: any[]) => any>;
    buttonStyle: PropTypes.Requireable<string>;
}>, "uri" | "conds" | "onSearch" | "buttonStyle"> & import("@material-ui/core").StyledComponentProps<"button" | "buttons" | "root" | "container">>;
/**
 * Bind query conditions to React Components.
 * conds example:
  [ { type: 'text', val: '', text: 'No', label: 'text condition'},
    { type: 'autocbb', sk: 'lvl1.domain.jsample',
      val: AnConst.cbbAllItem,
      options: [AnConst.cbbAllItem, {n: 'first', v: 1}, {n: 'second', v: 2}, {n: 'third', v: 3} ],
      label: 'auto complecte'},
  ]
 */
export class AnQueryFormComp extends React.Component<any, any, any> {
    constructor(props: any);
    bindConds(): void;
    handleChange(e: any): void;
    onTxtChange(e: any, x: any): void;
    toSearch(e: any): void;
    toClear(e: any): void;
    /** Check all binding tasks, if all are ok, fire onDone event.
     * Called by AnReact.ds2ds2cbbOptions, etc. Should call parent component's
     * onDone handler.
     * @param {object} cond the curreent condition
     */
    onBound(cond: object): void;
    refcbb: React.RefObject<any>;
    query: () => {}[];
    onDateChange(e: any, ix: any): void;
    onSwitchChange(e: any, x: any): void;
    onCbbRefChange(refcbb: any): (e: any, item: any) => void;
}
export namespace AnQueryFormComp {
    export { AnContext as contextType };
    export namespace propTypes {
        const uri: PropTypes.Validator<string>;
        const conds: PropTypes.Validator<any[]>;
        const onSearch: PropTypes.Validator<(...args: any[]) => any>;
        const buttonStyle: PropTypes.Requireable<string>;
    }
}
import PropTypes from "prop-types";
import React from "react";
import { AnContext } from "../reactext";
