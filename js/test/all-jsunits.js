/** Configuration for test with Mocha.
	npm run build
	npm test
 */

const window = {}

context = require.context('./jsunit', true, /\.mocha\.js$/);

context.keys().forEach(context);
module.exports = context;
