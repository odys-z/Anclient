/**
 * Common language extensions, ported from Java io.odysz.common.LangExt (antson).
 */

/**
 * @see java io.odysz.common.LangExt
 * @param arr
 * @param x
 * @returns the element
 * @since 1.0.6
 */
export class LangExt {
	/**
	 * Get array item, undefined if not exists. Same as Java LangExt.ix(arr, x).
	 * @param arr
	 * @param x
	 * @returns the element
	 * @since 1.0.6
	 */
	static ix<T>(arr: Array<T> | undefined | null, x: number): T | undefined {
		return Array.isArray(arr) && x >= 0 && arr.length > x ? arr[x] : undefined;
	}
}
