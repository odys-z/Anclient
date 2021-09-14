const happyHistResp = {
	"type": "io.odysz.semantic.jprotocol.AnsonMsg",
	"code": "ok", "opts": null, "port": "chart.tier", "header": null,
	"body": [{
		"type": "io.oz.ever.conn.n.NChartResp", "rs": null,
		"parent": "io.odysz.semantic.jprotocol.AnsonMsg", "a": null,
		"happyhist": [{"type": "io.odysz.module.rs.AnResultset", "stringFormats": null,
			"total": 0, "rowCnt": 2, "colCnt": 2,
			"colnames": {"HAPPY": [1, "happy"], "USERID": [2, "userId"]}, "rowIdx": 0,
			"results": [["2.2044077134116673", "alice"], ["0.8892561982283333", "george"]]
		}],
		"x": null, "y": null, "from": "2021-01-01",
		"gpaEmotion": null, "m": null, "map": null, "uri": null
	}],
	"version": "1.0", "seq": 0
};

const gpaEmotionResp = {
	"type": "io.odysz.semantic.jprotocol.AnsonMsg",
	"code": "ok", "opts": null, "port": "chart.tier", "header": null,
	"body": [{
		"type": "io.oz.ever.conn.n.NChartResp", "rs": null,
		"parent": "io.odysz.semantic.jprotocol.AnsonMsg", "a": null,
		"happyhist": null,
		"x": {"type": "io.odysz.module.rs.AnResultset", "stringFormats": null, "total": 0, "rowCnt": 1, "colCnt": 1,
			"colnames": {"M": [1, "m"]}, "rowIdx": 0,
			"results": [["09"]]},
		"y": {"type": "io.odysz.module.rs.AnResultset", "stringFormats": null, "total": 2, "rowCnt": 2, "colCnt": 2,
			"colnames": {"USERID": [1, "userId"], "USERNAME": [2, "userName"]}, "rowIdx": 0,
			"results": [["alice", "Alice"], ["george", "George"]]},
		"from": "2021-01-01",
		"gpaEmotion": {"type": "io.odysz.module.rs.AnResultset", "stringFormats": null, "total": 0, "rowCnt": 1, "colCnt": 4,
			"colnames": {"RESULTS": [3, "results"], "AVG(GPA)": [4, "avg(gpa)"], "USERID": [1, "userId"], "M": [2, "m"]},
			"rowIdx": 0,
			"results": [["alice", "09", "111.79999999999984", "2.0"]] },
		"m": null, "map": null, "uri": null
	}],
	"version": "1.0", "seq": 0
}
