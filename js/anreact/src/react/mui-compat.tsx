/**
 * Material-UI v4 APIs used by anreact's class components, on MUI 9 (@mui/material) and React 19.
 *
 * - withStyles(styles)(Comp): MUI 4's JSS HOC, now on tss-react (emotion), with the same
 *   curried signature, so the class components keep their props.classes.
 * - withWidth()(Comp): removed since MUI 5, now on useMediaQuery, still passing props.width.
 * - Color, Alignment: MUI 4's PropTypes.Color, PropTypes.Alignment.
 *
 * @since 0.8.0
 */
import React from 'react';
import { Theme, useTheme, Breakpoint } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { withStyles as tssWithStyles } from 'tss-react/mui';


/** MUI 4 PropTypes.Color */
export type Color = 'inherit' | 'primary' | 'secondary' | 'default';

/** MUI 4 PropTypes.Alignment */
export type Alignment = 'inherit' | 'left' | 'center' | 'right' | 'justify';

/** Styles of withStyles(): a style object, or a function of the theme, as MUI 4's. */
export type StylesOrCreator = object | ((theme: Theme) => object);

/**
 * MUI 4's withStyles(styles)(Component), with tss-react.
 * The type parameters are kept for the MUI 4 style calls, withStyles<any, any, Props>(styles).
 *
 * @param styles style rules, or (theme) => style rules
 * @returns HOC injecting props.classes
 */
export function withStyles<_A = any, _B = any, P = any>(styles: StylesOrCreator) {
	const resolve = (theme: Theme) => (typeof styles === 'function' ? (styles as (t: Theme) => object)(theme) : styles) as {[k: string]: any};

	return function <C extends React.ComponentType<any>>(Component: C): React.ComponentType<P & any> {
		/**
		 * Entries which are not style rules, e.g. {direction: theme.direction}, are passed to
		 * props.classes as they are: JSS accepted them, and the components read them back.
		 */
		function WithValues(props: any) {
			const values = valuesOf(resolve(useTheme()));
			return <Component {...props} classes={values ? {...values, ...props.classes} : props.classes} />;
		}
		WithValues.displayName = Component.displayName || Component.name;

		return tssWithStyles(WithValues as any, (theme: Theme) => rulesOf(resolve(theme)) as any) as any;
	};

	function rulesOf(styles: {[k: string]: any}) {
		const rules: {[k: string]: object} = {};
		for (const k in styles) if (isRule(styles[k])) rules[k] = styles[k];
		return rules;
	}

	function valuesOf(styles: {[k: string]: any}) {
		let values: {[k: string]: any} | undefined;
		for (const k in styles) if (!isRule(styles[k])) (values = values || {})[k] = styles[k];
		return values;
	}

	function isRule(v: any) {
		return v !== null && typeof v === 'object' && !Array.isArray(v);
	}
}

/**
 * The widest breakpoint matching the screen, as MUI 4's withWidth().
 */
export function useWidth(): Breakpoint {
	const theme = useTheme();
	const keys = [...theme.breakpoints.keys].reverse();
	let width: Breakpoint | undefined;
	// a fixed number of hooks in a fixed order (the breakpoint keys)
	for (const key of keys) {
		const matches = useMediaQuery(theme.breakpoints.up(key), { noSsr: true });
		if (!width && matches) width = key;
	}
	return width || 'xs';
}

/**
 * MUI 4's withWidth()(Component): injects props.width, a Breakpoint, e.g. 'md'.
 */
export function withWidth() {
	return function <C extends React.ComponentType<any>>(Component: C): React.ComponentType<any> {
		function WithWidth(props: any) {
			const width = useWidth();
			return <Component {...props} width={width} />;
		}
		WithWidth.displayName = `WithWidth(${Component.displayName || Component.name || 'Component'})`;
		return WithWidth;
	};
}

/**
 * MUI 4's isWidthUp(): is width at least breakpoint?
 */
export function isWidthUp(breakpoint: Breakpoint, width: Breakpoint, inclusive = true) {
	const keys: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl'];
	return inclusive ? keys.indexOf(breakpoint) <= keys.indexOf(width)
					 : keys.indexOf(breakpoint) < keys.indexOf(width);
}

/** MUI 4 Grid breakpoint props, e.g. {xs: 12, sm: 6}, true for growing, false for not set. */
export type GridBreakpoints = { [bp in Breakpoint]?: boolean | number | 'auto' };

/**
 * MUI 4 Grid item breakpoints (xs, sm, ... props, or AnlistColAttrs.grid) to MUI 9 Grid's size prop.
 * true (grow) is 'grow'; false (not set) is left out.
 * @example <Grid size={gridSize(col.grid)}>, for MUI 4's <Grid item {...col.grid}>
 */
export function gridSize(grid?: GridBreakpoints) {
	if (!grid) return undefined;
	const size: { [bp: string]: number | 'auto' | 'grow' } = {};
	for (const bp of Object.keys(grid)) {
		const v = grid[bp as Breakpoint];
		if (v === true) size[bp] = 'grow';
		else if (v !== false && v !== undefined) size[bp] = v;
	}
	return size;
}
