/**
 * @module plugins/ImportPlugin
 */
import { $injector } from '../injection';
import { addLayer } from '../store/layers/layers.action';
import { emitNotification, LevelTypes } from '../store/notifications/notifications.action';
import { observe } from '../utils/storeUtils';
import { BaPlugin } from './BaPlugin';
import { SourceTypeName } from '../domain/sourceType';
import { setTab } from '../store/mainMenu/mainMenu.action';
import { TabIds } from '../domain/mainMenu';
import { fitLayer } from '../store/position/position.action';

/**
 * Amount of time waiting before adding a layer in ms.
 */
export const LAYER_ADDING_DELAY_MS = 500;

/**
 * @class
 * @author thiloSchlemmer
 * @author taulinger
 */
export class ImportPlugin extends BaPlugin {
	constructor() {
		super();
		const { ImportVectorDataService: importVectorDataService, TranslationService: translationService } = $injector.inject(
			'ImportVectorDataService',
			'TranslationService'
		);
		this._importVectorDataService = importVectorDataService;
		this._translationService = translationService;
	}

	/**
	 * @override
	 * @param {Store} store
	 */
	async register(store) {
		const onChange = async (latestImport) => {
			const {
				payload: { url, data, sourceType }
			} = latestImport;

			const geoResource = url ? await this._importByUrl(url, sourceType) : this._importByData(data, sourceType);
			if (geoResource) {
				const { id } = geoResource;
				//switch to the main menu's maps tab
				setTab(TabIds.MAPS);
				//add the layer after some delay, which gives the user a better feedback
				setTimeout(() => {
					addLayer(id);
					fitLayer(id);
				}, LAYER_ADDING_DELAY_MS);
			}
		};

		observe(store, (state) => state.import.latest, onChange);
	}

	/**
	 * Imports the data as remote {@link GeoResource}
	 * @param {string} url the url to the data
	 * @returns {Promise<GeoResource>} the imported GeoResource
	 */
	async _importByUrl(url, sourceType) {
		const createGeoResource = (url, sourceType) => {
			if (sourceType) {
				switch (sourceType.name) {
					case SourceTypeName.KML:
					case SourceTypeName.GPX:
					case SourceTypeName.GEOJSON:
						return this._importVectorDataService.forUrl(url, { sourceType: sourceType });
				}
			}
			emitNotification(`${this._translationService.translate('global_import_unsupported_sourceType')}`, LevelTypes.WARN);
			return null;
		};

		const geoResource = createGeoResource(url, sourceType);
		if (geoResource) {
			geoResource.onReject(() => {
				emitNotification(this._translationService.translate('global_import_url_failed'), LevelTypes.ERROR);
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
		emitNotification(this._translationService.translate('global_import_data_failed'), LevelTypes.ERROR);
		return null;
	}
}
