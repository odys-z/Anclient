/**
 * jserv-album-lib/src/main/java/io/oz/album/peer/SynDocollPort.java
 * https://github.com/odys-z/semantic-jserv/blob/refact-docsync/jserv-album-lib/src/main/java/io/oz/album/peer/SynDocollPort.java
 */

export const SynDocollPort = {
	heartbeat: "ping.serv",
	sessio: "login.serv",
	userstier: "users.less",
	editor: "editor.less",
	docoll: "docoll.syn",
	menu: "menu.serv",
	settings: "settings.less",
	doctree: "doctree.serv",
	/** the docs' resources (pictures) for the doc-tree editor, doctree.jserv's Doctree206Serv */
	doctree206: "doctree206.serv"
};
