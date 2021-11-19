import { $injector } from '../injection';
import { VectorGeoResource, VectorSourceType } from '../services/domain/geoResources';
import { QueryParameters } from '../services/domain/queryParameters';
import { FileStorageServiceDataTypes } from '../services/FileStorageService';
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

	_newLabelUpdateHandler(id) {
		return {
			set: function (target, prop, value) {
				if (prop === '_label') {
					modifyLayer(id, { label: value });
				}
				return Reflect.set(...arguments);
			}
		};
	}

	async _getFileId(id) {
		const { FileStorageService: fileStorageService }
			= $injector.inject('FileStorageService');

		if (fileStorageService.isAdminId(id)) {
			return fileStorageService.getFileId(id);
		}
		else if (fileStorageService.isFileId(id)) {
			return id;
		}
		throw new Error(`${id} is not a valid fileId or adminId`);
	}

	_newVectorGeoResourceLoader(id) {
		const { FileStorageService: fileStorageService }
			= $injector.inject('FileStorageService');

		return async () => {

			const fileId = await this._getFileId(id);
			const { data, type, srid } = await fileStorageService.get(fileId);
			if (type === FileStorageServiceDataTypes.KML) {
				return {
					sourceType: VectorSourceType.KML,
					data: data,
					srid: srid
				};
			}
			throw new Error('No VectorGeoResourceLoader available for ' + type);
		};
	}

	_registerUnkownGeoResource(id) {
		const {
			GeoResourceService: geoResourceService,
			TranslationService: translationService
		}
			= $injector.inject('GeoResourceService', 'TranslationService');

		if (!geoResourceService.byId(id)) {

			//no source type here, we let the loader decide which kind of source we are loading
			const vgr = new VectorGeoResource(id, translationService.translate('layersPlugin_store_layer_default_layer_name'), null)
				.setLoader(this._newVectorGeoResourceLoader(id));
			/**
			 * The definitive label value will be extracted later from the source.
			 * Therefore we observe changes of the georesource's label property using a proxy and then update the layer
			 */
			const proxyVgr = new Proxy(vgr, this._newLabelUpdateHandler(id));
			//register georesource
			geoResourceService.addOrReplace(proxyVgr);
		}
		return id;
	}

	_addLayersFromQueryParams(queryParams) {
		const { GeoResourceService: geoResourceService } = $injector.inject('GeoResourceService');

		//layer
		const parseLayer = (layerValue, layerVisibilityValue, layerOpacityValue) => {

			//Todo: parse KML and WMS layer from query params like layerIdOrType||layerLabel||layerUrl||layerOptions
			const layer = layerValue.split(',');
			const layerVisibility = layerVisibilityValue ? layerVisibilityValue.split(',') : [];
			const layerOpacity = layerOpacityValue ? layerOpacityValue.split(',') : [];

			return layer
				.map(l => this._registerUnkownGeoResource(l))
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
