import React from 'react';
import { AutocompleteClassKey } from '@material-ui/lab/Autocomplete';
import { InvalidClassNames, TierCol } from '@anclient/semantier-st';
import { Comprops, CrudCompW } from '../crud';
/**E.g. form's combobox field declaration */
export interface TierComboField extends TierCol {
    className: undefined | "root" | InvalidClassNames | AutocompleteClassKey;
    nv: {
        n: string;
        v: string;
    };
    sk: string;
    cbbStyle: {};
}
/**
 * Combobox automatically bind dataset, using AnContext.anClient.
 * Also can handling hard coded options.
 * @class DatasetCombo
 */
declare class DatasetComboComp extends CrudCompW<Comprops> {
    state: {
        combo: {
            label: any;
            val: any;
            initVal: any;
            ref: any;
            options: any[];
        };
        selectedItem: any;
    };
    refcbb: React.RefObject<unknown>;
    constructor(props: any);
    componentDidMount(): void;
    onCbbRefChange(): (e: any, item: any) => void;
    render(): JSX.Element;
}
declare const DatasetCombo: React.ComponentType<(Pick<Pick<Comprops, keyof Comprops> & import("@material-ui/core/styles").StyledComponentProps<"ok" | "notNull" | "maxLen" | "root" | "anyErr" | "minLen">, string | number | symbol> | Pick<Pick<Comprops, keyof Comprops> & import("@material-ui/core/styles").StyledComponentProps<"ok" | "notNull" | "maxLen" | "root" | "anyErr" | "minLen"> & {
    children?: React.ReactNode;
}, string | number | symbol>) & import("@material-ui/core/withWidth").WithWidthProps>;
export { DatasetCombo, DatasetComboComp };
