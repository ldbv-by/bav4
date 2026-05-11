import { EventLike } from '../../utils/storeUtils';

export const ADMIN_ID_INITIALLY_SET = 'fileStorage/adminId';
export const ADMIN_AND_FILE_ID_CHANGED = 'fileStorage/adminAndFileId';
export const CLEARED = 'fileStorage/clear';
export const DATA_CHANGED = 'fileStorage/data';
export const STATE_CHANGED = 'fileStorage/state';
export const LATEST_CHANGED = 'fileStorage/latest';
export const LATEST_AND_FILE_ID_CHANGED = 'fileStorage/latestAndFileId';
export const LATEST_AND_ADMIN_AND_FILE_ID_CHANGED = 'fileStorage/latestAndFAdminAndFileId';

/**
 * Enumeration that indicates the current status of the FileStorage operation
 * @readonly
 * @enum {string}
 */
export const FileStorageState = Object.freeze({
	/**
	 * Default state
	 */
	DEFAULT: 'default',
	/**
	 * File saving in progress
	 */
	SAVING_IN_PROGRESS: 'saving_in_progress',
	/**
	 * File saved
	 */
	SAVED: 'saved'
});

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
	latest: new EventLike({ success: false, created: null, lastSaved: null }),

	/**
	 * @property {FileStorageState}
	 */
	state: FileStorageState.DEFAULT,

	/**
	 * Flag if we have collaborative data
	 *  @property {boolean}
	 */
	collaborativeData: false
};

export const fileStorageReducer = (state = initialState, action) => {
	const { type, payload } = action;
	switch (type) {
		case ADMIN_ID_INITIALLY_SET: {
			const { adminId, fileId } = payload;
			if (!state.adminId && !state.fileId) {
				return {
					...state,
					adminId,
					fileId,
					collaborativeData: true
				};
			}
			return state;
		}
		case DATA_CHANGED: {
			return {
				...state,
				data: payload,
				state: FileStorageState.DEFAULT
			};
		}
		case CLEARED: {
			return initialState;
		}
		case LATEST_CHANGED: {
			return {
				...state,
				latest: payload,
				state: FileStorageState.DEFAULT
			};
		}
		case LATEST_AND_FILE_ID_CHANGED: {
			return {
				...state,
				latest: payload.latest,
				fileId: payload.fileId,
				state: payload.latest.payload.success ? FileStorageState.SAVED : FileStorageState.DEFAULT
			};
		}
		case LATEST_AND_ADMIN_AND_FILE_ID_CHANGED: {
			return {
				...state,
				latest: payload.latest,
				adminId: payload.adminId,
				fileId: payload.fileId,
				state: payload.latest.payload.success ? FileStorageState.SAVED : FileStorageState.DEFAULT
			};
		}
		case STATE_CHANGED: {
			return {
				...state,
				state: payload
			};
		}
	}

	return state;
};
