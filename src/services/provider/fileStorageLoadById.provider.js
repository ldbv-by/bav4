import { $injector } from '../../injection';
import { VectorGeoResource, VectorSourceType } from '../domain/geoResources';
import { FileStorageServiceDataTypes } from '../FileStorageService';
import { modifyLayer } from '../../store/layers/layers.action';


export const _newVectorGeoResourceLoader = id => {
	const { FileStorageService: fileStorageService }
		= $injector.inject('FileStorageService');

	return async () => {

		try {
			const fileId = await fileStorageService.getFileId(id);
			const { data, type, srid } = await fileStorageService.get(fileId);

			if (type === FileStorageServiceDataTypes.KML) {
				return {
					sourceType: VectorSourceType.KML,
					data: data,
					srid: srid
				};
			}
			throw new Error(`No VectorGeoResourceLoader available for unsupported type '${type}'`);
		}
		catch (e) {
			throw new Error(`Could not load vector data for id '${id}': ${e}`);
		}
	};
};

export const _newLabelUpdateHandler = id => {
	return {
		set: function (target, prop, value) {
			if (prop === '_label') {
				modifyLayer(id, { label: value });
			}
			return Reflect.set(...arguments);
		}
	};
};

/**
 * Uses the BVV FileStorage endpoint to load a GeoResource by id
 * @function
 * @implements geoResourceByIdProvider
 * @returns {Promise<GeoResource|null>}
 */
export const loadBvvFileStorageResourceById = async id => {

	const { FileStorageService: fileStorageService, TranslationService: translationService }
		= $injector.inject('FileStorageService', 'TranslationService');

	if (fileStorageService.isAdminId(id) || fileStorageService.isFileId(id)) {
		//no source type here, we let the loader decide which kind of source we are loading
		const vgr = new VectorGeoResource(id, translationService.translate('layersPlugin_store_layer_default_layer_name'), null)
			.setLoader(_newVectorGeoResourceLoader(id));
		/**
		 * The definitive label value will be extracted later from the source.
		 * Therefore we observe changes of the georesource's label property using a proxy and then update the layer
		 */
		const proxyVgr = new Proxy(vgr, _newLabelUpdateHandler(id));
		return proxyVgr;
	}
	return null;
};

