import { MeasureSnapType, MeasureStateType, OlMeasurementHandler } from '../../../../../../../src/modules/map/components/olMap/handler/measure/OlMeasurementHandler';
import { Point, LineString, Polygon } from 'ol/geom';
import Map from 'ol/Map';
import TileLayer from 'ol/layer/Tile';
import View from 'ol/View';
import { OSM, TileDebug } from 'ol/source';
import { fromLonLat } from 'ol/proj';
import { Feature } from 'ol';
import { DragPan, Draw, Modify, Select, Snap } from 'ol/interaction';
import { DrawEvent } from 'ol/interaction/Draw';
import { MapBrowserEvent } from 'ol';
import MapBrowserEventType from 'ol/MapBrowserEventType';
import { $injector } from '../../../../../../../src/injection';
import { TestUtils } from '../../../../../../test-utils.js';
import proj4 from 'proj4';
import { register } from 'ol/proj/proj4';
import { MEASUREMENT_LAYER_ID } from '../../../../../../../src/modules/map/store/MeasurementPlugin';
import { ModifyEvent } from 'ol/interaction/Modify';
import { measurementReducer } from '../../../../../../../src/modules/map/store/measurement.reducer';



const environmentServiceMock = { isTouch: () => false };
const initialState = {
	active: false,
	statistic: { length:0, area:0 },
	reset:null
};
const setup = (state = initialState) => {
	const measurementState = {
		measurement: state,
	};
	TestUtils.setupStoreAndDi(measurementState, { measurement: measurementReducer });	
	$injector.registerSingleton('TranslationService', { translate: (key) => key });
	$injector.registerSingleton('MapService', { getSrid: () => 3857, getDefaultGeodeticSrid: () => 25832 });
	$injector.registerSingleton('EnvironmentService', environmentServiceMock);
};

proj4.defs('EPSG:25832', '+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +axis=neu');
register(proj4);



describe('OlMeasurementHandler', () => {
	beforeEach(() => {
		setup();
	});
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

		describe('uses Interactions', () => {
			it('adds a Draw-Interaction', () => {
				const classUnderTest = new OlMeasurementHandler();
				const map = setupMap();
				map.addInteraction = jasmine.createSpy();

				classUnderTest.activate(map);

				// adds Interaction for select, draw, modify,snap, dragPan
				expect(map.addInteraction).toHaveBeenCalledTimes(5);
			});

			it('removes Interaction', () => {
				const classUnderTest = new OlMeasurementHandler();
				const map = setupMap();
				const layerStub = {};
				map.removeInteraction = jasmine.createSpy();

				classUnderTest.deactivate(map, layerStub);

				// removes Interaction for select, draw, modify, snap, dragPan
				expect(map.removeInteraction).toHaveBeenCalledTimes(5);
			});

			it('adds a select interaction', () => {
				const classUnderTest = new OlMeasurementHandler();
				const map = setupMap();
				map.addInteraction = jasmine.createSpy();

				classUnderTest.activate(map);

				expect(classUnderTest._select).toBeInstanceOf(Select);
				expect(map.addInteraction).toHaveBeenCalledWith(classUnderTest._select);
			});

			it('adds a draw interaction', () => {
				const classUnderTest = new OlMeasurementHandler();
				const map = setupMap();
				map.addInteraction = jasmine.createSpy();

				classUnderTest.activate(map);

				expect(classUnderTest._draw).toBeInstanceOf(Draw);
				expect(map.addInteraction).toHaveBeenCalledWith(classUnderTest._draw);
			});

			it('adds a modify interaction', () => {
				const classUnderTest = new OlMeasurementHandler();
				const map = setupMap();
				map.addInteraction = jasmine.createSpy();

				classUnderTest.activate(map);

				expect(classUnderTest._modify).toBeInstanceOf(Modify);
				expect(map.addInteraction).toHaveBeenCalledWith(classUnderTest._modify);
			});

			it('adds a snap interaction', () => {
				const classUnderTest = new OlMeasurementHandler();
				const map = setupMap();
				map.addInteraction = jasmine.createSpy();

				classUnderTest.activate(map);

				expect(classUnderTest._snap).toBeInstanceOf(Snap);
				expect(map.addInteraction).toHaveBeenCalledWith(classUnderTest._snap);
			});

			it('adds a dragPan interaction', () => {
				const classUnderTest = new OlMeasurementHandler();
				const map = setupMap();
				map.addInteraction = jasmine.createSpy();

				classUnderTest.activate(map);

				expect(classUnderTest._dragPan).toBeInstanceOf(DragPan);
				expect(map.addInteraction).toHaveBeenCalledWith(classUnderTest._dragPan);
			});
		});


		it('deactivates overlayManager on deactivate', () => {
			const classUnderTest = new OlMeasurementHandler();
			const map = setupMap();
			classUnderTest._overlayManager = { deactivate: jasmine.createSpy() };
			classUnderTest.deactivate(map);

			expect(classUnderTest._overlayManager.deactivate).toHaveBeenCalled();
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
		const initialCenter = fromLonLat([0, 0]);

		const setupMap = (zoom = 10) => {

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
					zoom: zoom
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

		it('creates partition tooltips for line small zoom', () => {
			const classUnderTest = new OlMeasurementHandler();
			const map = setupMap();
			const geometry = new LineString([[0, 0], [12345, 0]]);
			const feature = new Feature({ geometry: geometry });

			classUnderTest.activate(map);
			simulateDrawEvent('drawstart', classUnderTest._draw, feature);
			feature.getGeometry().dispatchEvent('change');

			expect(feature.get('partitions').length).toBe(1);
		});

		it('creates partition tooltips for line in big zoom', () => {
			const classUnderTest = new OlMeasurementHandler();
			const map = setupMap(15);
			const geometry = new LineString([[0, 0], [1234, 0]]);
			const feature = new Feature({ geometry: geometry });

			classUnderTest.activate(map);
			simulateDrawEvent('drawstart', classUnderTest._draw, feature);
			feature.getGeometry().dispatchEvent('change');

			expect(feature.get('partitions').length).toBe(12);
		});

		it('creates partition tooltips for line in bigger zoom', () => {
			const classUnderTest = new OlMeasurementHandler();
			const map = setupMap(20);
			const geometry = new LineString([[0, 0], [123, 0]]);
			const feature = new Feature({ geometry: geometry });

			classUnderTest.activate(map);
			simulateDrawEvent('drawstart', classUnderTest._draw, feature);
			feature.getGeometry().dispatchEvent('change');

			expect(feature.get('partitions').length).toBe(12);
		});

		it('creates partition tooltips for line in biggest zoom', () => {
			const classUnderTest = new OlMeasurementHandler();
			const map = setupMap(28);
			const geometry = new LineString([[0, 0], [12, 0]]);
			const feature = new Feature({ geometry: geometry });

			classUnderTest.activate(map);
			simulateDrawEvent('drawstart', classUnderTest._draw, feature);
			feature.getGeometry().dispatchEvent('change');

			expect(feature.get('partitions').length).toBe(1);
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
			const geometry = new Polygon([[[0, 0], [5000, 0], [5500, 5500], [0, 5000]]]);
			const feature = new Feature({ geometry: geometry });

			classUnderTest.activate(map);
			simulateDrawEvent('drawstart', classUnderTest._draw, feature);
			feature.getGeometry().dispatchEvent('change');

			expect(feature.get('partitions').length).toBe(1);
		});

		it('creates partition tooltips for not closed large polygon', () => {
			const classUnderTest = new OlMeasurementHandler();
			const map = setupMap();
			const geometry = new Polygon([[[0, 0], [10000, 0], [10000, 10000], [0, 10000]]]);
			const feature = new Feature({ geometry: geometry });

			classUnderTest.activate(map);
			simulateDrawEvent('drawstart', classUnderTest._draw, feature);
			feature.getGeometry().dispatchEvent('change');

			expect(feature.get('partitions').length).toBe(2);
		});

		it('removes partition tooltips after shrinking very long line', () => {
			const classUnderTest = new OlMeasurementHandler();
			const map = setupMap();
			const geometry = new LineString([[0, 0], [123456, 0]]);
			const feature = new Feature({ geometry: geometry });

			classUnderTest.activate(map);
			simulateDrawEvent('drawstart', classUnderTest._draw, feature);
			feature.getGeometry().dispatchEvent('change');

			expect(feature.get('partitions').length).toBe(12);

			geometry.setCoordinates([[0, 0], [12345, 0]]);
			feature.getGeometry().dispatchEvent('change');

			expect(feature.get('partitions').length).toBe(1);
		});

		it('removes partition tooltips after zoom out', () => {
			const classUnderTest = new OlMeasurementHandler();
			const map = setupMap(15);
			const geometry = new LineString([[0, 0], [1234, 0]]);
			const feature = new Feature({ geometry: geometry });

			classUnderTest.activate(map);
			simulateDrawEvent('drawstart', classUnderTest._draw, feature);
			feature.getGeometry().dispatchEvent('change');

			expect(feature.get('partitions').length).toBe(12);

			map.getView().setZoom(13);

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
			classUnderTest._draw.handleEvent = jasmine.createSpy().and.callThrough();
			feature.getGeometry().dispatchEvent('change');

			simulateKeyEvent(deleteKeyCode);
			expect(classUnderTest._draw.removeLastPoint).toHaveBeenCalled();
		});

		it('removes NOT last point if other keypressed', () => {
			const classUnderTest = new OlMeasurementHandler();
			const map = setupMap();
			const geometry = new Polygon([[[0, 0], [500, 0], [550, 550], [0, 500], [0, 500]]]);
			const feature = new Feature({ geometry: geometry });
			const deleteKeyCode = 42;

			classUnderTest.activate(map);
			simulateDrawEvent('drawstart', classUnderTest._draw, feature);
			classUnderTest._draw.removeLastPoint = jasmine.createSpy();
			feature.getGeometry().dispatchEvent('change');

			simulateKeyEvent(deleteKeyCode);
			expect(classUnderTest._draw.removeLastPoint).not.toHaveBeenCalled();
		});

		it('removes currently drawing two-point feature if keypressed', () => {
			const classUnderTest = new OlMeasurementHandler();
			classUnderTest._reset = jasmine.createSpy().and.callThrough();
			const map = setupMap();
			const geometry = new Polygon([[[0, 0], [500, 0], [0, 0]]]);
			const feature = new Feature({ geometry: geometry });
			const deleteKeyCode = 46;

			classUnderTest.activate(map);
			simulateDrawEvent('drawstart', classUnderTest._draw, feature);
			feature.getGeometry().dispatchEvent('change');

			simulateKeyEvent(deleteKeyCode);
			expect(classUnderTest._reset).toHaveBeenCalled();
		});

		it('removes drawn feature if keypressed', () => {
			const classUnderTest = new OlMeasurementHandler();
			classUnderTest._reset = jasmine.createSpy().and.callThrough();
			const map = setupMap();
			const deleteKeyCode = 46;

			classUnderTest.activate(map);

			const geometry = new Polygon([[[0, 0], [500, 0], [550, 550], [0, 500], [0, 500]]]);
			const feature = new Feature({ geometry: geometry });
			simulateDrawEvent('drawstart', classUnderTest._draw, feature);
			feature.getGeometry().dispatchEvent('change');
			simulateDrawEvent('drawend', classUnderTest._draw, feature);

			simulateKeyEvent(deleteKeyCode);
			expect(classUnderTest._reset).toHaveBeenCalled();
		});
	});

	const createSnappingFeatureMock = (coordinate, feature) => {
		return {
			get: () => [feature],
			getGeometry: () => new Point(coordinate)
		};
	};

	describe('when pointer move', () => {
		let target;
		const setupMap = () => {
			target = document.createElement('div');
			target.style.height = '100px';
			target.style.width = '100px';
			const map = new Map({
				layers: [
					new TileLayer({
						source: new OSM(),
					}),
					new TileLayer({
						source: new TileDebug(),
					})],
				target: target,
				view: new View({
					center: [0, 0],
					zoom: 1,
				}),
			});

			map.renderSync();
			return map;

		};

		const simulateMapMouseEvent = (map, type, x, y, dragging) => {
			const eventType = type;

			const event = new Event(eventType);
			//event.target = map.getViewport().firstChild;
			event.clientX = x;
			event.clientY = y;
			event.pageX = x;
			event.pageY = y;
			event.shiftKey = false;
			event.preventDefault = function () { };


			const mapEvent = new MapBrowserEvent(eventType, map, event);
			mapEvent.coordinate = [x, y];
			mapEvent.dragging = dragging ? dragging : false;
			map.dispatchEvent(mapEvent);
		};

		it('deactivates dblclick', () => {
			const classUnderTest = new OlMeasurementHandler();
			const map = setupMap();

			classUnderTest.activate(map);
			expect(map.getView().getZoom()).toBe(1);

			simulateMapMouseEvent(map, MapBrowserEventType.DBLCLICK, 10, 0);

			expect(map.getView().getZoom()).toBe(1);
		});

		it('creates and activates helpTooltip', () => {
			const classUnderTest = new OlMeasurementHandler();
			const map = setupMap();

			classUnderTest.activate(map);

			expect(classUnderTest._measureStateHandler).toBeDefined();
			expect(classUnderTest._measureStateHandler.active).toBeTrue();
		});

		it('creates and NOT activates helpTooltip', () => {
			const classUnderTest = new OlMeasurementHandler();
			const environmentSpy = spyOn(environmentServiceMock, 'isTouch').and.returnValue(true);
			const map = setupMap();

			classUnderTest.activate(map);
			expect(classUnderTest._measureStateHandler).toBeDefined();
			expect(classUnderTest._measureStateHandler.active).toBeFalse();
			expect(environmentSpy).toHaveBeenCalled();
		});

		it('no move when dragging', () => {
			const classUnderTest = new OlMeasurementHandler();
			const measureStateSpy = spyOn(classUnderTest._measureStateHandler, 'notify');
			const map = setupMap();

			classUnderTest.activate(map);
			simulateMapMouseEvent(map, MapBrowserEventType.POINTERMOVE, 10, 0, true);

			expect(measureStateSpy).toHaveBeenCalledWith({ type: MeasureStateType.MUTE, snap: null, coordinate: [10, 0], pointCount: 0 });
		});

		it('change measureState, when sketch is changing', () => {
			const classUnderTest = new OlMeasurementHandler();
			const map = setupMap();

			classUnderTest.activate(map);
			const measureStateSpy = spyOn(classUnderTest._measureStateHandler, 'notify');

			simulateMapMouseEvent(map, MapBrowserEventType.POINTERMOVE, 10, 0);

			expect(measureStateSpy).toHaveBeenCalledWith({ type: MeasureStateType.ACTIVE, snap: null, coordinate: [10, 0], pointCount: 0 });
			classUnderTest._activeSketch = new Feature({ geometry: new LineString([[0, 0], [1, 0]]) });
			simulateMapMouseEvent(map, MapBrowserEventType.POINTERMOVE, 20, 0);
			expect(measureStateSpy).toHaveBeenCalledWith({ type: MeasureStateType.DRAW, snap: null, coordinate: [20, 0], pointCount: 0 });
		});

		it('change measureState, when sketch is snapping to first point', () => {
			const classUnderTest = new OlMeasurementHandler();
			const snappedGeometry = new Polygon([[[0, 0], [500, 0], [550, 550], [0, 500], [0, 500]]]);
			const feature = new Feature({ geometry: snappedGeometry });

			const map = setupMap();

			classUnderTest.activate(map);
			const measureStateSpy = spyOn(classUnderTest._measureStateHandler, 'notify');

			simulateMapMouseEvent(map, MapBrowserEventType.POINTERMOVE, 10, 0);
			expect(measureStateSpy).toHaveBeenCalledWith({ type: MeasureStateType.ACTIVE, snap: null, coordinate: [10, 0], pointCount: 0 });

			simulateDrawEvent('drawstart', classUnderTest._draw, feature);
			snappedGeometry.setCoordinates([[[0, 0], [500, 0], [550, 550], [0, 500], [0, 0], [0, 0]]]);
			feature.getGeometry().dispatchEvent('change');

			simulateMapMouseEvent(map, MapBrowserEventType.POINTERMOVE, 0, 0);
			expect(measureStateSpy).toHaveBeenCalledWith({ type: MeasureStateType.DRAW, snap: MeasureSnapType.FIRSTPOINT, coordinate: [0, 0], pointCount: 5 });
		});

		it('change measureState, when sketch is snapping to last point', () => {
			const classUnderTest = new OlMeasurementHandler();
			const snappedGeometry = new Polygon([[[0, 0], [500, 0], [550, 550], [0, 500], [0, 500]]]);
			const feature = new Feature({ geometry: snappedGeometry });
			const map = setupMap();

			classUnderTest.activate(map);
			const measureStateSpy = spyOn(classUnderTest._measureStateHandler, 'notify');

			simulateMapMouseEvent(map, MapBrowserEventType.POINTERMOVE, 10, 0);
			expect(measureStateSpy).toHaveBeenCalledWith({ type: MeasureStateType.ACTIVE, snap: null, coordinate: [10, 0], pointCount: 0 });

			simulateDrawEvent('drawstart', classUnderTest._draw, feature);
			snappedGeometry.setCoordinates([[[0, 0], [500, 0], [550, 550], [0, 500], [0, 500], [0, 500]]]);
			feature.getGeometry().dispatchEvent('change');
			simulateMapMouseEvent(map, MapBrowserEventType.POINTERMOVE, 0, 500);
			expect(measureStateSpy).toHaveBeenCalledWith({ type: MeasureStateType.DRAW, snap: MeasureSnapType.LASTPOINT, coordinate: [0, 500], pointCount: 5 });
		});

		it('change measureState, when mouse enters draggable overlay', () => {
			const classUnderTest = new OlMeasurementHandler();
			const map = setupMap();

			classUnderTest.activate(map);
			const measureStateSpy = spyOn(classUnderTest._measureStateHandler, 'notify');

			const overlayMock = {
				set: () => { },
				get: () => true,
				setOffset: () => { },
				setPosition: () => { }
			};
			classUnderTest._overlayManager.getOverlays = jasmine.createSpy().and.returnValue([overlayMock]);
			simulateMapMouseEvent(map, MapBrowserEventType.POINTERMOVE, 10, 0);


			expect(measureStateSpy).toHaveBeenCalledWith({ type: MeasureStateType.OVERLAY, snap: null, coordinate: [10, 0], pointCount: 0 });
		});

		it('uses _lastPointerMoveEvent on removeLast if keypressed', () => {
			const classUnderTest = new OlMeasurementHandler();
			const map = setupMap();
			const geometry = new Polygon([[[0, 0], [500, 0], [550, 550], [0, 500], [0, 500]]]);
			const feature = new Feature({ geometry: geometry });
			const deleteKeyCode = 46;

			classUnderTest.activate(map);
			simulateMapMouseEvent(map, MapBrowserEventType.POINTERMOVE, 10, 0);
			simulateDrawEvent('drawstart', classUnderTest._draw, feature);
			classUnderTest._draw.removeLastPoint = jasmine.createSpy();
			classUnderTest._draw.handleEvent = jasmine.createSpy().and.callThrough();
			feature.getGeometry().dispatchEvent('change');

			simulateKeyEvent(deleteKeyCode);
			expect(classUnderTest._draw.removeLastPoint).toHaveBeenCalled();
			expect(classUnderTest._draw.handleEvent).toHaveBeenCalledWith(jasmine.any(MapBrowserEvent));
		});

		it('adds the drawn feature to select after drawends', () => {
			const classUnderTest = new OlMeasurementHandler();
			const map = setupMap();

			classUnderTest.activate(map);

			const geometry = new Polygon([[[0, 0], [500, 0], [550, 550], [0, 500], [0, 500]]]);
			const feature = new Feature({ geometry: geometry });
			simulateDrawEvent('drawstart', classUnderTest._draw, feature);
			feature.getGeometry().dispatchEvent('change');
			simulateDrawEvent('drawend', classUnderTest._draw, feature);

			expect(classUnderTest._select).toBeDefined();
			expect(classUnderTest._select.getFeatures().getLength()).toBe(1);
		});

		describe('when switching to modify', () => {
			const geometry = new LineString([[0, 0], [100, 0]]);
			const feature = new Feature({ geometry: geometry });

			it('pointer is not snapped on sketch', () => {
				const classUnderTest = new OlMeasurementHandler();
				const map = setupMap();

				map.forEachFeatureAtPixel = jasmine.createSpy().and.callThrough();
				const measureStateSpy = spyOn(classUnderTest._measureStateHandler, 'notify');

				classUnderTest.activate(map);
				classUnderTest._modify.setActive(true);

				simulateMapMouseEvent(map, MapBrowserEventType.POINTERMOVE, 10, 0);

				expect(map.forEachFeatureAtPixel).toHaveBeenCalledWith([10, 0], jasmine.any(Function), jasmine.any(Object));
				expect(measureStateSpy).toHaveBeenCalledWith({ type: MeasureStateType.MODIFY, snap: null, coordinate: [10, 0], pointCount: 0 });
			});

			it('pointer is snapped to sketch boundary', () => {
				const classUnderTest = new OlMeasurementHandler();
				const map = setupMap();

				const measureStateSpy = spyOn(classUnderTest._measureStateHandler, 'notify');
				const snappingFeatureMock = createSnappingFeatureMock([50, 0], feature);
				map.forEachFeatureAtPixel = jasmine.createSpy().and.callFake((pixel, callback) => {
					callback(snappingFeatureMock, undefined);
				});

				classUnderTest.activate(map);
				classUnderTest._modify.setActive(true);
				simulateMapMouseEvent(map, MapBrowserEventType.POINTERMOVE, 50, 0);

				expect(map.forEachFeatureAtPixel).toHaveBeenCalledWith([50, 0], jasmine.any(Function), jasmine.any(Object));
				expect(measureStateSpy).toHaveBeenCalledWith({ type: MeasureStateType.MODIFY, snap: MeasureSnapType.EGDE, coordinate: [50, 0], pointCount: jasmine.anything() });
			});

			it('pointer is snapped to sketch vertex', () => {
				const classUnderTest = new OlMeasurementHandler();
				const map = setupMap();

				const measureStateSpy = spyOn(classUnderTest._measureStateHandler, 'notify');
				const snappingFeatureMock = createSnappingFeatureMock([0, 0], feature);
				map.forEachFeatureAtPixel = jasmine.createSpy().and.callFake((pixel, callback) => {
					callback(snappingFeatureMock, undefined);
				});

				classUnderTest.activate(map);
				classUnderTest._modify.setActive(true);
				simulateMapMouseEvent(map, MapBrowserEventType.POINTERMOVE, 0, 0);

				expect(map.forEachFeatureAtPixel).toHaveBeenCalledWith([0, 0], jasmine.any(Function), jasmine.any(Object));
				expect(measureStateSpy).toHaveBeenCalledWith({ type: MeasureStateType.MODIFY, snap: MeasureSnapType.VERTEX, coordinate: [0, 0], pointCount: jasmine.anything() });
			});


			it('adds/removes style for grab on vertex', () => {
				const classUnderTest = new OlMeasurementHandler();
				const map = setupMap();
				const mapContainer = map.getTarget();


				const snappingFeatureMock = createSnappingFeatureMock([0, 0], feature);
				let toggleOnce = true;
				map.forEachFeatureAtPixel = jasmine.createSpy().and.callFake((pixel, callback) => {
					if (toggleOnce) {
						callback(snappingFeatureMock, undefined);
						toggleOnce = false;
					}
				});

				classUnderTest.activate(map);
				classUnderTest._modify.setActive(true);
				simulateMapMouseEvent(map, MapBrowserEventType.POINTERMOVE, 0, 0);

				expect(map.forEachFeatureAtPixel).toHaveBeenCalledWith([0, 0], jasmine.any(Function), jasmine.any(Object));
				expect(mapContainer.classList.contains('grab')).toBeTrue();
				simulateMapMouseEvent(map, MapBrowserEventType.POINTERMOVE, 50, 0);
				expect(mapContainer.classList.contains('grab')).toBeFalse();
			});

			it('adds/removes style for grabbing while modifying', () => {
				const classUnderTest = new OlMeasurementHandler();
				const map = setupMap();
				const mapContainer = map.getTarget();

				classUnderTest.activate(map);
				classUnderTest._modify.setActive(true);
				classUnderTest._modify.dispatchEvent(new ModifyEvent('modifystart', null, new Event(MapBrowserEventType.POINTERDOWN)));


				expect(mapContainer.classList.contains('grabbing')).toBeTrue();
				classUnderTest._modify.dispatchEvent(new ModifyEvent('modifyend', null, new Event(MapBrowserEventType.POINTERUP)));
				expect(mapContainer.classList.contains('grabbing')).toBeFalse();
			});
		});



		describe('drags overlays', () => {

			it('change overlay-property on pointerdown', () => {
				const classUnderTest = new OlMeasurementHandler();
				const map = setupMap();
				classUnderTest.activate(map);

				const geometry = new Polygon([[[0, 0], [500, 0], [550, 550], [0, 500], [0, 500]]]);
				const feature = new Feature({ geometry: geometry });
				simulateDrawEvent('drawstart', classUnderTest._draw, feature);
				feature.getGeometry().dispatchEvent('change');
				simulateDrawEvent('drawend', classUnderTest._draw, feature);
				const overlay = feature.get('measurement');
				const element = overlay.getElement();

				element.dispatchEvent(new Event('pointerdown'));

				expect(overlay.get('dragging')).toBeTrue();
			});

			it('changes position of overlay on pointermove', () => {
				const classUnderTest = new OlMeasurementHandler();
				const map = setupMap();
				classUnderTest.activate(map);

				const geometry = new Polygon([[[0, 0], [500, 0], [550, 550], [0, 500], [0, 500]]]);
				const feature = new Feature({ geometry: geometry });
				simulateDrawEvent('drawstart', classUnderTest._draw, feature);
				feature.getGeometry().dispatchEvent('change');
				simulateDrawEvent('drawend', classUnderTest._draw, feature);
				const overlay = feature.get('measurement');
				const element = overlay.getElement();

				element.dispatchEvent(new Event('pointerdown'));

				expect(overlay.get('dragging')).toBeTrue();
				simulateMapMouseEvent(map, MapBrowserEventType.POINTERMOVE, 50, 500);
				expect(overlay.get('manualPositioning')).toBeTrue();
				expect(overlay.getPosition()).toEqual([50, 500]);
				simulateMapMouseEvent(map, MapBrowserEventType.POINTERUP, 50, 500);
				expect(overlay.get('dragging')).toBeFalse();
			});

			it('triggers overlay as dragable', () => {
				const classUnderTest = new OlMeasurementHandler();
				const map = setupMap();
				classUnderTest.activate(map);

				const geometry = new Polygon([[[0, 0], [500, 0], [550, 550], [0, 500], [0, 500]]]);
				const feature = new Feature({ geometry: geometry });
				simulateDrawEvent('drawstart', classUnderTest._draw, feature);
				feature.getGeometry().dispatchEvent('change');
				simulateDrawEvent('drawend', classUnderTest._draw, feature);
				const overlay = feature.get('measurement');
				const element = overlay.getElement();

				element.dispatchEvent(new Event('mouseenter'));
				expect(overlay.get('dragable')).toBeTrue();

				element.dispatchEvent(new Event('mouseleave'));
				expect(overlay.get('dragable')).toBeFalse();
			});
		});

	});

	describe('when pointer click', () => {
		let target;
		const setupMap = () => {
			target = document.createElement('div');
			target.style.height = '100px';
			target.style.width = '100px';
			const map = new Map({
				layers: [
					new TileLayer({
						source: new OSM(),
					}),
					new TileLayer({
						source: new TileDebug(),
					})],
				target: target,
				view: new View({
					center: [0, 0],
					zoom: 1,
				}),
			});

			map.renderSync();
			return map;

		};

		const simulateMapMouseEvent = (map, type, x, y, dragging) => {
			const eventType = type;

			const event = new Event(eventType);
			//event.target = map.getViewport().firstChild;
			event.clientX = x;
			event.clientY = y;
			event.pageX = x;
			event.pageY = y;
			event.shiftKey = false;
			event.preventDefault = function () { };


			const mapEvent = new MapBrowserEvent(eventType, map, event);
			mapEvent.coordinate = [x, y];
			mapEvent.dragging = dragging ? dragging : false;
			map.dispatchEvent(mapEvent);
		};


		it('deselect feature, if clickposition is disjoint to selected feature', () => {
			const classUnderTest = new OlMeasurementHandler();
			const map = setupMap();

			classUnderTest.activate(map);

			const geometry = new Polygon([[[0, 0], [500, 0], [550, 550], [0, 500], [0, 500]]]);
			const feature = new Feature({ geometry: geometry });
			simulateMapMouseEvent(map, MapBrowserEventType.POINTERMOVE, 10, 0);
			simulateDrawEvent('drawstart', classUnderTest._draw, feature);
			feature.getGeometry().dispatchEvent('change');
			simulateDrawEvent('drawend', classUnderTest._draw, feature);

			expect(classUnderTest._select).toBeDefined();
			expect(classUnderTest._select.getFeatures().getLength()).toBe(1);

			simulateMapMouseEvent(map, MapBrowserEventType.POINTERMOVE, 600, 0);
			simulateMapMouseEvent(map, MapBrowserEventType.CLICK, 600, 0);
			expect(classUnderTest._select.getFeatures().getLength()).toBe(0);
		});


		it('select feature, if clickposition is in anyinteract to selected feature', () => {
			const classUnderTest = new OlMeasurementHandler();
			const map = setupMap();

			classUnderTest.activate(map);

			const geometry = new Polygon([[[0, 0], [500, 0], [550, 550], [0, 500], [0, 500]]]);
			const feature = new Feature({ geometry: geometry });


			simulateMapMouseEvent(map, MapBrowserEventType.POINTERMOVE, 10, 0);
			simulateDrawEvent('drawstart', classUnderTest._draw, feature);
			feature.getGeometry().dispatchEvent('change');
			simulateDrawEvent('drawend', classUnderTest._draw, feature);
			expect(classUnderTest._select).toBeDefined();


			// force deselect
			classUnderTest._select.getFeatures().clear();
			expect(classUnderTest._select.getFeatures().getLength()).toBe(0);

			map.forEachFeatureAtPixel = jasmine.createSpy().and.callFake((pixel, callback) => {
				callback(feature, classUnderTest._vectorLayer);
			});

			// re-select
			simulateMapMouseEvent(map, MapBrowserEventType.POINTERMOVE, 500, 0);
			simulateMapMouseEvent(map, MapBrowserEventType.CLICK, 250, 250);
			expect(classUnderTest._select.getFeatures().getLength()).toBe(1);
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



