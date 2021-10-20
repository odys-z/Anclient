export const RecordForm: React.ComponentType<(Pick<Pick<PropTypes.InferProps<{
    uri: PropTypes.Validator<string>;
    stateHook: PropTypes.Requireable<object>;
    dense: PropTypes.Requireable<boolean>;
    mtabl: PropTypes.Validator<string>;
    fields: PropTypes.Validator<any[]>;
    record: PropTypes.Validator<object>;
    enableValidate: PropTypes.Requireable<boolean>;
}>, "record" | "dense" | "uri" | "mtabl" | "fields" | "stateHook" | "enableValidate"> & import("@material-ui/core/styles").StyledComponentProps<"hide" | "row" | "root" | "rowHead" | "folder" | "labelText" | "labelText_dense">, "record" | "dense" | "uri" | "mtabl" | "fields" | "stateHook" | "enableValidate" | keyof import("@material-ui/core/styles").StyledComponentProps<"hide" | "row" | "root" | "rowHead" | "folder" | "labelText" | "labelText_dense">> | Pick<Pick<PropTypes.InferProps<{
    uri: PropTypes.Validator<string>;
    stateHook: PropTypes.Requireable<object>;
    dense: PropTypes.Requireable<boolean>;
    mtabl: PropTypes.Validator<string>;
    fields: PropTypes.Validator<any[]>;
    record: PropTypes.Validator<object>;
    enableValidate: PropTypes.Requireable<boolean>;
}>, "record" | "dense" | "uri" | "mtabl" | "fields" | "stateHook" | "enableValidate"> & import("@material-ui/core/styles").StyledComponentProps<"hide" | "row" | "root" | "rowHead" | "folder" | "labelText" | "labelText_dense"> & {
    children?: React.ReactNode;
}, "record" | "children" | "dense" | "uri" | "mtabl" | "fields" | "stateHook" | "enableValidate" | keyof import("@material-ui/core/styles").StyledComponentProps<"hide" | "row" | "root" | "rowHead" | "folder" | "labelText" | "labelText_dense">>) & import("@material-ui/core/withWidth").WithWidthProps>;
/**@deprecated replaced by TRecordFormComp
 * Record form is a component for UI record layout, not data binding.
 * Why? A tech to handle performance problem and help data auto binding.
 * See performance issue: https://stackoverflow.com/a/66934465
 * Use SimpleForm for UI dialog to auto load data.
 * example:<pre>
  &lt;RecordForm uri={this.props.uri} pk='qid' mtabl='quiz'
    stateHook={this.quizHook}
    fields={[
      { field: 'qid', label: '', hide: true },
      { field: 'title', label: L('Title'), grid: {sm: 12, lg: 12} },
      { field: 'subject', label: L('Subject') },
      { field: 'tags', label: L('#Hashtag') },
      { field: 'quizinfo', label: L('Description'), grid: {sm: 12, lg: 12} }
    ]}
    record={{qid: this.state.quizId, ... this.state.quiz }}
  /&gt;</pre>
 */
export class RecordFormComp extends DetailFormW {
    constructor(props?: {});
    formFields(rec: any, classes: any): any[];
    getField(f: any, rec: any): JSX.Element;
    validate(invalidStyle: any): boolean;
}
export namespace RecordFormComp {
    namespace propTypes {
        const uri: PropTypes.Validator<string>;
        const stateHook: PropTypes.Requireable<object>;
        const dense: PropTypes.Requireable<boolean>;
        const mtabl: PropTypes.Validator<string>;
        const fields: PropTypes.Validator<any[]>;
        const record: PropTypes.Validator<object>;
        const enableValidate: PropTypes.Requireable<boolean>;
    }
}
import PropTypes from "prop-types";
import React from "react";
import { DetailFormW } from "../crud";
