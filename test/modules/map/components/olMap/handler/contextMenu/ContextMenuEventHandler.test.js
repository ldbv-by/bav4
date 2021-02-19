import { ContextMenuEventHandler } from '../../../../../../../src/modules/map/components/olMap/handler/contextMenu/ContextMenuEventHandler';
import Map from 'ol/Map';
import { $injector } from '../../../../../../../src/injection';
import { initialState, mapContextMenuReducer } from '../../../../../../../src/modules/map/store/mapContextMenu.reducer';
import { simulateMapEvent, simulateMouseEvent } from '../../mapTestUtils';
import { TestUtils } from '../../../../../../test-utils';
import MapBrowserEventType from 'ol/MapBrowserEventType';
import MapEventType from 'ol/MapEventType';




describe('ContextMenuEventHandler', () => {

	let store;

	const shareServiceMock = {
		copyToClipboard() { }
	};

	const mapServiceMock = {
	};

	const coordinateServiceMock = {
	};

	const setup = (state = initialState) => {
		const mapContextMenuState = {
			mapContextMenu: state
		};


		store = TestUtils.setupStoreAndDi(mapContextMenuState, { mapContextMenu: mapContextMenuReducer });

		$injector
			.registerSingleton('ShareService', shareServiceMock)
			.registerSingleton('MapService', mapServiceMock)
			.registerSingleton('CoordinateService', coordinateServiceMock)
			.registerSingleton('TranslationService', { translate: (key) => key });
	};

	it('instantiates the handler', () => {
		setup();
		const handler = new ContextMenuEventHandler();

		expect(handler).toBeTruthy();
		expect(new ContextMenuEventHandler().register).toBeTruthy();
		expect(handler.id).toBe('CONTEXTMENU_HANDLER');
	});

	describe('when contextmenu (i.e. with right-click) is performed', () => {

		it('it updates the store and inserts a ba-ol-map-context-menu-content element', () => {
			setup();
			const map = new Map();
			const handler = new ContextMenuEventHandler();
			handler.register(map);

			simulateMouseEvent(map, 'contextmenu', 10, 5);

			const { coordinate, id } = store.getState().mapContextMenu;
			expect(coordinate).toEqual([10, 5]);
			expect(id).toEqual('ba-ol-map-context-menu-content_generatedByContextMenuEventHandler');
			const element = document.querySelector('ba-ol-map-context-menu-content');
			expect(element).toBeTruthy();
			expect(element.id).toBe('ba-ol-map-context-menu-content_generatedByContextMenuEventHandler');
		});
	});

	describe('when single click is performed', () => {

		it('it updates/resets the store',  () => {
			const state = {
				coordinate: [10, 10],
				id: null
			};
			setup(state);
			const map = new Map();
			const handler = new ContextMenuEventHandler();
			handler.register(map);

			simulateMouseEvent(map, MapBrowserEventType.SINGLECLICK, 0, 0);

			const { coordinate } = store.getState().mapContextMenu;
			expect(coordinate).toBeNull();
		});
	});

	describe('when center changes', () => {

		it('it updates/resets the store',  () => {
			const state = {
				eventCoordinate: [10, 10],
				id: null
			};
			setup(state);
			const map = new Map();
			const handler = new ContextMenuEventHandler();
			handler.register(map);

			simulateMapEvent(map, MapEventType.MOVESTART);

			const { coordinate } = store.getState().mapContextMenu;
			expect(coordinate).toBeNull();
		});
	});
});