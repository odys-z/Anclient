import chai from 'chai';
import { expect, assert } from 'chai';
import { AnContext } from '../lib/an-react';
import { Quizlist } from '../react-quiz/src/app/Quizlist'
import { LoginComp } from '../react-quiz/src/app/Login.cmp.js'


// import { JSDOM } from "jsdom";
// import $ from "jquery";
// const { window } = new JSDOM( "" );
// $(window);

describe('case: [anclient]', () => {
 	LoginComp.configServ = function (ctx) {
		let json = `${ctx.pageOrigin}/${ctx.jsons[0]}`;
		$.ajax({
				dataType: "json",
				url: json,
			} )
		.done(loadServ)
		.fail( (e) => {
			console.warn("Failed on getting ", json, e);
			if (ctx.jsons.length >= 2) {
				json = `${ctx.pageOrigin}/${ctx.jsons[1]}`;
				$.ajax({
						dataType: "json",
						url: json,
					} )
				.done(loadServ);
			}
		});

		function loadServ(servs = {}) {
			let servId = that.context.servId;
			that.inputRef.value = servs[servId];
			that.setState({jserv: servs[servId]});
		}
	};

	it('[jserv] jserv-id configure rules', () => {
		let quizzes = new Quizlist().bindQuizzes(undefined, 'host');
		assert.equal( 'host', quizzes.state.servId, "1 ---" );

		let login = new LoginComp({servJsons: [ '../plain-quiz/private.json', '../plain-quiz/github.json' ]});
		AnContext.servId = 'localhost';
		AnContext.pageOrigin = "mocha-test";
		login.context = AnContext;

		login.componentDidMount();
		assert.equal( 'http://localhost:8888//jserv-quiz', quizzes.state.servId, "2 ---" );

	});
});
