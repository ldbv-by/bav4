/**
 * @module services/provider/fileStorage_provider
 */
import { $injector } from '../../injection';
import { GeoResourceFuture, VectorGeoResource, VectorSourceType } from '../../domain/geoResources';
import { FileStorageServiceDataTypes } from '../FileStorageService';
import { getAttributionForLocallyImportedOrCreatedGeoResource } from './attribution.provider';
import { UnavailableGeoResourceError } from '../../domain/errors';

export const _newLoader = (id) => {
	return async () => {
		const { FileStorageService: fileStorageService } = $injector.inject('FileStorageService');

		try {
			const fileId = await fileStorageService.getFileId(id);
			const { data, type, srid } = await fileStorageService.get(fileId);

			if (type === FileStorageServiceDataTypes.KML) {
				const vgr = new VectorGeoResource(id, null /**will be read from the KML */, VectorSourceType.KML)
					.setSource(data, srid)
					.setAttributionProvider(getAttributionForLocallyImportedOrCreatedGeoResource);
				return vgr;
			}
			throw new UnavailableGeoResourceError(`Unsupported FileStorageServiceDataType '${type}'`, id);
		} catch (e) {
			if (e instanceof UnavailableGeoResourceError) {
				throw e;
			}
			throw new UnavailableGeoResourceError(`Could not load vector data for id '${id}'`, id, null, { cause: e });
		}
	};
};
/**
 * Uses the BVV endpoint to load a GeoResource from the FileStorage.
 * @function
 * @implements {module:services/GeoResourceService~geoResourceByIdProvider}
 * @returns {GeoResourceFuture|null}
 */
export const loadBvvFileStorageResourceById = (id) => {
	const { FileStorageService: fileStorageService } = $injector.inject('FileStorageService');

	if (fileStorageService.isAdminId(id) || fileStorageService.isFileId(id)) {
		return new GeoResourceFuture(id, _newLoader(id));
	}
	return null;
};
