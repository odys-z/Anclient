import React from 'react';
import { ClassNames, Comprops, CrudCompW } from '../crud';
import { TierComboField } from './dataset-combo';
import { Tierec } from '@anclient/semantier-st';
import { Media } from '../anreact';
export interface RecordFormProps extends Comprops {
    enableValidate: boolean;
}
/**
 * A Tiered record component is designed for UI record layout rendering, handling
 * user action (change text, etc.) in a levle-up style. It's parent's responsibilty
 * to load all binding data in sychronous.
 * TRecordForm won't resolving FK's auto-cbb.
 * But TRecordFormComp do has a state for local udpating, See performance issue:
 * https://stackoverflow.com/a/66934465
 *
 * In case of child relation table, this component currently is not planned to supprt.
 * <p>Usally a CRUD process needs to update multiple tables in one transaction,
 * so this component leveled up state for saving. Is this a co-accident with React
 * or is required by semantics?</p>
 * <p>Issue: FK binding are triggered only once ? What about cascade cbbs ineraction?</p>
 *
 * NOTE: Desgin Memo
 * Level-up way is NOT working! So having tier as the common state/data manager.
 */
declare class TRecordFormComp extends CrudCompW<RecordFormProps> {
    state: {
        dirty: boolean;
        pk: any;
    };
    tier: any;
    constructor(props: RecordFormProps);
    componentDidMount(): void;
    setState(arg0: {}): void;
    getField(f: TierComboField, rec: Tierec, classes: ClassNames, media: Media): JSX.Element;
    formFields(rec: any, classes: any, media: any): any[];
    render(): JSX.Element;
}
declare const TRecordForm: React.ComponentType<(Pick<Pick<RecordFormProps, keyof RecordFormProps> & import("@material-ui/core/styles").StyledComponentProps<"ok" | "notNull" | "maxLen" | "root" | "anyErr" | "minLen" | "rowBox" | "labelText" | "labelText_dense">, string | number | symbol> | Pick<Pick<RecordFormProps, keyof RecordFormProps> & import("@material-ui/core/styles").StyledComponentProps<"ok" | "notNull" | "maxLen" | "root" | "anyErr" | "minLen" | "rowBox" | "labelText" | "labelText_dense"> & {
    children?: React.ReactNode;
}, string | number | symbol>) & import("@material-ui/core/withWidth").WithWidthProps>;
export { TRecordForm, TRecordFormComp };
