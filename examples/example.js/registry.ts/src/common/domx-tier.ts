import { AnsonMsg, AnsonResp, ErrorCtx, OnLoadOk, PageInf, Semantier, Tierec } from '@anclient/semantier';
import { DomxReq, superRole } from './registry';

/**
 * Client tier of the central's domx.serv (DomxTier): domains of a community, synodes of a domain.
 *
 * The client composes no sql: each read is an ask of the tier, see DomxReq.A.
 * The community, orgId, is overridden by the central with the session user's,
 * unless the user is of the super role.
 */
export class DomxTier extends Semantier {
	port = 'domx';

	/** Is the session user of the super role? (only for UI, the central checks it again) */
	isSuper() {
		return (this.client as any)?.ssInf?.roleId === superRole;
	}

	/**
	 * Domains of the community (DomxReq.A.domains).
	 * Columns: domid, domname, orgid, orgName, synodes, optime
	 * @param orgId super role: undefined for all communities of the market; others: ignored
	 * @param pageInf paging and conditions, see DomxReq.Condts
	 */
	domains(orgId: string | undefined, onLoad: OnLoadOk<Tierec>, pageInf?: PageInf) {
		this.load(new DomxReq({uri: this.uri, a: DomxReq.A.domains, orgId, pageInf}), onLoad);
	}

	/**
	 * Synodes of the domain, hub first (DomxReq.A.synodes).
	 * Columns: sid, mode, stat, jserv, ip, optime, oper
	 * @param orgId the domain's community, ignored for users other than the super role
	 */
	synodes(orgId: string | undefined, domid: string, onLoad: OnLoadOk<Tierec>) {
		this.load(new DomxReq({uri: this.uri, a: DomxReq.A.synodes, orgId, domid}), onLoad);
	}

	load(req: DomxReq, onLoad: OnLoadOk<Tierec>) {
		if (!this.client) return;

		this.client.commit(this.client.userReq(this.uri, this.port, req),
			(resp: AnsonMsg<AnsonResp>) => {
				let {cols, rows} = AnsonResp.rs2arr(resp.Body().Rs());
				this.rows = rows as Tierec[];
				onLoad(cols, rows as Tierec[]);
			},
			this.errCtx as ErrorCtx);
	}
}
