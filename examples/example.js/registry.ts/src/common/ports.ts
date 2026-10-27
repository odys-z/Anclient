/**
 * Ports (jserv servlet urls) of Registry Client.
 *
 * Jserv's built-in ports (session, query, update, dataset, menu, ...) are already
 * understood by @anclient/semantier.Protocol. Add the project's own servlets here,
 * matching the server side's IPort enum, e.g. jserv-sample's Samport:
 *
 *   tools: 'tools.serv',
 *   vec3 : 'vec3.serv',
 */
export const RegistryTsPorts = {
	/** jserv-sample/src/main/java/io/oz/jservapp/JservMenu.java */
	menu: 'menu.serv',

	/** Semantic-Network/registration/jserv, Registry, io.oz.syn.registry.Centralport.regist */
	regist: 'regist.serv',

	/** Semantic-Network/registration/jserv, Communitier, io.oz.syn.registry.Centralport.community:
	 * create, update and delete of communities and domains (reads go through query.serv) */
	community: 'community.serv',

	/** Semantic-Network/registration/jserv, Domxier, io.oz.syn.registry.Centralport.domx:
	 * creating domains with the synodes planned by the central, domains of a community,
	 * synodes of a domain, see DomxReq / DomxResp */
	domx: 'domx.serv',

	/** Semantic-Network/registration/jserv, Administratier, io.oz.syn.registry.Centralport.admin:
	 * the super role's administration, e.g. deleting dead domains, see AdminReq / AdminResp */
	admin: 'admin.serv',

	/** Semantic-Network/registration/jserv, Signupier, io.oz.syn.registry.Centralport.signup:
	 * signing up a domain admin with a new community, without a session, see SignupReq / SignupResp */
	signup: 'signup.serv',
};
