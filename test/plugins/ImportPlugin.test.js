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
import { SourceType, SourceTypeName } from '../../src/domain/sourceType';
import { createNoInitialStateMainMenuReducer } from '../../src/store/mainMenu/mainMenu.reducer';
import { TabId } from '../../src/store/mainMenu/mainMenu.action';
import { positionReducer } from '../../src/store/position/position.reducer';
import { QueryParameters } from '../../src/domain/queryParameters';

describe('LAYER_ADDING_DELAY_MS', () => {

	it('exports a const defining amount of time waiting before adding a layer', async () => {

		expect(LAYER_ADDING_DELAY_MS).toBe(500);
	});
});

describe('ImportPlugin', () => {

	const windowMock = {
		location: {
			get search() {
				return null;
			}
		}
	};

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
			mainMenu: createNoInitialStateMainMenuReducer(),
			position: positionReducer
		});
		$injector
			.registerSingleton('EnvironmentService', { getWindow: () => windowMock })
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

	describe('_import', () => {

		describe('from URL', () => {

			it('adds a layer and set the correct MainMenu tab index', async () => {
				const store = setup();
				const geoResourceFutureMock = {
					id: 'idFoo', label: 'labelBar', onReject: () => { }
				};
				const url = 'http://some.url';
				const sourceType = new SourceType(SourceTypeName.KML);
				const instanceUnderTest = new ImportPlugin();
				spyOn(instanceUnderTest, '_importByUrl').withArgs(url, sourceType).and.callFake(() => geoResourceFutureMock);
				await instanceUnderTest.register(store);

				expect(store.getState().layers.active.length).toBe(0);
				expect(store.getState().position.fitLayerRequest.payload).toBeNull();

				instanceUnderTest._import(url, sourceType);

				await TestUtils.timeout(LAYER_ADDING_DELAY_MS + 100);
				expect(store.getState().layers.active.length).toBe(1);
				expect(store.getState().layers.active[0].id).toBe('idFoo');
				expect(store.getState().layers.active[0].label).toBe('labelBar');
				expect(store.getState().mainMenu.tab).toBe(TabId.MAPS);
				expect(store.getState().position.fitLayerRequest.payload).not.toBeNull();
			});

			it('does nothing when GeoResource is not available', async () => {
				const store = setup();
				const url = 'http://some.url';
				const sourceType = new SourceType(SourceTypeName.KML);
				const instanceUnderTest = new ImportPlugin();
				spyOn(instanceUnderTest, '_importByUrl').withArgs(url, sourceType).and.returnValue(null);
				await instanceUnderTest.register(store);

				setUrl(url, sourceType);

				await TestUtils.timeout(LAYER_ADDING_DELAY_MS + 100);
				expect(store.getState().layers.active.length).toBe(0);
				expect(store.getState().mainMenu.tab).toBe(TabId.MISC);
				expect(store.getState().position.fitLayerRequest.payload).toBeNull();
			});
		});

		describe('from data', () => {

			it('adds a layer and set the correct MainMenu tab index', async () => {
				const store = setup();
				const geoResourceStub = { id: 'idFoo', label: 'labelBar' };
				const instanceUnderTest = new ImportPlugin();
				const data = '<kml some=thing></kml>';
				const sourceType = new SourceType(SourceTypeName.KML);
				spyOn(instanceUnderTest, '_importByData').withArgs(data, sourceType).and.callFake(() => geoResourceStub);
				await instanceUnderTest.register(store);

				expect(store.getState().layers.active.length).toBe(0);
				expect(store.getState().position.fitLayerRequest.payload).toBeNull();

				setData(data, sourceType);

				await TestUtils.timeout(LAYER_ADDING_DELAY_MS + 100);
				expect(store.getState().layers.active.length).toBe(1);
				expect(store.getState().layers.active[0].id).toBe('idFoo');
				expect(store.getState().layers.active[0].label).toBe('labelBar');
				expect(store.getState().mainMenu.tab).toBe(TabId.MAPS);
			});

			it('does nothing when GeoResource is not available', async () => {
				const store = setup();
				const instanceUnderTest = new ImportPlugin();
				const data = '<kml some=thing></kml>';
				const sourceType = new SourceType(SourceTypeName.KML);
				spyOn(instanceUnderTest, '_importByData').withArgs(data, sourceType).and.returnValue(null);
				await instanceUnderTest.register(store);

				expect(store.getState().layers.active.length).toBe(0);
				setData(data, sourceType);

				await TestUtils.timeout(LAYER_ADDING_DELAY_MS + 100);
				expect(store.getState().layers.active.length).toBe(0);
				expect(store.getState().mainMenu.tab).toBe(TabId.MISC);
				expect(store.getState().position.fitLayerRequest.payload).toBeNull();
			});

		});
	});

	describe('_importByUrl', () => {

		it('calls the ImportVectorDataService for vector-url', async () => {
			const store = setup();
			const sourceType = new SourceType(SourceTypeName.KML);
			const geoResourceFutureMock = {
				id: 'idFoo', label: 'labelBar', onReject: () => {}
			};
			spyOn(importVectorDataServiceMock, 'forUrl').withArgs('http://some.url', { sourceType: sourceType }).and.returnValue(geoResourceFutureMock);
			const instanceUnderTest = new ImportPlugin();
			await instanceUnderTest.register(store);

			const result = instanceUnderTest._importByUrl('http://some.url', sourceType);

			expect(result).toEqual(result);
		});

		it('emits a notification and logs a warning when sourceType is NULL', async () => {
			const store = setup();
			const instanceUnderTest = new ImportPlugin();
			await instanceUnderTest.register(store);

			instanceUnderTest._importByUrl('http://some.url', null);

			expect(store.getState().notifications.latest.payload.content).toBe('importPlugin_unsupported_sourceType');
			expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.WARN);
		});

		it('emits a notification for unsupported WMS urls', async () => {
			const store = setup();
			const sourceType = new SourceType(SourceTypeName.WMS);
			const spy = spyOn(importVectorDataServiceMock, 'forUrl');
			const instanceUnderTest = new ImportPlugin();
			await instanceUnderTest.register(store);

			instanceUnderTest._importByUrl('http://some.url', sourceType);

			expect(spy).not.toHaveBeenCalled();
			expect(store.getState().notifications.latest.payload.content).toBe('importPlugin_unsupported_sourceType');
			expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.WARN);
		});


		it('emits a notification when GeoResourceFuture rejects', async () => {
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
			instanceUnderTest._importByUrl('http://some.url', sourceType);

			expect(store.getState().notifications.latest.payload.content).toBe('importPlugin_url_failed');
			expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.ERROR);
		});
	});

	describe('when import.url property changes', () => {

		it('calls #_import', async () => {
			const store = setup();
			const url = 'http://some.url';
			const sourceType = new SourceType(SourceTypeName.KML);
			const instanceUnderTest = new ImportPlugin();
			const spy = spyOn(instanceUnderTest, '_import');
			await instanceUnderTest.register(store);

			setUrl(url, sourceType);

			expect(spy).toHaveBeenCalledWith(url, sourceType);
		});
	});

	describe('_importByData', () => {

		it('calls the ImportVectorDataService', async () => {
			const store = setup();
			const geoResourceStub = { id: 'idFoo', label: 'labelBar' };
			const sourceType = new SourceType(SourceTypeName.KML);
			spyOn(importVectorDataServiceMock, 'forData').withArgs('<kml some=thing></kml>', { sourceType: sourceType }).and.returnValue(geoResourceStub);
			const instanceUnderTest = new ImportPlugin();
			await instanceUnderTest.register(store);

			const result = instanceUnderTest._importByData('<kml some=thing></kml>', sourceType);

			expect(result).toEqual(geoResourceStub);
		});

		it('emits a notification when importVectorDataService returns NULL', async () => {
			const store = setup();
			spyOn(importVectorDataServiceMock, 'forData').and.returnValue(null);
			const instanceUnderTest = new ImportPlugin();
			await instanceUnderTest.register(store);

			instanceUnderTest._importByData('<kml some=thing></kml>', MediaType.KML);

			expect(store.getState().notifications.latest.payload.content).toBe('importPlugin_data_failed');
			expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.ERROR);
		});
	});

	describe('when import.data property changes', () => {

		it('calls #_import', async () => {
			const store = setup();
			const instanceUnderTest = new ImportPlugin();
			const data = '<kml some=thing></kml>';
			const sourceType = new SourceType(SourceTypeName.KML);
			const spy = spyOn(instanceUnderTest, '_import');
			await instanceUnderTest.register(store);

			setData(data, sourceType);

			expect(spy).toHaveBeenCalledWith(data, sourceType);
		});
	});

	describe('query parameter available', () => {

		it('adds a layer and set the correct MainMenu tab index', async () => {
			const store = setup();
			const geoResourceStub = { id: 'idFoo', label: 'labelBar' };
			const instanceUnderTest = new ImportPlugin();
			const term = '<kml some=thing></kml>';
			const queryParam = `${QueryParameters.DATA}=${term}`;
			spyOnProperty(windowMock.location, 'search').and.returnValue(queryParam);
			spyOn(instanceUnderTest, '_importByData').withArgs(term, undefined).and.callFake(() => geoResourceStub);

			await instanceUnderTest.register(store);

			await TestUtils.timeout(LAYER_ADDING_DELAY_MS + 100);
			expect(store.getState().layers.active.length).toBe(1);
			expect(store.getState().layers.active[0].id).toBe('idFoo');
			expect(store.getState().layers.active[0].label).toBe('labelBar');
			expect(store.getState().mainMenu.tab).toBe(TabId.MAPS);
		});

		it('does nothing when term is not available', async () => {
			const store = setup();
			const spy = spyOn(importVectorDataServiceMock, 'forData');
			const instanceUnderTest = new ImportPlugin();
			const term = '';
			const queryParam = `${QueryParameters.DATA}=${term}`;
			spyOnProperty(windowMock.location, 'search').and.returnValue(queryParam);

			await instanceUnderTest.register(store);

			expect(spy).not.toHaveBeenCalledWith();
		});
	});
});
