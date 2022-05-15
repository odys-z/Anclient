import { assert } from 'chai';
import dateFormat from 'dateformat';
import { addDays } from '../src/utils/lang-ext';

describe('case: [1.0] utils', () => {
	it('date format', () =>{
		assert.equal(dateFormat(addDays(new Date('2022-05-31'), 1), 'yyyy-mm-dd'), '2022-06-01', '1.1');
		assert.equal(dateFormat(addDays(new Date('2022-12-31'), 1), 'yyyy-mm-dd'), '2023-01-01', '1.2');
	} );

});
