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
 *ID for a highlight feature a query is running
 */
export const QUERY_RUNNING_HIGHLIGHT_FEATURE_ID = 'queryRunningHighlightFeatureId';

/**
 *ID for a highlight feature a query was successful
 */
export const QUERY_SUCCESS_HIGHLIGHT_FEATURE_ID = 'querySuccessHighlightFeatureId';
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
			removeHighlightFeaturesById(QUERY_RUNNING_HIGHLIGHT_FEATURE_ID);
		};

		const onTabChanged = (tab) => {
			if (tab !== TabId.FEATUREINFO) {
				removeHighlightFeaturesById([QUERY_RUNNING_HIGHLIGHT_FEATURE_ID, QUERY_SUCCESS_HIGHLIGHT_FEATURE_ID]);
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
				addHighlightFeatures({ id: highlightFeatureId, data: { coordinate: coordinate }, type: HighlightFeatureType.QUERY_RUNNING });
				removeHighlightFeaturesById(QUERY_SUCCESS_HIGHLIGHT_FEATURE_ID);
			}
			else {
				const coordinate = state.featureInfo.coordinate.payload;
				removeHighlightFeaturesById(highlightFeatureId);
				const checkForNoGeometry = f => !f.geometry; // we show a highlight feature if we have at least one FeatureInfo object containing no geometry
				if (state.featureInfo.current.length > 0 && state.featureInfo.current.some(checkForNoGeometry)) {
					addHighlightFeatures({ id: QUERY_SUCCESS_HIGHLIGHT_FEATURE_ID, data: { coordinate: coordinate }, type: HighlightFeatureType.QUERY_SUCCESS });
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
