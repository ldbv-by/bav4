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

			expect(spy).toHaveBeenCalledWith('http://some.url');
		});

		it('calls the ImportVectorDataService', async () => {
			const store = setup();
			const sourceType = new SourceType(SourceTypeName.KML);
			spyOn(sourceTypeServiceMock, 'forURL').and.callFake(() => sourceType);
			const spy = spyOn(importVectorDataServiceMock, 'importVectorDataFromUrl');
			const instanceUnderTest = new ImportPlugin();
			await instanceUnderTest.register(store);

			setUrl('http://some.url');

			expect(spy).toHaveBeenCalledWith('http://some.url', { sourceType: sourceType });
		});

		it('adds a layer', async () => {
			const store = setup();
			const geoResourceFutureMock = {
				id: 'idFoo', label: 'labelBar', onReject: () => { }
			};
			const sourceType = new SourceType(SourceTypeName.KML);
			spyOn(sourceTypeServiceMock, 'forURL').and.callFake(() => sourceType);
			spyOn(importVectorDataServiceMock, 'importVectorDataFromUrl').and.callFake(() => geoResourceFutureMock);
			const instanceUnderTest = new ImportPlugin();
			await instanceUnderTest.register(store);

			expect(store.getState().layers.active.length).toBe(0);
			setUrl('http://some.url');

			expect(store.getState().layers.active.length).toBe(1);
			expect(store.getState().layers.active[0].id).toBe('idFoo');
			expect(store.getState().layers.active[0].label).toBe('labelBar');
		});
	});

	describe('when import.data property changes', () => {

		it('calls the sourceTypeService', async () => {
			const store = setup();
			const spy = spyOn(sourceTypeServiceMock, 'forData');

			const instanceUnderTest = new ImportPlugin();
			await instanceUnderTest.register(store);

			setData('<kml some=thing></kml>', MediaType.KML);


			expect(spy).toHaveBeenCalledWith('<kml some=thing></kml>', MediaType.KML);
		});

		it('calls the ImportVectorDataService', async () => {
			const store = setup();
			const sourceType = new SourceType(SourceTypeName.KML);
			spyOn(sourceTypeServiceMock, 'forData').and.callFake(() => sourceType);
			const spy = spyOn(importVectorDataServiceMock, 'importVectorData');
			const instanceUnderTest = new ImportPlugin();
			await instanceUnderTest.register(store);

			setData('<kml some=thing></kml>', MediaType.KML);


			expect(spy).toHaveBeenCalledWith('<kml some=thing></kml>', { sourceType: sourceType });
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
