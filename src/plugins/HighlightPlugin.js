/**
 * @module plugins/HighlightPlugin
 */
import { observe } from '../utils/storeUtils';
import { BaPlugin } from './BaPlugin';
import { addLayer, removeLayer } from '../store/layers/layers.action';
import { addHighlightFeatures, HighlightFeatureType, HighlightGeometryType, removeHighlightFeaturesById } from '../store/highlight/highlight.action';
import { TabIds } from '../domain/mainMenu';
import { createUniqueId } from '../utils/numberUtils';
import { $injector } from '../injection/index';
import { QueryParameters } from '../domain/queryParameters';
import { isCoordinate } from '../utils/checks';

/**
 * Id of the layer used for highlight visualization.
 */
export const HIGHLIGHT_LAYER_ID = 'highlight_layer';

/**
 *ID for a highlight feature when a query is running
 */
export const QUERY_RUNNING_HIGHLIGHT_FEATURE_ID = 'queryRunningHighlightFeatureId';

/**
 *ID for a highlight feature after a query was successful
 */
export const QUERY_SUCCESS_HIGHLIGHT_FEATURE_ID = 'querySuccessHighlightFeatureId';
/**
 *ID for a highlight feature containing a geometry after a query was successful
 */
export const QUERY_SUCCESS_WITH_GEOMETRY_HIGHLIGHT_FEATURE_ID = 'querySuccessWithGeometryHighlightFeatureId';
/**
 *ID for SearchResult related highlight features
 */
export const SEARCH_RESULT_HIGHLIGHT_FEATURE_ID = 'searchResultHighlightFeatureId';
/**
 *ID for SearchResult related temporary highlight features
 */
export const SEARCH_RESULT_TEMPORARY_HIGHLIGHT_FEATURE_ID = 'searchResultTemporaryHighlightFeatureId';

/**
 *ID for a highlight feature a query is running
 */
export const CROSSHAIR_HIGHLIGHT_FEATURE_ID = 'crosshairHighlightFeatureId';
/**
 * This plugin currently
 * - adds a layer for displaying all highlight features (needed for all kinds of highlight visualization), exclusive here
 * - adds a highlight feature when the QueryParameter "CROSSHAIR" is available
 * - does the highlight feature management for the feature info visualization
 * - does the highlight feature management for the search result visualization
 *
 * Note: Other plugins are allowed to manage their highlight feature management on their own.
 * @class
 * @author taulinger
 */
export class HighlightPlugin extends BaPlugin {
	constructor() {
		super();
		const { TranslationService: translationService } = $injector.inject('TranslationService');
		this._translationService = translationService;
	}
	/**
	 * @override
	 * @param {Store} store
	 */
	async register(store) {
		const highlightFeatureId = `${createUniqueId()}`;
		const translate = (key) => this._translationService.translate(key);

		const onChange = (active) => {
			if (active) {
				addLayer(HIGHLIGHT_LAYER_ID, { constraints: { hidden: true, alwaysTop: true } });
			} else {
				removeLayer(HIGHLIGHT_LAYER_ID);
			}
		};

		const onPointerClick = () => {
			removeHighlightFeaturesById(QUERY_RUNNING_HIGHLIGHT_FEATURE_ID);
		};

		const onTabChanged = (tab) => {
			if (tab !== TabIds.FEATUREINFO) {
				removeHighlightFeaturesById([
					QUERY_RUNNING_HIGHLIGHT_FEATURE_ID,
					QUERY_SUCCESS_HIGHLIGHT_FEATURE_ID,
					QUERY_SUCCESS_WITH_GEOMETRY_HIGHLIGHT_FEATURE_ID
				]);
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
				removeHighlightFeaturesById([QUERY_SUCCESS_HIGHLIGHT_FEATURE_ID, QUERY_SUCCESS_WITH_GEOMETRY_HIGHLIGHT_FEATURE_ID]);
			} else {
				const coordinate = state.featureInfo.coordinate.payload;
				removeHighlightFeaturesById(highlightFeatureId);
				// we show a highlight feature if we have at least one FeatureInfo object containing no geometry
				if (state.featureInfo.current.some((fi) => !fi.geometry)) {
					addHighlightFeatures({
						id: QUERY_SUCCESS_HIGHLIGHT_FEATURE_ID,
						data: { coordinate: coordinate },
						type: HighlightFeatureType.QUERY_SUCCESS
					});
				}
				const highlightFeatures = state.featureInfo.current
					.filter((featureInfo) => featureInfo.geometry)
					.map((featureInfo) => ({
						id: QUERY_SUCCESS_WITH_GEOMETRY_HIGHLIGHT_FEATURE_ID,
						type: HighlightFeatureType.DEFAULT,
						data: { geometry: featureInfo.geometry.data, geometryType: HighlightGeometryType.GEOJSON }
					}));
				addHighlightFeatures(highlightFeatures);
			}
		};

		const { EnvironmentService: environmentService } = $injector.inject('EnvironmentService');

		if (environmentService.getQueryParams().get(QueryParameters.CROSSHAIR)) {
			const crosshairValues = environmentService.getQueryParams().get(QueryParameters.CROSSHAIR).split(',');
			setTimeout(() => {
				const crosshairCoordinate =
					crosshairValues.length > 1
						? isFinite(crosshairValues[1]) && isFinite(crosshairValues[2])
							? [crosshairValues[1], crosshairValues[2]].map((v) => parseFloat(v))
							: null
						: store.getState().position.center;

				if (isCoordinate(crosshairCoordinate)) {
					addHighlightFeatures({
						id: CROSSHAIR_HIGHLIGHT_FEATURE_ID,
						label: translate('global_marker_symbol_label'),
						data: { coordinate: crosshairCoordinate },
						type: HighlightFeatureType.MARKER
					});
				}
			});
		}

		observe(store, (state) => state.highlight.active, onChange);
		observe(store, (state) => state.pointer.click, onPointerClick);
		observe(store, (store) => store.mainMenu.tab, onTabChanged, false);
		observe(store, (store) => store.search.query, onQueryChanged);
		observe(store, (state) => state.featureInfo.querying, onFeatureInfoQueryingChange);
	}
}
