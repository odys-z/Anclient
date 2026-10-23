import { AnsonBody, AnsonResp, Protocol } from '@anclient/semantier';

/**
 * Client of the central's Registry tier (regist.serv), the TypeScript equivalent of
 * semanticshare.io.oz.syn.registry (synode.py) and io.oz.syn.registry (synodict.jclient).
 *
 * Only fields of the Java classes are sent: the central's Anson refuses unknown fields.
 */

/** io.oz.syn.registry.SynOrg, a community (a_orgs) */
export class SynOrg {
	type = 'io.oz.syn.registry.SynOrg';
	orgId: string;
	orgName?: string;
	orgType?: string;
	parent?: string;
	sort?: string;
	fullpath?: string;
	/** The community's landing page, saved by the central in a_orgs.homeExt.
	 * (SynOrg.webroot, the synodes' web root, is submitted by installers / synodes, not by the web client.) */
	homepage?: string;
	album0?: string;

	constructor(org: {orgId: string, orgName?: string, orgType?: string, sort?: string,
					  homepage?: string, album0?: string}) {
		this.orgId   = org.orgId;
		this.orgName = org.orgName;
		this.orgType = org.orgType;
		this.sort    = org.sort;
		this.homepage= org.homepage;
		this.album0  = org.album0;
	}
}

/** io.oz.syn.registry.SynodeConfig, only the fields used by the web client. */
export class SynodeConfig {
	type = 'io.oz.syn.registry.SynodeConfig';
	org?: SynOrg;
	domain?: string;
	synid?: string;

	constructor(cfg: {org?: SynOrg, domain?: string, synid?: string}) {
		this.org = cfg.org;
		this.domain = cfg.domain;
		this.synid = cfg.synid;
	}
}

/** io.oz.syn.registry.RegistReq */
export class RegistReq extends AnsonBody {
	static __type__ = 'io.oz.syn.registry.RegistReq';

	static A = {
		createOrg     : 'c/org',
		queryDomx     : 'r/domx',
		queryDomConfig: 'r/dom-config',
		registDom     : 'c/domx',
		updateDom     : 'u/domx',
		submitSettings: 'u/settings',
	};

	market: string;
	diction?: SynodeConfig;

	constructor(json: {uri: string, a: string, market: string, diction?: SynodeConfig}) {
		super({type: RegistReq.__type__, a: json.a, uri: json.uri});
		this.market  = json.market;
		this.diction = json.diction;
	}
}

/** io.oz.syn.registry.RegistResp */
export class RegistResp extends AnsonResp {
	static __type__ = 'io.oz.syn.registry.RegistResp';
	static R = { ok: 'ok', domexists: 'domexists', invalid: 'invalid', error: 'error' };

	r: string;
	diction: SynodeConfig;
	orgDomains: string[];

	constructor(json: any) {
		super(json);
		this.r = json.r;
		this.diction = json.diction;
		this.orgDomains = json.orgDomains;
	}
}

Protocol.registerBody(RegistResp.__type__, (json) => new RegistResp(json));

/**
 * io.oz.syn.registry.DomxReq, request of the central's domain tier (domx.serv).
 *
 * The market is the central's, never sent. The community, orgId, is overridden by the central
 * with the session user's, unless the user is of the super role.
 * The client composes no sql: each read is an ask of the tier, see DomxReq.A.
 */
export class DomxReq extends AnsonBody {
	static __type__ = 'io.oz.syn.registry.DomxReq';

	static A = {
		/** Create a domain, with the synodes planned by the central (<domid>-hub, -1, -2),
		 * the same as synode.py's Create / Join Domain (RegistReq.A.registDom). */
		create: 'c/domx',

		/** The synodes of a domain, hub first, with the states, jserv, etc. reported by the synodes.
		 * Replied in DomxResp.Rs(): sid, mode, stat, jserv, ip, optime, oper. */
		synodes: 'r/synodes',
	};

	orgId?: string;
	domid: string;
	domname?: string;

	constructor(json: {uri: string, a: string, orgId?: string, domid: string, domname?: string}) {
		super({type: DomxReq.__type__, a: json.a, uri: json.uri});
		this.orgId   = json.orgId;
		this.domid   = json.domid;
		this.domname = json.domname;
	}
}

/** io.oz.syn.registry.DomxResp */
export class DomxResp extends AnsonResp {
	static __type__ = 'io.oz.syn.registry.DomxResp';

	/** RegistResp.R.ok: created; RegistResp.R.domexists: already exists, loaded */
	r: string;
	orgId: string;
	domid: string;
	/** synode ids, hub first */
	synids: string[];

	constructor(json: any) {
		super(json);
		this.r = json.r;
		this.orgId = json.orgId;
		this.domid = json.domid;
		this.synids = json.synids;
	}
}

Protocol.registerBody(DomxResp.__type__, (json) => new DomxResp(json));
