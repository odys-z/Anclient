/** Jsample for EasuUI, function module sys/users.
 * @module jclient.js.jsample.easyui */

const debug = true;
// 2019.09.24
// The parent.ssClient can not accessed from local file anymore
// ssClient = parent.ssClient;
// in html: <script src="../../../../../lib/view/easyui/postmate.js"
// 					type="text/javascript" charset="utf-8"></script>

/** The function page roles.html is shown in the iframe of app.html,
 * so use this to communicate with parent and initialize page. */
var handshake = new Postmate.Model({
  // Serializable values
  ssInf: "bar",
  // Functions
  height: () => document.height || document.body.offsetHeight,

  load: (ssInf) => {
	  if (debug) console.log('load():', ssInf);

	  ssClient = new jvue.SessionClient(ssInf, ssInf.iv);
	  // EasyQueryForm.load('#irquery');
	  // EasyGrid.pager('irpager', {query: 'irquery'});
	  EasyGrid.treegrid('irlist', {query: 'irquery'});
	}
});

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
