/** Entry point for the browser bundle.
 *
 * Importing a test module has two effects:
 *  - its guarded `describe(...)` block registers with mocha, if mocha.setup()
 *    has already run (see test/browser/mocha.html)
 *  - its exported case function(s) become available here to attach to
 *    `window`, so a plain page can call them directly without mocha at all
 *    (see test/browser/debug.html)
 *
 * As you refactor more *.mocha.ts files to export their case functions,
 * import + re-expose them here the same way.
 */
import { case01_2_extDataset } from './01-protocol_ext_mocha-v2';
import { case02_1_checkTree_relation_recs, case02_2_checkTree_relation_recs } from './02-helpers.mocha';

declare global {
	interface Window {
		AnclientTests: Record<string, () => void>;
	}
}

window.AnclientTests = {
	case01_2_extDataset,
	case02_1_checkTree_relation_recs, case02_2_checkTree_relation_recs
};
