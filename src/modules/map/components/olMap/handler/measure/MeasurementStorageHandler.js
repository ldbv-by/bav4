import { $injector } from '../../../../../../injection';
import { FileStorageServiceDataTypes } from '../../../../../../services/FileStorageService';
import { setFileSaveResult } from '../../../../store/measurement.action';

export class MeasurementStorageHandler {

	setStorageId(value) {
		const { FileStorageService } = $injector.inject('FileStorageService');
		if (FileStorageService.isAdminId(value)) {
			setFileSaveResult({ adminId: value, fileId: null });
		}
		if (FileStorageService.isFileId(value)) {
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
		const { FileStorageService } = $injector.inject('FileStorageService');
		return candidate == null ? false : FileStorageService.isAdminId(candidate) || FileStorageService.isFileId(candidate);
	}

	isValid() {
		return this._isValidFileSaveResult(this._getLastFileSaveResult()) && this.isStorageId(this.getStorageId());
	}

	_getLastFileSaveResult() {
		const { StoreService } = $injector.inject('StoreService');
		const { measurement } = StoreService.getStore().getState();
		return measurement.fileSaveResult;
	}

	_isValidFileSaveResult(fileSaveResult) {
		if (fileSaveResult == null) {
			return false;
		}

		return fileSaveResult.adminId !== null && fileSaveResult.fileId !== null;
	}

	async store(content) {
		const { StoreService, FileStorageService } = $injector.inject('StoreService', 'FileStorageService');

		if (content) {
			const { measurement } = StoreService.getStore().getState();
			if (measurement.fileSaveResult) {
				try {
					const fileSaveResult = await FileStorageService.save(measurement.fileSaveResult.adminId, content, FileStorageServiceDataTypes.KML);
					setFileSaveResult(fileSaveResult);
				}
				catch (error) {
					console.warn('Could not store content:', error);
				}
			}
			else {
				try {
					const fileSaveResult = await FileStorageService.save(null, content, FileStorageServiceDataTypes.KML);
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
