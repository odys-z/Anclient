import { assert } from 'chai';

import { toBool, isEmpty } from '../helpers';


describe('case: [0.0] utils', () => {
	it('helpers: toBool, isEmpty', () =>{
		assert.equal(isEmpty(''), true, '0.1');
		assert.equal(toBool(''), false, '0.3');
		assert.equal(isEmpty(undefined), true, '0.6');
		assert.equal(toBool(undefined), false, '0.7');
		assert.equal(isEmpty(null), true, '0.6');
		assert.equal(toBool(null), false, '0.7');
		assert.equal(isEmpty(0), false, '0.6');
		assert.equal(toBool(0), false, '0.7');

		assert.equal(toBool(1), true, '0.8');
		assert.equal(toBool('1'), true, '0.9');
		assert.equal(toBool('true'), true, '0.10');
		assert.equal(toBool('false'), false, '0.11');
		assert.equal(toBool(true), true, '0.12');
		assert.equal(toBool(false), false, '0.13');
	} );

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
} );

