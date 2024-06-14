/**
 * @module modules/olMap/services/InteractionStorageService
 */
import { $injector } from '../../../injection';
import { emitNotification, LevelTypes } from '../../../store/notifications/notifications.action';
import { setFileSaveResult as setSharedFileSaveResult } from '../../../store/shared/shared.action';

const Temp_Session_Id = 'temp_session_id';
export const KML_EMPTY_CONTENT =
	'<?xml version="1.0" encoding="UTF-8"?><kml xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns="http://www.opengis.net/kml/2.2"><Document></Document></kml>';
/**
 * Facade for FileStorageService and StoreService,
 * to provide interaction-based LayerHandlers a simplified access for storage-functionality
 *
 * Todo: Let's move the synchronization of the shared slice-of-state to a plugin (e.g. SharePlugin)
 * @class
 * @author thiloSchlemmer
 */
export class InteractionStorageService {
	/**
	 *
	 * @param {string} value the id, which defines/overrides the following storage-process.
	 * A value evaluated to a AdminId refers to a 'save as update'.
	 * A value evaluated to a FileId refers to a 'save as copy'.
	 */
	setStorageId(value) {
		const { FileStorageService: fileStorageService } = $injector.inject('FileStorageService');
		if (fileStorageService.isAdminId(value)) {
			setSharedFileSaveResult({ adminId: value, fileId: null });
		}
		if (fileStorageService.isFileId(value)) {
			setSharedFileSaveResult({ fileId: value, adminId: null });
		}
	}

	/**
	 * @returns {string} the storageId
	 */
	getStorageId() {
		const fileSaveResult = this._getLastFileSaveResult();

		const createTempIdAndWarn = () => {
			const { TranslationService } = $injector.inject('TranslationService');
			const translate = (key) => TranslationService.translate(key);
			console.warn('Could not store layer-data. The data will get lost after this session.');
			emitNotification(translate('olMap_handler_storage_offline'), LevelTypes.WARN);
			return Temp_Session_Id;
		};

		return this._isValidFileSaveResult(fileSaveResult) ? fileSaveResult.fileId : createTempIdAndWarn();
	}

	/**
	 * Tests, whether or not the candidate is a value to be evaluated as FileId or AdminId
	 * @param {string|null} candidate the candidate of storageId-value
	 * @returns {boolean} whether or not the candidate is a valid value to be evaluated as FileId or AdminId
	 */
	isStorageId(candidate) {
		const { FileStorageService: fileStorageService } = $injector.inject('FileStorageService');
		return candidate == null
			? false
			: fileStorageService.isAdminId(candidate) || fileStorageService.isFileId(candidate) || candidate === Temp_Session_Id;
	}

	/**
	 * Tests, whether or not the instance have a valid storage state. A valid storage state is reached
	 * if one or more successful FileSaveResults are received from the FileStorageService
	 * @returns {boolean}
	 */
	isValid() {
		return this._isValidFileSaveResult(this._getLastFileSaveResult()) && this.isStorageId(this.getStorageId());
	}

	_getLastFileSaveResult() {
		const { StoreService: storeService } = $injector.inject('StoreService');
		const { shared } = storeService.getStore().getState();
		return shared.fileSaveResult;
	}

	_isValidFileSaveResult(fileSaveResult) {
		if (fileSaveResult == null) {
			return false;
		}

		return fileSaveResult.adminId !== null && fileSaveResult.fileId !== null;
	}

	/**
	 * Stores the defined content to the FileStorageService
	 * @param {string} content the content to be stored.
	 * @param {FileStorageServiceDataTypes} type the content type
	 */
	async store(content, type) {
		const { StoreService: storeService, FileStorageService: fileStorageService } = $injector.inject('StoreService', 'FileStorageService');
		const contentToStore = content ?? KML_EMPTY_CONTENT;

		const { shared } = storeService.getStore().getState();
		if (shared.fileSaveResult) {
			try {
				const fileSaveResult = await fileStorageService.save(shared.fileSaveResult.adminId, contentToStore, type);
				setSharedFileSaveResult(fileSaveResult);
				return fileSaveResult;
			} catch (error) {
				console.warn('Could not store content:', error);
			}
		} else {
			try {
				const fileSaveResult = await fileStorageService.save(null, contentToStore, type);
				setSharedFileSaveResult(fileSaveResult);
				return fileSaveResult;
			} catch (error) {
				console.warn('Could not store content initially:', error);
				setSharedFileSaveResult(null);
			}
		}

		return null;
	}
}
