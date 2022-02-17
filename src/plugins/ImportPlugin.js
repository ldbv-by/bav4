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

		const onChange = (latestImport) => {
			const { payload: { url, data, mimeType } } = latestImport;
			try {
				const importByUrl = (url) => {
					const sourceType = this._sourceTypeService.forURL(url);
					const importByService = (url, sourceType) => {
						if (sourceType) {
							switch (sourceType.name) {
								case SourceTypeName.KML:
								case SourceTypeName.GPX:
								case SourceTypeName.GEOJSON:
									return this._importVectorDataService.importVectorDataFromUrl(url);
								default:
									emitNotification(`${this._translationService.translate('importPlugin_url_not_supported')}:${sourceType.name}`, LevelTypes.ERROR);
							}
						}
					};

					const geoResource = importByService(url, sourceType);
					geoResource.onReject(() => emitNotification(`${this._translationService.translate('importPlugin_url_failed')}:${url}`, LevelTypes.ERROR));
					return geoResource;
				};
				const importByData = (data, mimeType) => {
					const sourceType = this._mapMimeTypeToVectorSourceType(mimeType);
					const vectorGeoResource = this._importVectorDataService.importVectorData(data, { sourceType: sourceType });
					if (vectorGeoResource) {
						return vectorGeoResource;
					}
					emitNotification(this._translationService.translate('importPlugin_data_failed'), LevelTypes.ERROR);
				};

				const vectorGeoResource = url ? importByUrl(url) : importByData(data, mimeType);

				const { id, label } = vectorGeoResource;
				addLayer(id, { label: label });
			}
			catch (error) {
				emitNotification(error, LevelTypes.ERROR);
			}


		};

		observe(store, state => state.import.latest, onChange);

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
}
