export const DatasetCombo: React.ComponentType<(Pick<Pick<PropTypes.InferProps<{
    uri: PropTypes.Requireable<string>;
    val: PropTypes.Requireable<object>;
}>, "uri" | "val"> & import("@material-ui/core/styles").StyledComponentProps<never>, "uri" | "val" | keyof import("@material-ui/core/styles").StyledComponentProps<never>> | Pick<Pick<PropTypes.InferProps<{
    uri: PropTypes.Requireable<string>;
    val: PropTypes.Requireable<object>;
}>, "uri" | "val"> & import("@material-ui/core/styles").StyledComponentProps<never> & {
    children?: React.ReactNode;
}, "children" | "uri" | "val" | keyof import("@material-ui/core/styles").StyledComponentProps<never>>) & import("@material-ui/core/withWidth").WithWidthProps>;
/**
 * Combobox automatically bind dataset, using AnContext.anClient.
 * Also can handling hard coded options.
 * @class DatasetCombo
 */
export class DatasetComboComp extends React.Component<any, any, any> {
    constructor(props: any);
    refcbb: React.RefObject<any>;
    onCbbRefChange(): (e: any, item: any) => void;
}
export namespace DatasetComboComp {
    export { AnContext as contextType };
    export namespace propTypes {
        const uri: PropTypes.Requireable<string>;
        const val: PropTypes.Requireable<object>;
    }
}
import PropTypes from "prop-types";
import React from "react";
import { AnContext } from "../reactext.jsx";
