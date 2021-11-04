
import { assert } from 'chai'

import {AnsonMsg, AnsonResp} from '../protocol';

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
		let msg = new AnsonMsg<AnsonResp>({body: [respInsUser]});
		let rp = msg.Body();
		assert.equal(rp.map['inserted'][0], 1, "1 ---");
		assert.equal(rp.map['resulved'], null, "2 ---");
	} );
});
