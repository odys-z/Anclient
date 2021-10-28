/** Configuration for test with Mocha.
	npm run build
	npm test
 */

const window = {};
const __TESTING__ = true;
context = require.context('./jsunit', true, /\.mocha\.ts$/);

context.keys().forEach(context);
module.exports = context;
