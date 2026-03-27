import { TestUtils } from '@test/test-utils.js';
import { $injector } from '@src/injection/index.js';
import { FileStoragePlugin } from '@src/plugins/FileStoragePlugin.js';
import { fileStorageReducer, FileStorageState, initialState } from '@src/store/fileStorage/fileStorage.reducer.js';
import { notificationReducer } from '@src/store/notifications/notifications.reducer.js';
import { QueryParameters } from '@src/domain/queryParameters.js';
import { setData } from '@src/store/fileStorage/fileStorage.action.js';
import { SourceType, SourceTypeName, SourceTypeResult, SourceTypeResultStatus } from '@src/domain/sourceType.js';
import { FileStorageServiceDataTypes } from '@src/services/FileStorageService.js';
import { LevelTypes } from '@src/store/notifications/notifications.action.js';

describe('FileStoragePlugin', () => {
	const environmentService = {
		getQueryParams() {}
	};
	const fileStorageService = {
		isAdminId() {},
		save() {},
		getFileId() {}
	};
	const sourceTypeService = {
		forData() {}
	};

	const setup = (initialState = {}) => {
		const store = TestUtils.setupStoreAndDi(initialState, {
			fileStorage: fileStorageReducer,
			notifications: notificationReducer
		});
		$injector
			.registerSingleton('EnvironmentService', environmentService)
			.registerSingleton('FileStorageService', fileStorageService)
			.registerSingleton('SourceTypeService', sourceTypeService)
			.registerSingleton('TranslationService', { translate: (key) => key });

		return store;
	};

	describe('static properties', () => {
		it('defines a debounce time', async () => {
			expect(FileStoragePlugin.Debounce_Delay_Ms).toBe(2000);
		});
	});

	describe('register', () => {
		describe('initially checks the query parameters for the presence of an admin id', () => {
			it('does nothing when no layer query param is available', async () => {
				const store = setup();
				const queryParam = new URLSearchParams();
				vi.spyOn(environmentService, 'getQueryParams').mockReturnValue(queryParam);
				const instanceUnderTest = new FileStoragePlugin();

				await instanceUnderTest.register(store);

				expect(store.getState().fileStorage.adminId).toBe(initialState.adminId);
			});

			it('does nothing when no admin id is detected', async () => {
				const store = setup();
				const queryParam = new URLSearchParams(`${QueryParameters.LAYER}=foo`);
				vi.spyOn(environmentService, 'getQueryParams').mockReturnValue(queryParam);
				vi.spyOn(fileStorageService, 'isAdminId').mockReturnValue(false);
				const instanceUnderTest = new FileStoragePlugin();

				await instanceUnderTest.register(store);

				expect(store.getState().fileStorage.adminId).toBe(initialState.adminId);
			});

			it('sets the admin and file id when an admin id is detected', async () => {
				const store = setup();
				const queryParam = new URLSearchParams(`${QueryParameters.LAYER}=adminId`);
				vi.spyOn(environmentService, 'getQueryParams').mockReturnValue(queryParam);
				vi.spyOn(fileStorageService, 'isAdminId').mockReturnValue(true);
				const fileIdSpy = vi.spyOn(fileStorageService, 'getFileId').mockResolvedValue('fileId');
				const instanceUnderTest = new FileStoragePlugin();

				await instanceUnderTest.register(store);

				expect(fileIdSpy).toHaveBeenCalledExactlyOnceWith('adminId');
				expect(store.getState().fileStorage.adminId).toBe('adminId');
				expect(store.getState().fileStorage.fileId).toBe('fileId');
			});
		});

		describe('registers an observer for fileStorage `data` property changes', () => {
			describe('`fileId` is available', () => {
				it('saves the data in a debounced manner', async () => {
					const data = { foo: 'bar' };
					const data2 = { foo: 'bar2' };
					const adminId = 'adminId';
					const fileId = 'fileId';
					const store = setup({
						fileStorage: {
							adminId,
							fileId
						}
					});
					const queryParam = new URLSearchParams();
					vi.spyOn(environmentService, 'getQueryParams').mockReturnValue(queryParam);
					const instanceUnderTest = new FileStoragePlugin();
					const saveDataSpy = vi.spyOn(instanceUnderTest, '_saveData').mockImplementation(() => {});
					await instanceUnderTest.register(store);

					setData(data);
					setData(data2);

					await TestUtils.timeout(FileStoragePlugin.Debounce_Delay_Ms + 100);
					expect(saveDataSpy).toHaveBeenCalledExactlyOnceWith(adminId, data2);
				});
			});

			describe('`fileId` is NOT available', () => {
				it('saves the data immediately', async () => {
					const data = { foo: 'bar' };
					const data2 = { foo: 'bar2' };
					const adminId = 'adminId';
					const store = setup({
						fileStorage: {
							adminId
						}
					});
					const queryParam = new URLSearchParams();
					vi.spyOn(environmentService, 'getQueryParams').mockReturnValue(queryParam);
					const instanceUnderTest = new FileStoragePlugin();
					const saveDataSpy = vi.spyOn(instanceUnderTest, '_saveData').mockImplementation(() => {});
					await instanceUnderTest.register(store);

					setData(data);
					setData(data2);

					await TestUtils.timeout(FileStoragePlugin.Debounce_Delay_Ms + 100);

					expect(saveDataSpy).toHaveBeenCalledTimes(2);
					expect(saveDataSpy).toHaveBeenCalledWith(adminId, data);
					expect(saveDataSpy).toHaveBeenCalledWith(adminId, data2);
				});
			});
		});
	});

	describe('_saveData', () => {
		beforeEach(async () => {
			const queryParam = new URLSearchParams();
			vi.spyOn(environmentService, 'getQueryParams').mockReturnValue(queryParam);
		});

		describe('source type cannot be detected', () => {
			it('throws an error', async () => {
				const data = { foo: 'bar' };
				const adminId = 'adminId';
				const store = setup();
				const sourceTypeForDataSpy = vi.spyOn(sourceTypeService, 'forData').mockReturnValue(new SourceTypeResult(SourceTypeResultStatus.OTHER));
				const instanceUnderTest = new FileStoragePlugin();
				await instanceUnderTest.register(store);

				await expect(instanceUnderTest._saveData(adminId, data)).rejects.toThrow(`Unexpected source type status: ${SourceTypeResultStatus.OTHER}`);
				expect(sourceTypeForDataSpy).toHaveBeenCalledExactlyOnceWith(data);
			});
		});

		describe('source type is other than KML', () => {
			it('throws an error', async () => {
				const data = { foo: 'bar' };
				const adminId = 'adminId';
				const store = setup();

				const sourceTypeForDataSpy = vi
					.spyOn(sourceTypeService, 'forData')
					.mockReturnValue(new SourceTypeResult(SourceTypeResultStatus.OK, new SourceType(SourceTypeName.GEOJSON)));
				const instanceUnderTest = new FileStoragePlugin();
				await instanceUnderTest.register(store);
				await expect(instanceUnderTest._saveData(adminId, data)).rejects.toThrow(`Unsupported source type: ${SourceTypeName.GEOJSON}`);
				expect(sourceTypeForDataSpy).toHaveBeenCalledExactlyOnceWith(data);
			});
		});

		describe('source type is supported', () => {
			describe('admin id is present', () => {
				it('calls the FileStorageService and updates the fileStorage s-o-s', async () => {
					const data = { foo: 'bar' };
					const adminId = 'adminId';
					const fileId = 'fileId';
					const store = setup();
					const sourceTypeForDataSpy = vi
						.spyOn(sourceTypeService, 'forData')
						.mockReturnValue(new SourceTypeResult(SourceTypeResultStatus.OK, new SourceType(SourceTypeName.KML)));
					const instanceUnderTest = new FileStoragePlugin();
					await instanceUnderTest.register(store);
					const fileStorageSaveSpy = vi.spyOn(fileStorageService, 'save').mockResolvedValue({ adminId, fileId });

					const promise = instanceUnderTest._saveData(adminId, data);
					expect(store.getState().fileStorage.state).toBe(FileStorageState.SAVING_IN_PROGRESS);

					await promise;

					expect(sourceTypeForDataSpy).toHaveBeenCalledExactlyOnceWith(data);
					expect(fileStorageSaveSpy).toHaveBeenCalledExactlyOnceWith(adminId, data, FileStorageServiceDataTypes.KML);
					expect(store.getState().fileStorage.fileId).toBe(fileId);
					expect(store.getState().fileStorage.latest.payload).toEqual({
						success: true,
						created: expect.any(Number),
						lastSaved: expect.any(Number)
					});
				});
			});

			describe('admin id is NOT present', () => {
				it('calls the FileStorageService and updates the fileStorage s-o-s', async () => {
					const data = { foo: 'bar' };
					const adminId = 'adminId';
					const fileId = 'fileId';
					const store = setup();
					const sourceTypeForDataSpy = vi
						.spyOn(sourceTypeService, 'forData')
						.mockReturnValue(new SourceTypeResult(SourceTypeResultStatus.OK, new SourceType(SourceTypeName.KML)));
					const instanceUnderTest = new FileStoragePlugin();
					await instanceUnderTest.register(store);
					const fileStorageSaveSpy = vi.spyOn(fileStorageService, 'save').mockResolvedValue({ adminId, fileId });

					const promise = instanceUnderTest._saveData(null, data);
					expect(store.getState().fileStorage.state).toBe(FileStorageState.SAVING_IN_PROGRESS);

					await promise;
					expect(sourceTypeForDataSpy).toHaveBeenCalledExactlyOnceWith(data);
					expect(fileStorageSaveSpy).toHaveBeenCalledExactlyOnceWith(null, data, FileStorageServiceDataTypes.KML);
					expect(store.getState().fileStorage.fileId).toBe(fileId);
					expect(store.getState().fileStorage.adminId).toBe(adminId);
					expect(store.getState().fileStorage.latest.payload).toEqual({
						success: true,
						created: expect.any(Number),
						lastSaved: expect.any(Number)
					});
				});
			});
			describe('FileStorageService throws', () => {
				it('emits a notification and updates the fileStorage s-o-s', async () => {
					const data = { foo: 'bar' };
					const error = 'error';
					const store = setup();
					const sourceTypeForDataSpy = vi
						.spyOn(sourceTypeService, 'forData')
						.mockReturnValue(new SourceTypeResult(SourceTypeResultStatus.OK, new SourceType(SourceTypeName.KML)));
					const instanceUnderTest = new FileStoragePlugin();
					await instanceUnderTest.register(store);
					vi.spyOn(fileStorageService, 'save').mockRejectedValue(error);
					const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

					await instanceUnderTest._saveData(null, data);

					expect(sourceTypeForDataSpy).toHaveBeenCalledExactlyOnceWith(data);
					expect(store.getState().notifications.latest.payload.content).toBe('global_fileStorageService_exception');
					expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.ERROR);
					expect(consoleSpy).toHaveBeenCalledWith(error);
					expect(store.getState().fileStorage.latest.payload).toEqual({
						success: false,
						created: null,
						lastSaved: null
					});
				});
			});
		});
	});
});
