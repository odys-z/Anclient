
import $ from 'jquery';
import AES from './aes.js';
import {Protocol, JMessage, JHeader} from './protocol.js';


///////////////// io.odysz.sworkflow ///////////////////////////////////////////
class DatasetCfg extends QueryReq {
	/**@param {string} conn JDBC connection id, configured at server/WEB-INF/connects.xml
	 * @param {string} sk semantic key configured in WEB-INF/dataset.xml
	 */
	constructor (conn, sk) {
		this.conn = conn;
		this.sk = sk;
	}

	get geTreeSemtcs() { return this.trSmtcs; }

	/**Set tree semantics
	 * @param {TreeSemantics} semtcs */
	treeSemtcs(semtcs) {
		this.trSmtcs = semtcs;
		return this;
	}
}
