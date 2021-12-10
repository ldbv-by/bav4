import { $injector } from '../../../../../../src/injection';
import { InteractionStorageService } from '../../../../../../src/modules/map/components/olMap/services/InteractionStorageService';
import { FileStorageServiceDataTypes } from '../../../../../../src/services/FileStorageService';
import { setFileSaveResult } from '../../../../../../src/store/shared/shared.action';
import { sharedReducer } from '../../../../../../src/store/shared/shared.reducer';
import { TestUtils } from '../../../../../test-utils.js';

describe('InteractionStorageService', () => {
	const fileStorageServiceMock = {
		async save(adminId, content, format) {
			if (adminId) {
				return Promise.resolve({ fileId: 'f_' + adminId + '_' + format });
			}
			return Promise.resolve({ fileId: 'f_' + format + '_' + content });
		},
		isFileId(id) {
			return id.startsWith('f_');
		},
		isAdminId(id) {
			return id.startsWith('a_');
		}

	};
	const initialState = {
		termsOfUseAcknowledged: false,
		fileSaveResult: { adminId: 'init', fileId: 'init' }
	};

	const setup = (state = initialState) => {
		const store = TestUtils.setupStoreAndDi({ shared: state }, { shared: sharedReducer });
		$injector.registerSingleton('TranslationService', { translate: (key) => key })
			.registerSingleton('FileStorageService', fileStorageServiceMock);
		return store;
	};

	it('has methods', () => {
		setup();
		const classUnderTest = new InteractionStorageService();
		expect(classUnderTest).toBeTruthy();
		expect(classUnderTest.isValid).toBeTruthy();
		expect(classUnderTest.store).toBeTruthy();
		expect(classUnderTest.isStorageId).toBeTruthy();
		expect(classUnderTest.setStorageId).toBeTruthy();
		expect(classUnderTest.getStorageId).toBeTruthy();
	});

	it('sets the storage id correctly', () => {
		const store = setup({ ...initialState, fileSaveResult: null });

		const classUnderTest = new InteractionStorageService();

		classUnderTest.setStorageId('f_someId');
		expect(store.getState().shared.fileSaveResult).toEqual({ fileId: 'f_someId', adminId: null });
		classUnderTest.setStorageId('a_someId');
		expect(store.getState().shared.fileSaveResult).toEqual({ fileId: null, adminId: 'a_someId' });
	});

	it('returns valid Id or null', () => {
		const store = setup();
		const classUnderTest = new InteractionStorageService();

		expect(classUnderTest.getStorageId()).toBe('init');
		classUnderTest.setStorageId('a_someId');
		expect(store.getState().shared.fileSaveResult).toEqual({ fileId: null, adminId: 'a_someId' });
		expect(classUnderTest.getStorageId()).toBeNull();
		setFileSaveResult(null);
		expect(classUnderTest.getStorageId()).toBeNull();
	});

	it('recognize storageIds', () => {
		setup();
		const classUnderTest = new InteractionStorageService();

		expect(classUnderTest.isStorageId('f_someId')).toBeTrue();
		expect(classUnderTest.isStorageId('a_someId')).toBeTrue();
		expect(classUnderTest.isStorageId('x_someId')).toBeFalse();
		expect(classUnderTest.isStorageId('someId')).toBeFalse();
		expect(classUnderTest.isStorageId('')).toBeFalse();
		expect(classUnderTest.isStorageId(null)).toBeFalse();
		expect(classUnderTest.isStorageId(undefined)).toBeFalse();
	});

	it('detect valid storage state', () => {
		setup();
		const validFileSaveResult = { adminId: 'a_someId', fileId: 'f_someId' };
		const classUnderTest = new InteractionStorageService();

		expect(classUnderTest.isValid()).toBeFalse();
		classUnderTest.setStorageId('a_someId');
		expect(classUnderTest.isValid()).toBeFalse();
		classUnderTest.setStorageId('f_someId');
		expect(classUnderTest.isValid()).toBeFalse();
		setFileSaveResult(null);
		expect(classUnderTest.isValid()).toBeFalse();
		setFileSaveResult(validFileSaveResult);
		expect(classUnderTest.isValid()).toBeTrue();
	});

	it('stores initial content in the fileStorage', async () => {
		const store = setup({ ...initialState, fileSaveResult: null });
		const content = 'someContent';
		const saveSpy = spyOn(fileStorageServiceMock, 'save').and.returnValue(
			Promise.resolve({ fileId: 'fooBarId', adminId: 'barBazId' })
		);

		const classUnderTest = new InteractionStorageService();
		await classUnderTest.store(content, FileStorageServiceDataTypes.KML);

		expect(store.getState().shared.fileSaveResult).toEqual({ fileId: 'fooBarId', adminId: 'barBazId' });
		expect(saveSpy).toHaveBeenCalledTimes(1);
		expect(saveSpy).toHaveBeenCalledWith(null, content, FileStorageServiceDataTypes.KML);

	});

	it('stores new content in the fileStorage', async () => {
		const store = setup({ ...initialState, fileSaveResult: { fileId: 'f_someId', adminId: 'a_someId' } });
		const content = 'someContent';
		const saveSpy = spyOn(fileStorageServiceMock, 'save').and.returnValue(
			Promise.resolve({ fileId: 'fooBarId', adminId: 'barBazId' })
		);

		const classUnderTest = new InteractionStorageService();
		await classUnderTest.store(content, FileStorageServiceDataTypes.KML);

		expect(store.getState().shared.fileSaveResult).toEqual({ fileId: 'fooBarId', adminId: 'barBazId' });
		expect(saveSpy).toHaveBeenCalledTimes(1);
		expect(saveSpy).toHaveBeenCalledWith('a_someId', content, FileStorageServiceDataTypes.KML);

	});

	it('resets state store on empty content', async () => {
		const store = setup({ ...initialState, fileSaveResult: { fileId: 'f_someId', adminId: 'a_someId' } });
		const emptyContent = null;

		const classUnderTest = new InteractionStorageService();
		await classUnderTest.store(emptyContent, FileStorageServiceDataTypes.KML);

		expect(store.getState().shared.fileSaveResult).toBeNull();
	});

	it('logs a warning on initial store', async () => {
		const store = setup({ ...initialState, fileSaveResult: null });
		const content = 'someContent';
		const warnSpy = spyOn(console, 'warn');
		spyOn(fileStorageServiceMock, 'save').and.returnValue(
			Promise.reject(new Error('Failed'))
		);

		const classUnderTest = new InteractionStorageService();
		await classUnderTest.store(content, FileStorageServiceDataTypes.KML);

		expect(store.getState().shared.fileSaveResult).toBeNull();
		expect(warnSpy).toHaveBeenCalledWith('Could not store content initially:', jasmine.any(Error));
	});

	it('logs a warning on second store', async () => {
		const store = setup({ ...initialState, fileSaveResult: { fileId: 'f_someId', adminId: 'a_someId' } });
		const content = 'someContent';
		const warnSpy = spyOn(console, 'warn');
		spyOn(fileStorageServiceMock, 'save').and.returnValue(
			Promise.reject(new Error('Failed'))
		);

		const classUnderTest = new InteractionStorageService();
		await classUnderTest.store(content, FileStorageServiceDataTypes.KML);

		expect(store.getState().shared.fileSaveResult).toEqual({ fileId: 'f_someId', adminId: 'a_someId' });
		expect(warnSpy).toHaveBeenCalledWith('Could not store content:', jasmine.any(Error));
	});


});

