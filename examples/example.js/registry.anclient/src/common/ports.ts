/**
 * Ports (jserv servlet urls) of Registry Anclient.
 *
 * Jserv's built-in ports (session, query, update, dataset, menu, ...) are already
 * understood by @anclient/semantier.Protocol. Add the project's own servlets here,
 * matching the server side's IPort enum, e.g. jserv-sample's Samport:
 *
 *   tools: 'tools.serv',
 *   vec3 : 'vec3.serv',
 */
export const RegistierPorts = {
	/** jserv-sample/src/main/java/io/oz/jservapp/JservMenu.java */
	menu: 'menu.serv',
};
