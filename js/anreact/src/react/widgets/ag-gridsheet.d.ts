export function anMultiRowRenderer(param: any): string;
export function AnIndicatorRenderer(param: any): any;
/**Thin wrapper of ag-grid.
 * For ag-grid practice, go
 * https://stackblitz.com/edit/ag-grid-react-hello-world-8lxdjj?file=index.js
 * For public results, go
 * https://ag-grid-react-hello-world-8lxdjj.stackblitz.io
 *
 * Desgin Note: But is it possible handled by Semantic-DA?
 */
export class AnGridsheet extends React.Component<any, any, any> {
    constructor(props: any);
    coldefs: any[];
    defaultColDef: {
        resizable: boolean;
        editable: boolean;
        singleClickEdit: boolean;
        stopEditingWhenCellsLoseFocus: boolean;
    };
    editHandlers: {};
    /** Grid event API:
     * https://www.ag-grid.com/javascript-data-grid/grid-events/
     */
    onEditStop(p: any): void;
    /** load default context menu, together with user's menu items.
     * user's menu items defined in props like:
     * {"qtype": {name: 'Format Answer', action}, ...}
     * where the value of 'qtype' is the ag-gride context menu item:
     * @deprecated context menu is a module of ag-grid enterprise.
     */
    getContextMenuItems: (para: any) => (string | {
        name: string;
        action: () => void;
    })[];
    /**<pre>
      GetContextMenuItemsParams {
        column: Column, // the column that was clicked
        node: RowNode, // the node that was clicked
        value: any, // the value displayed in the clicked cell
        api: GridApi, // the grid API
        columnApi: ColumnAPI, // the column API
        context: any, // the grid context
        defaultItems: string[] | undefined // names of the items that would be provided by default
      }</pre>
     */
    onGridReady: (params: any) => void;
    gridApi: any;
    gridColumnApi: any;
    onFirstDataRendered: (params: any) => void;
    onCellClicked: (p: any) => void;
}
export namespace AnGridsheet {
    namespace propTypes {
        const columns: PropTypes.Validator<any[]>;
        const rows: PropTypes.Validator<any[]>;
        const contextMenu: PropTypes.Requireable<object>;
    }
}
export class AnNumericEdit {
    init(params: any): void;
    eInput: HTMLInputElement;
    cancelBeforeStart: boolean;
    isKeyPressedNavigation(event: any): boolean;
    getGui(): HTMLInputElement;
    afterGuiAttached(): void;
    isCancelBeforeStart(): boolean;
    isCancelAfterEnd(): boolean;
    getValue(): string;
    destroy(): void;
    isPopup(): boolean;
    getCharCodeFromEvent(event: any): any;
    isCharNumeric(charStr: any): boolean;
    isKeyPressedNumeric(event: any): boolean;
}
import React from "react";
import PropTypes from "prop-types";
