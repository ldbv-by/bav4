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
import { finish, reset, remove } from '../../../../../../../src/modules/map/store/draw.action';




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


		});

	});


});



