/**
 * @module plugins/ComparePlugin
 */
import { observe } from '../utils/storeUtils';
import { modifyLayer, SwipeAlignment } from '../store/layers/layers.action';
import { BaPlugin } from './BaPlugin';
import { activate, deactivate } from '../store/layerSwipe/layerSwipe.action';
import { Tools } from '../domain/tools';

/**
 * This plugin observes the "tool" slice-of-state and sets the initial layerSwipe slice-of-state and modifies the top-most layer if needed.
 *
 * @class
 * @author taulinger
 */
export class ComparePlugin extends BaPlugin {
	/**
	 * @override
	 * @param {Store} store
	 */
	async register(store) {
		const onToolChanged = (toolId, state) => {
			if (toolId !== Tools.COMPARE) {
				deactivate();
			} else {
				// we activate the tool after another possible active tool was deactivated
				setTimeout(() => {
					if (state.layers.active.length > 1) {
						// http://localhost:8080/?c=621306,5416137&z=7&r=0&l=vt_grau,7cfb0293-4aab-42f4-a568-bb5cb36a4d11,914c9263-5312-453e-b3eb-5104db1bf788&t=ba&tid=compare
						// adjust swipe alignment of top most layer. If not other specified, it should be placed on the left side
						if (state.layers.active[state.layers.active.length - 1].constraints.swipeAlignment === SwipeAlignment.NOT_SET) {
							modifyLayer(state.layers.active[state.layers.active.length - 1].id, { swipeAlignment: SwipeAlignment.LEFT });
						}
						activate();
					}
				});
			}
		};

		observe(store, (state) => state.tools.current, onToolChanged, false);
	}
}
