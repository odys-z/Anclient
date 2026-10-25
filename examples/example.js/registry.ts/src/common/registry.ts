import { AnsonBody, AnsonResp, PageInf, Protocol } from '@anclient/semantier';

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

/**
 * io.oz.syn.registry.AdminReq, request of the central's administration tier (admin.serv),
 * for the super role only. The client composes no sql: each read is an ask of the tier.
 */
export class AdminReq extends AnsonBody {
	static __type__ = 'io.oz.syn.registry.AdminReq';

	/** Asks, semantically equivalent to the CRUD types: a query of each target is an ask, prefixed 'r/'
	 * (planned: qrySynodes, synodes of domains; qryDevices, devices of a domain's users). */
	static A = {
		/** Domains of the market, with conditions of pageInf, see AdminReq.Condts.
		 * Replied in AdminResp.Rs(): domid, domname, orgid, orgName, synodes, optime. */
		qryDomx: 'r/domx',

		/** Delete domains, domids, with conditions of pageInf, see AdminReq.Condts:
		 * all the synodes of a domain first, then the domain. */
		/** "delete" is a c++ keyword. */
		del: 'd/d-node',
	};

	/** Names of the conditions in pageInf.mapCondts. */
	static Condts = {
		/** The community; blank for all communities of the market. */
		orgId: 'orgId',

		/** The domains' status: AdminReq.dead for dead domains, none of the synodes of which is
		 * in a state other than 'd'; blank for all domains (A.qryDomx only). A.del requires dead. */
		status: 'status',
	};

	/** The dead mark, io.oz.syn.registry.CynodeStats.die */
	static dead = 'd';

	/** Paging and conditions, see AdminReq.Condts. */
	pageInf?: PageInf;

	/** Domains to be deleted. */
	domids?: string[];

	constructor(json: {uri: string, a: string, pageInf?: PageInf, domids?: string[]}) {
		super({type: AdminReq.__type__, a: json.a, uri: json.uri});
		this.pageInf = json.pageInf;
		this.domids  = json.domids;
	}
}

/** io.oz.syn.registry.AdminResp */
export class AdminResp extends AnsonResp {
	static __type__ = 'io.oz.syn.registry.AdminResp';

	/** AdminReq.A.del: number of the domains deleted. */
	deleted: number;

	constructor(json: any) {
		super(json);
		this.deleted = json.deleted;
	}
}

Protocol.registerBody(AdminResp.__type__, (json) => new AdminResp(json));

/**
 * io.oz.syn.registry.SignupReq, request of the central's sign-up tier (signup.serv),
 * the only port serving users without a session.
 *
 * The user signs up as the domain admin (r01) of a new community of the central's market.
 * The password is sent as is, so the central must be served over https.
 */
export class SignupReq extends AnsonBody {
	static __type__ = 'io.oz.syn.registry.SignupReq';

	static A = {
		/** Sign up a user, with a new community, of which the id is generated by the central. */
		signup: 'c/user',

		/** The central's market, id and name (SignupResp.market, marketName). */
		market: 'r/market',

		/** Communities of the market to join, with pageInf, condition Condts.orgName.
		 * Replied in SignupResp.Rs(): orgId, orgName. */
		qryOrgs: 'r/orgs',
	};

	/** Names of the conditions in pageInf.mapCondts. */
	static Condts = {
		/** Part of a community's name. */
		orgName: 'orgName',
	};

	uid?: string;
	userName?: string;
	pswd?: string;
	/** The community: a new one's if newOrg, otherwise an existing one to join. */
	orgId?: string;
	/** Create the community, orgId, with orgName. */
	newOrg?: boolean;
	/** The new community's name */
	orgName?: string;
	/** A.qryOrgs: paging and conditions, see Condts. */
	pageInf?: PageInf;

	constructor(json: {uri: string, a: string, uid?: string, userName?: string, pswd?: string,
			orgId?: string, newOrg?: boolean, orgName?: string, pageInf?: PageInf}) {
		super({type: SignupReq.__type__, a: json.a, uri: json.uri});
		this.uid      = json.uid;
		this.userName = json.userName;
		this.pswd     = json.pswd;
		this.orgId    = json.orgId;
		this.newOrg   = json.newOrg;
		this.orgName  = json.orgName;
		this.pageInf  = json.pageInf;
	}
}

/** io.oz.syn.registry.SignupResp */
export class SignupResp extends AnsonResp {
	static __type__ = 'io.oz.syn.registry.SignupResp';

	uid: string;
	/** the user's community */
	orgId: string;
	/** SignupReq.A.market */
	market: string;
	marketName: string;

	constructor(json: any) {
		super(json);
		this.uid   = json.uid;
		this.orgId = json.orgId;
		this.market     = json.market;
		this.marketName = json.marketName;
	}
}

Protocol.registerBody(SignupResp.__type__, (json) => new SignupResp(json));

/**
 * io.oz.syn.registry.CentralProfile, the central's reply on login (AnSessionResp.profile).
 */
export interface CentralProfile {
	type: 'io.oz.syn.registry.CentralProfile';
	/** The page to land on: the router's path (menu url), e.g. '/home', '/org/domains'. */
	home?: string;
}
