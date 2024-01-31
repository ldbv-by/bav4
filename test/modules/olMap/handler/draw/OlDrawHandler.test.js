import { $injector } from '../../../../../src/injection';
import { TestUtils } from '../../../../test-utils.js';
import { DRAW_LAYER_ID } from '../../../../../src/plugins/DrawPlugin';
import { drawReducer, INITIAL_STYLE } from '../../../../../src/store/draw/draw.reducer';
import { layersReducer } from '../../../../../src/store/layers/layers.reducer';
import { OverlayService } from '../../../../../src/modules/olMap/services/OverlayService';
import { Icon, Style } from 'ol/style';
import { OlDrawHandler } from '../../../../../src/modules/olMap/handler/draw/OlDrawHandler';
import Map from 'ol/Map';
import View from 'ol/View';
import { DragPan, Modify, Select, Snap } from 'ol/interaction';
import { finish, reset, remove, setType, setStyle, setDescription } from '../../../../../src/store/draw/draw.action';
import MapBrowserEventType from 'ol/MapBrowserEventType';
import { ModifyEvent } from 'ol/interaction/Modify';
import { LineString, Point, Polygon } from 'ol/geom';
import { Collection, Feature, MapBrowserEvent } from 'ol';
import Draw, { DrawEvent } from 'ol/interaction/Draw';
import { InteractionSnapType, InteractionStateType } from '../../../../../src/modules/olMap/utils/olInteractionUtils';
import { VectorGeoResource, VectorSourceType } from '../../../../../src/domain/geoResources';
import { FileStorageServiceDataTypes } from '../../../../../src/services/FileStorageService';
import VectorSource from 'ol/source/Vector';
import { simulateMapBrowserEvent } from '../../mapTestUtils';
import { IconResult } from '../../../../../src/services/IconService';
import Stroke from 'ol/style/Stroke';
import { sharedReducer } from '../../../../../src/store/shared/shared.reducer';
import { acknowledgeTermsOfUse } from '../../../../../src/store/shared/shared.action';
import { LevelTypes } from '../../../../../src/store/notifications/notifications.action';
import { notificationReducer } from '../../../../../src/store/notifications/notifications.reducer';
import { toolsReducer } from '../../../../../src/store/tools/tools.reducer';
import { measurementReducer } from '../../../../../src/store/measurement/measurement.reducer';
import { getAttributionForLocallyImportedOrCreatedGeoResource } from '../../../../../src/services/provider/attribution.provider';
import { Layer } from 'ol/layer';
import { Tools } from '../../../../../src/domain/tools';
import { EventLike } from '../../../../../src/utils/storeUtils';

describe('OlDrawHandler', () => {
	class MockClass {
		constructor() {
			this.get = "I'm a StyleService.";
		}

		addStyle() {}

		updateStyle() {}

		removeStyle() {}

		getStyleFunction() {
			const styleFunction = () => {
				const styles = [new Style()];

				return styles;
			};

			return styleFunction;
		}
	}

	const geoResourceServiceMock = {
		addOrReplace() {},
		// eslint-disable-next-line no-unused-vars
		byId() {
			return null;
		}
	};

	const interactionStorageServiceMock = {
		async store() {},
		isValid() {
			return false;
		},
		isStorageId() {
			return false;
		},
		setStorageId() {},
		getStorageId() {
			return 'f_some';
		}
	};

	const translationServiceMock = { translate: (key) => key };
	const environmentServiceMock = { isTouch: () => false, isStandalone: () => false };
	const iconServiceMock = { getDefault: () => new IconResult('foo', 'bar') };

	const initialState = {
		active: false,
		createPermanentLayer: true,
		mode: null,
		type: null,
		style: INITIAL_STYLE,
		reset: null,
		description: null,
		fileSaveResult: { adminId: 'init', fileId: 'init' }
	};

	const setupMap = (center = [0, 0], zoom = 0) => {
		const containerId = 'mapContainer';
		document.getElementById(containerId)?.remove(); //remove existing map container
		document.body.style.margin = '0';
		document.body.style.padding = '0';

		const container = document.createElement('div');
		container.id = containerId;
		container.style.height = '100px';
		container.style.width = '100px';
		document.body.appendChild(container);

		const map = new Map({
			layers: [],
			target: container,
			view: new View({
				center: center,
				zoom: zoom
			})
		});
		return map;
	};

	const setup = (state = initialState) => {
		const drawState = {
			draw: state,
			layers: {
				active: [],
				background: 'null'
			},
			shared: {
				termsOfUseAcknowledged: false,
				fileSaveResult: null
			},
			notifications: {
				notification: null
			}
		};
		const store = TestUtils.setupStoreAndDi(drawState, {
			draw: drawReducer,
			measurement: measurementReducer,
			layers: layersReducer,
			shared: sharedReducer,
			notifications: notificationReducer,
			tools: toolsReducer
		});
		$injector
			.registerSingleton('TranslationService', translationServiceMock)
			.registerSingleton('MapService', { getSrid: () => 3857, getLocalProjectedSrid: () => 25832, getLocalProjectedSridExtent: () => null })
			.registerSingleton('EnvironmentService', environmentServiceMock)
			.registerSingleton('GeoResourceService', geoResourceServiceMock)
			.registerSingleton('InteractionStorageService', interactionStorageServiceMock)
			.registerSingleton('IconService', iconServiceMock)
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

	const simulateKeyEvent = (keyCode, key) => {
		const keyEvent = new KeyboardEvent('keyup', { key: key, keyCode: keyCode, which: keyCode });

		document.dispatchEvent(keyEvent);
	};

	const createFeature = () => {
		const feature = new Feature({
			geometry: new Polygon([
				[
					[0, 0],
					[1, 0],
					[1, 1],
					[0, 1],
					[0, 0]
				]
			])
		});
		return feature;
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
		it('creates a layer to draw', () => {
			setup();
			const classUnderTest = new OlDrawHandler();
			const map = setupMap();
			const layer = classUnderTest.activate(map);

			expect(layer).toBeTruthy();
		});

		it('creates a layer to draw ONLY once', () => {
			setup();
			const classUnderTest = new OlDrawHandler();
			const spy = spyOn(classUnderTest, '_createSelect').and.callThrough();
			const map = setupMap();

			const layer = classUnderTest.activate(map);
			classUnderTest.activate(map);

			expect(layer).toBeTruthy();
			expect(spy).toHaveBeenCalledTimes(1);
		});

		it('adds a label to the session vectorlayer', () => {
			setup();
			const map = setupMap();
			const classUnderTest = new OlDrawHandler();
			classUnderTest.activate(map);

			expect(classUnderTest._vectorLayer.label).toBe('olMap_handler_draw_layer_label');
		});

		it('adds a keyup-EventListener to the document', () => {
			setup();
			const documentSpy = spyOn(document, 'addEventListener').and.callThrough();
			const map = setupMap();
			const classUnderTest = new OlDrawHandler();
			classUnderTest.activate(map);

			expect(documentSpy).toHaveBeenCalledWith('keyup', jasmine.any(Function));
		});

		it('removes a keyup-EventListener from the document', () => {
			setup();
			const documentSpy = spyOn(document, 'removeEventListener').and.callThrough();
			const map = setupMap();
			const classUnderTest = new OlDrawHandler();
			classUnderTest.activate(map);
			classUnderTest.deactivate(map);

			expect(documentSpy).toHaveBeenCalledWith('keyup', jasmine.any(Function));
		});

		describe('when not TermsOfUseAcknowledged', () => {
			it('emits a notification', async () => {
				const store = setup();
				const map = setupMap();
				const classUnderTest = new OlDrawHandler();

				expect(store.getState().shared.termsOfUseAcknowledged).toBeFalse();
				classUnderTest.activate(map);

				expect(store.getState().shared.termsOfUseAcknowledged).toBeTrue();
				await TestUtils.timeout();
				// check notification
				// content is provided by lit unsafeHtml-Directive; a testable string is found in the values-property
				expect(store.getState().notifications.latest.payload.content.values[0]).toBe('olMap_handler_termsOfUse');
				expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.INFO);
			});

			describe('when termsOfUse are empty', () => {
				it('emits not a notification', async () => {
					const store = setup();
					const map = setupMap();
					spyOn(translationServiceMock, 'translate').and.callFake(() => '');
					const classUnderTest = new OlDrawHandler();

					expect(store.getState().shared.termsOfUseAcknowledged).toBeFalse();
					classUnderTest.activate(map);

					expect(store.getState().shared.termsOfUseAcknowledged).toBeTrue();
					await TestUtils.timeout();
					// check notification
					expect(store.getState().notifications.latest).toBeFalsy();
				});
			});
		});

		describe('when TermsOfUse already acknowledged', () => {
			it('emits NOT a notification', async () => {
				const store = setup();
				const map = setupMap();
				const classUnderTest = new OlDrawHandler();
				acknowledgeTermsOfUse();
				expect(store.getState().shared.termsOfUseAcknowledged).toBeTrue();
				classUnderTest.activate(map);

				await TestUtils.timeout();
				//check notification
				expect(store.getState().notifications.latest).toBeFalsy();
			});
		});

		describe('_save', () => {
			it('calls the InteractionService and updates the draw slice-of-state with a fileSaveResult', async () => {
				const fileSaveResultMock = { fileId: 'barId', adminId: null };
				const state = { ...initialState, fileSaveResult: new EventLike(null) };
				const store = await setup(state);
				const classUnderTest = new OlDrawHandler();
				const map = setupMap();
				const feature = createFeature();
				const storageSpy = spyOn(interactionStorageServiceMock, 'store').and.resolveTo(fileSaveResultMock);

				classUnderTest.activate(map);
				classUnderTest._vectorLayer.getSource().addFeature(feature);
				classUnderTest._save();

				await TestUtils.timeout();
				expect(storageSpy).toHaveBeenCalledWith(jasmine.any(String), FileStorageServiceDataTypes.KML);

				await TestUtils.timeout();
				expect(store.getState().draw.fileSaveResult.payload.content).toContain('<kml');
				expect(store.getState().draw.fileSaveResult.payload.fileSaveResult).toEqual(fileSaveResultMock);
			});

			it('calls the InteractionService and updates the draw slice-of-state with null', async () => {
				const state = { ...initialState, fileSaveResult: new EventLike(null) };
				const store = await setup(state);
				const classUnderTest = new OlDrawHandler();
				const map = setupMap();
				const feature = createFeature();
				spyOn(interactionStorageServiceMock, 'store').and.resolveTo(null);

				classUnderTest.activate(map);
				classUnderTest._vectorLayer.getSource().addFeature(feature);
				classUnderTest._save();

				await TestUtils.timeout();

				expect(store.getState().draw.fileSaveResult.payload).toBeNull();
			});
		});

		describe('uses Interactions', () => {
			it('adds Interactions', () => {
				setup();
				const classUnderTest = new OlDrawHandler();
				const map = setupMap();
				map.addInteraction = jasmine.createSpy();

				classUnderTest.activate(map);

				// adds Interaction for select, modify,snap, dragPan
				expect(map.addInteraction).toHaveBeenCalledTimes(4);
			});

			it('removes Interaction', () => {
				setup();
				const classUnderTest = new OlDrawHandler();
				const map = setupMap();
				const layerStub = {};
				map.removeInteraction = jasmine.createSpy();
				classUnderTest.activate(map);
				classUnderTest.deactivate(map, layerStub);

				// removes Interaction for select, modify, snap, dragPan
				expect(map.removeInteraction).toHaveBeenCalledTimes(4);
			});

			it('removes Interaction, draw inclusive', () => {
				setup();
				const classUnderTest = new OlDrawHandler();
				const map = setupMap();
				const layerStub = {};

				classUnderTest.activate(map);
				setType('line');
				map.removeInteraction = jasmine.createSpy();
				classUnderTest.deactivate(map, layerStub);

				// removes Interaction for select, draw,modify, snap, dragPan
				expect(map.removeInteraction).toHaveBeenCalledWith(jasmine.any(Draw));
				expect(map.removeInteraction).toHaveBeenCalledWith(jasmine.any(Select));
				expect(map.removeInteraction).toHaveBeenCalledWith(jasmine.any(Modify));
				expect(map.removeInteraction).toHaveBeenCalledWith(jasmine.any(Snap));
				expect(map.removeInteraction).toHaveBeenCalledWith(jasmine.any(DragPan));
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

			it('register observer for type-changes', () => {
				setup();
				const classUnderTest = new OlDrawHandler();
				const map = setupMap();
				map.addInteraction = jasmine.createSpy();
				const initSpy = spyOn(classUnderTest, '_init').and.callThrough();

				classUnderTest.activate(map);
				setType('line');

				expect(classUnderTest._draw).toBeTruthy();
				expect(initSpy).toHaveBeenCalledWith('line');
			});

			it('register observer for style-changes', () => {
				setup();
				const classUnderTest = new OlDrawHandler();
				const map = setupMap();
				map.addInteraction = jasmine.createSpy();
				const styleSpy = spyOn(classUnderTest, '_updateStyle').and.callThrough();

				classUnderTest.activate(map);
				setStyle(null);

				expect(styleSpy).toHaveBeenCalledTimes(1);
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
				const resetSpy = spyOn(classUnderTest, '_reset').and.callThrough();

				classUnderTest.activate(map);
				reset();
				expect(resetSpy).toHaveBeenCalled();
			});

			it('register observer for reset-request again, after deactivate', () => {
				setup();
				const classUnderTest = new OlDrawHandler();
				const map = setupMap();
				map.addInteraction = jasmine.createSpy();
				const resetSpy = spyOn(classUnderTest, '_reset').and.callThrough();

				classUnderTest.activate(map);
				reset();
				classUnderTest.deactivate(map);
				classUnderTest.activate(map);
				reset();
				expect(resetSpy).toHaveBeenCalledTimes(2);
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

			it('starts with a preselected drawType', () => {
				const state = { ...initialState, type: 'marker', style: { symbolSrc: 'something' } };
				setup(state);
				const classUnderTest = new OlDrawHandler();
				const map = setupMap();
				const initSpy = spyOn(classUnderTest, '_init').and.callThrough();

				classUnderTest.activate(map);

				expect(initSpy).toHaveBeenCalled();
				expect(classUnderTest._draw).toBeTruthy();
			});

			it('starts without a preselected drawType, caused by unknown type', () => {
				const state = { ...initialState, type: 'somethingWrong' };
				setup(state);
				const classUnderTest = new OlDrawHandler();
				const map = setupMap();
				const initSpy = spyOn(classUnderTest, '_init');

				classUnderTest.activate(map);

				expect(initSpy).toHaveBeenCalledWith('somethingWrong');
				expect(classUnderTest._draw).toBeNull();
			});

			it('starts without a preselected drawType', () => {
				setup();
				const classUnderTest = new OlDrawHandler();
				const map = setupMap();
				const initSpy = spyOn(classUnderTest, '_init');

				classUnderTest.activate(map);

				expect(initSpy).not.toHaveBeenCalled();
				expect(classUnderTest._draw).toBeNull();
			});

			it('aborts drawing after reset-request', () => {
				setup();
				const classUnderTest = new OlDrawHandler();
				const map = setupMap();
				map.addInteraction = jasmine.createSpy();
				const startNewSpy = spyOn(classUnderTest, '_startNew').and.callThrough();

				classUnderTest.activate(map);
				setStyle({ symbolSrc: 'something' });
				setType('line');
				const draw = classUnderTest._draw;
				const abortSpy = spyOn(draw, 'abortDrawing').and.callThrough();
				expect(classUnderTest._draw.getActive()).toBeTrue();

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
				setStyle({ symbolSrc: 'something' });
				setType('marker');
				const abortSpy = spyOn(classUnderTest._draw, 'abortDrawing').and.callThrough();
				expect(classUnderTest._draw.getActive()).toBeTrue();
				setType('line');
				expect(initSpy).toHaveBeenCalledTimes(2);
				expect(abortSpy).toHaveBeenCalled();
			});

			it('aborts current drawing if keyup', () => {
				setup();
				const classUnderTest = new OlDrawHandler();
				const map = setupMap();
				map.addInteraction = jasmine.createSpy();
				const abortKeyCode = 27;

				classUnderTest.activate(map);
				setStyle({ symbolSrc: 'something' });
				setType('marker');
				const abortSpy = spyOn(classUnderTest._draw, 'abortDrawing').and.callThrough();
				expect(classUnderTest._draw.getActive()).toBeTrue();
				setType('line');

				simulateKeyEvent(abortKeyCode, 'Escape');

				expect(abortSpy).toHaveBeenCalled();
			});

			it('deactivates active modify after type-change', () => {
				setup();
				const classUnderTest = new OlDrawHandler();
				const map = setupMap();
				map.addInteraction = jasmine.createSpy();
				const initSpy = spyOn(classUnderTest, '_init').and.callThrough();

				classUnderTest.activate(map);
				classUnderTest._modify.setActive(true);
				setType('marker');
				expect(initSpy).toHaveBeenCalledTimes(1);
				expect(classUnderTest._modify.getActive()).toBeFalse();
			});

			it('aborts current drawing with additional warning after errornous type-change', () => {
				setup();
				const classUnderTest = new OlDrawHandler();
				const map = setupMap();
				map.addInteraction = jasmine.createSpy();
				const initSpy = spyOn(classUnderTest, '_init').and.callThrough();
				const warnSpy = spyOn(console, 'warn');

				classUnderTest.activate(map);
				setStyle({ symbolSrc: 'something' });
				setType('marker');
				const draw = classUnderTest._draw;
				const abortSpy = spyOn(draw, 'abortDrawing').and.callThrough();
				setType('SomethingWrong');
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
				const geometry = new LineString([
					[0, 0],
					[1, 0]
				]);
				const feature = new Feature({ geometry: geometry });

				classUnderTest.activate(map);

				setType('line');
				const draw = classUnderTest._draw;
				const finishSpy = spyOn(draw, 'finishDrawing').and.callThrough();

				simulateDrawEvent('drawstart', draw, feature);
				finish();

				expect(startNewSpy).toHaveBeenCalled();
				expect(finishSpy).toHaveBeenCalled();
			});

			it('reads description from store when draw begins', () => {
				setup();
				const classUnderTest = new OlDrawHandler();
				const map = setupMap();
				const geometry = new LineString([
					[0, 0],
					[1, 0]
				]);
				const feature = new Feature({ geometry: geometry });

				classUnderTest.activate(map);
				setType('line');
				classUnderTest._drawState.type = InteractionStateType.DRAW;
				setDescription('Foo');

				const draw = classUnderTest._draw;
				simulateDrawEvent('drawstart', draw, feature);

				expect(feature.get('description')).toBe('Foo');
			});

			it('updates description of sketchFeature when store changes', () => {
				setup();
				const classUnderTest = new OlDrawHandler();
				const map = setupMap();
				const updateFeatureSpy = spyOn(classUnderTest, '_updateDescription').and.callThrough();
				const geometry = new LineString([
					[0, 0],
					[1, 0]
				]);
				const feature = new Feature({ geometry: geometry });

				classUnderTest.activate(map);
				setType('line');
				const draw = classUnderTest._draw;
				simulateDrawEvent('drawstart', draw, feature);
				classUnderTest._drawState.type = InteractionStateType.DRAW;

				setDescription('Foo');

				expect(updateFeatureSpy).toHaveBeenCalled();
				expect(feature.get('description')).toBe('Foo');
			});

			it('updates description of modifyable feature when store changes', () => {
				setup();
				const classUnderTest = new OlDrawHandler();
				const map = setupMap();
				const updateFeatureSpy = spyOn(classUnderTest, '_updateDescription').and.callThrough();
				const geometry = new LineString([
					[0, 0],
					[1, 0]
				]);
				const feature = new Feature({ geometry: geometry });

				classUnderTest.activate(map);
				classUnderTest._drawState.type = InteractionStateType.MODIFY;
				spyOn(classUnderTest._select, 'getFeatures').and.callFake(() => new Collection([feature]));

				setDescription('Foo');

				expect(updateFeatureSpy).toHaveBeenCalled();
				expect(feature.get('description')).toBe('Foo');
			});

			it('updates description in store when feature changes', () => {
				const store = setup();
				const classUnderTest = new OlDrawHandler();
				const map = setupMap();
				const geometry = new LineString([
					[0, 0],
					[1, 0]
				]);
				const feature = new Feature({ geometry: geometry });
				feature.setId('draw_line_1');
				feature.set('description', 'foo');

				classUnderTest.activate(map);
				setType('line');
				simulateDrawEvent('drawstart', classUnderTest._draw, feature);
				simulateDrawEvent('drawend', classUnderTest._draw, feature);

				expect(store.getState().draw.description).toEqual('foo');
			});

			it('switches to modify after finish-request on not-present sketch', () => {
				setup();
				const classUnderTest = new OlDrawHandler();
				const map = setupMap();
				map.addInteraction = jasmine.createSpy();
				const startNewSpy = spyOn(classUnderTest, '_finish').and.callThrough();

				classUnderTest.activate(map);

				setType('line');
				expect(classUnderTest._draw.getActive()).toBeTrue();

				finish();

				expect(startNewSpy).toHaveBeenCalled();
				expect(classUnderTest._modify.getActive()).toBeTrue();
				expect(classUnderTest._draw).toBeNull();
			});

			it('inits the drawing and sets the store with defaultText for line', () => {
				const store = setup();
				const classUnderTest = new OlDrawHandler();
				const map = setupMap();
				const drawStateFake = {
					type: InteractionStateType.ACTIVE
				};

				classUnderTest.activate(map);
				classUnderTest._drawState = drawStateFake;
				setType('line');

				expect(store.getState().draw.style.text).toBeNull();
			});

			it('inits the drawing and sets the store with defaultText, defaultSymbol for marker', () => {
				const store = setup();
				const defaultIconResult = new IconResult('marker', 'some_svg_stuff');
				spyOn(iconServiceMock, 'getDefault').and.returnValue(defaultIconResult);
				spyOnProperty(defaultIconResult, 'base64', 'get').and.returnValue('some_base64_stuff');
				const classUnderTest = new OlDrawHandler();
				const map = setupMap();
				const drawStateFake = {
					type: InteractionStateType.ACTIVE
				};

				classUnderTest.activate(map);
				classUnderTest._drawState = drawStateFake;
				setType('marker');

				expect(store.getState().draw.style.text).toBe('');
				expect(store.getState().draw.style.symbolSrc).toBe('some_base64_stuff');
				expect(store.getState().draw.style.anchor).toEqual([0.5, 1]);
			});

			it('inits the drawing and sets the store with defaultText for marker', () => {
				const store = setup();
				const classUnderTest = new OlDrawHandler();
				const map = setupMap();
				const drawStateFake = {
					type: InteractionStateType.ACTIVE
				};

				classUnderTest.activate(map);
				classUnderTest._drawState = drawStateFake;
				setType('text');

				expect(store.getState().draw.style.text).toBe('olMap_handler_draw_new_text');
			});

			it('re-inits the drawing and sets the store with defaultText for marker', async () => {
				const style = { symbolSrc: null, color: '#ff0000', scale: 0.5, text: null };
				const state = { ...initialState, style: style };

				const store = await setup(state);
				const classUnderTest = new OlDrawHandler();
				const map = setupMap();
				const drawStateFake = {
					type: InteractionStateType.ACTIVE
				};

				classUnderTest.activate(map);
				classUnderTest._drawState = drawStateFake;
				setType('marker');

				expect(store.getState().draw.style.text).toBe('');
			});

			it('re-inits the drawing and sets the store with defaultText for text', async () => {
				const style = { symbolSrc: null, color: '#ff0000', scale: 0.5, text: null };
				const state = { ...initialState, style: style };

				const store = await setup(state);
				const classUnderTest = new OlDrawHandler();
				const map = setupMap();
				const drawStateFake = {
					type: InteractionStateType.ACTIVE
				};

				classUnderTest.activate(map);
				classUnderTest._drawState = drawStateFake;
				setType('text');

				expect(store.getState().draw.style.text).toBe('olMap_handler_draw_new_text');
			});

			it('re-inits the drawing with new style, when store changes', () => {
				setup();
				const classUnderTest = new OlDrawHandler();
				const map = setupMap();
				const style = { symbolSrc: null, color: '#ff0000', scale: 0.5, text: '' };
				const drawStateFake = {
					type: InteractionStateType.ACTIVE
				};

				classUnderTest.activate(map);
				classUnderTest._drawState = drawStateFake;
				setType('line');

				const initSpy = spyOn(classUnderTest, '_init').and.callThrough();
				setStyle(style);

				expect(initSpy).toHaveBeenCalledWith('line');
				expect(initSpy).toHaveBeenCalledTimes(1);
			});

			it('updates drawing feature with new style, when store changes', () => {
				setup();
				const classUnderTest = new OlDrawHandler();
				const map = setupMap();
				const style = { symbolSrc: null, color: '#ff0000', scale: 0.5, text: '' };
				const feature = new Feature({
					geometry: new LineString([
						[0, 0],
						[1, 1]
					])
				});

				feature.setStyle([new Style(), new Style()]);
				const drawStateFake = {
					type: InteractionStateType.DRAW
				};
				classUnderTest.activate(map);
				classUnderTest._drawState = drawStateFake;
				classUnderTest._sketchHandler.activate(feature, 'draw_line_');

				setType('line');

				const styleSpy = spyOn(feature, 'setStyle').and.callThrough();
				setStyle(style);

				expect(styleSpy).toHaveBeenCalledTimes(1);
			});

			it('updates not until drawing feature is present, when store changes', () => {
				setup();
				const classUnderTest = new OlDrawHandler();
				const map = setupMap();
				const style = { symbolSrc: null, color: '#ff0000', scale: 0.5 };
				const feature = new Feature({
					geometry: new LineString([
						[0, 0],
						[1, 1]
					])
				});
				feature.setId('draw_line_1234');
				feature.setStyle([new Style(), new Style()]);
				const drawStateFake = {
					type: InteractionStateType.DRAW
				};
				classUnderTest.activate(map);
				classUnderTest._drawState = drawStateFake;

				setType('line');

				const styleSpy = spyOn(feature, 'setStyle').and.callThrough();
				setStyle(style);

				expect(styleSpy).toHaveBeenCalledTimes(0);
			});

			it('updates selected feature (modify) with new style, when store changes', () => {
				setup();
				const classUnderTest = new OlDrawHandler();
				const map = setupMap();
				const style = { symbolSrc: null, color: '#ff0000', scale: 0.5, text: '' };
				const feature = new Feature({ geometry: new Point([0, 0]) });

				const oldStyle1 = new Style(
					new Stroke({
						color: [0, 0, 0, 1],
						width: 3
					})
				);
				const oldStyle2 = new Style(
					new Stroke({
						color: [42, 0, 0, 1],
						width: 3
					})
				);
				const newStyle = new Style(
					new Stroke({
						color: [255, 255, 255, 1],
						width: 12
					})
				);
				spyOn(classUnderTest, '_getStyleFunctionFrom')
					.withArgs(feature)
					.and.callFake(() => () => [newStyle]);
				feature.setId('draw_Symbol_1234');
				feature.setStyle([oldStyle1, oldStyle2]);
				const drawStateFake = {
					type: InteractionStateType.MODIFY
				};
				classUnderTest.activate(map);

				spyOn(classUnderTest._select, 'getFeatures').and.callFake(() => new Collection([feature]));
				setType('marker');
				classUnderTest._drawState = drawStateFake;
				const styleSpy = spyOn(feature, 'setStyle').and.callThrough();
				setStyle(style);

				expect(styleSpy).toHaveBeenCalledTimes(1);
				expect(styleSpy).toHaveBeenCalledWith([newStyle, oldStyle2]);
			});
		});

		it('looks for an existing drawing-layer and adds the feature for update/copy on save', async () => {
			setup();
			const classUnderTest = new OlDrawHandler();
			const lastData =
				'<kml xmlns="http://www.opengis.net/kml/2.2" xmlns:gx="http://www.google.com/kml/ext/2.2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opengis.net/kml/2.2 https://developers.google.com/kml/schema/kml22gx.xsd"><Placemark id="draw_line_1620710146878"><Style><LineStyle><color>ff0000ff</color><width>3</width></LineStyle><PolyStyle><color>660000ff</color></PolyStyle></Style><ExtendedData><Data name="area"/><Data name="measurement"/><Data name="partitions"/></ExtendedData><Polygon><outerBoundaryIs><LinearRing><coordinates>10.66758401,50.09310529 11.77182103,50.08964948 10.57062661,49.66616988 10.66758401,50.09310529</coordinates></LinearRing></outerBoundaryIs></Polygon></Placemark></kml>';
			const map = setupMap();
			const vectorGeoResource = new VectorGeoResource('a_lastId', 'foo', VectorSourceType.KML).setSource(lastData, 4326);

			// we add two fileStorage related layers
			map.addLayer(new Layer({ geoResourceId: 'a_notWanted', render: () => {} }));
			map.addLayer(new Layer({ geoResourceId: 'a_lastId', render: () => {} }));
			spyOn(interactionStorageServiceMock, 'isStorageId').and.callFake(() => true);
			spyOn(classUnderTest._overlayService, 'add').and.callFake(() => {});

			const geoResourceSpy = spyOn(geoResourceServiceMock, 'byId').and.returnValue(vectorGeoResource);
			const storageSpy = spyOn(classUnderTest._storageHandler, 'setStorageId').and.callFake(() => {});
			classUnderTest.activate(map);
			const addFeatureSpy = spyOn(classUnderTest._vectorLayer.getSource(), 'addFeature');

			await TestUtils.timeout();
			expect(geoResourceSpy).toHaveBeenCalledWith('a_lastId');
			expect(storageSpy).toHaveBeenCalledWith('a_lastId');
			expect(addFeatureSpy).toHaveBeenCalledTimes(1);
		});

		it('looks for an existing drawing-layer and gets no georesource', async () => {
			setup();
			const classUnderTest = new OlDrawHandler();
			const map = setupMap();

			map.addLayer(new Layer({ geoResourceId: 'a_lastId', render: () => {} }));
			spyOn(interactionStorageServiceMock, 'isStorageId').and.callFake(() => true);
			spyOn(classUnderTest._overlayService, 'add').and.callFake(() => {});

			const geoResourceSpy = spyOn(geoResourceServiceMock, 'byId').and.returnValue(null);
			const storageSpy = spyOn(classUnderTest._storageHandler, 'setStorageId').and.callFake(() => {});
			classUnderTest.activate(map);
			const addFeatureSpy = spyOn(classUnderTest._vectorLayer.getSource(), 'addFeature');

			await TestUtils.timeout();
			expect(geoResourceSpy).toHaveBeenCalledWith('a_lastId');
			expect(storageSpy).not.toHaveBeenCalled();
			expect(addFeatureSpy).not.toHaveBeenCalled();
		});

		it('does NOT look for an existing drawing-layer', async () => {
			setup({ ...initialState, createPermanentLayer: false });
			const classUnderTest = new OlDrawHandler();
			const lastData =
				'<kml xmlns="http://www.opengis.net/kml/2.2" xmlns:gx="http://www.google.com/kml/ext/2.2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opengis.net/kml/2.2 https://developers.google.com/kml/schema/kml22gx.xsd"><Placemark id="draw_line_1620710146878"><Style><LineStyle><color>ff0000ff</color><width>3</width></LineStyle><PolyStyle><color>660000ff</color></PolyStyle></Style><ExtendedData><Data name="area"/><Data name="measurement"/><Data name="partitions"/></ExtendedData><Polygon><outerBoundaryIs><LinearRing><coordinates>10.66758401,50.09310529 11.77182103,50.08964948 10.57062661,49.66616988 10.66758401,50.09310529</coordinates></LinearRing></outerBoundaryIs></Polygon></Placemark></kml>';
			const map = setupMap();
			const vectorGeoResource = new VectorGeoResource('a_lastId', 'foo', VectorSourceType.KML).setSource(lastData, 4326);

			spyOn(classUnderTest._overlayService, 'add').and.callFake(() => {});

			const geoResourceSpy = spyOn(geoResourceServiceMock, 'byId').and.returnValue(vectorGeoResource);
			const storageSpy = spyOn(classUnderTest._storageHandler, 'setStorageId').and.callFake(() => {});
			classUnderTest.activate(map);
			const addFeatureSpy = spyOn(classUnderTest._vectorLayer.getSource(), 'addFeature');

			await TestUtils.timeout();
			expect(geoResourceSpy).not.toHaveBeenCalledWith('a_lastId');
			expect(storageSpy).not.toHaveBeenCalledWith('a_lastId');
			expect(addFeatureSpy).not.toHaveBeenCalledTimes(1);
		});

		it('adds style on old features', async () => {
			setup();
			const classUnderTest = new OlDrawHandler();
			const lastData =
				'<kml xmlns="http://www.opengis.net/kml/2.2" xmlns:gx="http://www.google.com/kml/ext/2.2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opengis.net/kml/2.2 https://developers.google.com/kml/schema/kml22gx.xsd"><Placemark id="measurement_1620710146878"><Style><LineStyle><color>ff0000ff</color><width>3</width></LineStyle><PolyStyle><color>660000ff</color></PolyStyle></Style><ExtendedData><Data name="area"/><Data name="measurement"/><Data name="partitions"/></ExtendedData><Polygon><outerBoundaryIs><LinearRing><coordinates>10.66758401,50.09310529 11.77182103,50.08964948 10.57062661,49.66616988 10.66758401,50.09310529</coordinates></LinearRing></outerBoundaryIs></Polygon></Placemark></kml>';
			const map = setupMap();
			const vectorGeoResource = new VectorGeoResource('a_lastId', 'foo', VectorSourceType.KML).setSource(lastData, 4326);

			map.addLayer(new Layer({ geoResourceId: 'a_lastId', render: () => {} }));
			spyOn(interactionStorageServiceMock, 'isStorageId').and.callFake(() => true);
			spyOn(classUnderTest._overlayService, 'add').and.callFake(() => {});
			spyOn(geoResourceServiceMock, 'byId').and.returnValue(vectorGeoResource);
			const addStyleSpy = spyOn(classUnderTest._styleService, 'addStyle');
			let oldFeature;

			classUnderTest.activate(map);
			spyOn(classUnderTest._vectorLayer.getSource(), 'addFeature').and.callFake((f) => {
				oldFeature = f;
			});

			await TestUtils.timeout();
			expect(addStyleSpy).toHaveBeenCalledWith(oldFeature, map, classUnderTest._vectorLayer);
		});

		it('updates style of old features onChange', async () => {
			setup();
			const classUnderTest = new OlDrawHandler();
			const lastData =
				'<kml xmlns="http://www.opengis.net/kml/2.2" xmlns:gx="http://www.google.com/kml/ext/2.2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opengis.net/kml/2.2 https://developers.google.com/kml/schema/kml22gx.xsd"><Placemark id="measurement_1620710146878"><Style><LineStyle><color>ff0000ff</color><width>3</width></LineStyle><PolyStyle><color>660000ff</color></PolyStyle></Style><ExtendedData><Data name="area"/><Data name="measurement"/><Data name="partitions"/></ExtendedData><Polygon><outerBoundaryIs><LinearRing><coordinates>10.66758401,50.09310529 11.77182103,50.08964948 10.57062661,49.66616988 10.66758401,50.09310529</coordinates></LinearRing></outerBoundaryIs></Polygon></Placemark></kml>';
			const map = setupMap();
			const vectorGeoResource = new VectorGeoResource('a_lastId', 'foo', VectorSourceType.KML).setSource(lastData, 4326);

			map.addLayer(new Layer({ geoResourceId: 'a_lastId', render: () => {} }));
			spyOn(interactionStorageServiceMock, 'isStorageId').and.callFake(() => true);
			spyOn(classUnderTest._overlayService, 'add').and.callFake(() => {});
			spyOn(geoResourceServiceMock, 'byId').and.returnValue(vectorGeoResource);
			const updateStyleSpy = spyOn(classUnderTest._styleService, 'updateStyle');
			let oldFeature;

			classUnderTest.activate(map);
			spyOn(classUnderTest._vectorLayer.getSource(), 'addFeature').and.callFake((f) => {
				oldFeature = f;
			});

			await TestUtils.timeout();
			oldFeature.getGeometry().dispatchEvent('change');
			expect(updateStyleSpy).toHaveBeenCalledTimes(1);
		});

		it('adds a drawn feature to the selection, after adding to layer (on addFeature)', () => {
			const geometry = new LineString([
				[0, 0],
				[500, 0],
				[550, 550],
				[0, 500],
				[0, 500]
			]);
			const feature = new Feature({ geometry: geometry });
			feature.setId('draw_line_1');
			feature.setStyle(new Style());
			const store = setup();
			const classUnderTest = new OlDrawHandler();
			const map = setupMap();

			classUnderTest.activate(map);
			setType('marker');
			classUnderTest._drawState.type = InteractionStateType.DRAW;
			classUnderTest._vectorLayer.getSource().addFeature(feature);

			expect(store.getState().draw.selection).toEqual(['draw_line_1']);
		});

		describe('_createDrawByType', () => {
			const defaultStyleOption = { symbolSrc: 'something', color: '#FFDAFF', scale: 0.5 };
			it("returns a draw-interaction for 'Symbol'", async () => {
				setup();
				const classUnderTest = new OlDrawHandler();
				const map = setupMap();
				classUnderTest.activate(map);

				expect(classUnderTest._createDrawByType('marker', defaultStyleOption)).toEqual(jasmine.any(Draw));
				expect(classUnderTest._createDrawByType('marker', { ...defaultStyleOption, symbolSrc: null })).toBeNull();
				expect(classUnderTest._createDrawByType('text', defaultStyleOption)).toEqual(jasmine.any(Draw));
				expect(classUnderTest._createDrawByType('line', defaultStyleOption)).toEqual(jasmine.any(Draw));
				expect(classUnderTest._createDrawByType('polygon', defaultStyleOption)).toEqual(jasmine.any(Draw));

				classUnderTest._vectorLayer = null;
				expect(classUnderTest._createDrawByType('Any', defaultStyleOption)).toBeNull();
			});
		});

		describe('_getStyleFunctionFrom', () => {
			it('returns a styleFunction for a feature with valid featureId', async () => {
				const styleFunctionMock = () => {};
				setup();
				const classUnderTest = new OlDrawHandler();
				const map = setupMap();
				classUnderTest.activate(map);
				const featureMock = { getId: () => 'foo_bar_12345' };
				const typeSpy = spyOn(classUnderTest, '_getStyleFunctionByDrawType').and.callFake(() => styleFunctionMock);

				const styleFunction = classUnderTest._getStyleFunctionFrom(featureMock);

				expect(styleFunction).toBe(styleFunctionMock);
				expect(typeSpy).toHaveBeenCalledWith('bar', jasmine.any(Object));
			});

			it('returns null for a INVALID featureId', async () => {
				setup();
				const classUnderTest = new OlDrawHandler();
				const featureMock = { getId: () => 'foo' };
				const typeSpy = spyOn(classUnderTest, '_getStyleFunctionByDrawType');

				const styleFunction = classUnderTest._getStyleFunctionFrom(featureMock);

				expect(styleFunction).toBeNull();
				expect(typeSpy).not.toHaveBeenCalled();
			});
		});

		describe('_getStyleFunctionByDrawType', () => {
			const defaultStyleOption = { symbolSrc: null, color: '#FFDAFF', scale: 0.5 };
			it('returns a styleFunction', async () => {
				setup();
				const classUnderTest = new OlDrawHandler();

				expect(classUnderTest._getStyleFunctionByDrawType('marker', defaultStyleOption)()).toContain(jasmine.any(Style));
				expect(classUnderTest._getStyleFunctionByDrawType('text', defaultStyleOption)()).toContain(jasmine.any(Style));
				expect(classUnderTest._getStyleFunctionByDrawType('line', defaultStyleOption)()).toContain(jasmine.any(Style));
				expect(classUnderTest._getStyleFunctionByDrawType('polygon', defaultStyleOption)()).toContain(jasmine.any(Style));
				expect(classUnderTest._getStyleFunctionByDrawType('foo', defaultStyleOption)()).toContain(jasmine.any(Style));
			});
		});
	});

	describe('when deactivated over olMap', () => {
		it('writes features to kml format for persisting purpose', async () => {
			const fileSaveResultMock = { fileId: 'barId', adminId: null };
			const state = { ...initialState, fileSaveResult: new EventLike(null) };
			const store = await setup(state);
			const classUnderTest = new OlDrawHandler();
			const map = setupMap();
			const feature = createFeature();
			const storageSpy = spyOn(interactionStorageServiceMock, 'store').and.resolveTo(fileSaveResultMock);

			classUnderTest.activate(map);
			classUnderTest._vectorLayer.getSource().addFeature(feature);
			classUnderTest.deactivate(map);

			await TestUtils.timeout();
			expect(storageSpy).toHaveBeenCalledWith(jasmine.any(String), FileStorageServiceDataTypes.KML);
			expect(store.getState().draw.fileSaveResult.payload.content).toContain('<kml');
			expect(store.getState().draw.fileSaveResult.payload.fileSaveResult).toEqual(fileSaveResultMock);
		});

		it('uses already written features for persisting purpose', () => {
			setup();
			const classUnderTest = new OlDrawHandler();
			const map = setupMap();
			const source = new VectorSource({ wrapX: false });
			source.addFeature(createFeature());
			const saveSpy = spyOn(classUnderTest, '_save');
			spyOn(interactionStorageServiceMock, 'isValid').and.callFake(() => true);

			classUnderTest.activate(map);
			classUnderTest._vectorLayer.setSource(source);
			classUnderTest.deactivate(map);

			expect(saveSpy).not.toHaveBeenCalled();
		});

		it('adds a vectorGeoResource for persisting purpose', async () => {
			const state = { ...initialState, fileSaveResult: { fileId: null, adminId: null } };
			setup(state);
			const classUnderTest = new OlDrawHandler();
			const map = setupMap();
			const feature = createFeature();
			const addOrReplaceSpy = spyOn(geoResourceServiceMock, 'addOrReplace');
			spyOn(interactionStorageServiceMock, 'getStorageId').and.returnValue('f_ooBarId');
			const storageSpy = spyOn(interactionStorageServiceMock, 'store');
			classUnderTest.activate(map);
			classUnderTest._vectorLayer.getSource().addFeature(feature);
			classUnderTest.deactivate(map);

			await TestUtils.timeout();
			expect(storageSpy).toHaveBeenCalledWith(jasmine.any(String), FileStorageServiceDataTypes.KML);
			expect(addOrReplaceSpy).toHaveBeenCalledTimes(1);
			expect(addOrReplaceSpy).toHaveBeenCalledWith(
				jasmine.objectContaining({
					id: 'f_ooBarId',
					label: 'olMap_handler_draw_layer_label',
					_attributionProvider: getAttributionForLocallyImportedOrCreatedGeoResource
				})
			);
		});

		it('adds layer with specific constraints', async () => {
			const state = { ...initialState, fileSaveResult: { fileId: null, adminId: null } };
			const store = await setup(state);
			const classUnderTest = new OlDrawHandler();
			const map = setupMap();
			const feature = createFeature();
			spyOn(interactionStorageServiceMock, 'getStorageId').and.returnValue('f_ooBarId');

			classUnderTest.activate(map);
			expect(classUnderTest._vectorLayer).toBeTruthy();
			classUnderTest._vectorLayer.getSource().addFeature(feature);
			classUnderTest.deactivate(map);

			await TestUtils.timeout();
			expect(store.getState().layers.active.length).toBe(1);
			expect(store.getState().layers.active[0].id).toBe('f_ooBarId');
			expect(store.getState().layers.active[0].constraints.metaData).toBeFalse();
		});

		it('adds no layer when empty', async () => {
			const store = setup();
			const classUnderTest = new OlDrawHandler();
			const map = setupMap();

			classUnderTest.activate(map);
			expect(classUnderTest._vectorLayer).toBeTruthy();
			classUnderTest.deactivate(map);

			await TestUtils.timeout();
			expect(store.getState().layers.active.length).toBe(0);
		});

		it('left no active draw-interaction', async () => {
			setup();
			const classUnderTest = new OlDrawHandler();
			const map = setupMap();

			classUnderTest.activate(map);
			setType('line');
			classUnderTest.deactivate(map);

			await TestUtils.timeout();
			const draw = map
				.getInteractions()
				.getArray()
				.find((i) => i instanceof Draw);
			expect(draw == null).toBeTrue();
			expect(classUnderTest._draw).toBeNull();
		});

		it('initialize NO draw-interaction while deactivated', async () => {
			setup();
			const classUnderTest = new OlDrawHandler();
			const initSpy = spyOn(classUnderTest, '_init').and.callThrough();
			const map = setupMap();

			classUnderTest.activate(map);
			setType('line');
			classUnderTest.deactivate(map);
			setType('marker');

			await TestUtils.timeout();
			const draw = map
				.getInteractions()
				.getArray()
				.find((i) => i instanceof Draw);
			expect(draw == null).toBeTrue();
			expect(classUnderTest._draw).toBeNull();
			expect(initSpy).toHaveBeenCalled();
		});

		it('clears the drawing listeners', async () => {
			await setup();
			const classUnderTest = new OlDrawHandler();
			const map = setupMap();
			const geometry = new LineString([
				[0, 0],
				[1, 0]
			]);
			const feature = new Feature({ geometry: geometry });

			classUnderTest.activate(map);
			setType('line');
			simulateDrawEvent('drawstart', classUnderTest._draw, feature);

			expect(classUnderTest._drawingListeners).toHaveSize(1);

			classUnderTest.deactivate(map);

			expect(classUnderTest._drawingListeners).toEqual(jasmine.arrayWithExactContents([{}]));
		});
	});

	describe('when draw a line', () => {
		it('feature gets valid id after start drawing', () => {
			setup();
			const classUnderTest = new OlDrawHandler();
			const map = setupMap();
			const geometry = new LineString([
				[0, 0],
				[1, 0]
			]);
			const feature = new Feature({ geometry: geometry });

			classUnderTest.activate(map);
			setType('line');
			simulateDrawEvent('drawstart', classUnderTest._draw, feature);

			const id = feature.getId();

			expect(id).toBeTruthy();
			expect(id).toMatch(/draw_line_[0-9]{13}/g);
		});

		it('switches to modify after drawend', () => {
			setup();
			const classUnderTest = new OlDrawHandler();
			const map = setupMap();
			const geometry = new LineString([
				[0, 0],
				[1, 0]
			]);
			const feature = new Feature({ geometry: geometry });

			classUnderTest.activate(map);
			setType('line');
			expect(classUnderTest._modify.getActive()).toBeFalse();
			simulateDrawEvent('drawstart', classUnderTest._draw, feature);
			simulateDrawEvent('drawend', classUnderTest._draw, feature);

			expect(classUnderTest._modify.getActive()).toBeTrue();
		});

		it('removes last point if keypressed', () => {
			setup();
			const classUnderTest = new OlDrawHandler();
			const map = setupMap();
			const geometry = new LineString([
				[0, 0],
				[500, 0],
				[550, 550],
				[0, 500],
				[0, 500]
			]);
			const feature = new Feature({ geometry: geometry });
			const deleteKeyCode = 46;

			classUnderTest.activate(map);
			setType('line');
			simulateDrawEvent('drawstart', classUnderTest._draw, feature);
			feature.getGeometry().dispatchEvent('change');
			expect(classUnderTest._modify.getActive()).toBeFalse();
			const removeSpy = spyOn(classUnderTest._draw, 'removeLastPoint');
			simulateKeyEvent(deleteKeyCode, 'Delete');
			expect(removeSpy).toHaveBeenCalled();
		});

		it('removes NOT last point if other keypressed', () => {
			setup();
			const classUnderTest = new OlDrawHandler();
			const map = setupMap();
			const geometry = new Polygon([
				[
					[0, 0],
					[500, 0],
					[550, 550],
					[0, 500],
					[0, 500]
				]
			]);
			const feature = new Feature({ geometry: geometry });
			const backspaceKeyCode = 8;

			classUnderTest.activate(map);
			setType('line');
			simulateDrawEvent('drawstart', classUnderTest._draw, feature);
			classUnderTest._draw.removeLastPoint = jasmine.createSpy();
			feature.getGeometry().dispatchEvent('change');

			simulateKeyEvent(backspaceKeyCode, 'Backspace');
			expect(classUnderTest._draw.removeLastPoint).not.toHaveBeenCalled();
		});

		it('removes currently drawing two-point feature if keypressed', () => {
			setup();
			const classUnderTest = new OlDrawHandler();
			const startNewSpy = spyOn(classUnderTest, '_startNew');
			const map = setupMap();
			const geometry = new Polygon([
				[
					[0, 0],
					[0, 0]
				]
			]);
			const feature = new Feature({ geometry: geometry });
			const deleteKeyCode = 46;

			classUnderTest.activate(map);
			setType('line');
			simulateDrawEvent('drawstart', classUnderTest._draw, feature);
			feature.getGeometry().dispatchEvent('change');
			expect(classUnderTest._modify.getActive()).toBeFalse();

			simulateKeyEvent(deleteKeyCode, 'Delete');
			expect(startNewSpy).toHaveBeenCalled();
		});

		it('removes drawn feature if keypressed', async () => {
			setup();
			const classUnderTest = new OlDrawHandler();
			const map = setupMap();
			const deleteKeyCode = 46;
			const sourceMock = {
				hasFeature: () => true,
				removeFeature: () => {}
			};

			classUnderTest.activate(map);
			setType('line');
			const geometry = new Polygon([
				[
					[0, 0],
					[500, 0],
					[550, 550],
					[0, 500],
					[0, 500]
				]
			]);
			const feature = new Feature({ geometry: geometry });

			simulateDrawEvent('drawstart', classUnderTest._draw, feature);
			simulateDrawEvent('drawend', classUnderTest._draw, feature);
			classUnderTest._vectorLayer.getSource().addFeature(feature);
			classUnderTest._select.getFeatures().push(feature);

			const sourceSpy = spyOn(sourceMock, 'removeFeature');
			spyOn(classUnderTest._vectorLayer, 'getSource').and.callFake(() => sourceMock);
			spyOn(classUnderTest._select, 'getFeatures').and.callFake(() => new Collection([feature]));
			simulateKeyEvent(deleteKeyCode, 'Delete');

			await TestUtils.timeout();
			expect(sourceSpy).toHaveBeenCalledWith(feature);
		});
	});

	const createSnappingFeatureMock = (coordinate, feature) => {
		return {
			get: () => [feature],
			getGeometry: () => new Point(coordinate)
		};
	};

	describe('when pointer move', () => {
		it('creates and activates helpTooltip', () => {
			setup();
			const classUnderTest = new OlDrawHandler();
			const map = setupMap();

			classUnderTest.activate(map);

			expect(classUnderTest._helpTooltip).toBeDefined();
			expect(classUnderTest._helpTooltip.active).toBeTrue();
		});

		it('creates and NOT activates helpTooltip', () => {
			setup();
			const classUnderTest = new OlDrawHandler();
			const environmentSpy = spyOn(environmentServiceMock, 'isTouch').and.returnValue(true);
			const map = setupMap();

			classUnderTest.activate(map);
			expect(classUnderTest._helpTooltip).toBeDefined();
			expect(classUnderTest._helpTooltip.active).toBeFalse();
			expect(environmentSpy).toHaveBeenCalled();
		});

		it('change drawState, when sketch is changing', () => {
			setup();
			const classUnderTest = new OlDrawHandler();
			classUnderTest._sketchPropertyHandler = { pointCount: 0 };
			const map = setupMap();
			const drawStateSpy = jasmine.createSpy();
			classUnderTest.activate(map);
			classUnderTest._onDrawStateChanged(drawStateSpy);

			simulateMapBrowserEvent(map, MapBrowserEventType.POINTERMOVE, 10, 0);
			expect(drawStateSpy).toHaveBeenCalledWith({ type: null, snap: null, coordinate: [10, 0], pointCount: 0, dragging: jasmine.any(Boolean) });
			setStyle({ symbolSrc: 'something' });
			setType('marker');

			simulateMapBrowserEvent(map, MapBrowserEventType.POINTERMOVE, 15, 0);
			expect(drawStateSpy).toHaveBeenCalledWith({
				type: InteractionStateType.ACTIVE,
				snap: null,
				coordinate: [15, 0],
				pointCount: 0,
				dragging: jasmine.any(Boolean)
			});
			classUnderTest._sketchHandler.activate(new Feature({ geometry: new Point([1, 0]) }));
			simulateMapBrowserEvent(map, MapBrowserEventType.POINTERMOVE, 20, 0);
			expect(drawStateSpy).toHaveBeenCalledWith({
				type: InteractionStateType.DRAW,
				snap: null,
				coordinate: [20, 0],
				pointCount: 1,
				geometryType: 'Point',
				dragging: jasmine.any(Boolean)
			});
		});

		it('change drawState, when sketch is snapping to first point', () => {
			setup();
			const classUnderTest = new OlDrawHandler();
			const snappedGeometry = new LineString([
				[0, 0],
				[500, 0],
				[550, 550],
				[0, 500],
				[0, 500]
			]);
			const feature = new Feature({ geometry: snappedGeometry });

			const map = setupMap();

			classUnderTest.activate(map);
			setType('line');
			const drawStateSpy = spyOn(classUnderTest._helpTooltip, 'notify');

			simulateMapBrowserEvent(map, MapBrowserEventType.POINTERMOVE, 10, 0);
			expect(drawStateSpy).toHaveBeenCalledWith({
				type: InteractionStateType.ACTIVE,
				snap: null,
				coordinate: [10, 0],
				pointCount: 0,
				dragging: jasmine.any(Boolean)
			});

			simulateDrawEvent('drawstart', classUnderTest._draw, feature);
			snappedGeometry.setCoordinates([
				[0, 0],
				[500, 0],
				[550, 550],
				[0, 500],
				[0, 0]
			]);
			feature.getGeometry().dispatchEvent('change');

			simulateMapBrowserEvent(map, MapBrowserEventType.POINTERMOVE, 0, 0);
			expect(drawStateSpy).toHaveBeenCalledWith({
				type: InteractionStateType.DRAW,
				snap: InteractionSnapType.FIRSTPOINT,
				coordinate: [0, 0],
				pointCount: 5,
				geometryType: 'LineString',
				dragging: jasmine.any(Boolean)
			});
		});

		it('change drawState, when sketch is snapping to last point', () => {
			setup();
			const classUnderTest = new OlDrawHandler();
			const snappedGeometry = new LineString([
				[0, 0],
				[500, 0],
				[550, 550],
				[0, 500],
				[0, 500]
			]);
			const feature = new Feature({ geometry: snappedGeometry });
			const map = setupMap();

			classUnderTest.activate(map);
			setType('line');
			const drawStateSpy = spyOn(classUnderTest._helpTooltip, 'notify');

			simulateMapBrowserEvent(map, MapBrowserEventType.POINTERMOVE, 10, 0);
			expect(drawStateSpy).toHaveBeenCalledWith({
				type: InteractionStateType.ACTIVE,
				snap: null,
				coordinate: [10, 0],
				pointCount: 0,
				dragging: jasmine.any(Boolean)
			});

			simulateDrawEvent('drawstart', classUnderTest._draw, feature);
			snappedGeometry.setCoordinates([
				[0, 0],
				[500, 0],
				[550, 550],
				[0, 500],
				[0, 500],
				[0, 500]
			]);
			feature.getGeometry().dispatchEvent('change');
			simulateMapBrowserEvent(map, MapBrowserEventType.POINTERMOVE, 0, 500);
			expect(drawStateSpy).toHaveBeenCalledWith({
				type: InteractionStateType.DRAW,
				snap: InteractionSnapType.LASTPOINT,
				coordinate: [0, 500],
				pointCount: 6,
				geometryType: 'LineString',
				dragging: jasmine.any(Boolean)
			});
		});

		it('adds/removes style for grabbing while modifying', () => {
			setup();
			const classUnderTest = new OlDrawHandler();
			const map = setupMap();
			const mapContainer = map.getTarget();

			classUnderTest.activate(map);
			classUnderTest._modify.setActive(true);

			classUnderTest._modify.dispatchEvent(new ModifyEvent('modifystart', null, new Event(MapBrowserEventType.SINGLECLICK)));
			expect(mapContainer.classList.contains('grabbing')).toBeFalse();
			classUnderTest._modify.dispatchEvent(new ModifyEvent('modifystart', null, new Event(MapBrowserEventType.POINTERDOWN)));
			expect(mapContainer.classList.contains('grabbing')).toBeTrue();
			classUnderTest._modify.dispatchEvent(new ModifyEvent('modifyend', null, new Event(MapBrowserEventType.POINTERDOWN)));
			expect(mapContainer.classList.contains('grabbing')).toBeTrue();
			classUnderTest._modify.dispatchEvent(new ModifyEvent('modifyend', null, new Event(MapBrowserEventType.POINTERUP)));
			expect(mapContainer.classList.contains('grabbing')).toBeFalse();
		});

		it('uses _lastPointerMoveEvent on removeLast if keypressed', () => {
			setup();
			const classUnderTest = new OlDrawHandler();
			const map = setupMap();
			const geometry = new Polygon([
				[
					[50, 0],
					[500, 0],
					[550, 550],
					[0, 500],
					[0, 500]
				]
			]);
			const feature = new Feature({ geometry: geometry });
			const deleteKeyCode = 46;

			classUnderTest.activate(map);
			setType('line');
			simulateDrawEvent('drawstart', classUnderTest._draw, feature);
			simulateMapBrowserEvent(map, MapBrowserEventType.POINTERMOVE, 10, 0);
			classUnderTest._draw.removeLastPoint = jasmine.createSpy();
			classUnderTest._draw.handleEvent = jasmine.createSpy().and.callThrough();
			feature.getGeometry().dispatchEvent('change');
			expect(classUnderTest._modify.getActive()).toBeFalse();

			simulateKeyEvent(deleteKeyCode, 'Delete');
			expect(classUnderTest._drawState.type).toBe(InteractionStateType.DRAW);
			expect(classUnderTest._draw.removeLastPoint).toHaveBeenCalled();
			expect(classUnderTest._draw.handleEvent).toHaveBeenCalledWith(jasmine.any(MapBrowserEvent));
		});

		describe('when switching to modify', () => {
			const geometry = new LineString([
				[0, 0],
				[100, 0]
			]);
			const feature = new Feature({ geometry: geometry });
			feature.setStyle(new Style({ stroke: new Stroke({ color: [0, 0, 0] }) }));

			it('pointer is not snapped on sketch', () => {
				setup();
				const classUnderTest = new OlDrawHandler();
				const map = setupMap();

				map.forEachFeatureAtPixel = jasmine.createSpy().and.callThrough();
				const drawStateSpy = jasmine.createSpy();

				classUnderTest.activate(map);
				classUnderTest._onDrawStateChanged(drawStateSpy);
				classUnderTest._select.getFeatures().push(feature);
				classUnderTest._modify.setActive(true);

				simulateMapBrowserEvent(map, MapBrowserEventType.POINTERMOVE, 10, 0);

				expect(map.forEachFeatureAtPixel).toHaveBeenCalledWith([10, 0], jasmine.any(Function), jasmine.any(Object));
				expect(drawStateSpy).toHaveBeenCalledWith({
					type: InteractionStateType.MODIFY,
					snap: null,
					coordinate: [10, 0],
					pointCount: 0,
					dragging: jasmine.any(Boolean),
					geometryType: 'LineString'
				});
			});

			it('pointer is snapped to sketch boundary', () => {
				setup();
				const classUnderTest = new OlDrawHandler();
				const map = setupMap();

				const drawStateSpy = jasmine.createSpy();
				const snappingFeatureMock = createSnappingFeatureMock([50, 0], feature);
				map.forEachFeatureAtPixel = jasmine.createSpy().and.callFake((pixel, callback) => {
					return callback(snappingFeatureMock, undefined);
				});

				classUnderTest.activate(map);
				classUnderTest._onDrawStateChanged(drawStateSpy);
				classUnderTest._select.getFeatures().push(feature);
				classUnderTest._modify.setActive(true);
				simulateMapBrowserEvent(map, MapBrowserEventType.POINTERMOVE, 50, 0);

				expect(map.forEachFeatureAtPixel).toHaveBeenCalledWith([50, 0], jasmine.any(Function), jasmine.any(Object));
				expect(drawStateSpy).toHaveBeenCalledWith({
					type: InteractionStateType.MODIFY,
					snap: InteractionSnapType.EDGE,
					coordinate: [50, 0],
					pointCount: jasmine.anything(),
					dragging: jasmine.any(Boolean),
					geometryType: 'LineString'
				});
			});

			it('pointer is snapped to sketch vertex', () => {
				setup();
				const classUnderTest = new OlDrawHandler();
				const map = setupMap();
				const drawStateSpy = jasmine.createSpy();

				const snappingFeatureMock = createSnappingFeatureMock([0, 0], feature);
				map.forEachFeatureAtPixel = jasmine.createSpy().and.callFake((pixel, callback) => {
					return callback(snappingFeatureMock, undefined);
				});

				classUnderTest.activate(map);
				classUnderTest._onDrawStateChanged(drawStateSpy);
				classUnderTest._select.getFeatures().push(feature);
				classUnderTest._modify.setActive(true);
				simulateMapBrowserEvent(map, MapBrowserEventType.POINTERMOVE, 0, 0);

				expect(map.forEachFeatureAtPixel).toHaveBeenCalledWith([0, 0], jasmine.any(Function), jasmine.any(Object));
				expect(drawStateSpy).toHaveBeenCalledWith({
					type: InteractionStateType.MODIFY,
					snap: InteractionSnapType.VERTEX,
					coordinate: [0, 0],
					pointCount: jasmine.anything(),
					dragging: jasmine.any(Boolean),
					geometryType: 'LineString'
				});
			});

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
	});

	describe('when pointer doubleclick', () => {
		it('does not zooming in', () => {
			setup();
			const classUnderTest = new OlDrawHandler();
			const map = setupMap(null, 1);

			classUnderTest.activate(map);
			expect(map.getView().getZoom()).toBe(1);

			simulateMapBrowserEvent(map, MapBrowserEventType.DBLCLICK, 10, 0);

			expect(map.getView().getZoom()).toBe(1);
		});
	});

	describe('when pointer click', () => {
		const style = new Style({
			image: new Icon({
				src: 'something',
				color: [0, 0, 0]
			})
		});

		it('deselect feature, if clickposition is disjoint to selected feature', () => {
			setup({ ...initialState, selection: ['draw_1'] });
			const classUnderTest = new OlDrawHandler();
			const map = setupMap(null, 1);

			classUnderTest.activate(map);
			setStyle({ symbolSrc: 'something' });
			setType('marker');

			const geometry = new Point([550, 550]);
			const feature = new Feature({ geometry: geometry });
			feature.setId('draw_1');
			classUnderTest._select.getFeatures().push(feature);

			expect(classUnderTest._select).toBeDefined();
			expect(classUnderTest._select.getFeatures().getLength()).toBe(1);

			classUnderTest._drawState.type = InteractionStateType.SELECT;
			simulateMapBrowserEvent(map, MapBrowserEventType.CLICK, 600, 0);

			expect(classUnderTest._select.getFeatures().getLength()).toBe(0);
		});

		it('select feature, if clickposition is in anyinteract to selected feature', () => {
			setup();
			const geometry = new Point([550, 550]);
			const feature = new Feature({ geometry: geometry });
			feature.setId('draw_1');
			feature.setStyle(style);
			const map = setupMap();

			const classUnderTest = new OlDrawHandler();
			classUnderTest.activate(map);
			classUnderTest._vectorLayer.getSource().addFeature(feature);

			expect(classUnderTest._select).toBeDefined();

			setType('marker');

			// force deselect
			classUnderTest._select.getFeatures().clear();
			expect(classUnderTest._select.getFeatures().getLength()).toBe(0);

			map.forEachFeatureAtPixel = jasmine.createSpy().and.callFake((pixel, callback) => {
				callback(feature, classUnderTest._vectorLayer);
			});

			// re-select
			classUnderTest._drawState.type = InteractionStateType.SELECT;
			simulateMapBrowserEvent(map, MapBrowserEventType.CLICK, 550, 550);

			expect(classUnderTest._select.getFeatures().getLength()).toBe(1);
		});

		it('select marker feature, updates store with empty text property', async () => {
			const drawStyle = { symbolSrc: null, color: '#ff0000', scale: 0.5, text: 'foo' };
			const state = { ...initialState, style: drawStyle };

			const store = await setup(state);
			const geometry = new Point([550, 550]);
			const feature = new Feature({ geometry: geometry });
			feature.setId('draw_1');
			feature.setStyle(style);
			const map = setupMap();

			const classUnderTest = new OlDrawHandler();
			classUnderTest.activate(map);
			classUnderTest._vectorLayer.getSource().addFeature(feature);

			expect(classUnderTest._select).toBeDefined();

			setType('marker');

			// force deselect
			classUnderTest._select.getFeatures().clear();
			expect(classUnderTest._select.getFeatures().getLength()).toBe(0);

			map.forEachFeatureAtPixel = jasmine.createSpy().and.callFake((pixel, callback) => {
				callback(feature, classUnderTest._vectorLayer);
			});

			// re-select
			classUnderTest._drawState.type = InteractionStateType.SELECT;
			simulateMapBrowserEvent(map, MapBrowserEventType.CLICK, 550, 550);

			expect(store.getState().draw.selectedStyle.style.text).toBe('');
		});

		it('switch to measure-tool, if clickposition is in anyinteract to selected measure-feature', () => {
			const store = setup();

			const geometry = new Point([550, 550]);
			const feature = new Feature({ geometry: geometry });
			feature.setId('measure_1');
			feature.setStyle(style);
			const map = setupMap();

			const classUnderTest = new OlDrawHandler();
			classUnderTest.activate(map);
			classUnderTest._vectorLayer.getSource().addFeature(feature);

			expect(classUnderTest._select).toBeDefined();

			setType('marker');

			// force deselect
			classUnderTest._select.getFeatures().clear();
			expect(classUnderTest._select.getFeatures().getLength()).toBe(0);

			map.forEachFeatureAtPixel = jasmine.createSpy().and.callFake((pixel, callback) => {
				callback(feature, classUnderTest._vectorLayer);
			});

			// re-select
			classUnderTest._drawState.type = InteractionStateType.SELECT;
			simulateMapBrowserEvent(map, MapBrowserEventType.CLICK, 550, 550);

			expect(store.getState().measurement.selection.length).toBe(1);
			expect(store.getState().tools.current).toBe(Tools.MEASURE);
		});

		it('does NOT switch to measure-tool, if clickposition is in anyinteract to selected unknown feature (not measure or draw)', () => {
			const store = setup();

			const geometry = new Point([550, 550]);
			const feature = new Feature({ geometry: geometry });
			feature.setId('some_1');
			feature.setStyle(style);
			const map = setupMap();

			const classUnderTest = new OlDrawHandler();
			classUnderTest.activate(map);
			classUnderTest._vectorLayer.getSource().addFeature(feature);

			expect(classUnderTest._select).toBeDefined();

			setType('marker');

			// force deselect
			classUnderTest._select.getFeatures().clear();
			expect(classUnderTest._select.getFeatures().getLength()).toBe(0);

			map.forEachFeatureAtPixel = jasmine.createSpy().and.callFake((pixel, callback) => {
				callback(feature, classUnderTest._vectorLayer);
			});

			// re-select
			classUnderTest._drawState.type = InteractionStateType.SELECT;
			simulateMapBrowserEvent(map, MapBrowserEventType.CLICK, 550, 550);

			expect(store.getState().tools.current).not.toBe(Tools.MEASURE);
		});

		it('select only ONE feature (no multiselect; preselected feature is deselected)', () => {
			const feature1 = new Feature({ geometry: new Point([0, 0]) });
			const feature2 = new Feature({ geometry: new Point([50, 50]) });
			feature1.setId('draw_1');
			feature2.setId('draw_2');
			feature1.setStyle(style);
			feature2.setStyle(style);

			setup();
			const classUnderTest = new OlDrawHandler();
			const map = setupMap();

			classUnderTest.activate(map);
			setType('marker');

			classUnderTest._vectorLayer.getSource().addFeature(feature1);
			classUnderTest._vectorLayer.getSource().addFeature(feature2);

			// force deselect
			classUnderTest._select.getFeatures().clear();
			expect(classUnderTest._select.getFeatures().getLength()).toBe(0);

			map.forEachFeatureAtPixel = jasmine.createSpy().and.callFake((pixel, callback) => {
				if (pixel[0] === 0 && pixel[1] === 0) {
					callback(feature1, classUnderTest._vectorLayer);
				}
				if (pixel[0] === 50 && pixel[1] === 50) {
					callback(feature2, classUnderTest._vectorLayer);
				}
			});

			// re-select
			classUnderTest._drawState.type = InteractionStateType.SELECT;
			simulateMapBrowserEvent(map, MapBrowserEventType.CLICK, 0, 0);
			expect(classUnderTest._select.getFeatures().getLength()).toBe(1);

			classUnderTest._drawState.type = InteractionStateType.SELECT;
			simulateMapBrowserEvent(map, MapBrowserEventType.CLICK, 50, 50);
			expect(classUnderTest._select.getFeatures().getLength()).toBe(1);
		});

		it('prevents multiselect, when style of selected features changes frequently', () => {
			const feature = new Feature({ geometry: new Point([0, 0]) });
			feature.setId('draw_marker_1');
			setup({ ...initialState });

			const classUnderTest = new OlDrawHandler();
			const map = setupMap(null, 1);

			classUnderTest.activate(map);
			setStyle({ symbolSrc: 'something' });
			setType('marker');

			classUnderTest._vectorLayer.getSource().addFeature(feature);
			classUnderTest._select.getFeatures().push(feature);
			classUnderTest._drawState.type = InteractionStateType.MODIFY;
			const selectionSpy = spyOn(classUnderTest, '_setSelected').withArgs(feature).and.callThrough();

			setStyle({ symbolSrc: 'something', text: 'a' });
			setStyle({ symbolSrc: 'something', text: 'aa' });
			setStyle({ symbolSrc: 'something', text: 'aaa' });

			expect(selectionSpy).toHaveBeenCalledTimes(6);
			expect(classUnderTest._select.getFeatures().getLength()).toBe(1);
		});

		it('updates the drawState, while pointerclick drawing', () => {
			setup();
			const feature = new Feature({
				geometry: new Polygon([
					[
						[0, 0],
						[1, 0],
						[1, 1],
						[0, 1],
						[0, 1]
					]
				])
			});
			const map = setupMap();
			const classUnderTest = new OlDrawHandler();
			const layer = classUnderTest.activate(map);
			layer.getSource().addFeature(feature);

			const updateDrawStateSpy = spyOn(classUnderTest, '_updateDrawState');

			// initial Phase: the drawing will be activated after this click-event
			classUnderTest._sketchHandler.activate(feature);
			classUnderTest._drawState.type = InteractionStateType.ACTIVE;

			simulateMapBrowserEvent(map, MapBrowserEventType.CLICK, 0.5, 0.5);

			expect(updateDrawStateSpy).toHaveBeenCalled();
			updateDrawStateSpy.calls.reset();

			// Phase 2: the drawing will be end after this click-event
			classUnderTest._sketchHandler.deactivate();
			classUnderTest._drawState.type = InteractionStateType.DRAW;

			simulateMapBrowserEvent(map, MapBrowserEventType.CLICK, 0.5, 0.5);

			expect(updateDrawStateSpy).toHaveBeenCalled();
		});
	});

	describe('_setDrawState', () => {
		it('left the current drawState as it is, when value not changes', () => {
			setup();
			const drawStateSpy = jasmine.createSpy();
			const classUnderTest = new OlDrawHandler();

			classUnderTest._onDrawStateChanged(drawStateSpy);

			const newDrawState = { ...classUnderTest._drawState };
			classUnderTest._setDrawState(newDrawState);
			classUnderTest._setDrawState(newDrawState);

			expect(drawStateSpy).toHaveBeenCalledTimes(1);
		});
	});

	describe('_updateStyle', () => {
		it('prevents style update, when selected feature is missing', () => {
			setup();
			const classUnderTest = new OlDrawHandler();
			const styleFunctionSpy = spyOn(classUnderTest, '_getStyleFunctionFrom').withArgs(null).and.callThrough();
			const updateSpy = spyOn(classUnderTest, '_updateStyle').and.callThrough();
			const map = setupMap();

			classUnderTest.activate(map);

			classUnderTest._drawState.type = InteractionStateType.MODIFY;

			setStyle({ symbolSrc: 'something' });

			expect(updateSpy).toHaveBeenCalled();
			expect(styleFunctionSpy).not.toHaveBeenCalled();
		});
	});
});
