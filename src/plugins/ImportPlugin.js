import { $injector } from '../injection';
import { addLayer } from '../store/layers/layers.action';
import { emitNotification, LevelTypes } from '../store/notifications/notifications.action';
import { VectorSourceType } from '../services/domain/geoResources';
import { observe } from '../utils/storeUtils';
import { provide as provider } from './i18n/importPlugin.provider';
import { BaPlugin } from './BaPlugin';
import { MediaType } from '../services/HttpService';
import { SourceTypeName } from '../services/SourceTypeService';

/**
 * @class
 * @author thiloSchlemmer
 * @author taulinger
 */
export class ImportPlugin extends BaPlugin {
	constructor() {
		super();
		const { ImportVectorDataService: importVectorDataService, SourceTypeService: sourceTypeService, TranslationService: translationService } = $injector.inject('ImportVectorDataService', 'SourceTypeService', 'TranslationService');
		this._importVectorDataService = importVectorDataService;
		this._sourceTypeService = sourceTypeService;
		this._translationService = translationService;
		translationService.register('importPluginProvider', provider);
	}

	/**
	 * @override
	 * @param {Store} store
	 */
	async register(store) {

		const onChange = async (latestImport) => {
			const { payload: { url, data, mimeType } } = latestImport;

			const geoResource = url ? await this._importByUrl(url) : this._importByData(data, mimeType);
			if (geoResource) {
				const { id, label } = geoResource;
				addLayer(id, { label: label });
			}
		};

		observe(store, state => state.import.latest, onChange);
	}

	/**
	 * Imports the data as remote {@link GeoResource}
	 * @param {string} url the url to the data
	 * @returns {Promise<GeoResource>} the imported GeoResource
	 */
	async _importByUrl(url) {
		const createGeoResource = (url, sourceType) => {
			if (sourceType) {
				switch (sourceType.name) {
					case SourceTypeName.KML:
					case SourceTypeName.GPX:
					case SourceTypeName.GEOJSON:
						return this._importVectorDataService.importVectorDataFromUrl(url, { sourceType: this._mapSourceTypeToVectorSourceType(sourceType) });
				}
			}
			emitNotification(`${this._translationService.translate('importPlugin_unsupported_sourceType')}`, LevelTypes.WARN);
			return null;
		};

		try {
			const sourceType = await this._sourceTypeService.forUrl(url);
			const geoResource = createGeoResource(url, sourceType);
			if (geoResource) {
				geoResource.onReject(() => {
					emitNotification(this._translationService.translate('importPlugin_url_failed'), LevelTypes.ERROR);
				});
				return geoResource;
			}
		}
		catch (error) {
			console.warn(error);
			emitNotification(this._translationService.translate('importPlugin_url_failed'), LevelTypes.ERROR);
		}

		return null;
	}

	/**
	  * Imports the data as local {@link GeoResource}
	  * @param {string} data the local data
	  * @param {string} mimeType the mimeType of the data
	  * @returns {GeoResource|null} the imported GeoResource or null on failure
	  */
	_importByData(data, mimeType) {
		const sourceType = this._mapMimeTypeToVectorSourceType(mimeType);
		const vectorGeoResource = this._importVectorDataService.importVectorData(data, { sourceType: sourceType });
		if (vectorGeoResource) {
			return vectorGeoResource;
		}
		emitNotification(this._translationService.translate('importPlugin_data_failed'), LevelTypes.ERROR);
		return null;
	}

	/**
	  * Maps a mimeType as {@link MediaType} to a {@link VectorSourceType}
	*/
	_mapMimeTypeToVectorSourceType(mimeType) {
		switch (mimeType) {
			case MediaType.GPX:
				return VectorSourceType.GPX;
			case MediaType.GeoJSON:
				return VectorSourceType.GEOJSON;
			case MediaType.KML:
				return VectorSourceType.KML;
			default:
				return null;
		}
	}

	/**
	  * Maps a {@link SourceType} to a {@link VectorSourceType}
	*/
	_mapSourceTypeToVectorSourceType(sourceType) {
		if (sourceType) {
			switch (sourceType.name) {
				case SourceTypeName.GEOJSON:
					return VectorSourceType.GEOJSON;
				case SourceTypeName.GPX:
					return VectorSourceType.GPX;
				case SourceTypeName.KML:
					return VectorSourceType.KML;
			}
		}
		return null;
	}
}
