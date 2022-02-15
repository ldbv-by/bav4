import { $injector } from '../injection';
import { addLayer } from '../store/layers/layers.action';
import { emitNotification, LevelTypes } from '../store/notifications/notifications.action';
import { observe } from '../utils/storeUtils';
import { BaPlugin } from './BaPlugin';

/**
 * @class
 * @author thiloSchlemmer
 */
export class ImportPlugin extends BaPlugin {

	/**
	 * @override
	 * @param {Store} store
	 */
	async register(store) {
		const { ImportService: importService, SourceTypeService: sourceTypeService } = $injector.inject('ImportService', 'SourceTypeService');


		const onChange = (latestImport) => {
			try {
				const importByUrl = (url) => {
					const sourceType = sourceTypeService.forURL(url);
					return importService.importVectorDataFromUrl(url, { sourceType: sourceType });
				};
				const importByData = (data, mimeType) => {
					const sourceType = sourceTypeService.forData(data, mimeType);
					importService.importVectorData(latestImport.data, { sourceType: sourceType });
				};

				const vgr = latestImport.url ? importByUrl(latestImport.url) : importByData(latestImport.data, latestImport.mimeType);
				addLayer(vgr.id, { label: vgr.label });
			}
			catch (error) {
				emitNotification(error, LevelTypes.ERROR);
			}


		};

		observe(store, state => state.import.latest, onChange);

	}
}
