import { $injector } from '../injection';
import { addLayer } from '../store/layers/layers.action';
import { emitNotification, LevelTypes } from '../store/notifications/notifications.action';
import { observe } from '../utils/storeUtils';
import { provide as provider } from './i18n/importPlugin.provider';
import { BaPlugin } from './BaPlugin';

/**
 * @class
 * @author thiloSchlemmer
 */
export class ImportPlugin extends BaPlugin {
	constructor() {
		super();
		const { ImportService: importService, SourceTypeService: sourceTypeService, TranslationService: translationService } = $injector.inject('ImportService', 'SourceTypeService', 'TranslationService');
		this._importService = importService;
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
			try {
				const importByUrl = (url) => {
					const sourceType = this._sourceTypeService.forURL(url);
					const vectorGeoResource = this._importService.importVectorDataFromUrl(url, { sourceType: sourceType });
					vectorGeoResource.onReject(() => emitNotification(`${this._translationService.translate('importPlugin_url_failed')}:${url}`, LevelTypes.ERROR));
					return vectorGeoResource;
				};
				const importByData = (data, mimeType) => {
					const sourceType = this._sourceTypeService.forData(data, mimeType);
					const vectorGeoResource = this._importService.importVectorData(latestImport.data, { sourceType: sourceType });
					if (vectorGeoResource) {
						return vectorGeoResource;
					}
					emitNotification(this._translationService.translate('importPlugin_data_failed'), LevelTypes.ERROR);
				};

				const vectorGeoResource = latestImport.url ? importByUrl(latestImport.url) : importByData(latestImport.data, latestImport.mimeType);

				const { id, label } = vectorGeoResource;
				addLayer(id, { label: label });
			}
			catch (error) {
				emitNotification(error, LevelTypes.ERROR);
			}


		};

		observe(store, state => state.import.latest, onChange);

	}
}
