import { AnsonBody, AnsonResp, ErrorCtx, OnLoadOk, Semantier, Tierec, Protocol } from '@anclient/semantier';
import { StateMap } from '@anclient/anreact';

/** Super role, hard coded in the central, see CentralSettings.superRole. */
export const superRole = 'r00';

/**
 * Synode states in c_synodes.stat, see io.oz.syn.registry.CynodeStats.
 */
export const synodeStates: StateMap = {
	c: { label: 'Created', title: 'Registered, not reported by the synode yet' },
	h: { label: 'Hub',     color: '#2e7d32', title: 'Running as hub' },
	p: { label: 'Peer',    color: '#1565c0', title: 'Running as peer' },
	d: { label: 'Died',    color: '#b71c1c', title: 'Stopped / removed' },
};

/**
 * Request of the central's web tier, Semantic-Network/registration/jserv,
 * io.oz.registier.central.CentralReq.
 *
 * Market and the user's org are decided by the central with settings and session.
 * Only the super role (r00) can ask for an org other than its own.
 */
export class CentralReq extends AnsonBody {
	static __type__ = 'io.oz.registier.central.CentralReq';

	static A = {
		/** orgs of the market, super role only */
		orgs   : 'r/orgs',
		/** domains of an org */
		domains: 'r/domains',
		/** synodes of a domain */
		synodes: 'r/synodes',
	};

	orgId?: string;
	domain?: string;

	constructor(json: {uri?: string, orgId?: string, domain?: string} = {}) {
		super({type: CentralReq.__type__} as any);
		this.uri    = json.uri as string;
		this.orgId  = json.orgId;
		this.domain = json.domain;
	}
}

Protocol.registerBody(CentralReq.__type__, (json) => new CentralReq(json));

/**
 * Client tier of central.tier: orgs of the market, domains of an org, synodes of a domain.
 */
export class CentralTier extends Semantier {
	port = 'centier';

	/** Is the session user of the super role? (only for UI, the central checks it again) */
	isSuper() {
		return (this.client as any)?.ssInf?.roleId === superRole;
	}

	/**
	 * Orgs of the market (super role only).
	 * Columns: orgId, orgName, orgType, webroot, album0, domains
	 */
	orgs(onLoad: OnLoadOk<Tierec>) {
		this.load(new CentralReq(), CentralReq.A.orgs, onLoad);
	}

	/**
	 * Domains of the org.
	 * Columns: orgid, domid, domname, stat, synodes
	 * @param orgId undefined for the session user's org
	 */
	domains(orgId: string | undefined, onLoad: OnLoadOk<Tierec>) {
		this.load(new CentralReq({orgId}), CentralReq.A.domains, onLoad);
	}

	/**
	 * Synodes of the domain, hub first.
	 * Columns: sid, mode, stat, jserv, ip, optime, oper
	 * @param orgId undefined for the session user's org
	 */
	synodes(orgId: string | undefined, domain: string, onLoad: OnLoadOk<Tierec>) {
		this.load(new CentralReq({orgId, domain}), CentralReq.A.synodes, onLoad);
	}

	load(req: CentralReq, a: string, onLoad: OnLoadOk<Tierec>) {
		if (!this.client) return;

		let client = this.client as any;
		let msg = client.userReq(this.uri, this.port, req.A(a));

		client.commit(msg,
			(resp: any) => {
				let {cols, rows} = AnsonResp.rs2arr(resp.Body().Rs());
				this.rows = rows as Tierec[];
				onLoad(cols as any, rows as Tierec[]);
			},
			this.errCtx as ErrorCtx);
	}
}
