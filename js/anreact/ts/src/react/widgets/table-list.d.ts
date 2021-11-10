export const AnTablist: React.ComponentType<Pick<PropTypes.InferProps<{
    pk: PropTypes.Validator<string>;
    selectedIds: PropTypes.Validator<object>;
    onSelectChange: PropTypes.Requireable<(...args: any[]) => any>;
}>, "pk" | "selectedIds" | "onSelectChange"> & import("@material-ui/core/styles").StyledComponentProps<"root">>;
/**
 * props:
 * 	{array} columns must need
 * 	{array}  rows  must need
 * 	{string} pk must need
 * 	{object} pageInf {page, size, total, sizeOptions}
 * 	{boolean} checkbox  - if true, first field alwasy been treaded as checkbox
 * 	{function} updateSelectd
 * 	{array} selected
 */
export class AnTablistComp extends React.Component<any, any, any> {
    constructor(props: any);
    isSelected(k: any): any;
    toSelectAll(event: any): void;
    changePage(event: any, page: any): void;
    changeSize(event: any, s: any): void;
    handleClick(event: any, newSelct: any): void;
    updateSelectd(set: any): void;
    /**
     * Render table head.
     * @param {array} [columns] table columns
     * @returns [<TableCell>,...]
     */
    th(columns?: any[]): JSX.Element[];
    tr(rows?: any[], columns?: any[]): JSX.Element[];
    checkAllBox: HTMLButtonElement;
}
export namespace AnTablistComp {
    namespace propTypes {
        const pk: PropTypes.Validator<string>;
        const selectedIds: PropTypes.Validator<object>;
        const onSelectChange: PropTypes.Requireable<(...args: any[]) => any>;
    }
}
import PropTypes from "prop-types";
import React from "react";
