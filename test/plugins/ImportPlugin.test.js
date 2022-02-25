import { $injector } from '../../src/injection';
import { notificationReducer } from '../../src/store/notifications/notifications.reducer';
import { importReducer } from '../../src/store/import/import.reducer';
import { setUrl, setData } from '../../src/store/import/import.action';
import { TestUtils } from '../test-utils';
import { provide } from '../../src/plugins/i18n/importPlugin.provider.js';
import { ImportPlugin } from '../../src/plugins/ImportPlugin';
import { MediaType } from '../../src/services/HttpService';
import { layersReducer } from '../../src/store/layers/layers.reducer';
import { LevelTypes } from '../../src/store/notifications/notifications.action';
import { VectorSourceType } from '../../src/services/domain/geoResources';
import { SourceType, SourceTypeName } from '../../src/services/domain/sourceType';

describe('ImportPlugin', () => {

	const importVectorDataServiceMock = {
		forUrl: async () => { },
		forData: () => { }
	};

	const translationServiceMock = {
		register() { },
		translate: (key) => key
	};

	const setup = (state) => {
		const initialState = {
			import: { latest: null },
			...state
		};
		const store = TestUtils.setupStoreAndDi(initialState, {
			layers: layersReducer,
			import: importReducer,
			notifications: notificationReducer
		});
		$injector
			.registerSingleton('ImportVectorDataService', importVectorDataServiceMock)
			.registerSingleton('TranslationService', translationServiceMock);
		return store;
	};

	describe('constructor', () => {

		it('registers an i18n provider', async () => {
			const translationServiceSpy = spyOn(translationServiceMock, 'register');
			setup();

			new ImportPlugin();

			expect(translationServiceSpy).toHaveBeenCalledWith('importPluginProvider', provide);
		});
	});

	describe('when import.url property changes', () => {

		it('calls the ImportVectorDataService for vector-url', async (done) => {
			const store = setup();
			const sourceType = new SourceType(SourceTypeName.KML);
			const spy = spyOn(importVectorDataServiceMock, 'forUrl');
			const instanceUnderTest = new ImportPlugin();
			await instanceUnderTest.register(store);

			setUrl('http://some.url', sourceType);

			setTimeout(() => {
				expect(spy).toHaveBeenCalledWith('http://some.url', { sourceType: VectorSourceType.KML });
				done();
			});

		});

		it('adds a layer', async (done) => {
			const store = setup();
			const geoResourceFutureMock = {
				id: 'idFoo', label: 'labelBar', onReject: () => { }
			};
			const sourceType = new SourceType(SourceTypeName.KML);
			const spy = spyOn(importVectorDataServiceMock, 'forUrl').and.callFake(() => geoResourceFutureMock);
			const instanceUnderTest = new ImportPlugin();
			const mapSourceTypeToVectorSourceTypeSpy = spyOn(instanceUnderTest, '_mapSourceTypeToVectorSourceType').and.returnValue(VectorSourceType.KML);
			await instanceUnderTest.register(store);

			expect(store.getState().layers.active.length).toBe(0);
			setUrl('http://some.url', sourceType);

			setTimeout(() => {
				expect(spy).toHaveBeenCalledWith('http://some.url', { sourceType: VectorSourceType.KML });
				expect(store.getState().layers.active.length).toBe(1);
				expect(store.getState().layers.active[0].id).toBe('idFoo');
				expect(store.getState().layers.active[0].label).toBe('labelBar');
				expect(mapSourceTypeToVectorSourceTypeSpy).toHaveBeenCalledWith(sourceType);
				done();
			});

		});

		it('emits a notification and logs a warning when sourceType is NULL', async (done) => {
			const store = setup();
			const instanceUnderTest = new ImportPlugin();
			await instanceUnderTest.register(store);

			setUrl('http://some.url', null);

			setTimeout(() => {
				expect(store.getState().notifications.latest.payload.content).toBe('importPlugin_unsupported_sourceType');
				expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.WARN);
				done();
			});
		});

		it('emits a notification for unsupported WMS urls', async (done) => {
			const store = setup();
			const sourceType = new SourceType(SourceTypeName.WMS);
			const spy = spyOn(importVectorDataServiceMock, 'forUrl');
			const instanceUnderTest = new ImportPlugin();
			await instanceUnderTest.register(store);

			setUrl('http://some.url', sourceType);

			setTimeout(() => {
				expect(spy).not.toHaveBeenCalled();
				expect(store.getState().notifications.latest.payload.content).toBe('importPlugin_unsupported_sourceType');
				expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.WARN);
				done();
			});
		});


		it('emits a notification when GeoResourceFuture rejects', async (done) => {
			const store = setup();
			const geoResourceFutureMock = {
				id: 'idFoo', label: 'labelBar', onReject: (f) => {
					f();
				}
			};
			const sourceType = new SourceType(SourceTypeName.KML);
			spyOn(importVectorDataServiceMock, 'forUrl').and.callFake(() => geoResourceFutureMock);
			const instanceUnderTest = new ImportPlugin();
			await instanceUnderTest.register(store);

			expect(store.getState().layers.active.length).toBe(0);
			setUrl('http://some.url', sourceType);

			setTimeout(() => {
				expect(store.getState().notifications.latest.payload.content).toBe('importPlugin_url_failed');
				expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.ERROR);
				done();
			});
		});
	});

	describe('when import.data property changes', () => {

		it('calls the ImportVectorDataService', async () => {
			const store = setup();
			const spy = spyOn(importVectorDataServiceMock, 'forData');
			const instanceUnderTest = new ImportPlugin();
			await instanceUnderTest.register(store);

			setData('<kml some=thing></kml>', new SourceType(SourceTypeName.KML));

			expect(spy).toHaveBeenCalledWith('<kml some=thing></kml>', { sourceType: VectorSourceType.KML });
		});

		it('adds a layer', async () => {
			const store = setup();
			const geoResourceStub = { id: 'idFoo', label: 'labelBar' };
			spyOn(importVectorDataServiceMock, 'forData').and.callFake(() => geoResourceStub);
			const instanceUnderTest = new ImportPlugin();
			await instanceUnderTest.register(store);

			expect(store.getState().layers.active.length).toBe(0);
			setData('<kml some=thing></kml>', MediaType.KML);

			expect(store.getState().layers.active.length).toBe(1);
			expect(store.getState().layers.active[0].id).toBe('idFoo');
			expect(store.getState().layers.active[0].label).toBe('labelBar');
		});

		it('emits a notification when importVectorDataService returns NULL', async () => {
			const store = setup();
			spyOn(importVectorDataServiceMock, 'forData').and.returnValue(null);
			const instanceUnderTest = new ImportPlugin();
			await instanceUnderTest.register(store);

			setData('<kml some=thing></kml>', MediaType.KML);

			setTimeout(() => {
				expect(store.getState().notifications.latest.payload.content).toBe('importPlugin_data_failed');
				expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.ERROR);
			});
		});
	});

	describe('_mapSourceTypeToVectorSourceType', () => {

		it('maps a SourceType to a VectorSourceType', () => {
			setup();
			const instanceUnderTest = new ImportPlugin();

			expect(instanceUnderTest._mapSourceTypeToVectorSourceType()).toBeNull();
			expect(instanceUnderTest._mapSourceTypeToVectorSourceType(new SourceType(SourceTypeName.KML))).toBe(VectorSourceType.KML);
			expect(instanceUnderTest._mapSourceTypeToVectorSourceType(new SourceType(SourceTypeName.GPX))).toBe(VectorSourceType.GPX);
			expect(instanceUnderTest._mapSourceTypeToVectorSourceType(new SourceType(SourceTypeName.GEOJSON))).toBe(VectorSourceType.GEOJSON);
			expect(instanceUnderTest._mapSourceTypeToVectorSourceType(new SourceType(SourceTypeName.WMS))).toBeNull();
		});
	});

});
