import { $injector } from '../injection';
import { modifyLayer } from '../store/layers/layers.action';
import { createUniqueId } from '../utils/numberUtils';
import { GeoResourceFuture, observable, VectorGeoResource } from './domain/geoResources';
import { detectVectorSourceType } from './provider/vectorSourceType.provider';

/**
* Service for importing data. Usually returns a {@link GeoResouce}.
* @class
* @author taulinger
*/
export class ImportService {

	constructor(vectorSourceTypeProvider = detectVectorSourceType) {
		const { HttpService: httpService, GeoResourceService: geoResourceService, UrlService: urlService, TranslationService: translationService }
            = $injector.inject('HttpService', 'GeoResourceService', 'UrlService', 'TranslationService');
		this._httpService = httpService;
		this._geoResourceService = geoResourceService;
		this._urlService = urlService;
		this._translationService = translationService;
		this._vectorSourceTypeProvider = vectorSourceTypeProvider;
	}

	/**
    * Returns default vector data import options.
    * @returns VectorDataImportOptions
    */
	_newDefaultImportVectorDataOptions() {
		return {
			id: createUniqueId().toString(),
			label: null,
			sourceType: null,
			detectVectorSourceTypeFunction: this._vectorSourceTypeProvider
		};
	}

	/**
    * Imports vector data from an URL and returns a {@link GeoResourceFuture}.
    * The GeoResourceFuture is registered on the {@link GeoResourceService}.
    * @param {string} url
    * @param {VectorDataImportOptions} [options]
    * @returns VectorGeoresouce
    */
	importVectorDataFromUrl(url, options = {}) {
		const { id, label, sourceType, detectVectorSourceTypeFunction } = { ...this._newDefaultImportVectorDataOptions(), ...options };
		const { HttpService: httpService, GeoResourceService: geoResourceService, UrlService: urlService, TranslationService: translationService }
            = $injector.inject('HttpService', 'GeoResourceService', 'UrlService', 'TranslationService');

		const loader = async id => {

			const proxyfiedUrl = urlService.proxifyInstant(url);

			const result = await httpService.get(proxyfiedUrl);

			if (result.ok) {
				const data = await result.text();
				const resultingSourceType = sourceType ?? detectVectorSourceTypeFunction(data, result.headers.get('Content-Type'));
				if (resultingSourceType) {
					const vgr = observable(new VectorGeoResource(id, label ?? translationService.translate('layersPlugin_store_layer_default_layer_name_vector'), resultingSourceType),
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

		const geoResource = new GeoResourceFuture(id, loader, label ?? translationService.translate('layersPlugin_store_layer_default_layer_name_future'));
		geoResourceService.addOrReplace(geoResource);
		return geoResource;
	}

	/**
     * Creates a {@link VectorGeoresouce} containing the given data.
     * The VectorGeoresouce is registered on the {@link GeoResourceService}.
     * @param {string} data
     * @param {VectorDataImportOptions} [options]
     * @returns VectorGeoresouce or `null` when no VectorGeoresouce could be created
     */
	importVectorData(data, options) {
		const { id, label, sourceType, detectVectorSourceTypeFunction } = { ...this._newDefaultImportVectorDataOptions(), ...options };
		const { GeoResourceService: geoResourceService, TranslationService: translationService }
            = $injector.inject('GeoResourceService', 'TranslationService');

		const resultingSourceType = sourceType ?? detectVectorSourceTypeFunction(data);
		if (resultingSourceType) {
			const vgr = observable(new VectorGeoResource(id, label ?? translationService.translate('layersPlugin_store_layer_default_layer_name_vector'), resultingSourceType), (prop, value) => {
				if (prop === '_label') {
					modifyLayer(id, { label: value });
				}
			});
			vgr.setSource(data, 4326 /**valid for kml, gpx an geoJson**/);
			geoResourceService.addOrReplace(vgr);
			return vgr;
		}
		console.warn(`SourceType for '${id}' could not be detected`);
		return null;
	}
}

