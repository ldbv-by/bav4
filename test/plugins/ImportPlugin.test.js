import { $injector } from '../../src/injection';
import { notificationReducer } from '../../src/store/notifications/notifications.reducer';
import { importReducer } from '../../src/store/import/import.reducer';
import { setUrl, setData } from '../../src/store/import/import.action';
import { TestUtils } from '../test-utils';
import { provide } from '../../src/plugins/i18n/importPlugin.provider.js';
import { ImportPlugin, LAYER_ADDING_DELAY_MS } from '../../src/plugins/ImportPlugin';
import { MediaType } from '../../src/services/HttpService';
import { layersReducer } from '../../src/store/layers/layers.reducer';
import { LevelTypes } from '../../src/store/notifications/notifications.action';
import { SourceType, SourceTypeName } from '../../src/services/domain/sourceType';
import { createNoInitialStateMainMenuReducer } from '../../src/store/mainMenu/mainMenu.reducer';
import { TabId } from '../../src/store/mainMenu/mainMenu.action';

describe('LAYER_ADDING_DELAY_MS', () => {

	it('exports a const defining amount of time waiting before adding a layer', async () => {

		expect(LAYER_ADDING_DELAY_MS).toBe(500);
	});
});

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
			mainMenu: {
				tab: TabId.MISC
			},
			...state
		};
		const store = TestUtils.setupStoreAndDi(initialState, {
			layers: layersReducer,
			import: importReducer,
			notifications: notificationReducer,
			mainMenu: createNoInitialStateMainMenuReducer()
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
				expect(spy).toHaveBeenCalledWith('http://some.url', { sourceType: sourceType });
				done();
			});

		});

		it('adds a layer and set the correct MainMenu tab index', async (done) => {
			const store = setup();
			const geoResourceFutureMock = {
				id: 'idFoo', label: 'labelBar', onReject: () => { }
			};
			const sourceType = new SourceType(SourceTypeName.KML);
			const spy = spyOn(importVectorDataServiceMock, 'forUrl').and.callFake(() => geoResourceFutureMock);
			const instanceUnderTest = new ImportPlugin();
			await instanceUnderTest.register(store);

			expect(store.getState().layers.active.length).toBe(0);
			setUrl('http://some.url', sourceType);

			setTimeout(() => {
				expect(spy).toHaveBeenCalledWith('http://some.url', { sourceType: sourceType });
				expect(store.getState().layers.active.length).toBe(1);
				expect(store.getState().layers.active[0].id).toBe('idFoo');
				expect(store.getState().layers.active[0].label).toBe('labelBar');
				expect(store.getState().mainMenu.tab).toBe(TabId.MAPS);
				done();
			}, LAYER_ADDING_DELAY_MS + 100);

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
			const sourceType = new SourceType(SourceTypeName.KML);
			await instanceUnderTest.register(store);

			setData('<kml some=thing></kml>', sourceType);

			expect(spy).toHaveBeenCalledWith('<kml some=thing></kml>', { sourceType: sourceType });
		});

		it('adds a layer and set the correct MainMenu tab index', async (done) => {
			const store = setup();
			const geoResourceStub = { id: 'idFoo', label: 'labelBar' };
			spyOn(importVectorDataServiceMock, 'forData').and.callFake(() => geoResourceStub);
			const instanceUnderTest = new ImportPlugin();
			await instanceUnderTest.register(store);

			expect(store.getState().layers.active.length).toBe(0);
			setData('<kml some=thing></kml>', MediaType.KML);

			setTimeout(() => {
				expect(store.getState().layers.active.length).toBe(1);
				expect(store.getState().layers.active[0].id).toBe('idFoo');
				expect(store.getState().layers.active[0].label).toBe('labelBar');
				expect(store.getState().mainMenu.tab).toBe(TabId.MAPS);
				done();
			}, LAYER_ADDING_DELAY_MS + 100);
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
});
