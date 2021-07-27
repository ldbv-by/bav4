import { $injector } from '../../../../../../injection';
import { FileStorageServiceDataTypes } from '../../../../../../services/FileStorageService';
import { setFileSaveResult } from '../../../../store/measurement.action';

export class MeasurementStorageHandler {

	constructor() {
		const { StoreService, FileStorageService } = $injector.inject('StoreService', 'FileStorageService');
		this._storeService = StoreService;
		this._fileStorageService = FileStorageService;

		this._storedContent = null;
		this._lastFileSaveResult = null;
	}

	set storageId(value) {
		if (this._fileStorageService.isAdminId(value)) {
			setFileSaveResult({ adminId: value, fileId: null });
		}
		if (this._fileStorageService.isFileId(value)) {
			setFileSaveResult({ fileId: value, adminId: null });
		}
	}

	get storageId() {
		const fileSaveResult = this._getLastFileSaveResult();
		if (this._isValidFileSaveResult(fileSaveResult)) {
			return fileSaveResult.fileId;
		}
		return null;
	}

	isStorageId(candidate) {
		return candidate == null ? false : this._fileStorageService.isAdminId(candidate) || this._fileStorageService.isFileId(candidate);
	}

	isValid() {
		return this._isValidFileSaveResult(this._getLastFileSaveResult()) && this.isStorageId(this.storageId);
	}

	_getLastFileSaveResult() {
		const { measurement } = this._storeService.getStore().getState();
		return measurement.fileSaveResult;
	}

	_isValidFileSaveResult(fileSaveResult) {
		if (fileSaveResult == null) {
			return false;
		}

		return fileSaveResult.adminId !== null && fileSaveResult.fileId !== null;
	}

	async store(content) {
		if (content) {
			this._storedContent = content;
			const { measurement } = this._storeService.getStore().getState();
			if (measurement.fileSaveResult) {
				try {
					const fileSaveResult = await this._fileStorageService.save(measurement.fileSaveResult.adminId, this._storedContent, FileStorageServiceDataTypes.KML);
					setFileSaveResult(fileSaveResult);
				}
				catch (error) {
					console.warn('Could not store content:', error);
				}
			}
			else {
				try {
					const fileSaveResult = await this._fileStorageService.save(null, this._storedContent, FileStorageServiceDataTypes.KML);
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
