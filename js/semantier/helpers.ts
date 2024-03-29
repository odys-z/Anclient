// TODO: should be renamed as lang-ext.ts?
/**
 * Convert string to boolean
 * @example
  	it('toBool', () => {
		assert.isTrue(toBool('1'), '1');
		assert.isTrue(toBool('2'), '2');
		assert.isTrue(toBool(1), '3');
		assert.isTrue(toBool(2), '4');
		assert.isTrue(toBool(true), '5');
		assert.isTrue(toBool('true'), '6');

		assert.isFalse(toBool('0'), 'A');
		assert.isFalse(toBool(' '), 'B');
		assert.isFalse(toBool(0), 'C');
		assert.isFalse(toBool(undefined), 'D');
		assert.isFalse(toBool(null), 'E');
		assert.isFalse(toBool('false'), 'F');
	} );

	it('toBool 2', () =>{
		assert.isFalse(toBool('0', true), 'x');
		assert.isFalse(toBool(' ', true), 'y');
		assert.isFalse(toBool('' , false), 'z');
		assert.isTrue(toBool('' , true), 'q');
		assert.isTrue(toBool(undefined , true), 'r');
		assert.isFalse(toBool(undefined), 's');
		assert.isFalse(toBool(null), 't');
		assert.isFalse(toBool(null, null), 'u');
	} );
 * @param str 
 * @param undefinedNull take undefind & null as true or false
 * @returns 
 */
export function toBool(str: string | number | boolean | object | undefined | null, undefinedNull?: boolean | undefined | null): boolean {
	// if ( undefinedNull !== undefined && undefinedNull !== null
	// 	&& (str === undefined || str === null))
	if ( isEmpty(str))
		// return !!undefinedNull;
		return !isEmpty(undefinedNull) && undefinedNull;

	return (!str || str === '0' || str === 'false'
			|| (typeof str === 'string' && str.trim().length === 0)
			? false : true);
}

export function isEmpty(str: string | number | boolean | object | null | undefined) : boolean {
	return (typeof str === 'undefined' || str === null || str === '');
} 
/**
 * Convert to string.
 * @param obj 
 * @returns string
 */
export function str(obj: any) {
	return isEmpty(obj) ? undefined : String(obj);
}

/**Convert to string, '' for undefined.
 * @param obj 
 * @returns string 
 */
export function str_(obj: any) {
	return str(obj) || '';
}

export function size(arg: Set<any> | Map<any, any> | object | string | Array<any> | undefined | null) : number {
		return  arg instanceof Set || arg instanceof Map ?
				arg.size : 
				typeof arg === 'object' ?
				Object.keys(arg).length : len(arg);
}

export function len(arg: object | string | Array<any> | Set<any> | Map<any, any> | undefined | null) {
	return Array.isArray(arg)
		? arg.length
		: isEmpty(arg)
		? 0
		: typeof arg === 'string'
		? arg.length
		: typeof (arg as any).size === 'number'
		? (arg as any).size
		: typeof arg === 'object'
		? Object.keys(arg).length
		: size(arg);
}

export function arr(obj: object) {
	return Object.entries(obj || {});
}
