/**
 * @module plugins/ComparePlugin
 */
import { observe } from '../utils/storeUtils';
import { modifyLayer, SwipeAlignment } from '../store/layers/layers.action';
import { BaPlugin } from './BaPlugin';
import { activate, deactivate, updateRatio } from '../store/layerSwipe/layerSwipe.action';
import { Tools } from '../domain/tools';
import { $injector } from '../injection/index';
import { QueryParameters } from '../domain/queryParameters';
import { isNumber } from '../utils/checks';

/**
 * This plugin
 * - initially sets the layerSwipe `ratio` value from available query parameter
 * - observes the `tool` slice-of-state and sets the initial layerSwipe slice-of-state and modifies the top-most layer if needed
 *
 * @class
 * @extends BaPlugin
 * @author taulinger
 */
export class ComparePlugin extends BaPlugin {
	/**
	 * @override
	 * @param {Store} store
	 */
	async register(store) {
		const { EnvironmentService: environmentService } = $injector.inject('EnvironmentService');
		const queryParams = environmentService.getQueryParams();
		const swipeRatio = parseFloat(queryParams.get(QueryParameters.SWIPE_RATIO));

		if (isNumber(swipeRatio)) {
			//updateRatio also checks the correct range
			updateRatio(swipeRatio * 100);
		}

		const onToolChanged = (toolId, state) => {
			if (toolId !== Tools.COMPARE) {
				deactivate();
			} else {
				// we activate the tool after another possible active tool was deactivated
				setTimeout(() => {
					if (state.layers.active.length > 0) {
						// adjust swipe alignment of top most layer. If not other specified, it should be placed on the left side
						if (state.layers.active[state.layers.active.length - 1].constraints.swipeAlignment === SwipeAlignment.NOT_SET) {
							modifyLayer(state.layers.active[state.layers.active.length - 1].id, { swipeAlignment: SwipeAlignment.LEFT });
						}
					}
					activate();
				});
			}
		};

		observe(store, (state) => state.tools.current, onToolChanged, false);
	}
}
