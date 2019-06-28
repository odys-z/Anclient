
var cmd = jeasy.u;
var usrForm;
var client;
var userId;
var user;

var superOrgs = ['Mossad', 'MI6', 'CIA', 'SVR', 'ChaoYang People'];

function initUser(crud, formId, ssClient, row) {
	console.log(crud, formId, ssClient, row);

	client = ssClient;
	cmd = crud;
	usrForm = formId; // you can hard coding here
	userId = row === undefined ? undefined : row.userId;
	user = row;

	var opts = {// ir-t: maintbl: a_user. if null, find ir-t from $(#formId)
				t: "a_user:u,l:a_attaches:att att.busiTbl='a_user' and att.busiId=u.userId",
				pk: {pk: 'userId', v: userId},
				onload: function () {
							console.log("Typical CRUD - EasyModal.load() Callback");
						}
				};
	EasyModal.load(formId, opts);

	fileclient.init('fileInput', 'fileDisplayArea');
}

/** save user's informantion */
function save() {
	userId = $('#userId').val().trim();
	// create a JMessage with an UpdateReq body
	var q = EasyModal.save (null,		// default connId
							cmd,		// jeasu.c | r | u | d
							usrForm,	// modal dialog form id
							'a_user',	// target main table
							{pk: "userId", v: userId});	// pk - not used when inserting, using textbox #userId value. This is not a good practice.

	// You append post updates here (call q.post(UpdateReq))
	// Example here is adding file attachment as a post request and commit in callback of file loaded.
	// See role details modal dialog for example of none-callback style.

    if (fileclient.file) {
        // save with attach files
        fileclient.getFiles64(function(file, b64) {
		    // 3 insert attached files
		    var ins = new jvue.InsertReq(jconsts.conn, 'a_attaches')
				.nv('busiId', userId)
				.nv('busiTbl', 'a_user')
				.nv('attName', file.name)
				.nv('uri', b64);

		    // 2. delete all attachments
		    var del = new jvue.DeleteReq(jconsts.conn, 'a_attaches')
				.whereEq('busiId', userId)
				.whereEq('busiTbl', 'a_user')
				.post(ins);

		// 1. delete is post updating user
		q.post(del).nv("pswd", "123456");

		    client.commit(q,
			    function(resp) {
				    // You can fire saved event at client side here.
				    EasyMsger.ok(EasyMsger.m.saved);
			    }, EasyMsger.error);
	    });
    }
    else {
        // save without saving file
		client.commit(q,
			function(resp) {
				// You can fire saved event at client side here.
				EasyMsger.ok(EasyMsger.m.saved);
			}, EasyMsger.error);
    }
}

function Role () {
	this.init = function (crud, formId, ssClient, row) {
		client = ssClient;
		// don't use 'this', this function is called in callback
		role.cmd = crud;
		role.row = row;
		role.roleForm = formId; // you can hard coding here
		role.roleId = row.roleId;

		EasyMsger.init();

		// Framework desgin defection detour. See also EasyGrid#bindPager().
		// Remove pager that handled by EasyGrid.
		//
		// Design Notes: user component's tried to design a wideget that a framework can handle,
		// but it's still matter to user components, and tell another module to handle someone else's.
		// This is ridiculous - by easyUI's global html and ui objects accessibility!
		//
		// We can handle pager id in EzModal#bindWidgets() to left this burden from user.
		// That way can only partially handle the situation because there are still
		// some pagers user want ot operate, so it's bug introducing.
		//
		// May be we should redesign pageInfo processing?
		EasyModal.onclose = function () {
			EasyGrid.pageInfo['#roles-pager'] = undefined;
		}

		var opts = {
			// ir-t: maintbl: a_roles, don't confused with #rflist[ir-t]
			t: 'a_roles',
			// a_roles' id. tip: don't use "this.roleId"
			pk: {pk: 'roleId', v: role.roleId},
			onload: function () {
				console.log("Typical CRUD (2) - EasyModal.load(role) - ", row.roleId,
							"Binding function tree and workflow rights");
				role.rolefuncs(row.roleId);
				// role.cheaprights(row.roleId);

			} };
		EasyModal.load(formId, opts);

		// because '#wfs' combobox don't have an ir-field attribute, it's not handled by EzModal.load()
		EasyCbb.combobox('wfs');
	};

	this.rolefuncs = function (roleId) {
		role.roleId = roleId;
		EasyTree.stree('rftree', {args: role.row});
	};

	this.cheaprights = function (wfId, oldv) {
		role.wfId = wfId;
		if ("" !== oldv) {// first time change, ingore
			// var wfId = EasyCbb.getValue('wfs');
			if (wfId)
				EasyGrid.treegrid('wfright', {args: {roleId: role.roleId, wfId: wfId}});
		}
	};

	/** save role's info */
	this.save = function () {
		// j: JMessage, body = UpdateReq
		var j = EasyModal.save (null,			// default connId
								this.cmd,		// c r u d
								this.roleForm,	// modal dialog form id
								'a_roles',		// target main table
								{pk: "roleId", v: this.roleId},	// pk
								'.datagrid [name]');	// exclude checkbox in treegrid

		// post operations
		// 1. create role-funcs post update
		// 1.1 delete all role-funcs
		var del = new jvue.DeleteReq(
						jconsts.conn,
						'a_role_funcs')
				.where_("=", 'roleId', this.roleId);
		// 1.2 insert checked items
		// return:
		// [ [ [ "funcId", "1A"   ],		- value-row 0, col 0 (funcId)
		//     [ "roleId", "0101" ],		- value-row 0, col 1 (this.roleId == '0101')
		//   ],
		//   [ [ "funcId", "0101" ],		- value-row 1, col 0 (funcId)
		//     [ "roleId", "0101" ],		- value-row 1, col 1 (this.roleId == '0101')
		// ]
		// this means two records will be inserted like
		// insert a_role_funcs (funId, roleId) values ('1A', '0101'), ('0101', '0101')
		var rolefuncs = EasyHtml.checkedTreeItem('rftree',
					{ // n-v, prop: n; row.name = v
					  cols:	{funcId: 'value'},
					  append: {roleId: role.roleId},
				 	});
		// Create a post inserting body
		// This way will deprecated in the future - confusing to the above one, the del.
		var insts = jeasy.postBody(jeasy.c,
				{ t: 'a_role_funcs',
				cols: rolefuncs[0],
				values: rolefuncs[1]});
		j.post(del.post(insts));

		// 2. collect workflow command rights
		// 2.1 delete all commands of the role
		var wdel = new jvue.DeleteReq(
						jconsts.conn,
						'oz_wfrights')
				.where_("=", 'roleId', this.roleId)
				.where_("=", 'wfId', role.wfId);
		// 2.2 insert command rights
		var wfRights = EasyHtml.checkedTreeItem('wfright',
				{ cols:	{cmd: 'value', nodeId: 'nodeId'},
				  // appending cols with variables
				  append: {roleId: this.roleId, wfId: role.wfId},
				  check: 'checked',
				  eztype: 'treegrid'
				});
		wdel.post(jeasy.postBody(jeasy.c, {
				t: 'oz_wfrights',
				cols: wfRights[0],
				values: wfRights[1]}));

		j.body[0].post(wdel);

		// 3 commit the structured update request
		client.commit(j, function(resp) {
				// You can fire saved event at client side here.
				EasyMsger.ok(EasyMsger.m.saved);
			}, EasyMsger.error);
	};

	/**Load role-function rights and role-workflow rights */
	this.loadRights = function (ix, r) {
		$('#roleName').textbox({value: r.roleName});

		// this is a event handle by role-details.html/#rflist ir-select="roleId: {@role.roleId}",
		// so it's needing arg updating here
		role.roleId = r.roleId;

		role.rolefuncs(r.roleId);

		role.cheaprights(r.roleId);
	};
}
var role = new Role();

function FileClient () {
	/**Init a file upload client control.
	 * see https://codepen.io/matt-west/pen/CfilG
	 * @param {string} fileInput the html file fileInput
	 * @param {string} prevuId preview div id
	 * @param {regex} ftype file type regex, default: /image.* /
	 */
	this.init = function(fileInput, prevuId, ftype) {
		var fileInput = document.getElementById(regex.desharp_(fileInput));
		var fileDisplayArea = document.getElementById(prevuId);

		fileInput.addEventListener('change', function(e) {
			// { name: "a2.png", lastModified: 1553155518000, webkitRelativePath: "", size: 151541, type: "image/png" }
			fileclient.file = fileInput.files[0];

			// var imageType = /image.*/;
			var imageType = ftype === undefined ? /image.*/ : ftype;

			if (fileclient.file.type.match(imageType)) {
				var reader = new FileReader();

				reader.onload = function(e) {
					fileDisplayArea.innerHTML = "";

					var img = new Image();
					img.src = reader.result;
					img.classList.add('preview');

					fileDisplayArea.appendChild(img);
				}
				reader.readAsDataURL(fileclient.file);
			} else {
				fileDisplayArea.innerHTML = "File not supported!"
			}
		});
	};

	this.getFiles64 = function(onok) {
		var freader = new FileReader();
		// e: ProgressEvent
		freader.onload = function (e) {
			console.log(e, freader.result);
			var b64 = jvue.aes.bytesToB64(new Uint8Array(freader.result));
			if (typeof onok === 'function') {
				onok(fileclient.file, b64);
			}
		}
		if (fileclient.file) {
			freader.readAsArrayBuffer(fileclient.file);
		}
	}
}
var fileclient = new FileClient;
