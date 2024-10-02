/**
 * @module plugins/LayersPlugin
 */
import { $injector } from '../injection';
import { QueryParameters } from '../domain/queryParameters';
import { BaPlugin } from './BaPlugin';
import { addLayer, removeAndSetLayers, setReady } from '../store/layers/layers.action';
import { fitLayer } from '../store/position/position.action';
import { isNumber } from '../utils/checks';
import { observe } from '../utils/storeUtils';

/**
 * This plugin does the following layer-related things:
 *
 * - initially set the layers from available query parameters or configuration
 *
 * - handle layer-related attribute changes of the public web component
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
	}

	_addLayersFromQueryParams(queryParams) {
		const { GeoResourceService: geoResourceService } = $injector.inject('GeoResourceService');

		const parseLayer = (layerValue, layerVisibilityValue, layerOpacityValue, layerTimestampValue) => {
			const layer = layerValue.split(',');
			const layerVisibility = layerVisibilityValue ? layerVisibilityValue.split(',') : [];
			const layerOpacity = layerOpacityValue ? layerOpacityValue.split(',') : [];
			const layerTimestamp = layerTimestampValue ? layerTimestampValue.split(',') : [];

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
								const atomicallyAddedLayer = { id: layerId, geoResourceId: geoResource.id };

								if (layerVisibility[index] === 'false') {
									atomicallyAddedLayer.visible = false;
								}
								if (isFinite(layerOpacity[index]) && layerOpacity[index] >= 0 && layerOpacity[index] <= 1) {
									atomicallyAddedLayer.opacity = parseFloat(layerOpacity[index]);
								}
								if (!!layerTimestamp[index] && geoResource.timestamps.includes(layerTimestamp[index])) {
									atomicallyAddedLayer.timestamp = layerTimestamp[index];
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
			queryParams.get(QueryParameters.LAYER_TIMESTAMP)
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

		if (environmentService.isEmbeddedAsWC()) {
			// handle WC attribute changes
			observe(
				store,
				(state) => state.wcAttribute.changed,
				() => {
					this._addLayersFromQueryParams(environmentService.getQueryParams());
				}
			);
		}
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
			const baseGeoRs = topicsService.byId(current)?.baseGeoRs ?? topicsService.default()?.baseGeoRs;
			const { raster, vector } = baseGeoRs;
			if (Array.isArray(raster) && Array.isArray(vector) && raster.indexOf(baseGeoRId) === 0) {
				return vector[0];
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
