/** Jsample for EasuUI, function module sys/users.
 * @module jclient.js.jsample.easyui */

/** The function page roles.html is shown int the iframe of app.html,
 * so use this to initialize. */
ssClient = parent.ssClient;

function Domain () {
	/**Initialize detail form
	 * @param {string} crud, typically one of jeasy.crud.c | r | u | d,
	 * user can use this for other branch tag.
	 * @param {string} formId form Id, this can be ignored
	 * - the component know what is itself's function.
	 * @param {jclient.vue.SessionClient} ssClient the session client
	 * @param {object} row the selected row in main list (a record bind to the domains.html)
	 */
	this.init = function (crud, formId, ssClient, row) {
		// don't use 'this', this function is called in callback
		domain.client = ssClient;
		domain.cmd = crud;
		domain.row = row;
		domain.domainForm = formId; // you can hard coding here
		domain.domainId = row.domainId;

		EasyMsger.init();

		var opts = {
			// ir-t: maintbl: a_roles, don't confused with #rflist[ir-t]
			t: 'a_domain',
			// a_roles' id. tip: don't use "this.roleId"
			pk: {pk: 'domainId', v: domain.domainId},
			onload: function () {
				if (jeasy.log >= 2) {
					console.log("[2] Typical CRUD - EasyModal.load(domain) - ", row.domainId,
							"Binding function tree and workflow rights");
				}
			} };
		EasyModal.load(formId, opts);
	};
}
var domain = new Domain();
