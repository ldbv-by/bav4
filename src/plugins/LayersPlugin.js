import { $injector } from '../injection';
import { GeoResourceTypes } from '../services/domain/geoResources';
import { QueryParameters } from '../services/domain/queryParameters';
import { BaPlugin } from './BaPlugin';
import { addLayer, modifyLayer, setReady } from '../store/layers/layers.action';
import { provide as provider } from './i18n/layersPlugin.provider';

/**
 * @class
 * @author taulinger
 */
export class LayersPlugin extends BaPlugin {

	constructor() {
		super();
		const { TranslationService: translationService } = $injector.inject('TranslationService');
		this._translationService = translationService;
		translationService.register('layersPluginProvider', provider);
	}

	_addLayersFromQueryParams(queryParams) {
		const { GeoResourceService: geoResourceService } = $injector.inject('GeoResourceService');

		const parseLayer = (layerValue, layerVisibilityValue, layerOpacityValue) => {

			//Todo: parse KML and WMS layer from query params like layerIdOrType||layerLabel||layerUrl||layerOptions
			const layer = layerValue.split(',');
			const layerVisibility = layerVisibilityValue ? layerVisibilityValue.split(',') : [];
			const layerOpacity = layerOpacityValue ? layerOpacityValue.split(',') : [];

			return layer
				.map((layerId, index) => {
					if (layerId) {

						const geoResource = geoResourceService.byId(layerId) ?? geoResourceService.asyncById(layerId);

						if (geoResource) {
							//if we have a GeoResource future, we update the label property after we know it
							if (geoResource.getType() === GeoResourceTypes.FUTURE) {
								geoResource.onResolve((geoResource) => {
									modifyLayer(layerId, { label: geoResource.label });
								});
							}

							const layerProperties = {};
							layerProperties.label = geoResource.label;

							if (layerVisibility[index] === 'false') {
								layerProperties.visible = false;
							}
							if (isFinite(layerOpacity[index]) && layerOpacity[index] >= 0 && layerOpacity[index] <= 1) {
								layerProperties.opacity = parseFloat(layerOpacity[index]);
							}

							return { id: layerId, layerProperties };
						}
					}
				})
				//remove undefined 'layer'
				.filter(l => !!l);
		};

		const parsedLayers = parseLayer(
			queryParams.get(QueryParameters.LAYER),
			queryParams.get(QueryParameters.LAYER_VISIBILITY),
			queryParams.get(QueryParameters.LAYER_OPACITY)
		);
		parsedLayers.forEach(l => {
			addLayer(l.id, l.layerProperties);
		});
	}

	_addLayersFromConfig() {

		const { GeoResourceService: georesourceService, TopicsService: topicsService, StoreService: storeService }
			= $injector.inject('GeoResourceService', 'TopicsService', 'StoreService');

		//we take the bg layer from the topic configuration
		const { topics: { current } } = storeService.getStore().getState();
		const { defaultBaseGeoR } = topicsService.byId(current) || topicsService.default();

		const geoResources = georesourceService.all();

		const bgGeoresources = geoResources.filter(geoResource => geoResource.id === defaultBaseGeoR);
		//fallback: add the first available georesource as bg
		if (bgGeoresources.length === 0) {
			bgGeoresources.push(geoResources[0]);
		}
		addLayer(bgGeoresources[0].id, { label: bgGeoresources[0].label });
	}

	/**
	 * Initializes the georesource service and adds layers to the list of layers in the store
	 */
	async _init() {

		const { GeoResourceService: geoResourceService, EnvironmentService: environmentService }
			= $injector.inject('GeoResourceService', 'EnvironmentService');

		const queryParams = new URLSearchParams(environmentService.getWindow().location.search);

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
	}

	/**
	 * @override
	 */
	async register() {
		return await this._init();
	}
}
