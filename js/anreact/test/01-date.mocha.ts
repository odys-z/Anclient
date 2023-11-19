import { assert } from 'chai';
import dateFormat from 'dateformat';
import { addDays } from '../src/utils/lang-ext';

describe('case: [1.0] utils', () => {
	it('date format', () =>{
		// This won't work in west hemisphere
		// assert.equal(dateFormat(addDays(new Date('2022-05-31'), 1), 'yyyy-mm-dd', true), '2022-06-01', '1.1');
		assert.equal(dateFormat(addDays(new Date('2022-12-31'), 1), 'yyyy-mm-dd', true), '2023-01-01', '1.2');
		assert.equal(dateFormat(addDays(new Date(Date.UTC(2022, 4, 31)), 1), 'yyyy-mm-dd', true), '2022-06-01', '1.1');
		assert.equal(dateFormat(addDays(new Date(Date.UTC(2022, 11, 31)), 1), 'yyyy-mm-dd', true), '2023-01-01', '1.2');
	} );

});
