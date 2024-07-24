import {
	clear,
	setAdminId,
	setData,
	setLatestStorageResult,
	setLatestStorageResultAndAdminAndFileId,
	setLatestStorageResultAndFileId
} from '../../../src/store/fileStorage/fileStorage.action.js';
import { TestUtils } from '../../test-utils.js';
import { fileStorageReducer } from '../../../src/store/fileStorage/fileStorage.reducer.js';

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
	});

	it('updates the `adminId` property', () => {
		const store = setup();

		setAdminId('adminId');

		expect(store.getState().fileStorage.adminId).toBe('adminId');
	});

	it('clears the store and resets to default values', () => {
		const store = setup();
		const data = { foo: 'bar' };

		setData(data);

		expect(store.getState().fileStorage.data).toEqual(data);

		clear();

		expect(store.getState().fileStorage.data).toBeNull();
		expect(store.getState().fileStorage.data).toBeNull();
	});

	it('updates the `data` property', () => {
		const store = setup();
		const data = { foo: 'bar' };

		setData();

		expect(store.getState().fileStorage.data).toBeNull();

		setData(data);

		expect(store.getState().fileStorage.data).toEqual(data);
	});

	it('updates the `latest` property', () => {
		const store = setup();
		const result = { foo: 'bar' };

		setLatestStorageResult();

		expect(store.getState().fileStorage.latest.payload).toEqual({ success: false, created: null, lastSaved: null });

		setLatestStorageResult(result);

		expect(store.getState().fileStorage.latest.payload).toEqual(result);
	});

	it('updates the `latest` and `fileId` property', () => {
		const store = setup();
		const result = { foo: 'bar' };
		const fileId = 'fileId';

		setLatestStorageResultAndFileId(result);

		expect(store.getState().fileStorage.latest.payload).toEqual({ success: false, created: null, lastSaved: null });
		expect(store.getState().fileStorage.fileId).toBeNull();

		setLatestStorageResultAndFileId(null, fileId);

		expect(store.getState().fileStorage.latest.payload).toEqual({ success: false, created: null, lastSaved: null });
		expect(store.getState().fileStorage.fileId).toBeNull();

		setLatestStorageResultAndFileId(result, fileId);

		expect(store.getState().fileStorage.latest.payload).toEqual(result);
		expect(store.getState().fileStorage.fileId).toBe(fileId);
	});

	it('updates the `latest`, the `adminId` and the `fileId` property', () => {
		const store = setup();
		const result = { foo: 'bar' };
		const fileId = 'fileId';
		const adminId = 'adminId';

		setLatestStorageResultAndAdminAndFileId(result);

		expect(store.getState().fileStorage.latest.payload).toEqual({ success: false, created: null, lastSaved: null });
		expect(store.getState().fileStorage.adminId).toBeNull();
		expect(store.getState().fileStorage.fileId).toBeNull();

		setLatestStorageResultAndAdminAndFileId(null, adminId);

		expect(store.getState().fileStorage.latest.payload).toEqual({ success: false, created: null, lastSaved: null });
		expect(store.getState().fileStorage.adminId).toBeNull();
		expect(store.getState().fileStorage.fileId).toBeNull();

		setLatestStorageResultAndAdminAndFileId(null, null);

		expect(store.getState().fileStorage.latest.payload).toEqual({ success: false, created: null, lastSaved: null });
		expect(store.getState().fileStorage.adminId).toBeNull();
		expect(store.getState().fileStorage.fileId).toBeNull();

		setLatestStorageResultAndAdminAndFileId(result, adminId, fileId);

		expect(store.getState().fileStorage.latest.payload).toEqual(result);
		expect(store.getState().fileStorage.adminId).toBe(adminId);
		expect(store.getState().fileStorage.fileId).toBe(fileId);
	});
});
