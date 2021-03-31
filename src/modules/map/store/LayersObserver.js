import { $injector } from '../../../injection';
import { QueryParameters } from '../../../services/domain/queryParameters';
import { BaStorePlugin } from '../../../store/BaStorePlugin';
import { addLayer } from './layers.action';


export class LayersObserver extends BaStorePlugin {

	_addLayersFromQueryParams(queryParams) {
		const { GeoResourceService: geoResourceService } = $injector.inject('GeoResourceService');

		//layer
		const parseLayer = (layerValue, layerVisibilityValue, layerOpacityValue) => {

			const layer = layerValue.split(',');
			const layerVisibility = layerVisibilityValue ? layerVisibilityValue.split(',') : [];
			const layerOpacity = layerOpacityValue ? layerOpacityValue.split(',') : [];

			return layer
				.map((l, i) => {
					const geoResource = geoResourceService.byId(l);
					if (geoResource) {
						const layerProperties = {};
						layerProperties.label = geoResource.label;

						if (layerVisibility[i] === 'false') {
							layerProperties.visible = false;
						}
						if (isFinite(layerOpacity[i]) && layerOpacity[i] >= 0 && layerOpacity[i] <= 1) {
							layerProperties.opacity = parseFloat(layerOpacity[i]);
						}

						return { id: l, layerProperties };
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
		//fallback
		if (parsedLayers.length === 0) {
			this._addLayersFromConfig();
		}
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
