import { TestUtils } from '../test-utils.js';
import { $injector } from '../../src/injection/index.js';
import { FileStoragePlugin } from '../../src/plugins/FileStoragePlugin.js';
import { fileStorageReducer } from '../../src/store/fileStorage/fileStorage.reducer.js';
import { notificationReducer } from '../../src/store/notifications/notifications.reducer.js';
import { QueryParameters } from '../../src/domain/queryParameters.js';
import { setData } from '../../src/store/fileStorage/fileStorage.action.js';
import { SourceType, SourceTypeName, SourceTypeResult, SourceTypeResultStatus } from '../../src/domain/sourceType.js';
import { FileStorageServiceDataTypes } from '../../src/services/FileStorageService.js';
import { LevelTypes } from '../../src/store/notifications/notifications.action.js';

describe('FileStoragePlugin', () => {
	const environmentService = {
		getQueryParams() {}
	};
	const fileStorageService = {
		isAdminId() {},
		save() {}
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
			expect(FileStoragePlugin.Debounce_Delay_Ms).toBe(1000);
		});
	});

	describe('register', () => {
		describe('initially checks the query parameters for the presence of an admin id', () => {
			it('does nothing when no layer query param is available', async () => {
				const store = setup();
				const queryParam = new URLSearchParams();
				spyOn(environmentService, 'getQueryParams').and.returnValue(queryParam);
				const instanceUnderTest = new FileStoragePlugin();

				await instanceUnderTest.register(store);

				expect(store.getState().fileStorage.adminId).toBeNull();
			});

			it('does nothing when no admin id is detected', async () => {
				const store = setup();
				const queryParam = new URLSearchParams(`${QueryParameters.LAYER}=foo`);
				spyOn(environmentService, 'getQueryParams').and.returnValue(queryParam);
				spyOn(fileStorageService, 'isAdminId').and.returnValue(false);
				const instanceUnderTest = new FileStoragePlugin();

				await instanceUnderTest.register(store);

				expect(store.getState().fileStorage.adminId).toBeNull();
			});

			it('sets the admin id when an admin id is detected', async () => {
				const store = setup();
				const queryParam = new URLSearchParams(`${QueryParameters.LAYER}=foo`);
				spyOn(environmentService, 'getQueryParams').and.returnValue(queryParam);
				spyOn(fileStorageService, 'isAdminId').and.returnValue(true);
				const instanceUnderTest = new FileStoragePlugin();

				await instanceUnderTest.register(store);

				expect(store.getState().fileStorage.adminId).toBe('foo');
			});
		});

		describe('registers an observer for fileStorage `data` property changes', () => {
			it('saves the data in debounced manner', async () => {
				const data = { foo: 'bar' };
				const data2 = { foo: 'bar2' };
				const adminId = 'adminId';
				const store = setup({
					fileStorage: {
						adminId
					}
				});
				const queryParam = new URLSearchParams();
				spyOn(environmentService, 'getQueryParams').and.returnValue(queryParam);
				const instanceUnderTest = new FileStoragePlugin();
				const saveDataSpy = spyOn(instanceUnderTest, '_saveData');
				await instanceUnderTest.register(store);

				setData(data);
				setData(data2);

				await TestUtils.timeout(FileStoragePlugin.Debounce_Delay_Ms + 100);

				expect(saveDataSpy).toHaveBeenCalledOnceWith(adminId, data2);
			});
		});
	});

	describe('_saveData', () => {
		beforeEach(async () => {
			const queryParam = new URLSearchParams();
			spyOn(environmentService, 'getQueryParams').and.returnValue(queryParam);
		});

		describe('source type cannot be detected', () => {
			it('throws an error', async () => {
				const data = { foo: 'bar' };
				const adminId = 'adminId';
				const store = setup();
				spyOn(sourceTypeService, 'forData').withArgs(data).and.returnValue(new SourceTypeResult(SourceTypeResultStatus.OTHER));
				const instanceUnderTest = new FileStoragePlugin();
				await instanceUnderTest.register(store);

				await expectAsync(instanceUnderTest._saveData(adminId, data)).toBeRejectedWithError(
					`Unexpected source type status: ${SourceTypeResultStatus.OTHER}`
				);
			});
		});

		describe('source type is other than KML', () => {
			it('throws an error', async () => {
				const data = { foo: 'bar' };
				const adminId = 'adminId';
				const store = setup();

				spyOn(sourceTypeService, 'forData')
					.withArgs(data)
					.and.returnValue(new SourceTypeResult(SourceTypeResultStatus.OK, new SourceType(SourceTypeName.GEOJSON)));
				const instanceUnderTest = new FileStoragePlugin();
				await instanceUnderTest.register(store);

				await expectAsync(instanceUnderTest._saveData(adminId, data)).toBeRejectedWithError(`Unsupported source type: ${SourceTypeName.GEOJSON}`);
			});
		});

		describe('source type is supported', () => {
			describe('admin id is present', () => {
				it('calls the FileStorageService and updates the fileStorage s-o-s', async () => {
					const data = { foo: 'bar' };
					const adminId = 'adminId';
					const fileId = 'fileId';
					const store = setup();
					spyOn(sourceTypeService, 'forData')
						.withArgs(data)
						.and.returnValue(new SourceTypeResult(SourceTypeResultStatus.OK, new SourceType(SourceTypeName.KML)));
					const instanceUnderTest = new FileStoragePlugin();
					await instanceUnderTest.register(store);
					spyOn(fileStorageService, 'save').withArgs(adminId, data, FileStorageServiceDataTypes.KML).and.resolveTo({ adminId, fileId });

					await instanceUnderTest._saveData(adminId, data);

					expect(store.getState().fileStorage.fileId).toBe(fileId);
					expect(store.getState().fileStorage.latest.payload).toEqual({
						success: true,
						created: jasmine.any(Number),
						lastSaved: jasmine.any(Number)
					});
				});
			});

			describe('admin id is NOT present', () => {
				it('calls the FileStorageService and updates the fileStorage s-o-s', async () => {
					const data = { foo: 'bar' };
					const adminId = 'adminId';
					const fileId = 'fileId';
					const store = setup();
					spyOn(sourceTypeService, 'forData')
						.withArgs(data)
						.and.returnValue(new SourceTypeResult(SourceTypeResultStatus.OK, new SourceType(SourceTypeName.KML)));
					const instanceUnderTest = new FileStoragePlugin();
					await instanceUnderTest.register(store);
					spyOn(fileStorageService, 'save').withArgs(null, data, FileStorageServiceDataTypes.KML).and.resolveTo({ adminId, fileId });

					await instanceUnderTest._saveData(null, data);

					expect(store.getState().fileStorage.fileId).toBe(fileId);
					expect(store.getState().fileStorage.adminId).toBe(adminId);
					expect(store.getState().fileStorage.latest.payload).toEqual({
						success: true,
						created: jasmine.any(Number),
						lastSaved: jasmine.any(Number)
					});
				});
			});
			describe('FileStorageService throws', () => {
				it('emits a notification and updates the fileStorage s-o-s', async () => {
					const data = { foo: 'bar' };
					const error = 'error';
					const store = setup();
					spyOn(sourceTypeService, 'forData')
						.withArgs(data)
						.and.returnValue(new SourceTypeResult(SourceTypeResultStatus.OK, new SourceType(SourceTypeName.KML)));
					const instanceUnderTest = new FileStoragePlugin();
					await instanceUnderTest.register(store);
					spyOn(fileStorageService, 'save').and.rejectWith(error);
					const consoleSpy = spyOn(console, 'error');

					await instanceUnderTest._saveData(null, data);

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
