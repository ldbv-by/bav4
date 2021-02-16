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


	const setup = (state = initialState) => {
		const mapContextMenueState = {
			mapContextMenue: state
		};

		store = TestUtils.setupStoreAndDi(mapContextMenueState, { mapContextMenue: mapContextMenueReducer });

		$injector
			.registerSingleton('ShareService', shareServiceMock);

	};

	it('instantiates the handler', () => {
		setup();
		const handler = new ContextMenueEventHandler();

		expect(handler).toBeTruthy();
		expect(new ContextMenueEventHandler().register).toBeTruthy();
		expect(handler.id).toBe('CONTEXTMENUE_HANDLER');
	});

	describe('when contextmenu (i.e. with right-click) is performed', () => {

		it('it updates the store', () => {
			setup();
			const map = new Map();
			const handler = new ContextMenueEventHandler();
			handler.register(map);


			simulateMouseEvent(map, 'contextmenu', 10, 5);


			const eventCoordinate = store.getState().mapContextMenue.eventCoordinate;
			const data = store.getState().mapContextMenue.data;
			expect(eventCoordinate).toEqual({ x: 10, y: 5 });
			expect(data).toEqual({});
		});
	});

	describe('when single click is performed', () => {

		it('it updates the store', async () => {
			const state = {
				eventCoordinate: { x: 10, y: 10 },
				data: null
			};
			setup(state);
			const map = new Map();
			const handler = new ContextMenueEventHandler();
			handler.register(map);
			
			simulateMouseEvent(map, MapBrowserEventType.SINGLECLICK, 0, 0);

			const eventCoordinate = store.getState().mapContextMenue.eventCoordinate;
			expect(eventCoordinate).toBeNull();
		});
	});

	describe('when changes center', () => {

		it('it updates the store', async () => {
			const state = {
				eventCoordinate: { x: 10, y: 10 },
				data: null
			};
			setup(state);
			const map = new Map();
			const handler = new ContextMenueEventHandler();
			handler.register(map);
			
			simulateMapEvent(map, MapEventType.MOVESTART);

			const eventCoordinate = store.getState().mapContextMenue.eventCoordinate;
			expect(eventCoordinate).toBeNull();
		});
	});
});