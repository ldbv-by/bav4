import { $injector } from '../../../../../../src/injection';
import { MeasurementStorageService } from '../../../../../../src/modules/map/components/olMap/services/MeasurementStorageService';
import { FileStorageServiceDataTypes } from '../../../../../../src/services/FileStorageService';
import { drawReducer } from '../../../../../../src/store/draw/draw.reducer';
import { setFileSaveResult } from '../../../../../../src/store/measurement/measurement.action';
import { measurementReducer } from '../../../../../../src/store/measurement/measurement.reducer';
import { TestUtils } from '../../../../../test-utils.js';

describe('MeasurementStorageService', () => {
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
		active: false,
		statistic: { length: 0, area: 0 },
		reset: null,
		fileSaveResult: { adminId: 'init', fileId: 'init' }
	};

	const setup = (state = initialState) => {
		const measurementState = {
			measurement: state,
			draw: state
		};
		const store = TestUtils.setupStoreAndDi(measurementState, { measurement: measurementReducer, draw: drawReducer });
		$injector.registerSingleton('TranslationService', { translate: (key) => key })
			.registerSingleton('FileStorageService', fileStorageServiceMock);
		return store;
	};

	it('has methods', () => {
		setup();
		const classUnderTest = new MeasurementStorageService();
		expect(classUnderTest).toBeTruthy();
		expect(classUnderTest.isValid).toBeTruthy();
		expect(classUnderTest.store).toBeTruthy();
		expect(classUnderTest.isStorageId).toBeTruthy();
		expect(classUnderTest.setStorageId).toBeTruthy();
		expect(classUnderTest.getStorageId).toBeTruthy();
	});

	it('sets the storage id correctly', () => {
		const store = setup({ ...initialState, fileSaveResult: null });

		const classUnderTest = new MeasurementStorageService();

		classUnderTest.setStorageId('f_someId');
		expect(store.getState().measurement.fileSaveResult).toEqual({ fileId: 'f_someId', adminId: null });
		expect(store.getState().draw.fileSaveResult).toEqual({ fileId: 'f_someId', adminId: null });
		classUnderTest.setStorageId('a_someId');
		expect(store.getState().measurement.fileSaveResult).toEqual({ fileId: null, adminId: 'a_someId' });
		expect(store.getState().draw.fileSaveResult).toEqual({ fileId: null, adminId: 'a_someId' });
	});

	it('returns valid Id or null', () => {
		const store = setup();
		const classUnderTest = new MeasurementStorageService();

		expect(classUnderTest.getStorageId()).toBe('init');
		classUnderTest.setStorageId('a_someId');
		expect(store.getState().measurement.fileSaveResult).toEqual({ fileId: null, adminId: 'a_someId' });
		expect(store.getState().draw.fileSaveResult).toEqual({ fileId: null, adminId: 'a_someId' });
		expect(classUnderTest.getStorageId()).toBeNull();
		setFileSaveResult(null);
		expect(classUnderTest.getStorageId()).toBeNull();
	});

	it('recognize storageIds', () => {
		setup();
		const classUnderTest = new MeasurementStorageService();

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
		const classUnderTest = new MeasurementStorageService();

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

		const classUnderTest = new MeasurementStorageService();
		await classUnderTest.store(content, FileStorageServiceDataTypes.KML);

		expect(store.getState().measurement.fileSaveResult).toEqual({ fileId: 'fooBarId', adminId: 'barBazId' });
		expect(store.getState().draw.fileSaveResult).toEqual({ fileId: 'fooBarId', adminId: 'barBazId' });
		expect(saveSpy).toHaveBeenCalledTimes(1);
		expect(saveSpy).toHaveBeenCalledWith(null, content, FileStorageServiceDataTypes.KML);

	});

	it('stores new content in the fileStorage', async () => {
		const store = setup({ ...initialState, fileSaveResult: { fileId: 'f_someId', adminId: 'a_someId' } });
		const content = 'someContent';
		const saveSpy = spyOn(fileStorageServiceMock, 'save').and.returnValue(
			Promise.resolve({ fileId: 'fooBarId', adminId: 'barBazId' })
		);

		const classUnderTest = new MeasurementStorageService();
		await classUnderTest.store(content, FileStorageServiceDataTypes.KML);

		expect(store.getState().measurement.fileSaveResult).toEqual({ fileId: 'fooBarId', adminId: 'barBazId' });
		expect(store.getState().draw.fileSaveResult).toEqual({ fileId: 'fooBarId', adminId: 'barBazId' });
		expect(saveSpy).toHaveBeenCalledTimes(1);
		expect(saveSpy).toHaveBeenCalledWith('a_someId', content, FileStorageServiceDataTypes.KML);

	});

	it('resets state store on empty content', async () => {
		const store = setup({ ...initialState, fileSaveResult: { fileId: 'f_someId', adminId: 'a_someId' } });
		const emptyContent = null;

		const classUnderTest = new MeasurementStorageService();
		await classUnderTest.store(emptyContent, FileStorageServiceDataTypes.KML);

		expect(store.getState().measurement.fileSaveResult).toBeNull();
		expect(store.getState().draw.fileSaveResult).toBeNull();
	});

	it('logs a warning on initial store', async () => {
		const store = setup({ ...initialState, fileSaveResult: null });
		const content = 'someContent';
		const warnSpy = spyOn(console, 'warn');
		spyOn(fileStorageServiceMock, 'save').and.returnValue(
			Promise.reject(new Error('Failed'))
		);

		const classUnderTest = new MeasurementStorageService();
		await classUnderTest.store(content, FileStorageServiceDataTypes.KML);

		expect(store.getState().measurement.fileSaveResult).toBeNull();
		expect(store.getState().draw.fileSaveResult).toBeNull();
		expect(warnSpy).toHaveBeenCalledWith('Could not store content initially:', jasmine.any(Error));
	});

	it('logs a warning on second store', async () => {
		const store = setup({ ...initialState, fileSaveResult: { fileId: 'f_someId', adminId: 'a_someId' } });
		const content = 'someContent';
		const warnSpy = spyOn(console, 'warn');
		spyOn(fileStorageServiceMock, 'save').and.returnValue(
			Promise.reject(new Error('Failed'))
		);

		const classUnderTest = new MeasurementStorageService();
		await classUnderTest.store(content, FileStorageServiceDataTypes.KML);

		expect(store.getState().measurement.fileSaveResult).toEqual({ fileId: 'f_someId', adminId: 'a_someId' });
		expect(store.getState().draw.fileSaveResult).toEqual({ fileId: 'f_someId', adminId: 'a_someId' });
		expect(warnSpy).toHaveBeenCalledWith('Could not store content:', jasmine.any(Error));
	});


});

