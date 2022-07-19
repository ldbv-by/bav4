import { $injector } from '../injection';
import { addLayer } from '../store/layers/layers.action';
import { emitNotification, LevelTypes } from '../store/notifications/notifications.action';
import { observe } from '../utils/storeUtils';
import { provide as provider } from './i18n/importPlugin.provider';
import { BaPlugin } from './BaPlugin';
import { SourceTypeName } from '../domain/sourceType';
import { setTab, TabId } from '../store/mainMenu/mainMenu.action';
import { fitLayer } from '../store/position/position.action';
import { QueryParameters } from '../domain/queryParameters';
import { isHttpUrl } from '../utils/checks';

/**
 * Amount of time waiting before adding a layer in ms.
 */
export const LAYER_ADDING_DELAY_MS = 500;


/**
 * Observes the 'import' slice of state and initially handles the 'data' query parameter
 * @class
 * @author thiloSchlemmer
 * @author taulinger
 */
export class ImportPlugin extends BaPlugin {
	constructor() {
		super();
		const { ImportVectorDataService: importVectorDataService, TranslationService: translationService } = $injector.inject('ImportVectorDataService', 'TranslationService');
		this._importVectorDataService = importVectorDataService;
		this._translationService = translationService;
		translationService.register('importPluginProvider', provider);
	}

	/**
	 * @override
	 * @param {Store} store
	 */
	async register(store) {

		const { EnvironmentService: environmentService } = $injector.inject('EnvironmentService');
		const queryParams = new URLSearchParams(environmentService.getWindow().location.search);

		const data = queryParams.get(QueryParameters.DATA);
		if (data) {
			this._import(data);
		}

		const onChange = async (latestImport) => {
			const { payload: { url, data, sourceType } } = latestImport;
			this._import(url ?? data, sourceType);
		};

		observe(store, state => state.import.latest, onChange);
	}

	_import(dataOrUrl, sourceType) {

		const geoResource = isHttpUrl(dataOrUrl) ? this._importByUrl(dataOrUrl, sourceType) : this._importByData(dataOrUrl, sourceType);
		if (geoResource) {
			const { id, label } = geoResource;
			//switch to the main menu's maps tab
			setTab(TabId.MAPS);
			//add the layer after some delay, which gives the user a better feedback
			setTimeout(() => {
				addLayer(id, { label: label });
				fitLayer(id);
			}, LAYER_ADDING_DELAY_MS);
		}
	}

	/**
	 * Imports the data as remote {@link GeoResource}
	 * @param {string} url the url to the data
	 * @returns {Promise<GeoResource>} the imported GeoResource
	 */
	_importByUrl(url, sourceType) {
		const createGeoResource = (url, sourceType) => {
			if (sourceType) {
				switch (sourceType.name) {
					case SourceTypeName.KML:
					case SourceTypeName.GPX:
					case SourceTypeName.GEOJSON:
						return this._importVectorDataService.forUrl(url, { sourceType: sourceType });
				}
			}
			emitNotification(`${this._translationService.translate('importPlugin_unsupported_sourceType')}`, LevelTypes.WARN);
			return null;
		};


		const geoResource = createGeoResource(url, sourceType);
		if (geoResource) {
			geoResource.onReject(() => {
				emitNotification(this._translationService.translate('importPlugin_url_failed'), LevelTypes.ERROR);
			});
			return geoResource;
		}

		return null;
	}

	/**
	  * Imports the data as local {@link GeoResource}
	  * @param {string} data the local data
	  * @param {string} mimeType the mimeType of the data
	  * @returns {GeoResource|null} the imported GeoResource or null on failure
	  */
	_importByData(data, sourceType) {
		const vectorGeoResource = this._importVectorDataService.forData(data, { sourceType: sourceType });
		if (vectorGeoResource) {
			return vectorGeoResource;
		}
		emitNotification(this._translationService.translate('importPlugin_data_failed'), LevelTypes.ERROR);
		return null;
	}
}
