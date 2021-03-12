import { $injector } from '../../../injection';
import { QueryParameters } from '../../../services/domain/queryParameters';
import { BaObserver } from '../../BaObserver';
import { addLayer } from './layers.action';


export class LayersObserver extends BaObserver {

	constructor() {
		super();
	}

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

		//Todo: bgLayerIds needs to be loaded from backend at a later moment
		const bgLayerIds = ['atkis'];
		const { GeoResourceService: georesourceService } = $injector.inject('GeoResourceService');
		const geoResources = georesourceService.all();

		const bgGeoresources = geoResources.filter(geoResource => geoResource.id === bgLayerIds[0]);
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

		//no try-catch needed, service at least delivers a fallback
		await geoResourceService.init();

		const queryParams = new URLSearchParams(environmentService.getWindow().location.search);

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
	register() {
		this._init();
	}
}
