import { TestUtils } from '../../../../test-utils';
import { OlOverlayMapHandler } from '../../../../../src/modules/olMap/handler/measure/OlOverlayMapHandler';
import { View, Map, Overlay } from 'ol';
import { fromLonLat } from 'ol/proj';
import { ObjectEvent } from 'ol/Object';
import { MeasurementOverlay } from '../../../../../src/modules/olMap/components/MeasurementOverlay';
import { $injector } from '../../../../../src/injection';

window.customElements.define(MeasurementOverlay.tag, MeasurementOverlay);

describe('OlOverlayMapHandler', () => {
	const initCoordinate = fromLonLat([11, 48]);
	const defaultState = {};

	const setup = (state = defaultState) => {
		const store = TestUtils.setupStoreAndDi(state);

		$injector
			.registerSingleton('UnitsService', {
				// eslint-disable-next-line no-unused-vars
				formatDistance: (distance, decimals) => {
					return distance + ' m';
				},
				// eslint-disable-next-line no-unused-vars
				formatArea: (area, decimals) => {
					return area + ' m²';
				}
			})
			.registerSingleton('MapService', { getSrid: () => 3857, getLocalProjectedSrid: () => 25832, getLocalProjectedSridExtent: () => null });

		return store;
	};

	const setupMap = () => {
		const container = document.createElement('div');
		container.style.height = '100px';
		container.style.width = '100px';
		document.body.appendChild(container);

		return new Map({
			target: container,
			view: new View({
				center: initCoordinate,
				zoom: 1
			})
		});
	};

	describe('constructor', () => {
		it('initializes members', async () => {
			setup();

			const instanceUnderTest = new OlOverlayMapHandler();
			expect(instanceUnderTest._map).toBeNull();
			expect(instanceUnderTest._map).not.toBeUndefined();
		});
	});

	it('instantiates the handler', () => {
		setup();
		const handler = new OlOverlayMapHandler();

		expect(handler).toBeTruthy();
		expect(handler.id).toBe('Overlay_Handler');
		expect(handler.register).toBeDefined();
	});

	describe('when view changes', () => {
		const createOverlay = () => {
			return new Overlay({ element: new MeasurementOverlay() });
		};
		it('listens to view center events', async () => {
			setup();
			const map = setupMap();
			const view = map.getView();
			const overlaysMock = { getArray: () => [createOverlay(), createOverlay(), createOverlay()] };
			spyOn(map, 'getOverlays').and.callFake(() => overlaysMock);

			const instanceUnderTest = new OlOverlayMapHandler();
			const updateSpy = spyOn(instanceUnderTest, '_updatePosition').and.callFake(() => {});

			instanceUnderTest.register(map);
			view.dispatchEvent(new ObjectEvent('change:center'));

			expect(updateSpy).toHaveBeenCalledTimes(3);
		});
	});
});
