import { observe } from '../utils/storeUtils';
import { BaPlugin } from './BaPlugin';
import { addLayer, removeLayer } from '../store/layers/layers.action';
import { removeHighlightFeaturesById } from '../store/highlight/highlight.action';
import { TabIndex } from '../store/mainMenu/mainMenu.action';


/**
 * Id of the layer used for highlight visualization.
 */
export const HIGHLIGHT_LAYER_ID = 'highlight_layer';

/**
 *ID for FeatureInfo related  highlight features
 */
export const FEATURE_INFO_HIGHLIGHT_FEATURE_ID = 'featureInfoHighlightFeatureId';
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

		const onPointerClick = () => {
			removeHighlightFeaturesById(FEATURE_INFO_HIGHLIGHT_FEATURE_ID);
		};

		const onTabIndexChanged = (tabIndex) => {
			if (tabIndex !== TabIndex.FEATUREINFO) {
				removeHighlightFeaturesById(FEATURE_INFO_HIGHLIGHT_FEATURE_ID);
			}
		};

		observe(store, state => state.highlight.active, onChange);
		observe(store, state => state.pointer.click, onPointerClick);
		observe(store, store => store.mainMenu.tabIndex, onTabIndexChanged, false);
	}
}
