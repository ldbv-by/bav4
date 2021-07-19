import { $injector } from '../../../../../../../src/injection';
import { TestUtils } from '../../../../../../test-utils.js';
import { DRAW_LAYER_ID } from '../../../../../../../src/modules/map/store/DrawPlugin';
import { drawReducer } from '../../../../../../../src/modules/map/store/draw.reducer';
import { layersReducer } from '../../../../../../../src/store/layers/layers.reducer';
import { OverlayService } from '../../../../../../../src/modules/map/components/olMap/services/OverlayService';
import { Style } from 'ol/style';
import { OlDrawHandler } from '../../../../../../../src/modules/map/components/olMap/handler/draw/OlDrawHandler';
import Map from 'ol/Map';
import TileLayer from 'ol/layer/Tile';
import View from 'ol/View';
import { OSM, TileDebug } from 'ol/source';
import { fromLonLat } from 'ol/proj';
import { DragPan, Draw, Modify, Select, Snap } from 'ol/interaction';
import { finish, reset, remove, setType } from '../../../../../../../src/modules/map/store/draw.action';
import MapBrowserEventType from 'ol/MapBrowserEventType';
import { ModifyEvent } from 'ol/interaction/Modify';
import { LineString } from 'ol/geom';
import { Feature } from 'ol';
import { DrawEvent } from 'ol/interaction/Draw';




describe('OlDrawHandler', () => {
	class MockClass {
		constructor() {
			this.get = 'I\'m a StyleService.';
		}

		addStyle() { }

		updateStyle() { }

		removeStyle() { }

		getStyleFunction() {
			const styleFunction = () => {
				const styles = [
					new Style()
				];

				return styles;
			};

			return styleFunction;
		}

	}


	const geoResourceServiceMock = {
		addOrReplace() { },
		// eslint-disable-next-line no-unused-vars
		byId() {
			return null;
		}
	};

	const fileStorageServiceMock = {
		async save() {
			return { fileId: 'saveFooBarBazId' };
		},
		isFileId(id) {
			return id.startsWith('f_');
		},
		isAdminId(id) {
			return id.startsWith('a_');
		}

	};
	const environmentServiceMock = { isTouch: () => false };
	const initialState = {
		active: false,
		mode: null,
		type: null,
		reset: null,
		fileSaveResult: { adminId: 'init', fileId: 'init' }
	};

	const setup = (state = initialState) => {
		const drawState = {
			draw: state,
			layers: {
				active: [],
				background: 'null'
			}
		};
		const store = TestUtils.setupStoreAndDi(drawState, { draw: drawReducer, layers: layersReducer });
		$injector.registerSingleton('TranslationService', { translate: (key) => key })
			.registerSingleton('MapService', { getSrid: () => 3857, getDefaultGeodeticSrid: () => 25832 })
			.registerSingleton('EnvironmentService', environmentServiceMock)
			.registerSingleton('GeoResourceService', geoResourceServiceMock)
			.registerSingleton('FileStorageService', fileStorageServiceMock)
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
			.register('OverlayService', OverlayService)
			.register('StyleService', MockClass);
		return store;
	};

	const simulateDrawEvent = (type, draw, feature) => {
		const eventType = type;
		const drawEvent = new DrawEvent(eventType, feature);

		draw.dispatchEvent(drawEvent);
	};

	it('has two methods', () => {
		setup();
		const handler = new OlDrawHandler();
		expect(handler).toBeTruthy();
		expect(handler.activate).toBeTruthy();
		expect(handler.deactivate).toBeTruthy();
		expect(handler.id).toBe(DRAW_LAYER_ID);
	});

	describe('when activated over olMap', () => {
		const container = document.createElement('div');
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
				target: container,
				view: new View({
					center: initialCenter,
					zoom: 1,
				}),
			});

		};

		it('creates a layer to draw', () => {
			setup();
			const classUnderTest = new OlDrawHandler();
			const map = setupMap();
			const layer = classUnderTest.activate(map);

			expect(layer).toBeTruthy();
		});

		describe('uses Interactions', () => {
			it('adds Interactions', () => {
				setup();
				const classUnderTest = new OlDrawHandler();
				const map = setupMap();
				map.addInteraction = jasmine.createSpy();

				classUnderTest.activate(map);

				// adds Interaction for select, draw (4x), modify,snap, dragPan				
				expect(map.addInteraction).toHaveBeenCalledTimes(8);
			});

			it('removes Interaction', () => {
				setup();
				const classUnderTest = new OlDrawHandler();
				const map = setupMap();
				const layerStub = {};
				map.removeInteraction = jasmine.createSpy();
				classUnderTest.activate(map);
				classUnderTest.deactivate(map, layerStub);

				// removes Interaction for select, draw, modify, snap, dragPan
				expect(map.removeInteraction).toHaveBeenCalledTimes(8);
			});

			it('adds a select interaction', () => {
				setup();
				const classUnderTest = new OlDrawHandler();
				const map = setupMap();
				map.addInteraction = jasmine.createSpy();

				classUnderTest.activate(map);

				expect(classUnderTest._select).toBeInstanceOf(Select);
				expect(map.addInteraction).toHaveBeenCalledWith(classUnderTest._select);
			});

			it('adds a draw interaction', () => {
				setup();
				const classUnderTest = new OlDrawHandler();
				const map = setupMap();
				map.addInteraction = jasmine.createSpy();

				classUnderTest.activate(map);

				expect(Object.keys(classUnderTest._drawTypes).length).toBe(4);
				// eslint-disable-next-line no-unused-vars
				for (const [key, draw] of Object.entries(classUnderTest._drawTypes)) {
					expect(draw).toBeInstanceOf(Draw);
					expect(map.addInteraction).toHaveBeenCalledWith(draw);
				}
			});

			it('adds a modify interaction', () => {
				setup();
				const classUnderTest = new OlDrawHandler();
				const map = setupMap();
				map.addInteraction = jasmine.createSpy();

				classUnderTest.activate(map);

				expect(classUnderTest._modify).toBeInstanceOf(Modify);
				expect(map.addInteraction).toHaveBeenCalledWith(classUnderTest._modify);
			});

			it('adds a snap interaction', () => {
				setup();
				const classUnderTest = new OlDrawHandler();
				const map = setupMap();
				map.addInteraction = jasmine.createSpy();

				classUnderTest.activate(map);

				expect(classUnderTest._snap).toBeInstanceOf(Snap);
				expect(map.addInteraction).toHaveBeenCalledWith(classUnderTest._snap);
			});

			it('adds a dragPan interaction', () => {
				setup();
				const classUnderTest = new OlDrawHandler();
				const map = setupMap();
				map.addInteraction = jasmine.createSpy();

				classUnderTest.activate(map);

				expect(classUnderTest._dragPan).toBeInstanceOf(DragPan);
				expect(map.addInteraction).toHaveBeenCalledWith(classUnderTest._dragPan);
			});

			it('initialize interactions and state objects only once on multiple activates', () => {
				setup();
				const classUnderTest = new OlDrawHandler();
				const map = setupMap();
				const createDrawSpy = spyOn(classUnderTest, '_createDrawTypes').and.callThrough();

				classUnderTest.activate(map);
				classUnderTest.activate(map);

				expect(createDrawSpy).toHaveBeenCalledTimes(1);
			});


			it('register observer for type-changes', () => {
				setup();
				const classUnderTest = new OlDrawHandler();
				const map = setupMap();
				map.addInteraction = jasmine.createSpy();
				const initSpy = spyOn(classUnderTest, '_init').and.callThrough();

				classUnderTest.activate(map);
				setType('Symbol');

				expect(classUnderTest._getActiveDraw()).toBeTruthy();
				expect(classUnderTest._drawTypes['Symbol'].getActive()).toBeTrue();
				expect(initSpy).toHaveBeenCalled();
			});

			it('register observer for finish-request', () => {
				setup();
				const classUnderTest = new OlDrawHandler();
				const map = setupMap();
				map.addInteraction = jasmine.createSpy();
				const finishSpy = spyOn(classUnderTest, '_finish').and.callThrough();

				classUnderTest.activate(map);
				finish();
				expect(finishSpy).toHaveBeenCalled();
			});

			it('register observer for reset-request', () => {
				setup();
				const classUnderTest = new OlDrawHandler();
				const map = setupMap();
				map.addInteraction = jasmine.createSpy();
				const startNewSpy = spyOn(classUnderTest, '_startNew').and.callThrough();

				classUnderTest.activate(map);
				reset();
				expect(startNewSpy).toHaveBeenCalled();
			});


			it('register observer for remove-request', () => {
				setup();
				const classUnderTest = new OlDrawHandler();
				const map = setupMap();
				map.addInteraction = jasmine.createSpy();
				const removeSpy = spyOn(classUnderTest, '_remove').and.callThrough();

				classUnderTest.activate(map);
				remove();
				expect(removeSpy).toHaveBeenCalled();
			});

			it('aborts drawing after reset-request', () => {
				setup();
				const classUnderTest = new OlDrawHandler();
				const map = setupMap();
				map.addInteraction = jasmine.createSpy();
				const startNewSpy = spyOn(classUnderTest, '_startNew').and.callThrough();

				classUnderTest.activate(map);
				const draw = classUnderTest._drawTypes['Line'];
				const abortSpy = spyOn(draw, 'abortDrawing').and.callThrough();
				setType('Line');
				expect(classUnderTest._drawTypes['Line'].getActive()).toBeTrue();
				reset();
				expect(startNewSpy).toHaveBeenCalled();
				expect(abortSpy).toHaveBeenCalled();
			});


			it('aborts current drawing after type-change', () => {
				setup();
				const classUnderTest = new OlDrawHandler();
				const map = setupMap();
				map.addInteraction = jasmine.createSpy();
				const initSpy = spyOn(classUnderTest, '_init').and.callThrough();

				classUnderTest.activate(map);
				const draw = classUnderTest._drawTypes['Symbol'];
				const abortSpy = spyOn(draw, 'abortDrawing').and.callThrough();
				setType('Symbol');
				expect(classUnderTest._drawTypes['Symbol'].getActive()).toBeTrue();
				setType('Line');
				expect(classUnderTest._drawTypes['Symbol'].getActive()).toBeFalse();
				expect(initSpy).toHaveBeenCalled();
				expect(abortSpy).toHaveBeenCalled();
			});


			it('aborts current drawing with additional warning after errornous type-change', () => {
				setup();
				const classUnderTest = new OlDrawHandler();
				const map = setupMap();
				map.addInteraction = jasmine.createSpy();
				const initSpy = spyOn(classUnderTest, '_init').and.callThrough();
				const warnSpy = spyOn(console, 'warn');

				classUnderTest.activate(map);
				const draw = classUnderTest._drawTypes['Symbol'];
				const abortSpy = spyOn(draw, 'abortDrawing').and.callThrough();
				setType('Symbol');
				expect(classUnderTest._drawTypes['Symbol'].getActive()).toBeTrue();
				setType(null);
				expect(classUnderTest._drawTypes['Symbol'].getActive()).toBeFalse();
				expect(initSpy).toHaveBeenCalled();
				expect(abortSpy).toHaveBeenCalled();
				expect(warnSpy).toHaveBeenCalled();
			});


			it('finishs drawing after finish-request', () => {
				setup();
				const classUnderTest = new OlDrawHandler();
				const map = setupMap();
				map.addInteraction = jasmine.createSpy();
				const startNewSpy = spyOn(classUnderTest, '_finish').and.callThrough();
				const geometry = new LineString([[0, 0], [1, 0]]);
				const feature = new Feature({ geometry: geometry });

				classUnderTest.activate(map);


				const draw = classUnderTest._drawTypes['Line'];
				const finishSpy = spyOn(draw, 'finishDrawing').and.callThrough();
				setType('Line');
				expect(classUnderTest._drawTypes['Line'].getActive()).toBeTrue();

				simulateDrawEvent('drawstart', classUnderTest._drawTypes['Line'], feature);
				finish();

				expect(startNewSpy).toHaveBeenCalled();
				expect(finishSpy).toHaveBeenCalled();
			});

			it('switches to modify after finish-request on not-present sketch', () => {
				setup();
				const classUnderTest = new OlDrawHandler();
				const map = setupMap();
				map.addInteraction = jasmine.createSpy();
				const startNewSpy = spyOn(classUnderTest, '_finish').and.callThrough();

				classUnderTest.activate(map);

				setType('Line');
				expect(classUnderTest._drawTypes['Line'].getActive()).toBeTrue();

				finish();

				expect(startNewSpy).toHaveBeenCalled();
				expect(classUnderTest._modify.getActive()).toBeTrue();
			});

			it('removes last point after remove-request for a line', () => {
				setup();
				const classUnderTest = new OlDrawHandler();
				const map = setupMap();
				map.addInteraction = jasmine.createSpy();
				const removeSpy = spyOn(classUnderTest, '_remove').and.callThrough();
				const geometry = new LineString([[0, 0], [1, 0]]);
				const feature = new Feature({ geometry: geometry });

				classUnderTest.activate(map);


				const draw = classUnderTest._drawTypes['Line'];
				const removeLastPointSpy = spyOn(draw, 'removeLastPoint').and.callThrough();
				setType('Line');
				expect(classUnderTest._drawTypes['Line'].getActive()).toBeTrue();

				simulateDrawEvent('drawstart', classUnderTest._drawTypes['Line'], feature);
				remove();

				expect(removeSpy).toHaveBeenCalled();
				expect(removeLastPointSpy).toHaveBeenCalled();
			});
		});

	});

	describe('when draw a line', () => {
		const initialCenter = fromLonLat([42, 42]);
		let target;
		const setupMap = (zoom = 10) => {
			target = document.createElement('div');
			return new Map({
				layers: [
					new TileLayer({
						source: new OSM(),
					}),
					new TileLayer({
						source: new TileDebug(),
					})],
				target: target,
				view: new View({
					center: initialCenter,
					zoom: zoom
				}),
			});

		};

		it('feature gets valid id after start drawing', () => {
			setup();
			const classUnderTest = new OlDrawHandler();
			const map = setupMap();
			const geometry = new LineString([[0, 0], [1, 0]]);
			const feature = new Feature({ geometry: geometry });

			classUnderTest.activate(map);

			simulateDrawEvent('drawstart', classUnderTest._drawTypes['Line'], feature);

			const id = feature.getId();

			expect(id).toBeTruthy();
			expect(id).toMatch(/draw_[0-9]{13}/g);
		});

		it('switches to modify after drawend', () => {
			setup();
			const classUnderTest = new OlDrawHandler();
			const map = setupMap();
			const geometry = new LineString([[0, 0], [1, 0]]);
			const feature = new Feature({ geometry: geometry });

			classUnderTest.activate(map);
			expect(classUnderTest._modify.getActive()).toBeFalse();
			simulateDrawEvent('drawstart', classUnderTest._drawTypes['Line'], feature);
			simulateDrawEvent('drawend', classUnderTest._drawTypes['Line'], feature);


			expect(classUnderTest._modify.getActive()).toBeTrue();
		});


	});

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
					center: [42, 42],
					zoom: 1,
				}),
			});

			map.renderSync();
			return map;

		};

		it('adds/removes style for grabbing while modifying', () => {
			setup();
			const classUnderTest = new OlDrawHandler();
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

	describe('when using EnvironmentService for snapTolerance', () => {

		it('isTouch() resolves in higher snapTolerance', () => {
			setup();
			const classUnderTest = new OlDrawHandler();
			const environmentSpy = spyOn(environmentServiceMock, 'isTouch').and.returnValue(true);

			expect(classUnderTest._getSnapTolerancePerDevice()).toBe(12);
			expect(environmentSpy).toHaveBeenCalled();
		});

		it('isTouch() resolves in lower snapTolerance', () => {
			setup();
			const classUnderTest = new OlDrawHandler();
			const environmentSpy = spyOn(environmentServiceMock, 'isTouch').and.returnValue(false);

			expect(classUnderTest._getSnapTolerancePerDevice()).toBe(4);
			expect(environmentSpy).toHaveBeenCalled();
		});

	});

});



