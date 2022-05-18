import { $injector } from '../injection';
import { modifyLayer } from '../store/layers/layers.action';
import { createUniqueId } from '../utils/numberUtils';
import { GeoResourceFuture, observable, VectorGeoResource, VectorSourceType } from './domain/geoResources';
import { SourceType, SourceTypeName } from './domain/sourceType';

/**
 *
 * @typedef {Object} ImportVectorDataOptions
 * @property {string} [id] the id of the created VectorGeoResource. If not set, id will be created
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
		const { HttpService: httpService, GeoResourceService: geoResourceService, UrlService: urlService, TranslationService: translationService,
			SourceTypeService: sourceTypeService }
			= $injector.inject('HttpService', 'GeoResourceService', 'UrlService', 'TranslationService', 'SourceTypeService');
		this._httpService = httpService;
		this._geoResourceService = geoResourceService;
		this._urlService = urlService;
		this._translationService = translationService;
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
	* Imports vector data from an URL and returns a {@link GeoResourceFuture}.
	* The GeoResourceFuture is registered on the {@link GeoResourceService}.
	* @param {string} url
	* @param {ImportVectorDataOptions} [options]
	* @returns VectorGeoresource  or `null` when given source type is not supported
	*/
	forUrl(url, options = {}) {
		const { id, label, sourceType } = { ...this._newDefaultImportVectorDataOptions(), ...options };

		// check if optional sourceType is supported
		if (sourceType && !this._mapSourceTypeToVectorSourceType(sourceType)) {
			console.warn(`SourceType '${sourceType}' for '${id}' is not supported`);
			return null;
		}

		const loader = async id => {

			const proxyfiedUrl = this._urlService.proxifyInstant(url);
			const result = await this._httpService.get(proxyfiedUrl);

			if (result.ok) {
				const data = await result.text();
				/**
				 * Although we think we already know the source type, we let the SourceTypeService analyze the data
				 * and derive the final source type. They might not be what they pretend to be ...
				 **/
				const resultingSourceType = this._mapSourceTypeToVectorSourceType(this._sourceTypeService.forData(data).sourceType);
				if (resultingSourceType) {
					const vgr = observable(new VectorGeoResource(id, label ?? this._translationService.translate('layersPlugin_store_layer_default_layer_name_vector'), resultingSourceType),
						(prop, value) => {
							if (prop === '_label') {
								modifyLayer(id, { label: value });
							}
						});
					vgr.setSource(data, 4326 /**valid for kml, gpx an geoJson**/);
					return vgr;
				}
				throw new Error(`GeoResource for '${url}' could not be loaded: SourceType could not be detected`);
			}
			throw new Error(`GeoResource for '${url}' could not be loaded: Http-Status ${result.status}`);
		};

		const geoResource = new GeoResourceFuture(id, loader, label ?? this._translationService.translate('layersPlugin_store_layer_default_layer_name_future'));
		this._geoResourceService.addOrReplace(geoResource);
		return geoResource;
	}

	/**
	 * Creates a {@link VectorGeoresource} containing the given data.
	 * The VectorGeoresource is registered on the {@link GeoResourceService}.
	 * @param {string} data
	 * @param {ImportVectorDataOptions} [options]
	 * @returns VectorGeoresource or `null` when no VectorGeoresource could be created
	 */
	forData(data, options) {
		const { id, label, sourceType } = { ...this._newDefaultImportVectorDataOptions(), ...options };

		const resultingSourceType = this._mapSourceTypeToVectorSourceType(sourceType) ?? this._mapSourceTypeToVectorSourceType(this._sourceTypeService.forData(data));
		if (resultingSourceType) {
			const vgr = observable(new VectorGeoResource(id, label ?? this._translationService.translate('layersPlugin_store_layer_default_layer_name_vector'), resultingSourceType), (prop, value) => {
				if (prop === '_label') {
					modifyLayer(id, { label: value });
				}
			});
			vgr.setSource(data, 4326 /**valid for kml, gpx an geoJson**/);
			this._geoResourceService.addOrReplace(vgr);
			return vgr;
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
				}
			}
			// is it a VectorSourceType enum value?
			else if (Object.entries(VectorSourceType).map(arr => arr[1]).includes(sourceType)) {
				return sourceType;
			}
		}
		return null;
	}
}

