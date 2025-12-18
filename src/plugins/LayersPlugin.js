/**
 * @module plugins/LayersPlugin
 */
import { $injector } from '../injection';
import { QueryParameters } from '../domain/queryParameters';
import { BaPlugin } from './BaPlugin';
import { addLayer, closeLayerFilterUI, closeLayerSettingsUI, removeAndSetLayers, setReady, SwipeAlignment } from '../store/layers/layers.action';
import { fitLayer } from '../store/position/position.action';
import { isHexColor, isNumber, isString } from '../utils/checks';
import { observe } from '../utils/storeUtils';
import { closeBottomSheet, openBottomSheet } from '../store/bottomSheet/bottomSheet.action';
import { LAYER_FILTER_BOTTOM_SHEET_ID, LAYER_SETTINGS_BOTTOM_SHEET_ID } from '../store/bottomSheet/bottomSheet.reducer';
import { html } from 'lit-html';
import { DEFAULT_MIN_LAYER_UPDATE_INTERVAL_SECONDS } from '../domain/layer';
import { parseBoolean } from '../utils/urlUtils';

/**
 * This plugin does the following layer-related things:
 *
 * - initially set the layers from available query parameters or configuration
 *
 * - handle layer-related attribute changes of the public web component
 *
 * - manages visibility of UI components (settings, filter)
 *
 * @class
 * @extends BaPlugin
 * @author taulinger
 */
export class LayersPlugin extends BaPlugin {
	constructor() {
		super();
		const { TranslationService: translationService } = $injector.inject('TranslationService');
		this._translationService = translationService;
		this._bottomSheetFilterUiUnsubscribeFn = null;
		this._bottomSheetSettingsUiUnsubscribeFn = null;
	}

	_addLayersFromQueryParams(queryParams) {
		const { GeoResourceService: geoResourceService } = $injector.inject('GeoResourceService');

		const parseLayer = (
			layerValue,
			layerVisibilityValue,
			layerOpacityValue,
			layerTimestampValue,
			layerSwipeAlignmentValue,
			layerStyleValue,
			layerDisplayFeatureValue,
			layerFilterValue,
			layerUpdateIntervalValue
		) => {
			const layer = layerValue.split(',');
			const layerVisibility = layerVisibilityValue ? layerVisibilityValue.split(',') : [];
			const layerOpacity = layerOpacityValue ? layerOpacityValue.split(',') : [];
			const layerTimestamp = layerTimestampValue ? layerTimestampValue.split(',') : [];
			const layerSwipeAlignment = layerSwipeAlignmentValue ? layerSwipeAlignmentValue.split(',') : [];
			const layerStyle = layerStyleValue ? layerStyleValue.split(',') : [];
			const layerDisplayFeature = layerDisplayFeatureValue ? layerDisplayFeatureValue.split(',') : [];
			const layerFilter = layerFilterValue ? layerFilterValue.split(',') : [];
			const layerUpdateInterval = layerUpdateIntervalValue ? layerUpdateIntervalValue.split(',') : [];

			/**
			 * parseLayer() is called not only initially at application startup time but also dynamically during runtime.
			 * So we have to ensure that a layer ID is created reproducible.
			 * We do this by referencing its GeoResource: layerId = geoResourceId + nth-Reference
			 */
			const geoResourceIds = [];
			const getGrReferenceIndexNumber = (geoResourceId) => {
				geoResourceIds.push(geoResourceId);
				return geoResourceIds.filter((v) => v === geoResourceId).length - 1;
			};
			return (
				layer
					.map((id, index) => {
						if (id) {
							const geoResource = geoResourceService.byId(id) ?? geoResourceService.asyncById(id);
							const layerId = `${id}_${getGrReferenceIndexNumber(id)}`;

							if (geoResource) {
								const atomicallyAddedLayer = { id: layerId, geoResourceId: geoResource.id, constraints: {} };

								if (layerVisibility[index] === 'false') {
									atomicallyAddedLayer.visible = false;
								}
								if (isFinite(layerOpacity[index]) && layerOpacity[index] >= 0 && layerOpacity[index] <= 1) {
									atomicallyAddedLayer.opacity = parseFloat(layerOpacity[index]);
								}
								if (!!layerTimestamp[index] && geoResource.timestamps.includes(layerTimestamp[index])) {
									atomicallyAddedLayer.timestamp = layerTimestamp[index];
								}
								if (Object.values(SwipeAlignment).includes(layerSwipeAlignment[index])) {
									atomicallyAddedLayer.constraints.swipeAlignment = layerSwipeAlignment[index];
								}
								if (isHexColor(`#${layerStyle[index]}`)) {
									const style = { baseColor: `#${layerStyle[index]}` };
									atomicallyAddedLayer.style = style;
								}
								atomicallyAddedLayer.constraints.displayFeatureLabels = parseBoolean(layerDisplayFeature[index]);
								if (isString(layerFilter[index]) && layerFilter[index].length) {
									atomicallyAddedLayer.constraints.filter = layerFilter[index];
								}
								if (isFinite(layerUpdateInterval[index]) && layerUpdateInterval[index] >= DEFAULT_MIN_LAYER_UPDATE_INTERVAL_SECONDS) {
									atomicallyAddedLayer.constraints.updateInterval = parseInt(layerUpdateInterval[index]);
								}

								return atomicallyAddedLayer;
							}
						}
					})
					//remove undefined 'layer'
					.filter((l) => !!l)
			);
		};

		const parsedLayers = parseLayer(
			queryParams.get(QueryParameters.LAYER),
			queryParams.get(QueryParameters.LAYER_VISIBILITY),
			queryParams.get(QueryParameters.LAYER_OPACITY),
			queryParams.get(QueryParameters.LAYER_TIMESTAMP),
			queryParams.get(QueryParameters.LAYER_SWIPE_ALIGNMENT),
			queryParams.get(QueryParameters.LAYER_STYLE),
			queryParams.get(QueryParameters.LAYER_DISPLAY_FEATURE_LABELS),
			queryParams.get(QueryParameters.LAYER_FILTER),
			queryParams.get(QueryParameters.LAYER_UPDATE_INTERVAL)
		);
		const zteIndex = parseInt(queryParams.get(QueryParameters.ZOOM_TO_EXTENT));
		const zoomToExtentLayerIndex = isNumber(zteIndex) ? zteIndex : -1;

		removeAndSetLayers(parsedLayers, true);

		parsedLayers.forEach((l, index) => {
			if (index === zoomToExtentLayerIndex) {
				setTimeout(() => {
					fitLayer(l.id);
				});
			}
		});
	}

	_addLayersFromConfig() {
		const {
			GeoResourceService: georesourceService,
			TopicsService: topicsService,
			StoreService: storeService
		} = $injector.inject('GeoResourceService', 'TopicsService', 'StoreService');

		const getDefaultBaseGeoR = () => {
			const {
				topics: { current }
			} = storeService.getStore().getState();
			//we take the bg layer from the topic configuration
			const { defaultBaseGeoR } = topicsService.byId(current) || topicsService.default();
			return this._replaceForRetinaDisplays(defaultBaseGeoR);
		};

		const defaultBaseGeoR = getDefaultBaseGeoR();

		const geoResources = georesourceService.all();

		const bgGeoresources = geoResources.filter((geoResource) => geoResource.id === defaultBaseGeoR);
		//fallback: add the first available GeoResource as bg
		if (bgGeoresources.length === 0) {
			bgGeoresources.push(geoResources[0]);
		}
		addLayer(bgGeoresources[0].id);
	}

	/**
	 * Initializes the GeoResourceService and adds layers to the list of layers in the store
	 */
	async _init(store) {
		const { GeoResourceService: geoResourceService, EnvironmentService: environmentService } = $injector.inject(
			'GeoResourceService',
			'EnvironmentService'
		);

		const queryParams = environmentService.getQueryParams();

		//no try-catch needed, service at least delivers a fallback
		await geoResourceService.init();
		//mark the layers state as ready
		setReady();

		//from query params
		if (queryParams.has(QueryParameters.LAYER)) {
			this._addLayersFromQueryParams(queryParams);
		}
		//from config
		else {
			this._addLayersFromConfig();
		}

		/**
		 * Layer UI handling
		 */
		const onFilterUiActivityChanged = (layerId) => {
			this._bottomSheetFilterUiUnsubscribeFn?.();
			if (layerId) {
				// register an observer which updates the activeFilterUI property after the BottomSheet was closed by the user
				this._bottomSheetFilterUiUnsubscribeFn = observe(
					store,
					(state) => state.bottomSheet.active,
					(activeIds) => {
						if (!activeIds.includes(LAYER_FILTER_BOTTOM_SHEET_ID)) {
							closeLayerFilterUI();
						}
					}
				);
				closeLayerSettingsUI();
				openBottomSheet(html`<ba-oaf-mask .layerId=${layerId}></ba-oaf-mask>`, LAYER_FILTER_BOTTOM_SHEET_ID);
			} else {
				closeBottomSheet(LAYER_FILTER_BOTTOM_SHEET_ID);
			}
		};

		const onSettingsUiActivityChanged = (layerId) => {
			this._bottomSheetSettingsUiUnsubscribeFn?.();
			if (layerId) {
				// register an observer which updates the activeSettingUiForId property after the BottomSheet was closed by the user
				this._bottomSheetSettingsUiUnsubscribeFn = observe(
					store,
					(state) => state.bottomSheet.active,
					(activeIds) => {
						if (!activeIds.includes(LAYER_SETTINGS_BOTTOM_SHEET_ID)) {
							closeLayerSettingsUI();
						}
					}
				);
				closeLayerFilterUI();
				openBottomSheet(html`<ba-layer-settings .layerId=${layerId}></ba-layer-settings>`, LAYER_SETTINGS_BOTTOM_SHEET_ID);
			} else {
				closeBottomSheet(LAYER_SETTINGS_BOTTOM_SHEET_ID);
			}
		};

		const onLayerRemoved = (layerRemoveEvent, state) => {
			if (layerRemoveEvent.payload.includes(state.layers.activeFilterUI)) {
				closeLayerFilterUI();
			}
			if (layerRemoveEvent.payload.includes(state.layers.activeSettingsUI)) {
				closeLayerSettingsUI();
			}
		};

		observe(store, (state) => state.layers.activeFilterUI, onFilterUiActivityChanged);
		observe(store, (state) => state.layers.activeSettingsUI, onSettingsUiActivityChanged);
		observe(store, (state) => state.layers.removed, onLayerRemoved);
	}

	/**
	 * Current strategy to replace the default raster GeoResource with its VT pendant.
	 * @param {string} baseGeoRId
	 * @returns the id of the determined VTGeoResource or the unchanged argument
	 */
	_replaceForRetinaDisplays(baseGeoRId) {
		const {
			EnvironmentService: environmentService,
			TopicsService: topicsService,
			StoreService: storeService
		} = $injector.inject('EnvironmentService', 'TopicsService', 'StoreService');

		if (environmentService.isRetinaDisplay()) {
			const {
				topics: { current }
			} = storeService.getStore().getState();
			const defaultBaseGeoResourceRetina =
				topicsService.byId(current)?.defaultBaseGeoRHiRes ?? topicsService.default()?.defaultBaseGeoRHiRes;
			const defaultBaseGeoR = topicsService.byId(current)?.defaultBaseGeoR ?? topicsService.default()?.defaultBaseGeoR;
			if (defaultBaseGeoResourceRetina && defaultBaseGeoR === baseGeoRId) {
				return defaultBaseGeoResourceRetina;
			}
		}
		return baseGeoRId;
	}

	/**
	 * @override
	 */
	async register(store) {
		return await this._init(store);
	}
}
