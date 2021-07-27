import { $injector } from '../../../../../injection';
import { FileStorageServiceDataTypes } from '../../../../../services/FileStorageService';
import { setFileSaveResult } from '../../../store/measurement.action';


/**
 * Facade for FileStorageService and StoreService,
 * to give the measurement a simplified access for storage-functionality
 *
 * @class
 * @author thiloSchlemmer
 */
export class MeasurementStorageService {

	setStorageId(value) {
		const { FileStorageService: fileStorageService } = $injector.inject('FileStorageService');
		if (fileStorageService.isAdminId(value)) {
			setFileSaveResult({ adminId: value, fileId: null });
		}
		if (fileStorageService.isFileId(value)) {
			setFileSaveResult({ fileId: value, adminId: null });
		}
	}

	getStorageId() {
		const fileSaveResult = this._getLastFileSaveResult();
		if (this._isValidFileSaveResult(fileSaveResult)) {
			return fileSaveResult.fileId;
		}
		return null;
	}

	isStorageId(candidate) {
		const { FileStorageService: fileStorageService } = $injector.inject('FileStorageService');
		return candidate == null ? false : fileStorageService.isAdminId(candidate) || fileStorageService.isFileId(candidate);
	}

	isValid() {
		return this._isValidFileSaveResult(this._getLastFileSaveResult()) && this.isStorageId(this.getStorageId());
	}

	_getLastFileSaveResult() {
		const { StoreService: storeService } = $injector.inject('StoreService');
		const { measurement } = storeService.getStore().getState();
		return measurement.fileSaveResult;
	}

	_isValidFileSaveResult(fileSaveResult) {
		if (fileSaveResult == null) {
			return false;
		}

		return fileSaveResult.adminId !== null && fileSaveResult.fileId !== null;
	}

	async store(content) {
		const { StoreService: storeService, FileStorageService: fileStorageService } = $injector.inject('StoreService', 'FileStorageService');

		if (content) {
			const { measurement } = storeService.getStore().getState();
			if (measurement.fileSaveResult) {
				try {
					const fileSaveResult = await fileStorageService.save(measurement.fileSaveResult.adminId, content, FileStorageServiceDataTypes.KML);
					setFileSaveResult(fileSaveResult);
				}
				catch (error) {
					console.warn('Could not store content:', error);
				}
			}
			else {
				try {
					const fileSaveResult = await fileStorageService.save(null, content, FileStorageServiceDataTypes.KML);
					setFileSaveResult(fileSaveResult);
				}
				catch (error) {
					console.warn('Could not store content initially:', error);
				}
			}
		}
		else {
			setFileSaveResult(null);
		}
	}
}
