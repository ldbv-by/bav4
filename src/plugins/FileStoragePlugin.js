/**
 * @module plugins/FileStoragePlugin
 */
import { QueryParameters } from '../domain/queryParameters';
import { SourceTypeName, SourceTypeResultStatus } from '../domain/sourceType';
import { $injector } from '../injection';
import { FileStorageServiceDataTypes } from '../services/FileStorageService';
import {
	setAdminAndFileId,
	setLatestStorageResult,
	setLatestStorageResultAndAdminAndFileId,
	setLatestStorageResultAndFileId
} from '../store/fileStorage/fileStorage.action';
import { emitNotification, LevelTypes } from '../store/notifications/notifications.action';
import { observe } from '../utils/storeUtils';
import { debounced } from '../utils/timer';
import { BaPlugin } from './BaPlugin';

/**
 * - Initially checks the query parameters for the presence of an admin id and updates the fileStorage s-o-s
 * - Observes the fileStorage s-o-s and stores the data by calling the `FileStorageServe`.
 *
 * @class
 * @author taulinger
 */
export class FileStoragePlugin extends BaPlugin {
	#environmentService;
	#fileStorageService;
	#sourceTypeService;
	#translationService;

	constructor() {
		super();
		const {
			EnvironmentService: environmentService,
			FileStorageService: fileStorageService,
			SourceTypeService: sourceTypeService,
			TranslationService: translationService
		} = $injector.inject('EnvironmentService', 'FileStorageService', 'SourceTypeService', 'TranslationService');
		this.#environmentService = environmentService;
		this.#fileStorageService = fileStorageService;
		this.#sourceTypeService = sourceTypeService;
		this.#translationService = translationService;
	}

	/**
	 * @override
	 */
	async register(store) {
		const queryParams = this.#environmentService.getQueryParams();

		/**
		 * Set both the admin and the file ID if the admin id is available. We just handle the topmost suitable layer
		 */
		if (queryParams.has(QueryParameters.LAYER)) {
			const geoResourceIds = queryParams.get(QueryParameters.LAYER).split(',');
			const adminId = geoResourceIds.reverse().find((grId) => this.#fileStorageService.isAdminId(grId));
			if (adminId) {
				const fileId = await this.#fileStorageService.getFileId(adminId);
				setAdminAndFileId(adminId, fileId);
			}
		}

		const saveDataDebounced = debounced(FileStoragePlugin.Debounce_Delay_Ms, (adminId, data) => this._saveData(adminId, data));
		observe(
			store,
			(state) => state.fileStorage.data,
			(data, store) => {
				/**
				 * When the data are saved for the first time, we have to call the FileStorageService immediately (not debounced) to ensure we have a fileId before the user possibly closes the tool
				 */
				if (store.fileStorage.fileId) {
					saveDataDebounced(store.fileStorage.adminId, data);
				} else {
					this._saveData(store.fileStorage.adminId, data);
				}
			}
		);
	}

	async _saveData(adminId, data) {
		const translate = (key) => this.#translationService.translate(key);
		const sourceTypeResult = this.#sourceTypeService.forData(data);

		switch (sourceTypeResult.status) {
			case SourceTypeResultStatus.OK:
				switch (sourceTypeResult.sourceType.name) {
					case SourceTypeName.KML: {
						try {
							const fileSaveResult = await this.#fileStorageService.save(adminId, data, FileStorageServiceDataTypes.KML);
							// update an existing file
							if (adminId) {
								setLatestStorageResultAndFileId(
									{ success: true, created: new Date().getTime(), lastSaved: new Date().getTime() },
									fileSaveResult.fileId
								);
							}
							// create a new file (entirely new or cloned)
							else {
								setLatestStorageResultAndAdminAndFileId(
									{ success: true, created: new Date().getTime(), lastSaved: new Date().getTime() },
									fileSaveResult.adminId,
									fileSaveResult.fileId
								);
							}
						} catch (error) {
							console.error(error);
							emitNotification(translate('global_fileStorageService_exception'), LevelTypes.ERROR);
							setLatestStorageResult({ success: false, created: null, lastSaved: null });
						}
						break;
					}
					default:
						throw new Error(`Unsupported source type: ${sourceTypeResult.sourceType.name}`);
				}
				break;
			default:
				throw new Error(`Unexpected source type status: ${sourceTypeResult.status}`);
		}
	}

	static get Debounce_Delay_Ms() {
		return 2000;
	}
}
