
import {} from './lang-ext';

/**@deprecated moved to @anclient/semantier-st
 * 
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
		assert.isFalse(toBool('' , true), 'z');
		assert.isTrue(toBool(undefined , true), 'r');
		assert.isFalse(toBool(undefined), 's');
		assert.isFalse(toBool(null), 's');
		assert.isFalse(toBool(null, null), 't');
	} );
 * @param str 
 * @param undefinedNull default value if str is undefined or null
 * @returns 
 */
export function toBool(str: string | number | boolean, undefinedNull?: boolean): boolean {
	if ( undefinedNull !== undefined && undefinedNull !== null
		&& (str === undefined || str === null))
		return undefinedNull;

	return  !str || str === '0' || str === 'false'
			|| (typeof str === 'string' && str.trim().length === 0)
			? false : true;
}

/**@deprecated moved to @anclient/semantier-st
 * @param str 
 * @returns 
 */
export function isEmpty(str: string | number) : boolean {
	return typeof str === 'undefined' || str === null || str === '';
}