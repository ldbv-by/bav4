import { OlMeasurementHandler } from '../../../../../../../src/modules/map/components/olMap/handler/measure/OlMeasurementHandler';
import { LineString, Polygon } from 'ol/geom';
import Map from 'ol/Map';
import TileLayer from 'ol/layer/Tile';
import View from 'ol/View';
import { OSM, TileDebug } from 'ol/source';
import { fromLonLat } from 'ol/proj';
import { Feature } from 'ol';
import { DrawEvent } from 'ol/interaction/Draw';
import { MapBrowserEvent } from 'ol';
import MapBrowserEventType from 'ol/MapBrowserEventType';
import { $injector } from '../../../../../../../src/injection';
import { TestUtils } from '../../../../../../test-utils.js';
import proj4 from 'proj4';
import { register } from 'ol/proj/proj4';
import { MEASUREMENT_LAYER_ID } from '../../../../../../../src/modules/map/store/measurement.observer';


const environmentServiceMock = { isTouch: () => false };

TestUtils.setupStoreAndDi({},);
$injector.registerSingleton('TranslationService', { translate: (key) => key });
$injector.registerSingleton('MapService', { getSrid: () => 3857, getDefaultGeodeticSrid: () => 25832 });
$injector.registerSingleton('EnvironmentService', environmentServiceMock);

proj4.defs('EPSG:25832', '+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +axis=neu');
register(proj4);



describe('OlMeasurementHandler', () => {

	it('has two methods', () => {
		const handler = new OlMeasurementHandler();
		expect(handler).toBeTruthy();
		expect(handler.activate).toBeTruthy();
		expect(handler.deactivate).toBeTruthy();
		expect(handler.id).toBe(MEASUREMENT_LAYER_ID);
	});

	const simulateDrawEvent = (type, draw, feature) => {
		const eventType = type;
		const drawEvent = new DrawEvent(eventType, feature);

		draw.dispatchEvent(drawEvent);
	};

	const simulateKeyEvent = (keyCode) => {
		const keyEvent = new KeyboardEvent('keyup', { keyCode: keyCode, which: keyCode });

		document.dispatchEvent(keyEvent);
	};

	describe('when activated over olMap', () => {
		const classUnderTest = new OlMeasurementHandler();
		const initialCenter = fromLonLat([11.57245, 48.14021]);

		const setupMap = () => {
			return new Map({
				layers: [
					new TileLayer({
						source: new OSM(),
					}),
					new TileLayer({
						source: new TileDebug(),
					})],
				target: 'map',
				view: new View({
					center: initialCenter,
					zoom: 1,
				}),
			});

		};

		it('adds a Interaction', () => {
			const map = setupMap();
			map.addInteraction = jasmine.createSpy();
			classUnderTest.activate(map);

			expect(map.addInteraction).toHaveBeenCalled();
		});

		it('removes a Interaction', () => {
			const map = setupMap();
			const layerStub = {};
			map.removeInteraction = jasmine.createSpy();

			classUnderTest.deactivate(map, layerStub);

			expect(map.removeInteraction).toHaveBeenCalled();
		});


		it('removes all registered mapOverlays', () => {
			const map = setupMap();
			map.removeOverlay = jasmine.createSpy();
			const overlayStub = {};
			classUnderTest._overlays = [overlayStub, overlayStub, overlayStub, overlayStub];
			classUnderTest.deactivate(map);

			expect(map.removeOverlay).toHaveBeenCalledTimes(4);
			expect(classUnderTest._overlays.length).toBe(0);
		});


	});

	describe('when using EnvironmentService for snapTolerance', () => {

		it('isTouch() resolves in higher snapTolerance', () => {
			const classUnderTest = new OlMeasurementHandler();
			const environmentSpy = spyOn(environmentServiceMock, 'isTouch').and.returnValue(true);

			expect(classUnderTest._getSnapTolerancePerDevice()).toBe(12);
			expect(environmentSpy).toHaveBeenCalled();
		});

		it('isTouch() resolves in lower snapTolerance', () => {
			const classUnderTest = new OlMeasurementHandler();
			const environmentSpy = spyOn(environmentServiceMock, 'isTouch').and.returnValue(false);

			expect(classUnderTest._getSnapTolerancePerDevice()).toBe(4);
			expect(environmentSpy).toHaveBeenCalled();
		});

	});

	describe('when draw a line', () => {
		const initialCenter = fromLonLat([11.57245, 48.14021]);

		const setupMap = () => {

			return new Map({
				layers: [
					new TileLayer({
						source: new OSM(),
					}),
					new TileLayer({
						source: new TileDebug(),
					})],
				target: 'map',
				view: new View({
					center: initialCenter,
					zoom: 1,
				}),
			});

		};

		it('creates tooltip content for line', () => {
			const classUnderTest = new OlMeasurementHandler();
			const map = setupMap();
			const geometry = new LineString([[0, 0], [1, 0]]);
			const feature = new Feature({ geometry: geometry });

			classUnderTest.activate(map);
			simulateDrawEvent('drawstart', classUnderTest._draw, feature);
			feature.getGeometry().dispatchEvent('change');

			const baOverlay = feature.get('measurement').getElement();

			expect(baOverlay.outerHTML).toBe('<ba-measure-overlay></ba-measure-overlay>');
		});

		it('creates partition tooltips for long line', () => {
			const classUnderTest = new OlMeasurementHandler();
			const map = setupMap();
			const geometry = new LineString([[0, 0], [1234, 0]]);
			const feature = new Feature({ geometry: geometry });

			classUnderTest.activate(map);
			simulateDrawEvent('drawstart', classUnderTest._draw, feature);
			feature.getGeometry().dispatchEvent('change');

			expect(feature.get('partitions').length).toBe(1);
		});

		it('creates partition tooltips for longer line', () => {
			const classUnderTest = new OlMeasurementHandler();
			const map = setupMap();
			const geometry = new LineString([[0, 0], [12345, 0]]);
			const feature = new Feature({ geometry: geometry });

			classUnderTest.activate(map);
			simulateDrawEvent('drawstart', classUnderTest._draw, feature);
			feature.getGeometry().dispatchEvent('change');

			expect(feature.get('partitions').length).toBe(12);
		});

		it('creates partition tooltips very long line', () => {
			const classUnderTest = new OlMeasurementHandler();
			const map = setupMap();
			const geometry = new LineString([[0, 0], [123456, 0]]);
			const feature = new Feature({ geometry: geometry });

			classUnderTest.activate(map);
			simulateDrawEvent('drawstart', classUnderTest._draw, feature);
			feature.getGeometry().dispatchEvent('change');

			expect(feature.get('partitions').length).toBe(12);
		});

		it('creates partition tooltips for longest line', () => {
			const classUnderTest = new OlMeasurementHandler();
			const map = setupMap();
			const geometry = new LineString([[0, 0], [1234567, 0]]);
			const feature = new Feature({ geometry: geometry });

			classUnderTest.activate(map);
			simulateDrawEvent('drawstart', classUnderTest._draw, feature);
			feature.getGeometry().dispatchEvent('change');

			expect(feature.get('partitions').length).toBe(12);
		});

		it('creates partition tooltips for not closed polygon', () => {
			const classUnderTest = new OlMeasurementHandler();
			const map = setupMap();
			const geometry = new Polygon([[[0, 0], [500, 0], [550, 550], [0, 500]]]);
			const feature = new Feature({ geometry: geometry });

			classUnderTest.activate(map);
			simulateDrawEvent('drawstart', classUnderTest._draw, feature);
			feature.getGeometry().dispatchEvent('change');

			expect(feature.get('partitions').length).toBe(1);
		});

		it('creates partition tooltips for not closed large polygon', () => {
			const classUnderTest = new OlMeasurementHandler();
			const map = setupMap();
			const geometry = new Polygon([[[0, 0], [5000, 0], [5500, 5500], [0, 5000]]]);
			const feature = new Feature({ geometry: geometry });

			classUnderTest.activate(map);
			simulateDrawEvent('drawstart', classUnderTest._draw, feature);
			feature.getGeometry().dispatchEvent('change');

			expect(feature.get('partitions').length).toBe(10);
		});

		it('removes partition tooltips after shrinking very long line', () => {
			const classUnderTest = new OlMeasurementHandler();
			const map = setupMap();
			const geometry = new LineString([[0, 0], [12345, 0]]);
			const feature = new Feature({ geometry: geometry });

			classUnderTest.activate(map);
			simulateDrawEvent('drawstart', classUnderTest._draw, feature);
			feature.getGeometry().dispatchEvent('change');

			expect(feature.get('partitions').length).toBe(12);

			geometry.setCoordinates([[0, 0], [1234, 0]]);
			feature.getGeometry().dispatchEvent('change');

			expect(feature.get('partitions').length).toBe(1);
		});

		it('unregister tooltip-listener after finish drawing', () => {
			const classUnderTest = new OlMeasurementHandler();
			const map = setupMap();
			const geometry = new LineString([[0, 0], [1, 0]]);
			const feature = new Feature({ geometry: geometry });

			classUnderTest.activate(map);

			simulateDrawEvent('drawstart', classUnderTest._draw, feature);
			feature.getGeometry().dispatchEvent('change');
			simulateDrawEvent('drawend', classUnderTest._draw, feature);

			const baOverlay = feature.get('measurement').getElement();

			expect(baOverlay.static).toBeTrue();
			expect(feature.get('measurement').getOffset()).toEqual([0, -7]);
		});


		it('positions tooltip content on the end of not closed Polygon', () => {
			const classUnderTest = new OlMeasurementHandler();
			const map = setupMap();
			const snappedGeometry = new Polygon([[[0, 0], [500, 0], [550, 550], [0, 500], [0, 0]]]);
			const feature = new Feature({ geometry: snappedGeometry });

			classUnderTest.activate(map);
			simulateDrawEvent('drawstart', classUnderTest._draw, feature);
			feature.getGeometry().dispatchEvent('change');

			const overlay = feature.get('measurement');


			expect(overlay.getPosition()[0]).toBe(0);
			expect(overlay.getPosition()[1]).toBe(500);
		});

		it('positions tooltip content on the end of a updated not closed Polygon', () => {
			const classUnderTest = new OlMeasurementHandler();
			const map = setupMap();
			const snappedGeometry = new Polygon([[[0, 0], [500, 0], [550, 550], [0, 500], [0, 500]]]);
			const feature = new Feature({ geometry: snappedGeometry });

			classUnderTest.activate(map);
			simulateDrawEvent('drawstart', classUnderTest._draw, feature);
			feature.getGeometry().dispatchEvent('change');

			const overlay = feature.get('measurement');
			expect(overlay.getPosition()[0]).toBe(0);
			expect(overlay.getPosition()[1]).toBe(500);
			snappedGeometry.setCoordinates([[[0, 0], [500, 0], [550, 550], [0, 500], [0, 250], [0, 250]]]);
			feature.getGeometry().dispatchEvent('change');
			simulateDrawEvent('drawend', classUnderTest._draw, feature);

			expect(overlay.getPosition()[0]).toBe(0);
			expect(overlay.getPosition()[1]).toBe(250);
		});


		it('removes last point if keypressed', () => {
			const classUnderTest = new OlMeasurementHandler();
			const map = setupMap();
			const geometry = new Polygon([[[0, 0], [500, 0], [550, 550], [0, 500], [0, 500]]]);
			const feature = new Feature({ geometry: geometry });
			const deleteKeyCode = 46;

			classUnderTest.activate(map);
			simulateDrawEvent('drawstart', classUnderTest._draw, feature);
			classUnderTest._draw.removeLastPoint = jasmine.createSpy();
			feature.getGeometry().dispatchEvent('change');

			simulateKeyEvent(deleteKeyCode);
			expect(classUnderTest._draw.removeLastPoint).toHaveBeenCalled();
		});
	});

	describe('when pointer move', () => {
		const initialCenter = fromLonLat([11.57245, 48.14021]);

		const setupMap = () => {

			return new Map({
				layers: [
					new TileLayer({
						source: new OSM(),
					}),
					new TileLayer({
						source: new TileDebug(),
					})],
				target: 'map',
				view: new View({
					center: initialCenter,
					zoom: 1,
				}),
			});

		};

		const simulateMouseEvent = (map, type, x, y, dragging) => {
			const eventType = type;

			const event = new Event(eventType);
			//event.target = map.getViewport().firstChild;
			event.clientX = x;
			event.clientY = y;
			event.pageX = x;
			event.pageY = y;
			event.shiftKey = false;
			event.preventDefault = function () { };


			let mapEvent = new MapBrowserEvent(eventType, map, event);
			mapEvent.coordinate = [x, y];
			mapEvent.dragging = dragging ? dragging : false;
			map.dispatchEvent(mapEvent);
		};

		it('creates and move helpTooltip', () => {
			const classUnderTest = new OlMeasurementHandler();
			const map = setupMap();

			classUnderTest.activate(map);
			simulateMouseEvent(map, MapBrowserEventType.POINTERMOVE, 10, 0);
			const baOverlay = classUnderTest._helpTooltip.getElement();
			expect(baOverlay.value).toBe('map_olMap_handler_measure_start');
			expect(classUnderTest._helpTooltip.getPosition()).toEqual([10, 0]);
		});

		it('no move when dragging', () => {
			const classUnderTest = new OlMeasurementHandler();
			const map = setupMap();

			classUnderTest.activate(map);
			simulateMouseEvent(map, MapBrowserEventType.POINTERMOVE, 10, 0, true);

			expect(classUnderTest._helpTooltip.getPosition()).toBeFalsy();
		});

		it('change message in helpTooltip, when sketch is changing', () => {
			const classUnderTest = new OlMeasurementHandler();
			const map = setupMap();

			classUnderTest.activate(map);
			simulateMouseEvent(map, MapBrowserEventType.POINTERMOVE, 10, 0);

			const baOverlay = classUnderTest._helpTooltip.getElement();
			expect(baOverlay.value).toBe('map_olMap_handler_measure_start');
			classUnderTest._activeSketch = new Feature({ geometry: new LineString([[0, 0], [1, 0]]) });
			simulateMouseEvent(map, MapBrowserEventType.POINTERMOVE, 20, 0);
			expect(baOverlay.value).toBe('map_olMap_handler_measure_continue_line');
		});

		it('change message in helpTooltip, when sketch is snapping to first point', () => {
			const classUnderTest = new OlMeasurementHandler();
			const map = setupMap();

			classUnderTest.activate(map);
			const baOverlay = classUnderTest._helpTooltip.getElement();

			simulateMouseEvent(map, MapBrowserEventType.POINTERMOVE, 10, 0);
			expect(baOverlay.value).toBe('map_olMap_handler_measure_start');
			const snappedGeometry = new Polygon([[[0, 0], [500, 0], [550, 550], [0, 500], [0, 500]]]);
			const feature = new Feature({ geometry: snappedGeometry });
			simulateDrawEvent('drawstart', classUnderTest._draw, feature);
			feature.getGeometry().dispatchEvent('change');
			expect(classUnderTest._pointCount).toBe(4);


			snappedGeometry.setCoordinates([[[0, 0], [500, 0], [550, 550], [0, 500], [0, 0], [0, 0]]]);
			feature.getGeometry().dispatchEvent('change');
			expect(classUnderTest._pointCount).toBe(5);
			simulateMouseEvent(map, MapBrowserEventType.POINTERMOVE, 0, 0);
			expect(baOverlay.value).toBe('map_olMap_handler_measure_snap_first_point<br/>map_olMap_handler_delete_last_point');
		});

		it('change message in helpTooltip, when sketch is snapping to last point', () => {
			const classUnderTest = new OlMeasurementHandler();
			const map = setupMap();

			classUnderTest.activate(map);
			const baOverlay = classUnderTest._helpTooltip.getElement();

			simulateMouseEvent(map, MapBrowserEventType.POINTERMOVE, 10, 0);
			expect(baOverlay.value).toBe('map_olMap_handler_measure_start');
			const snappedGeometry = new Polygon([[[0, 0], [500, 0], [550, 550], [0, 500], [0, 500]]]);
			const feature = new Feature({ geometry: snappedGeometry });
			simulateDrawEvent('drawstart', classUnderTest._draw, feature);
			feature.getGeometry().dispatchEvent('change');
			expect(classUnderTest._pointCount).toBe(4);


			snappedGeometry.setCoordinates([[[0, 0], [500, 0], [550, 550], [0, 500], [0, 500], [0, 500]]]);
			feature.getGeometry().dispatchEvent('change');
			expect(classUnderTest._pointCount).toBe(5);
			simulateMouseEvent(map, MapBrowserEventType.POINTERMOVE, 0, 0);
			expect(baOverlay.value).toBe('map_olMap_handler_measure_snap_last_point<br/>map_olMap_handler_delete_last_point');
		});

	});

	describe('when measurement-layer changes', () => {
		const initialCenter = fromLonLat([11.57245, 48.14021]);

		const setupMap = () => {

			return new Map({
				layers: [
					new TileLayer({
						source: new OSM(),
					}),
					new TileLayer({
						source: new TileDebug(),
					})],
				target: 'map',
				view: new View({
					center: initialCenter,
					zoom: 1,
				}),
			});

		};

		it('layer visibility, then overlay visibility changes', () => {
			const classUnderTest = new OlMeasurementHandler();
			const geometry = new Polygon([[[0, 0], [500, 0], [550, 550], [0, 500], [0, 500]]]);
			const feature = new Feature({ geometry: geometry });
			const map = setupMap();

			// create a measurement with overlays
			const measurementLayer = classUnderTest.activate(map);
			simulateDrawEvent('drawstart', classUnderTest._draw, feature);
			feature.getGeometry().dispatchEvent('change');
			geometry.setCoordinates([[[0, 0], [500, 0], [550, 550], [0, 500], [0, 0], [0, 0]]]);
			feature.getGeometry().dispatchEvent('change');
			simulateDrawEvent('drawend', classUnderTest._draw, feature);

			// some overlays exists
			const overlay = feature.get('measurement');
			const overlayElement = overlay.getElement();
			expect(overlay).toBeTruthy();
			expect(overlayElement).toBeTruthy();

			// layers visibility changed
			measurementLayer.setVisible(false);

			expect(overlayElement.style.display).toBeDefined();
			expect(overlayElement.style.display).toBe('none');


			measurementLayer.setVisible(true);
			expect(overlayElement.style.display).toBe('');
		});

		it('layer opacity, then overlay opacity changes', () => {
			const classUnderTest = new OlMeasurementHandler();
			const geometry = new Polygon([[[0, 0], [500, 0], [550, 550], [0, 500], [0, 500]]]);
			const feature = new Feature({ geometry: geometry });
			const map = setupMap();

			// create a measurement with overlays
			const measurementLayer = classUnderTest.activate(map);
			simulateDrawEvent('drawstart', classUnderTest._draw, feature);
			feature.getGeometry().dispatchEvent('change');
			geometry.setCoordinates([[[0, 0], [500, 0], [550, 550], [0, 500], [0, 0], [0, 0]]]);
			feature.getGeometry().dispatchEvent('change');
			simulateDrawEvent('drawend', classUnderTest._draw, feature);

			// some overlays exists
			const overlay = feature.get('measurement');
			const overlayElement = overlay.getElement();
			expect(overlay).toBeTruthy();
			expect(overlayElement).toBeTruthy();

			// layers opacity changed
			measurementLayer.setOpacity(0.3);

			expect(overlayElement.style.opacity).toBeDefined();
			expect(overlayElement.style.opacity).toBe('0.3');

		});
	});
});

