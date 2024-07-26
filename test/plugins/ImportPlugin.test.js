import { $injector } from '../../src/injection';
import { notificationReducer } from '../../src/store/notifications/notifications.reducer';
import { importReducer } from '../../src/store/import/import.reducer';
import { setUrl, setData } from '../../src/store/import/import.action';
import { TestUtils } from '../test-utils';
import { ImportPlugin, LAYER_ADDING_DELAY_MS } from '../../src/plugins/ImportPlugin';
import { MediaType } from '../../src/domain/mediaTypes';
import { layersReducer } from '../../src/store/layers/layers.reducer';
import { LevelTypes } from '../../src/store/notifications/notifications.action';
import { SourceType, SourceTypeName } from '../../src/domain/sourceType';
import { createNoInitialStateMainMenuReducer } from '../../src/store/mainMenu/mainMenu.reducer';
import { TabIds } from '../../src/domain/mainMenu';
import { positionReducer } from '../../src/store/position/position.reducer';

describe('LAYER_ADDING_DELAY_MS', () => {
	it('exports a const defining amount of time waiting before adding a layer', async () => {
		expect(LAYER_ADDING_DELAY_MS).toBe(500);
	});
});

describe('ImportPlugin', () => {
	const importVectorDataServiceMock = {
		forUrl: async () => {},
		forData: () => {}
	};

	const translationServiceMock = {
		register() {},
		translate: (key) => key
	};

	const setup = (state) => {
		const initialState = {
			import: { latest: null },
			mainMenu: {
				tab: TabIds.MISC
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
			.registerSingleton('ImportVectorDataService', importVectorDataServiceMock)
			.registerSingleton('TranslationService', translationServiceMock);
		return store;
	};

	describe('when ImportVectorDataService return null', () => {
		it('informs the user', async () => {
			const store = setup();
			const sourceType = new SourceType(SourceTypeName.KML);
			spyOn(importVectorDataServiceMock, 'forUrl').and.returnValue(null);
			const instanceUnderTest = new ImportPlugin();
			await instanceUnderTest.register(store);

			setUrl('http://some.url', sourceType);

			expect(store.getState().notifications.latest.payload.content).toBe('global_import_data_failed');
			expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.ERROR);
		});
	});

	describe('when import.url property changes', () => {
		it('adds a layer and set the correct MainMenu tab index', async () => {
			const store = setup();
			const geoResourceFutureMock = {
				id: 'idFoo',
				label: 'labelBar',
				onReject: () => {}
			};
			const sourceType = new SourceType(SourceTypeName.KML);
			const spy = spyOn(importVectorDataServiceMock, 'forUrl').and.callFake(() => geoResourceFutureMock);
			const instanceUnderTest = new ImportPlugin();
			await instanceUnderTest.register(store);

			expect(store.getState().layers.active.length).toBe(0);
			expect(store.getState().position.fitLayerRequest.payload).toBeNull();

			setUrl('http://some.url', sourceType);

			await TestUtils.timeout(LAYER_ADDING_DELAY_MS + 100);
			expect(spy).toHaveBeenCalledWith('http://some.url', { sourceType: sourceType });
			expect(store.getState().layers.active.length).toBe(1);
			expect(store.getState().layers.active[0].id).toBe('idFoo');
			expect(store.getState().mainMenu.tab).toBe(TabIds.MAPS);
			expect(store.getState().position.fitLayerRequest.payload).not.toBeNull();
		});
	});

	describe('when import.data property changes', () => {
		it('adds a layer and set the correct MainMenu tab index', async () => {
			const store = setup();
			const geoResourceStub = { id: 'idFoo', label: 'labelBar' };
			spyOn(importVectorDataServiceMock, 'forData').and.callFake(() => geoResourceStub);
			const instanceUnderTest = new ImportPlugin();
			await instanceUnderTest.register(store);

			expect(store.getState().layers.active.length).toBe(0);
			setData('<kml some=thing></kml>', MediaType.KML);

			await TestUtils.timeout(LAYER_ADDING_DELAY_MS + 100);
			expect(store.getState().layers.active.length).toBe(1);
			expect(store.getState().layers.active[0].id).toBe('idFoo');
			expect(store.getState().mainMenu.tab).toBe(TabIds.MAPS);
		});
	});
});
