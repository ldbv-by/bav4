import { ContextMenueEventHandler } from '../../../../../../../src/modules/map/components/olMap/handler/contextMenue/ContextMenueEventHandler';
import Map from 'ol/Map';
import { $injector } from '../../../../../../../src/injection';
import { initialState, mapContextMenueReducer } from '../../../../../../../src/modules/map/store/mapContextMenue.reducer';
import { simulateMapEvent, simulateMouseEvent } from '../../mapTestUtils';
import { TestUtils } from '../../../../../../test-utils';
import MapBrowserEventType from 'ol/MapBrowserEventType';
import MapEventType from 'ol/MapEventType';




describe('ContextMenueEventHandler', () => {

	let store;

	const shareServiceMock = {
		copyToClipboard() { }
	};

	const mapServiceMock = {
	};

	const coordinateServiceMock = {
	};

	const setup = (state = initialState) => {
		const mapContextMenueState = {
			mapContextMenue: state
		};


		store = TestUtils.setupStoreAndDi(mapContextMenueState, { mapContextMenue: mapContextMenueReducer });

		$injector
			.registerSingleton('ShareService', shareServiceMock)
			.registerSingleton('MapService', mapServiceMock)
			.registerSingleton('CoordinateService', coordinateServiceMock);

	};

	it('instantiates the handler', () => {
		setup();
		const handler = new ContextMenueEventHandler();

		expect(handler).toBeTruthy();
		expect(new ContextMenueEventHandler().register).toBeTruthy();
		expect(handler.id).toBe('CONTEXTMENUE_HANDLER');
	});

	describe('when contextmenu (i.e. with right-click) is performed', () => {

		it('it updates the store and inserts a ba-ol-map-context-menue-content element', () => {
			setup();
			const map = new Map();
			const handler = new ContextMenueEventHandler();
			handler.register(map);

			simulateMouseEvent(map, 'contextmenu', 10, 5);

			const { coordinate, id } = store.getState().mapContextMenue;
			expect(coordinate).toEqual([10, 5]);
			expect(id).toEqual('ba-ol-map-context-menue-content_generatedByContextMenueEventHandler');
			const element = document.querySelector('ba-ol-map-context-menue-content');
			expect(element).toBeTruthy();
			expect(element.id).toBe('ba-ol-map-context-menue-content_generatedByContextMenueEventHandler');
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
			const handler = new ContextMenueEventHandler();
			handler.register(map);

			simulateMouseEvent(map, MapBrowserEventType.SINGLECLICK, 0, 0);

			const { coordinate } = store.getState().mapContextMenue;
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
			const handler = new ContextMenueEventHandler();
			handler.register(map);

			simulateMapEvent(map, MapEventType.MOVESTART);

			const { coordinate } = store.getState().mapContextMenue;
			expect(coordinate).toBeNull();
		});
	});
});