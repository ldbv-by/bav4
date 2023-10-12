/**
 * @module services/ImportVectorDataService
 */
import { $injector } from '../injection';
import { createUniqueId } from '../utils/numberUtils';
import { GeoResourceFuture, VectorGeoResource, VectorSourceType } from '../domain/geoResources';
import { SourceType, SourceTypeName } from './../domain/sourceType';
import {
	getAttributionForLocallyImportedOrCreatedGeoResource,
	getAttributionProviderForGeoResourceImportedByUrl
} from './provider/attribution.provider';

/**
 *
 * @typedef {Object} ImportVectorDataOptions
 * @property {string} [id] the ID of the created VectorGeoResource. If not set, id will be created. If the VectorGeoResource is imported from a URL, the URL will always be taken as the ID.
 * @property {string} [label] the label of the created VectorGeoResource
 * @property {SourceType|VectorSourceType} [sourceType] the source type. Can be either a SourceType or a VectorSourceType instance. If not set it will be tried to detect it
 */

/**
 * Service for importing data. Usually returns a {@link GeoResource}.
 * @class
 * @author taulinger
 */
export class ImportVectorDataService {
	constructor() {
		const {
			HttpService: httpService,
			GeoResourceService: geoResourceService,
			UrlService: urlService,
			SourceTypeService: sourceTypeService
		} = $injector.inject('HttpService', 'GeoResourceService', 'UrlService', 'SourceTypeService');
		this._httpService = httpService;
		this._geoResourceService = geoResourceService;
		this._urlService = urlService;
		this._sourceTypeService = sourceTypeService;
	}

	/**
	 * Returns default vector data import options.
	 * @returns ImportVectorDataOptions
	 */
	_newDefaultImportVectorDataOptions() {
		return {
			id: createUniqueId().toString(),
			label: null,
			sourceType: null
		};
	}

	/**
	 * Imports vector data from a URL and returns a {@link GeoResourceFuture}.
	 * The GeoResourceFuture is registered on the {@link GeoResourceService}.
	 * @param {string} url
	 * @param {ImportVectorDataOptions} [options]
	 * @returns GeoResourceFuture or `null` when given source type is not supported
	 */
	forUrl(url, options = {}) {
		const { id, label, sourceType } = { ...this._newDefaultImportVectorDataOptions(), ...options, ...{ id: url } };

		// check if optional sourceType is supported
		if (sourceType && !this._mapSourceTypeToVectorSourceType(sourceType)) {
			console.warn(`SourceType '${sourceType}' for '${id}' is not supported`);
			return null;
		}

		const loader = async (id) => {
			const proxyfiedUrl = this._urlService.proxifyInstant(url);
			const result = await this._httpService.get(proxyfiedUrl, { timeout: 5000 });

			if (result.ok) {
				const data = await result.text();
				/**
				 * Although we think we already know the source type, we let the SourceTypeService analyze the data
				 * and derive the final source type. They might not be what they pretend to be ...
				 **/
				const resultingSourceType = this._sourceTypeService.forData(data).sourceType;
				const vectorSourceType = this._mapSourceTypeToVectorSourceType(resultingSourceType);
				if (resultingSourceType) {
					const vgr = new VectorGeoResource(id, label, vectorSourceType)
						.setSource(data, resultingSourceType.srid ?? 4326 /**valid for kml, gpx and geoJson**/)
						.setAttributionProvider(getAttributionProviderForGeoResourceImportedByUrl(url));
					return vgr;
				}
				throw new Error(`GeoResource for '${url}' could not be loaded: SourceType could not be detected`);
			}
			throw new Error(`GeoResource for '${url}' could not be loaded: Http-Status ${result.status}`);
		};

		const geoResource = new GeoResourceFuture(id, loader);
		return this._geoResourceService.addOrReplace(geoResource);
	}

	/**
	 * Creates a {@link VectorGeoresource} containing the given data.
	 * The VectorGeoresource is registered on the {@link GeoResourceService}.
	 * @param {string} data
	 * @param {ImportVectorDataOptions} [options]
	 * @returns VectorGeoResource or `null` when no VectorGeoResource could be created
	 */
	forData(data, options) {
		const { id, label, sourceType } = { ...this._newDefaultImportVectorDataOptions(), ...options };

		const resultingSourceType = sourceType ?? this._sourceTypeService.forData(data).sourceType;
		const vectorSourceType = this._mapSourceTypeToVectorSourceType(resultingSourceType);
		if (resultingSourceType) {
			const vgr = new VectorGeoResource(id, label, vectorSourceType)
				.setSource(data, resultingSourceType.srid ?? 4326 /**valid for kml, gpx and geoJson**/)
				.setAttributionProvider(getAttributionForLocallyImportedOrCreatedGeoResource)
				.setHidden(true);
			return this._geoResourceService.addOrReplace(vgr);
		}
		console.warn(`SourceType for '${id}' could not be detected`);
		return null;
	}

	/**
	 * Maps a {@link SourceType} to a {@link VectorSourceType}
	 */
	_mapSourceTypeToVectorSourceType(sourceType) {
		if (sourceType) {
			// is it a SourceType instance?
			if (sourceType instanceof SourceType) {
				switch (sourceType.name) {
					case SourceTypeName.KML:
						return VectorSourceType.KML;

					case SourceTypeName.GPX:
						return VectorSourceType.GPX;

					case SourceTypeName.GEOJSON:
						return VectorSourceType.GEOJSON;

					case SourceTypeName.EWKT:
						return VectorSourceType.EWKT;
				}
			}
			// is it a VectorSourceType enum value?
			else if (
				Object.entries(VectorSourceType)
					.map((arr) => arr[1])
					.includes(sourceType)
			) {
				return sourceType;
			}
		}
		return null;
	}
}
