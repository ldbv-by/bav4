import { EventLike } from '../../utils/storeUtils';

export const ADMIN_ID_CHANGED = 'fileStorage/adminId';
export const ADMIN_AND_FILE_ID_CHANGED = 'fileStorage/adminAndFileId';
export const CLEARED = 'fileStorage/clear';
export const DATA_CHANGED = 'fileStorage/data';
export const LATEST_CHANGED = 'fileStorage/latest';
export const LATEST_AND_FILE_ID_CHANGED = 'fileStorage/latestAndFileId';
export const LATEST_AND_ADMIN_AND_FILE_ID_CHANGED = 'fileStorage/latestAndFAdminAndFileId';

export const initialState = {
	/**
	 * @property {string}
	 */
	adminId: null,
	/**
	 * @property {string}
	 */
	fileId: null,
	/**
	 * @property {string}
	 */
	data: null,

	/**
	 * @property {EventLike<module:store/fileStorage/fileStorage_action~FileStorageResult|null>}
	 */
	latest: new EventLike(null)
};

export const fileStorageReducer = (state = initialState, action) => {
	const { type, payload } = action;
	switch (type) {
		case ADMIN_ID_CHANGED: {
			return {
				...state,
				adminId: payload
			};
		}
		case DATA_CHANGED: {
			return {
				...state,
				data: payload
			};
		}
		case CLEARED: {
			return initialState;
		}
		case LATEST_CHANGED: {
			return {
				...state,
				latest: payload
			};
		}
		case LATEST_AND_FILE_ID_CHANGED: {
			return {
				...state,
				latest: payload.latest,
				fileId: payload.fileId
			};
		}
		case LATEST_AND_ADMIN_AND_FILE_ID_CHANGED: {
			return {
				...state,
				latest: payload.latest,
				adminId: payload.adminId,
				fileId: payload.fileId
			};
		}
	}

	return state;
};
