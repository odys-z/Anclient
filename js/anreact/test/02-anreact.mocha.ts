import { assert } from 'chai';
import { GridSize, hide } from '../src/react/anreact';

const gsm = {xs: false, sm: 3 as GridSize}
const gmd = {sm: false, md: 3 as GridSize}

const media = {
    xs: {isXs: true},
    sm: {isSm: true},
    md: {isMd: true}
}

describe('case: [2.0] utils', () => {
	it('hide', () =>{
		assert.equal(hide(gsm, media.md), false, '2.1');
		assert.equal(hide(gsm, media.sm), false, '2.2');
		assert.equal(hide(gsm, media.xs), true , '2.3');

		assert.equal(hide(gmd, media.md), false, '2.a');
		assert.equal(hide(gmd, media.sm), true , '2.b');
		assert.equal(hide(gmd, media.xs), true , '2.c');
	} );
});

