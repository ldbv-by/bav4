import {
	clear,
	indicateSavingInProgress,
	setAdminAndFileId,
	setData,
	setLatestStorageResult,
	setLatestStorageResultAndAdminAndFileId,
	setLatestStorageResultAndFileId
} from '../../../src/store/fileStorage/fileStorage.action.js';
import { fileStorageReducer, FileStorageState } from '../../../src/store/fileStorage/fileStorage.reducer.js';
import { TestUtils } from '../../test-utils.js';

it('exports a enum for FileStorageState', () => {
	expect(Object.isFrozen(FileStorageState)).toBeTrue();
	expect(Object.keys(FileStorageState).length).toBe(3);
	expect(FileStorageState.SAVING_IN_PROGRESS).toBe('saving_in_progress');
	expect(FileStorageState.SAVED).toBe('saved');
});

describe('fileStorageReducer', () => {
	const setup = (state) => {
		return TestUtils.setupStoreAndDi(state, {
			fileStorage: fileStorageReducer
		});
	};

	it('initializes the store with default values', () => {
		const store = setup();
		expect(store.getState().fileStorage.adminId).toBeNull();
		expect(store.getState().fileStorage.fileId).toBeNull();
		expect(store.getState().fileStorage.data).toBeNull();
		expect(store.getState().fileStorage.latest.payload).toEqual({ success: false, created: null, lastSaved: null });
		expect(store.getState().fileStorage.state).toBe(FileStorageState.DEFAULT);
		expect(store.getState().fileStorage.collaborativeData).toBeFalse();
	});

	it('initially sets the `adminId` and `fileId` property', () => {
		const store = setup();

		setAdminAndFileId('adminId');

		expect(store.getState().fileStorage.adminId).toBeNull();
		expect(store.getState().fileStorage.fileId).toBeNull();

		setAdminAndFileId(null, 'fileId');

		expect(store.getState().fileStorage.adminId).toBeNull();
		expect(store.getState().fileStorage.fileId).toBeNull();

		setAdminAndFileId('adminId', 'fileId');

		expect(store.getState().fileStorage.adminId).toBe('adminId');
		expect(store.getState().fileStorage.fileId).toBe('fileId');
		expect(store.getState().fileStorage.collaborativeData).toBeTrue();

		setAdminAndFileId('adminId_2', 'fileId_2');

		expect(store.getState().fileStorage.adminId).toBe('adminId');
		expect(store.getState().fileStorage.fileId).toBe('fileId');
	});

	it('clears the store and resets to initial state', () => {
		const store = setup();
		const data = { foo: 'bar' };

		setLatestStorageResultAndAdminAndFileId({ success: true, created: 42, lastSaved: 21 }, 'a_fooBar', 'f_ooBar');
		setData(data);
		indicateSavingInProgress();

		expect(store.getState().fileStorage.data).toEqual(data);
		expect(store.getState().fileStorage.fileId).toBe('f_ooBar');
		expect(store.getState().fileStorage.adminId).toBe('a_fooBar');
		expect(store.getState().fileStorage.latest.payload).toEqual({ success: true, created: 42, lastSaved: 21 });
		expect(store.getState().fileStorage.state).toBe(FileStorageState.SAVING_IN_PROGRESS);

		clear();

		expect(store.getState().fileStorage.data).toBeNull();
		expect(store.getState().fileStorage.fileId).toBeNull();
		expect(store.getState().fileStorage.adminId).toBeNull();
		expect(store.getState().fileStorage.latest.payload).toEqual({ success: false, created: null, lastSaved: null });
		expect(store.getState().fileStorage.state).toBe(FileStorageState.DEFAULT);
		expect(store.getState().fileStorage.collaborativeData).toBeFalse();
	});

	it('updates the `data` property and the `state` property', () => {
		const store = setup();
		const data = { foo: 'bar' };
		indicateSavingInProgress();

		setData();

		expect(store.getState().fileStorage.data).toBeNull();
		expect(store.getState().fileStorage.state).toBe(FileStorageState.SAVING_IN_PROGRESS);

		setData(data);

		expect(store.getState().fileStorage.data).toEqual(data);
		expect(store.getState().fileStorage.state).toBe(FileStorageState.DEFAULT);
	});

	it('updates the `latest` and the `state` property', () => {
		const store = setup();
		const result = { success: true, created: 12345, lastSaved: 54321 };
		indicateSavingInProgress();

		setLatestStorageResult();

		expect(store.getState().fileStorage.latest.payload).toEqual({ success: false, created: null, lastSaved: null });
		expect(store.getState().fileStorage.state).toBe(FileStorageState.SAVING_IN_PROGRESS);

		setLatestStorageResult(result);

		expect(store.getState().fileStorage.latest.payload).toEqual(result);
		expect(store.getState().fileStorage.state).toBe(FileStorageState.DEFAULT);
	});

	it('updates the `latest`, the `fileId` and the `state` property', () => {
		const store = setup();
		const result = { success: true, created: 12345, lastSaved: 54321 };
		const fileId = 'fileId';
		indicateSavingInProgress();

		setLatestStorageResultAndFileId(result);

		expect(store.getState().fileStorage.latest.payload).toEqual({ success: false, created: null, lastSaved: null });
		expect(store.getState().fileStorage.fileId).toBeNull();
		expect(store.getState().fileStorage.state).toBe(FileStorageState.SAVING_IN_PROGRESS);

		setLatestStorageResultAndFileId(null, fileId);

		expect(store.getState().fileStorage.latest.payload).toEqual({ success: false, created: null, lastSaved: null });
		expect(store.getState().fileStorage.fileId).toBeNull();
		expect(store.getState().fileStorage.state).toBe(FileStorageState.SAVING_IN_PROGRESS);

		setLatestStorageResultAndFileId(result, fileId);

		expect(store.getState().fileStorage.latest.payload).toEqual(result);
		expect(store.getState().fileStorage.fileId).toBe(fileId);
		expect(store.getState().fileStorage.state).toBe(FileStorageState.SAVED);

		setLatestStorageResultAndFileId({ ...result, success: false }, fileId);

		expect(store.getState().fileStorage.state).toBe(FileStorageState.DEFAULT);
	});

	it('updates the `latest`, the `adminId`, the `fileId` and the `state` property', () => {
		const store = setup();
		const result = { success: true, created: 12345, lastSaved: 54321 };
		const fileId = 'fileId';
		const adminId = 'adminId';
		indicateSavingInProgress();

		setLatestStorageResultAndAdminAndFileId(result);

		expect(store.getState().fileStorage.latest.payload).toEqual({ success: false, created: null, lastSaved: null });
		expect(store.getState().fileStorage.adminId).toBeNull();
		expect(store.getState().fileStorage.fileId).toBeNull();
		expect(store.getState().fileStorage.state).toBe(FileStorageState.SAVING_IN_PROGRESS);

		setLatestStorageResultAndAdminAndFileId(null, adminId);

		expect(store.getState().fileStorage.latest.payload).toEqual({ success: false, created: null, lastSaved: null });
		expect(store.getState().fileStorage.adminId).toBeNull();
		expect(store.getState().fileStorage.fileId).toBeNull();
		expect(store.getState().fileStorage.state).toBe(FileStorageState.SAVING_IN_PROGRESS);

		setLatestStorageResultAndAdminAndFileId(null, null);

		expect(store.getState().fileStorage.latest.payload).toEqual({ success: false, created: null, lastSaved: null });
		expect(store.getState().fileStorage.adminId).toBeNull();
		expect(store.getState().fileStorage.fileId).toBeNull();
		expect(store.getState().fileStorage.state).toBe(FileStorageState.SAVING_IN_PROGRESS);

		setLatestStorageResultAndAdminAndFileId(result, adminId, fileId);

		expect(store.getState().fileStorage.latest.payload).toEqual(result);
		expect(store.getState().fileStorage.adminId).toBe(adminId);
		expect(store.getState().fileStorage.fileId).toBe(fileId);
		expect(store.getState().fileStorage.state).toBe(FileStorageState.SAVED);

		setLatestStorageResultAndAdminAndFileId({ ...FileStorageState.result, success: false }, adminId, fileId);

		expect(store.getState().fileStorage.state).toBe(FileStorageState.DEFAULT);
	});

	it('updates the the `state` property', () => {
		const store = setup();

		expect(store.getState().fileStorage.state).toBe(FileStorageState.DEFAULT);

		indicateSavingInProgress();

		expect(store.getState().fileStorage.state).toBe(FileStorageState.SAVING_IN_PROGRESS);
	});
});
