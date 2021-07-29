import { observe } from '../../utils/storeUtils';
import { BaPlugin } from '../../store/BaPlugin';
import { addLayer, removeLayer } from '../layers/layers.action';


/**
 * Id of the layer used for highlight visualization.
 */
export const HIGHLIGHT_LAYER_ID = 'highlight_layer';

/**
 * @class
 * @author taulinger
 */
export class HighlightPlugin extends BaPlugin {

	/**
	 * @override
	 * @param {Store} store
	 */
	async register(store) {

		const onChange = (active) => {

			if (active) {
				addLayer(HIGHLIGHT_LAYER_ID, { constraints: { hidden: true, alwaysTop: true } });
			}
			else {
				removeLayer(HIGHLIGHT_LAYER_ID);
			}
		};

		observe(store, state => state.highlight.active, onChange);
	}
}
