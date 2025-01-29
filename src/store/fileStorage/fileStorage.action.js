/**
 * @module store/fileStorage/fileStorage_action
 */

import { $injector } from '../../injection';
import { isString } from '../../utils/checks';
import { EventLike } from '../../utils/storeUtils';
import {
	ADMIN_ID_CHANGED,
	DATA_CHANGED,
	CLEARED,
	LATEST_AND_ADMIN_AND_FILE_ID_CHANGED,
	LATEST_AND_FILE_ID_CHANGED,
	LATEST_CHANGED
} from './fileStorage.reducer';

/**
 * Result of an attempt to save data in the file storage.
 * @typedef {Object} FileStorageResult
 * @property {boolean} success the length in meter of the feature(s)
 * @property {number|null} created the length in meter of the feature(s)
 * @property {number|null} lastSaved the length in meter of the feature(s)
 */

const getStore = () => {
	const { StoreService: storeService } = $injector.inject('StoreService');
	return storeService.getStore();
};

/**
 * Sets the admin and its corresponding file ID.
 * @param {string} adminId
 * @param {string} fileId
 * @function
 */
export const setAdminAndFileId = (adminId, fileId) => {
	if (isString(adminId) && isString(fileId)) {
		getStore().dispatch({
			type: ADMIN_ID_CHANGED,
			payload: { adminId, fileId }
		});
	}
};

/**
 * Sets the data.
 * @param {string} data
 * @function
 */
export const setData = (data) => {
	if (data) {
		getStore().dispatch({
			type: DATA_CHANGED,
			payload: data
		});
	}
};

/**
 * Clears and resets the fileStorage to the default values.
 * @function
 */
export const clear = () => {
	getStore().dispatch({
		type: CLEARED,
		payload: null
	});
};

/**
 *  Sets the latest storage result meta data.
 * @param {module:store/fileStorage/fileStorage_action~FileStorageResult} result
 * @function
 */
export const setLatestStorageResult = (result) => {
	if (result) {
		getStore().dispatch({
			type: LATEST_CHANGED,
			payload: new EventLike({ ...result })
		});
	}
};

/**
 * Sets the latest storage result meta data and the file id.
 * @param {module:store/fileStorage/fileStorage_action~FileStorageResult} result
 * @param {string} fileId
 * @function
 */
export const setLatestStorageResultAndFileId = (result, fileId) => {
	if (result && fileId) {
		getStore().dispatch({
			type: LATEST_AND_FILE_ID_CHANGED,
			payload: { latest: new EventLike({ ...result }), fileId }
		});
	}
};

/**
 * Sets the latest storage result meta data as well as the admin id and the file id.
 * @param {module:store/fileStorage/fileStorage_action~FileStorageResult} result
 * @param {string} adminId
 * @param {string} fileId
 */
export const setLatestStorageResultAndAdminAndFileId = (result, adminId, fileId) => {
	if (result && adminId && fileId) {
		getStore().dispatch({
			type: LATEST_AND_ADMIN_AND_FILE_ID_CHANGED,
			payload: { latest: new EventLike({ ...result }), adminId, fileId }
		});
	}
};
