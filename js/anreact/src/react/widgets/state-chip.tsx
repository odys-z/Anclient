import React from 'react';
import Chip from '@material-ui/core/Chip';

/**
 * Definition of a state code, e.g. {label: 'Hub', color: '#2e7d32'}.
 * @since 0.7.3
 */
export interface StateDef {
	/** Displayed text */
	label: string;
	/** Background color, any css color. Text is white if set. */
	color?: string;
	/** Tooltip */
	title?: string;
}

/**
 * Map of state codes to definitions, e.g. synode states { h: {label: 'Hub'}, p: {label: 'Peer'}, ... }.
 * @since 0.7.3
 */
export type StateMap = { [code: string]: StateDef };

export interface StateChipProps {
	/** State code, e.g. a column value */
	code?: string;
	states: StateMap;
	/** Label for codes not in states. Default: the code itself, or '-' for empty code. */
	unknown?: string;
}

/**
 * A small chip showing a state code as a colored label.
 * @since 0.7.3
 */
export function StateChip(props: StateChipProps) {
	let { code, states, unknown } = props;
	let def = code !== undefined && code !== null ? states[code] : undefined;

	let label = def ? def.label : (unknown || (code ? String(code) : '-'));
	let style = def && def.color ? { backgroundColor: def.color, color: '#fff' } : undefined;

	return (<Chip size='small' label={label} style={style} title={def?.title} />);
}

/**
 * Create a column formatter for AnTablist, AnTreegrid, etc., which shows the cell value as a {@link StateChip}.
 *
 * AnTablist calls formatter(value, columnIndex, row).
 *
 * @example columns={[ { field: 'stat', label: L('State'), formatter: stateFormatter(synodeStates) } ]}
 * @param states
 * @param unknown label for codes not in states
 * @since 0.7.3
 */
export function stateFormatter(states: StateMap, unknown?: string) {
	return (v: any, _x?: any, _row?: any) =>
		<StateChip code={v === undefined || v === null ? undefined : String(v)} states={states} unknown={unknown} />;
}
