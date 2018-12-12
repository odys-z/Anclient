var api = new sapi();
api.init("http://127.0.0.1:8080/semantic.jserv");

console.log(api.jserv);

var req = protocol.query("a_functions", "f")
			.page(100, 0)
			.j("a_roles", "r", "r.roleId=f.roleId");
console.log(req);

api.loadPage("a_functions", req);

/**Load list (#listId) with ir-t defined in pager (#paerId) and condition defined in form (#queryId)
 * @description Load main list page
 * @param {string} pagerId e.g id="pargerId";
 * @param {string} listId list to be loaded. Default id="irlist";
 * @param {string} queryId form id for composing query condition;
 * @param {function} onSelectf function when row selected - f(ix, row).
 * @param {string} isSelectFirst 是否默认选中第一行.
 * @param {function} onCheckf function for row checked/uncheck - f(ix, row).
 * @param {function} onCheckAllf function for all rows checked/uncheck - f(rows).
function loadPage(pagerId, listId, queryId, onSelectf, isSelectFirst, onCheckf, onCheckAllf) {

	if(pagerId == null)
		pagerId = _pager;
	else if(typeof pagerId != "undefined" && pagerId.substring(0, 1) != "#")
		pagerId = "#" + pagerId;
	else if (typeof pagerId === "undefined")
		pagerId = _pager;

	if(listId == null)
		listId = _list;
	else if(typeof listId != "undefined" && listId.substring(0, 1) != "#")
		listId = "#" + listId;
	else if (typeof listId === "undefined")
		listId = _list;

	//查询条件Form表单Id
	if(queryId == null)
		queryId = _query;
	else if(typeof queryId != "undefined" && queryId.substring(0, 1) != "#")
		queryId = "#" + queryId;
	else if (typeof queryId === "undefined")
	 	queryId = _query;

	// semantics key (config.xml/semantics)
	var semantik = $(pagerId).attr(_aSemantik);

	//获取列表样式,判断列表是datagrid还是treegrid
	var listType = $(listId).attr(_listType);
	if(typeof listType == "undefined") listType = "datagrid";

	var IsSelect = $(listId).attr(_irselect);
	if(typeof IsSelect == "undefined") IsSelect = "false";

	var t = $(pagerId).attr(_aT);
	if (t != _pageInfo.t) {
		_pageInfo = {
			t: t,
			total: 0,
			page: 1,
			pageSize: 20,
			pageList: _pageInfo.pageList
		}
	}

	var tabl = findTabls(pagerId);
	var order = findOrders(listId, tabl[0].tabl);
	var expr = findTableExprs(listId, tabl[0].tabl);
	var cond = findConds2(tabl[0].tabl, queryId);

	var groupAttr = $(pagerId).attr(_aGroup);
	var groupings = findGroups(tabl[0].tabl, groupAttr);

	//var qobj = { tabls: tabl, exprs: expr, conds: cond, orders: order, group: groupings};
	var qobj = formatQuery(expr, tabl, cond, groupings, order);

	var pgSize = $(pagerId).attr(_aPagesize);

	var pager = $(pagerId).pagination({
		total: _pageInfo.total,
		//pageSize: pgSize,
		//pageList: [10, 20, 50, 100, pgSize]
		pageSize: _pageInfo.pageSize,
		pageList: _pageInfo.pageList(pgSize)
	});
	var conn = $(pagerId).attr(_aConn);

	var servId = $(pagerId).attr(_aServ);

	var servUrl = _servUrl + servId + ".serv";
	// t is not used by quere.serv, but send this for reserved extension?
	if(typeof conn != "undefined")
		servUrl += "?t=" + tabl[0].tabl + "&conn=" + conn;
	else servUrl += "?t=" + tabl[0].tabl;

	// Semantics for data format, e.g. tree structure configuration key, see config.xml/semantics/easyuitree-area
	if (typeof semantik != "undefined")
		servUrl += "&sk=" + semantik;

	//var bindPage = function (pageNumb, pageSize) {
	var bindPage = function (pageNumb, pageSize) {
		$.ajax({type: "POST",
			//url: servUrl + "?t=" + t + "&page=" + (pageNumb - 1) + "&size=" + pageSize,
			url: servUrl + "&page=" + (pageNumb - 1) + "&size=" + pageSize,
			contentType: "application/json; charset=utf-8",
			data: JSON.stringify(qobj),
			success: function (data) {
				_pageInfo.page = pageNumb;
				_pageInfo.pageSize = pageSize;

				var resp = JSON.parse(data);
				if (irLog) console.log(resp);
				if (typeof resp.code != "undefined" && resp.code == "ss_err") {
					// needing ir-ifire.js
					ssChecker.expire();
					// $.messager.alert({title: "提示", msg: "登录信息不正确或登录超时，请重新登录！", icon: "info",
					// 	fn: function() {window.top.location = _loginHtml;}});
				} else if (typeof resp.code != "undefined" && resp.code != "OK")
					alert("loading failed: " + resp.msg);
				else {
					if(listType == "datagrid") {
						if (onSelectf)
							$(listId).datagrid({ onSelect: onSelectf });
						else if(IsSelect == "true") {
							$(listId).datagrid({
								onSelect: function (index, row) { GetSelectData(index, row); }
							});
						}

						if (onCheckf)
							$(listId).datagrid({ onCheck: onCheckf,
								onUncheck: onCheckf});
						if (onCheckAllf)
							$(listId).datagrid({ onCheckAll: onCheckAllf,
								onUncheckAll: onCheckAllf});

						$(listId).datagrid("loadData", resp);
						if(isSelectFirst != false) {
							//默认选中第一行
							$(listId).datagrid("selectRow", 0);
						}
					} else if(listType == "treegrid") {
						if (onSelectf)
							$(listId).treegrid({ onSelect: onSelectf });
						$(listId).treegrid("loadData", resp);

						if (onCheckf)
							$(listId).treegrid({ onCheck: onCheckf,
								onUncheck: onCheckf});
						if (onCheckAllf)
							$(listId).treegrid({ onCheckAll: onCheckAllf,
								onUncheckAll: onCheckAllf});
					}
					$(pagerId).pagination("refresh", {total: resp.total, pageNumber: pageNumb, pageSize: pageSize});
				}
			},
			error: function(data) {
				//关闭进度条
				$.messager.progress('close');
				alert("loading failed: " + servUrl);
			}
		});
	};

	// pager.onSelectPage = bindList;
	$(pagerId).pagination({onSelectPage: bindPage});

	//bindPage(1, pgSize);
	bindPage(_pageInfo.page, _pageInfo.pageSize);
}
 */
