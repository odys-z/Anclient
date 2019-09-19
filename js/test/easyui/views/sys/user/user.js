// ssClient = parent.ssClient;

window.addEventListener('message', event => {
    // IMPORTANT: check the origin of the data!
    // if (event.origin.startsWith('http://yoursite.com')) {
    //     // The data was sent from your site.
    //     // Data sent with postMessage is stored in event.data:
    //     console.log(event.data);
    // } else {
    //     // The data was NOT sent from your site!
    //     // Be careful! Do not use it. This else branch is
    //     // here just for clarity, you usually shouldn't needed.
    //     return;
	// }
	ssClient = event.data;
	console.log('session client', ssClient, ssClient.userInf, ssClient.userReq);

	ssClient = new jvue.SessionClient(ssClient.ssInf, ssClient.ssInf.iv);
	EasyQueryForm.load('#irquery');
	EasyGrid.pager('irpager', {query: 'irquery'});
});

var cmd = jeasy.u;
var usrForm;
var client;
var userId;
var user;

/**They are every where */
var superOrgs = ['ChaoYang People'];

function User () {
	this.initUser = function(crud, formId, ssClient, row) {
		console.log(crud, formId, ssClient, row);

		client = ssClient;
		cmd = crud;
		usrForm = formId; // you can hard coding here
		userId = row === undefined ? undefined : row.userId;
		user = row;

		var opts = {t: "a_users:u,l:a_attaches:att att.busiTbl='a_users' and att.busiId=u.userId",
					pk: {pk: 'userId', v: userId},
					onload: function () {
								console.log("Typical CRUD - EasyModal.load() Callback");
							}
					};
		EasyModal.load(formId, opts);

		fileclient.init('fileInput', 'fileDisplayArea');
	}

	/** save user's informantion */
	this.save = function() {
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
}
var user = new User();
