/**@module jeasy*/

// global consts
{
	var _servUrl ="http://localhost:8080/semantic.jserv/";

	/** neable session checking*/
	var ssCheck = true;

	/** global flags: enable console.log() */
	var irLog = true;

}


////////////////////////////////////////////////////////////////////////////////
//
// jclient easyui adapter version 1.0
//
////////////////////////////////////////////////////////////////////////////////

/** regular utils
 * @module jeasy/utils */

/** html tag ids and supported ir-attrs
 * @module jeasy/session */

/**Gloable variable, key of localStorage
 * For W3C standard, see: https://www.w3.org/TR/webstorage/#the-storage-interface<br>
 * For ussage, see: https://hacks.mozilla.org/2009/06/localstorage/<br>
 * and https://stackoverflow.com/questions/19861265/getting-the-value-of-a-variable-from-localstorage-from-a-different-javascript-fi*/
var ssInfo = "ssinfo";
var ssClient;

var J = new $J();
J.init(null, _servUrl);

/**Login Utility.<br>
 * requesting login.serv with login-obj: <br>
 * {a: "login/logout", uid: "user-id", pswd: "uid-cipher-by-pswd", iv: "session-iv"}
 * @param {string} userId user id in plain
 * @param {string} pswd password in plain
 * @param {function} onLogin callback on logged in
 * @param {string} home main page url. default = index.html
 * @param {function} robotOnFailed callback if logId == 'robot' and failed on pswd or uid
 */
function login(logId, pswd, onLogin, home, onError) {
    var checkEasyUI = false;
    checkEasyUI = checkDevice(navigator.userAgent||navigator.vendor||window.opera);
	if (checkLog(logId, pswd))
		return;
	logId = logId.trim();

	localStorage.setItem(ssInfo, null);
	J.login(logId, pswd, function(client) {
				ssClient = client;
				if (typeof onLogin !== "function") {
					localStorage.setItem(ssInfo, client.ssInf);
					onLogin(client);
				}
				else {
					localStorage.setItem(ssInfo, client.ssInf);
					// go home page
					window.top.location = home === undfined ? "index.html" : home;
				}
			},
			onError);
		});
}

/**Check user's input
 * @param {string} logId
 * @param {string} pswd
 * @return {boolean} true = error()
 */
function checkLog(logId, pswd) {
	// your validation here
}
