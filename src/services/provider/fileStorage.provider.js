import { $injector } from '../../injection';
import { GeoResourceFuture, VectorGeoResource, VectorSourceType } from '../domain/geoResources';
import { FileStorageServiceDataTypes } from '../FileStorageService';

export const _newLoader = id => {

	return async () => {

		const { FileStorageService: fileStorageService, TranslationService: translationService }
			= $injector.inject('FileStorageService', 'TranslationService');

		try {
			const fileId = await fileStorageService.getFileId(id);
			const { data, type, srid } = await fileStorageService.get(fileId);

			if (type === FileStorageServiceDataTypes.KML) {
				const vgr = new VectorGeoResource(id, translationService.translate('layersPlugin_store_layer_default_layer_name_vector'), VectorSourceType.KML);
				vgr.setSource(data, srid);
				return vgr;
			}
			throw new Error(`Unsupported FileStorageServiceDataType '${type}'`);
		}
		catch (e) {
			throw new Error(`Could not load vector data for id '${id}': ${e.message}`);
		}
	};
};
/**
 * Uses the BVV endpoint to load a GeoResource from the FileStorage.
 * @function
 * @implements geoResourceByIdProvider
 * @returns {GeoResourceFuture|null}
 */
export const loadBvvFileStorageResourceById = id => {

	const { FileStorageService: fileStorageService, TranslationService: translationService }
		= $injector.inject('FileStorageService', 'TranslationService');

	if (fileStorageService.isAdminId(id) || fileStorageService.isFileId(id)) {

		return new GeoResourceFuture(id, _newLoader(id), translationService.translate('layersPlugin_store_layer_default_layer_name_future'));
	}
	return null;
};
