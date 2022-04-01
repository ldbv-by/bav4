import { observe } from '../utils/storeUtils';
import { BaPlugin } from './BaPlugin';
import { addLayer, removeLayer } from '../store/layers/layers.action';
import { addHighlightFeatures, HighlightFeatureType, removeHighlightFeaturesById } from '../store/highlight/highlight.action';
import { TabId } from '../store/mainMenu/mainMenu.action';
import { createUniqueId } from '../utils/numberUtils';


/**
 * Id of the layer used for highlight visualization.
 */
export const HIGHLIGHT_LAYER_ID = 'highlight_layer';

/**
 *ID for FeatureInfo related highlight features
 */
export const FEATURE_INFO_HIGHLIGHT_FEATURE_ID = 'featureInfoHighlightFeatureId';

/**
 *ID for FeatureInfo related highlight features
 */
export const FEATURE_INFO_SUCCESS_HIGHLIGHT_FEATURE_ID = 'featureInfoSuccessHighlightFeatureId';
/**
 *ID for SearchResult related highlight features
 */
export const SEARCH_RESULT_HIGHLIGHT_FEATURE_ID = 'searchResultHighlightFeatureId';
/**
 *ID for SearchResult related temporary highlight features
 */
export const SEARCH_RESULT_TEMPORARY_HIGHLIGHT_FEATURE_ID = 'searchResultTemporaryHighlightFeatureId';
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

		const highlightFeatureId = createUniqueId();


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

		const onTabChanged = (tab) => {
			if (tab !== TabId.FEATUREINFO) {
				removeHighlightFeaturesById([FEATURE_INFO_HIGHLIGHT_FEATURE_ID, FEATURE_INFO_SUCCESS_HIGHLIGHT_FEATURE_ID]);
			}
		};

		const onQueryChanged = (query) => {
			if (!query.payload) {
				removeHighlightFeaturesById([SEARCH_RESULT_HIGHLIGHT_FEATURE_ID, SEARCH_RESULT_TEMPORARY_HIGHLIGHT_FEATURE_ID]);
			}
		};

		const onFeatureInfoQueryingChange = (querying, state) => {
			if (querying) {
				const coordinate = state.featureInfo.coordinate.payload;
				addHighlightFeatures({ id: highlightFeatureId, data: { coordinate: coordinate }, type: HighlightFeatureType.FEATURE_INFO_RUNNING });
				removeHighlightFeaturesById(FEATURE_INFO_SUCCESS_HIGHLIGHT_FEATURE_ID);
			}
			else {
				const coordinate = state.featureInfo.coordinate.payload;
				removeHighlightFeaturesById(highlightFeatureId);
				if (state.featureInfo.current.length > 0) {
					addHighlightFeatures({ id: FEATURE_INFO_SUCCESS_HIGHLIGHT_FEATURE_ID, data: { coordinate: coordinate }, type: HighlightFeatureType.FEATURE_INFO_SUCCESS });
				}
			}
		};

		observe(store, state => state.highlight.active, onChange);
		observe(store, state => state.pointer.click, onPointerClick);
		observe(store, store => store.mainMenu.tab, onTabChanged, false);
		observe(store, store => store.search.query, onQueryChanged);
		observe(store, state => state.featureInfo.querying, onFeatureInfoQueryingChange);
	}
}
