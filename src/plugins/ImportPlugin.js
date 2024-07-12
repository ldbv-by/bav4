/**
 * @module plugins/ImportPlugin
 */
import { $injector } from '../injection';
import { addLayer } from '../store/layers/layers.action';
import { emitNotification, LevelTypes } from '../store/notifications/notifications.action';
import { observe } from '../utils/storeUtils';
import { BaPlugin } from './BaPlugin';
import { setTab } from '../store/mainMenu/mainMenu.action';
import { TabIds } from '../domain/mainMenu';
import { fitLayer } from '../store/position/position.action';

/**
 * Amount of time waiting before adding a layer in ms.
 */
export const LAYER_ADDING_DELAY_MS = 500;

/**
 * Observes the import s-o-s and puts the data to the map by calling the `ImportVectorDataService`.
 *
 * Note: The source type is assumed to be checked before committing it to the s-o-s (e.g. by calling the `SourceTypeService`), no further checks are done here.
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

			const geoResource = url
				? this._importVectorDataService.forUrl(url, { sourceType: sourceType })
				: this._importVectorDataService.forData(data, { sourceType: sourceType });
			if (geoResource) {
				const { id } = geoResource;
				//switch to the main menu's maps tab
				setTab(TabIds.MAPS);
				//add the layer after some delay, which gives the user a better feedback
				setTimeout(() => {
					addLayer(id);
					fitLayer(id);
				}, LAYER_ADDING_DELAY_MS);
			} else {
				emitNotification(this._translationService.translate('global_import_data_failed'), LevelTypes.ERROR);
			}
		};

		observe(store, (state) => state.import.latest, onChange);
	}
}
