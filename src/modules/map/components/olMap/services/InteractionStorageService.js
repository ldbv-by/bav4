import { $injector } from '../../../../../injection';
import { setFileSaveResult as setSharedFileSaveResult } from '../../../../../store/shared/shared.action';


/**
 * Facade for FileStorageService and StoreService,
 * to provide interaction-based LayerHandlers a simplified access for storage-functionality
 *
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
	 * @returns {string|null} the storageId
	 */
	getStorageId() {
		const fileSaveResult = this._getLastFileSaveResult();
		if (this._isValidFileSaveResult(fileSaveResult)) {
			return fileSaveResult.fileId;
		}
		return null;
	}

	/**
	 * Tests, whether or not the candidate is a value to be evaluated as FileId or AdminId
	 * @param {string|null} candidate the candidate of storageId-value
	 * @returns {boolean} whether or not the candidate is a valid value to be evaluated as FileId or AdminId
	 */
	isStorageId(candidate) {
		const { FileStorageService: fileStorageService } = $injector.inject('FileStorageService');
		return candidate == null ? false : fileStorageService.isAdminId(candidate) || fileStorageService.isFileId(candidate);
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

		if (content) {
			const { shared } = storeService.getStore().getState();
			if (shared.fileSaveResult) {
				try {
					const fileSaveResult = await fileStorageService.save(shared.fileSaveResult.adminId, content, type);
					setSharedFileSaveResult(fileSaveResult);
				}
				catch (error) {
					console.warn('Could not store content:', error);
				}
			}
			else {
				try {
					const fileSaveResult = await fileStorageService.save(null, content, type);
					setSharedFileSaveResult(fileSaveResult);
				}
				catch (error) {
					console.warn('Could not store content initially:', error);
					setSharedFileSaveResult(null);
				}
			}
		}
		else {
			setSharedFileSaveResult(null);
		}
	}
}
