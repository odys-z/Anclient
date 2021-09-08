
import chai from 'chai'
import { expect, assert } from 'chai'

import {Protocol, AnsonMsg, QueryReq, UserReq, UpdateReq, AnsonResp} from '../../lib/protocol.js';

const respInsUser = {
  "type": "io.odysz.semantic.jprotocol.AnsonResp",
  "a": null,
  "parent": "io.odysz.semantic.jprotocol.AnsonMsg",
  "uri": null,
  "m": null,
  "map": {
    "resulved": null,
    "inserted": [
      1
    ]
  },
  "rs": null
}

describe('case: [04.1 Userst] AnsonResp Insert', () => {
    it('Resulve userId', () => {
		let rp = new AnsonMsg({body: [respInsUser]});
		rp = rp.Body();
		assert.equal(rp.map.inserted[0], 1, "1 ---");
		assert.equal(rp.map.resulved, null, "2 ---");
	} );
});
