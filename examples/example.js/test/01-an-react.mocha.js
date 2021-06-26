import chai from 'chai';
import { expect, assert } from 'chai';
import { AnContext } from '../lib/an-react';
import { QuizlistComp } from '../react-quiz/src/app/Quizlist'
import { LoginComp } from '../react-quiz/src/app/Login.cmp.js'
import { QrSharingComp } from '../lib/widgets/Messagebox'

describe('case: [anclient]', () => {
	it('[jserv] jserv-id configure rules', () => {
		let quizzes = new QuizlistComp({ servId: 'host', servs: {
			"host": 'http://host.com/test.serv',
			"docker": "http://localhost:8088/jserv-quiz"
		} });
		assert.equal( 'host', quizzes.state.servId, "1 ---" );
		assert.equal( 'http://host.com/test.serv', quizzes.props.servs.host, "2 ---" );

		let login = new LoginComp({});
		login.context = Object.assign(quizzes.props, {servId: 'localhost', pageOrigin: 'http://mocha-test'});
		assert.equal( 'http://host.com/test.serv', login.context.servs.host, "3 ---" );
		assert.equal( 'localhost', login.context.servId, "4 ---" );

		let share = new QrSharingComp({
			qr:{origin: login.context.pageOrigin,
				path: 'jserv',
				page: 'test.html',
				serv: login.context.servId,
				quiz: '012345' }
		});
		assert.equal( 'http://mocha-test/jserv/test.html?serv=localhost&quiz=012345', share.url(), 'A ---');
	});
});
