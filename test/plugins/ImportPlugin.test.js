import { $injector } from '../../src/injection';
import { notificationReducer } from '../../src/store/notifications/notifications.reducer';
import { importReducer } from '../../src/store/import/import.reducer';
import { setUrl, setData } from '../../src/store/import/import.action';
import { TestUtils } from '../test-utils';
import { provide } from '../../src/plugins/i18n/importPlugin.provider.js';
import { ImportPlugin } from '../../src/plugins/ImportPlugin';
import { SourceType, SourceTypeName } from '../../src/services/SourceTypeService';
import { MediaType } from '../../src/services/HttpService';
import { layersReducer } from '../../src/store/layers/layers.reducer';
import { LevelTypes } from '../../src/store/notifications/notifications.action';
import { VectorSourceType } from '../../src/services/domain/geoResources';

describe('ImportPlugin', () => {

	const importVectorDataServiceMock = {
		importVectorDataFromUrl: async () => { },
		importVectorData: () => { }
	};

	const sourceTypeServiceMock = {
		forURL: () => false,
		forData: () => false
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
			.registerSingleton('SourceTypeService', sourceTypeServiceMock)
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

		it('calls the sourceTypeService', async () => {
			const store = setup();
			const spy = spyOn(sourceTypeServiceMock, 'forURL');
			const instanceUnderTest = new ImportPlugin();
			await instanceUnderTest.register(store);

			setUrl('http://some.url');
			setTimeout(() => {
				expect(spy).toHaveBeenCalledWith('http://some.url');
			});

		});

		it('calls the ImportVectorDataService for vector-url', async () => {
			const store = setup();
			const sourceType = new SourceType(SourceTypeName.KML);
			spyOn(sourceTypeServiceMock, 'forURL').and.callFake(() => sourceType);
			const spy = spyOn(importVectorDataServiceMock, 'importVectorDataFromUrl');
			const instanceUnderTest = new ImportPlugin();
			await instanceUnderTest.register(store);

			setUrl('http://some.url');
			setTimeout(() => {
				expect(spy).toHaveBeenCalledWith('http://some.url');
			});

		});

		it('adds a layer', async () => {
			const store = setup();
			const geoResourceFutureMock = {
				id: 'idFoo', label: 'labelBar', onReject: () => { }
			};
			const sourceType = new SourceType(SourceTypeName.KML);
			spyOn(sourceTypeServiceMock, 'forURL').and.callFake(() => Promise.resolve(sourceType));
			const spy = spyOn(importVectorDataServiceMock, 'importVectorDataFromUrl').and.callFake(() => geoResourceFutureMock);
			const instanceUnderTest = new ImportPlugin();
			await instanceUnderTest.register(store);

			expect(store.getState().layers.active.length).toBe(0);
			setUrl('http://some.url');
			setTimeout(() => {
				expect(spy).toHaveBeenCalledWith('http://some.url');
				setTimeout(() => {
					expect(store.getState().layers.active.length).toBe(1);
					expect(store.getState().layers.active[0].id).toBe('idFoo');
					expect(store.getState().layers.active[0].label).toBe('labelBar');
				});
			});

		});

		it('does NOT calls the ImportVectorDataService for unsupported URLs', async () => {
			const store = setup();
			const sourceType = new SourceType(SourceTypeName.WMS);
			spyOn(sourceTypeServiceMock, 'forURL').and.callFake(() => sourceType);
			const spy = spyOn(importVectorDataServiceMock, 'importVectorDataFromUrl');
			const instanceUnderTest = new ImportPlugin();
			await instanceUnderTest.register(store);

			setUrl('http://some.url');
			setTimeout(() => {
				expect(spy).not.toHaveBeenCalled();
				expect(store.getState().notifications.latest.payload.content).toBe('importPlugin_url_not_supported:wms');
				expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.ERROR);
			});
		});


		it('does NOT add a layer, emits notification on failure', async () => {
			const store = setup();
			const geoResourceFutureMock = {
				id: 'idFoo', label: 'labelBar', onReject: (f) => {
					f();
				}
			};
			const sourceType = new SourceType(SourceTypeName.KML);
			spyOn(sourceTypeServiceMock, 'forURL').and.callFake(() => sourceType);
			spyOn(importVectorDataServiceMock, 'importVectorDataFromUrl').and.callFake(() => geoResourceFutureMock);
			const instanceUnderTest = new ImportPlugin();
			await instanceUnderTest.register(store);

			expect(store.getState().layers.active.length).toBe(0);
			setUrl('http://some.url');
			setTimeout(() => {
				expect(store.getState().notifications.latest.payload.content).toBe('importPlugin_url_failed:http://some.url');
				expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.ERROR);
			});

		});
	});

	describe('when import.data property changes', () => {

		it('does NOT calls the sourceTypeService', async () => {
			const store = setup();
			const spy = spyOn(sourceTypeServiceMock, 'forData');

			const instanceUnderTest = new ImportPlugin();
			await instanceUnderTest.register(store);

			setData('<kml some=thing></kml>', MediaType.KML);


			expect(spy).not.toHaveBeenCalled();
		});

		it('calls the ImportVectorDataService', async () => {
			const store = setup();
			const spy = spyOn(importVectorDataServiceMock, 'importVectorData');
			const instanceUnderTest = new ImportPlugin();
			await instanceUnderTest.register(store);

			setData('<kml some=thing></kml>', MediaType.KML);


			expect(spy).toHaveBeenCalledWith('<kml some=thing></kml>', { sourceType: VectorSourceType.KML });
		});

		it('adds a layer', async () => {
			const store = setup();
			const geoResourceStub = { id: 'idFoo', label: 'labelBar' };

			spyOn(importVectorDataServiceMock, 'importVectorData').and.callFake(() => geoResourceStub);
			const instanceUnderTest = new ImportPlugin();
			await instanceUnderTest.register(store);

			expect(store.getState().layers.active.length).toBe(0);
			setData('<kml some=thing></kml>', MediaType.KML);

			expect(store.getState().layers.active.length).toBe(1);
			expect(store.getState().layers.active[0].id).toBe('idFoo');
			expect(store.getState().layers.active[0].label).toBe('labelBar');
		});
	});

});
