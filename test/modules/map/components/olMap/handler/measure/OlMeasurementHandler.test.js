import { OlMeasurementHandler } from '../../../../../../../src/modules/map/components/olMap/handler/measure/OlMeasurementHandler';
import { Point, LineString, Polygon, Geometry } from 'ol/geom';
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
import { VectorGeoResource, VectorSourceType } from '../../../../../../../src/services/domain/geoResources';
import { register } from 'ol/proj/proj4';
import { MEASUREMENT_LAYER_ID } from '../../../../../../../src/plugins/MeasurementPlugin';
import { ModifyEvent } from 'ol/interaction/Modify';
import { layersReducer } from '../../../../../../../src/store/layers/layers.reducer';
import { finish, remove, reset } from '../../../../../../../src/store/measurement/measurement.action';
import { OverlayService } from '../../../../../../../src/modules/map/components/olMap/services/OverlayService';
import { Stroke, Style } from 'ol/style';
import { FileStorageServiceDataTypes } from '../../../../../../../src/services/FileStorageService';
import { InteractionSnapType, InteractionStateType } from '../../../../../../../src/modules/map/components/olMap/olInteractionUtils';
import VectorSource from 'ol/source/Vector';
import { measurementReducer } from '../../../../../../../src/store/measurement/measurement.reducer';
import { sharedReducer } from '../../../../../../../src/store/shared/shared.reducer';
import { notificationReducer } from '../../../../../../../src/store/notifications/notifications.reducer';
import { LevelTypes } from '../../../../../../../src/store/notifications/notifications.action';
import { acknowledgeTermsOfUse } from '../../../../../../../src/store/shared/shared.action';
import { simulateMapBrowserEvent } from '../../mapTestUtils';
import { ToolId } from '../../../../../../../src/store/tools/tools.action';
import { drawReducer } from '../../../../../../../src/store/draw/draw.reducer';
import { toolsReducer } from '../../../../../../../src/store/tools/tools.reducer';


proj4.defs('EPSG:25832', '+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +axis=neu');
register(proj4);



describe('OlMeasurementHandler', () => {
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


	const interactionStorageServiceMock = {
		async store() { },
		isValid() {
			return false;
		},
		isStorageId() {
			return false;
		},
		setStorageId() { },
		getStorageId() {
			return null;
		}
	};

	const translationServiceMock = { translate: (key) => key };
	const environmentServiceMock = { isTouch: () => false, isStandalone: () => false };
	const initialState = {
		active: false,
		statistic: { length: 0, area: 0 },
		selection: [],
		reset: null,
		fileSaveResult: { adminId: 'init', fileId: 'init' }
	};

	const setup = (state = initialState) => {
		const measurementState = {
			measurement: state,
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
		const store = TestUtils.setupStoreAndDi(measurementState, { measurement: measurementReducer, draw: drawReducer, layers: layersReducer, shared: sharedReducer, notifications: notificationReducer, tools: toolsReducer });
		$injector.registerSingleton('TranslationService', translationServiceMock)
			.registerSingleton('MapService', { getSrid: () => 3857, getDefaultGeodeticSrid: () => 25832 })
			.registerSingleton('EnvironmentService', environmentServiceMock)
			.registerSingleton('GeoResourceService', geoResourceServiceMock)
			.registerSingleton('InteractionStorageService', interactionStorageServiceMock)
			.registerSingleton('IconService', { getUrl: () => 'some.url' })
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
		const handler = new OlMeasurementHandler();
		expect(handler).toBeTruthy();
		expect(handler.activate).toBeTruthy();
		expect(handler.deactivate).toBeTruthy();
		expect(handler.id).toBe(MEASUREMENT_LAYER_ID);
	});

	describe('static properties', () => {

		it('defines a debounce time', async () => {
			expect(OlMeasurementHandler.Debounce_Delay).toBe(1000);
		});

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
		const container = document.createElement('div');
		const initialCenter = fromLonLat([11.57245, 48.14021]);

		const setupMap = () => {
			return new Map({
				layers: [
					new TileLayer({
						source: new OSM()
					}),
					new TileLayer({
						source: new TileDebug()
					})],
				target: container,
				view: new View({
					center: initialCenter,
					zoom: 1
				})
			});

		};

		it('adds a label to the session vectorlayer', () => {
			setup();
			const map = setupMap();
			const classUnderTest = new OlMeasurementHandler();
			classUnderTest.activate(map);

			expect(classUnderTest._vectorLayer.label).toBe('map_olMap_handler_measure_layer_label');
		});

		describe('when not TermsOfUseAcknowledged', () => {
			it('emits a notification', (done) => {
				const store = setup();
				const map = setupMap();
				const classUnderTest = new OlMeasurementHandler();

				expect(store.getState().shared.termsOfUseAcknowledged).toBeFalse();
				classUnderTest.activate(map);

				expect(store.getState().shared.termsOfUseAcknowledged).toBeTrue();
				setTimeout(() => {
					// check notification
					// content is provided by lit unsafeHtml-Directive; a testable string is found in the values-property
					expect(store.getState().notifications.latest.payload.content.values[0]).toBe('map_olMap_handler_termsOfUse');
					expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.INFO);
					done();
				});
			});

			describe('when termsOfUse are empty', () => {
				it('emits not a notification', (done) => {
					const store = setup();
					const map = setupMap();
					spyOn(translationServiceMock, 'translate').and.callFake(() => '');
					const classUnderTest = new OlMeasurementHandler();

					expect(store.getState().shared.termsOfUseAcknowledged).toBeFalse();
					classUnderTest.activate(map);

					expect(store.getState().shared.termsOfUseAcknowledged).toBeTrue();
					setTimeout(() => {
						// check notification
						expect(store.getState().notifications.latest).toBeFalsy();
						done();
					});
				});
			});
		});

		describe('when TermsOfUse already acknowledged', () => {
			it('emits NOT a notification', (done) => {
				const store = setup();
				const map = setupMap();
				const classUnderTest = new OlMeasurementHandler();
				acknowledgeTermsOfUse();
				expect(store.getState().shared.termsOfUseAcknowledged).toBeTrue();
				classUnderTest.activate(map);

				setTimeout(() => {
					//check notification
					expect(store.getState().notifications.latest).toBeFalsy();
					done();
				});
			});
		});

		describe('uses Interactions', () => {
			it('adds a Draw-Interaction', () => {
				setup();
				const classUnderTest = new OlMeasurementHandler();
				const map = setupMap();
				map.addInteraction = jasmine.createSpy();

				classUnderTest.activate(map);

				// adds Interaction for select, draw, modify,snap, dragPan
				expect(map.addInteraction).toHaveBeenCalledTimes(5);
			});

			it('removes Interaction', () => {
				setup();
				const classUnderTest = new OlMeasurementHandler();
				const map = setupMap();
				const layerStub = {};
				const warnSpy = spyOn(console, 'warn');
				map.removeInteraction = jasmine.createSpy();
				classUnderTest.activate(map);
				classUnderTest.deactivate(map, layerStub);

				// removes Interaction for select, draw, modify, snap, dragPan
				expect(map.removeInteraction).toHaveBeenCalledTimes(5);
				expect(warnSpy).toHaveBeenCalled();
			});

			it('adds a select interaction', () => {
				setup();
				const classUnderTest = new OlMeasurementHandler();
				const map = setupMap();
				map.addInteraction = jasmine.createSpy();

				classUnderTest.activate(map);

				expect(classUnderTest._select).toBeInstanceOf(Select);
				expect(map.addInteraction).toHaveBeenCalledWith(classUnderTest._select);
			});

			it('adds a draw interaction', () => {
				setup();
				const classUnderTest = new OlMeasurementHandler();
				const map = setupMap();
				map.addInteraction = jasmine.createSpy();

				classUnderTest.activate(map);

				expect(classUnderTest._draw).toBeInstanceOf(Draw);
				expect(map.addInteraction).toHaveBeenCalledWith(classUnderTest._draw);
			});

			it('adds a modify interaction', () => {
				setup();
				const classUnderTest = new OlMeasurementHandler();
				const map = setupMap();
				map.addInteraction = jasmine.createSpy();

				classUnderTest.activate(map);

				expect(classUnderTest._modify).toBeInstanceOf(Modify);
				expect(map.addInteraction).toHaveBeenCalledWith(classUnderTest._modify);
			});

			it('adds a snap interaction', () => {
				setup();
				const classUnderTest = new OlMeasurementHandler();
				const map = setupMap();
				map.addInteraction = jasmine.createSpy();

				classUnderTest.activate(map);

				expect(classUnderTest._snap).toBeInstanceOf(Snap);
				expect(map.addInteraction).toHaveBeenCalledWith(classUnderTest._snap);
			});

			it('adds a dragPan interaction', () => {
				setup();
				const classUnderTest = new OlMeasurementHandler();
				const map = setupMap();
				map.addInteraction = jasmine.createSpy();

				classUnderTest.activate(map);

				expect(classUnderTest._dragPan).toBeInstanceOf(DragPan);
				expect(map.addInteraction).toHaveBeenCalledWith(classUnderTest._dragPan);
			});

			it('initialize interactions and state objects only once on multiple activates', () => {
				setup();
				const classUnderTest = new OlMeasurementHandler();
				const map = setupMap();
				const createDrawSpy = spyOn(classUnderTest, '_createDraw').and.callThrough();

				classUnderTest.activate(map);
				classUnderTest.activate(map);

				expect(createDrawSpy).toHaveBeenCalledTimes(1);
			});

			it('register observer for finish-request', () => {
				setup();
				const classUnderTest = new OlMeasurementHandler();
				const map = setupMap();
				map.addInteraction = jasmine.createSpy();
				const finishSpy = spyOn(classUnderTest, '_finish').and.callThrough();

				classUnderTest.activate(map);
				finish();
				expect(finishSpy).toHaveBeenCalled();
			});

			it('register observer for reset-request', () => {
				setup();
				const classUnderTest = new OlMeasurementHandler();
				const map = setupMap();
				map.addInteraction = jasmine.createSpy();
				const startNewSpy = spyOn(classUnderTest, '_startNew').and.callThrough();

				classUnderTest.activate(map);
				reset();
				expect(startNewSpy).toHaveBeenCalled();
			});

			it('register observer for reset-request again, after deactivate', () => {
				setup();
				const classUnderTest = new OlMeasurementHandler();
				const map = setupMap();
				map.addInteraction = jasmine.createSpy();
				const startNewSpy = spyOn(classUnderTest, '_startNew').and.callThrough();

				classUnderTest.activate(map);
				reset();
				classUnderTest.deactivate(map);
				classUnderTest.activate(map);
				reset();
				expect(startNewSpy).toHaveBeenCalledTimes(2);
			});


			it('register observer for remove-request', () => {
				setup();
				const classUnderTest = new OlMeasurementHandler();

				const map = setupMap();
				map.addInteraction = jasmine.createSpy();
				const removeSpy = spyOn(classUnderTest, '_remove').and.callThrough();

				classUnderTest.activate(map);
				remove();
				expect(removeSpy).toHaveBeenCalled();
			});


		});

		it('looks for measurement-layer and adds the feature for update/copy on save', (done) => {
			setup();
			const classUnderTest = new OlMeasurementHandler();
			const lastData = '<kml xmlns="http://www.opengis.net/kml/2.2" xmlns:gx="http://www.google.com/kml/ext/2.2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opengis.net/kml/2.2 https://developers.google.com/kml/schema/kml22gx.xsd"><Placemark id="measurement_1620710146878"><Style><LineStyle><color>ff0000ff</color><width>3</width></LineStyle><PolyStyle><color>660000ff</color></PolyStyle></Style><ExtendedData><Data name="area"/><Data name="measurement"/><Data name="partitions"/></ExtendedData><Polygon><outerBoundaryIs><LinearRing><coordinates>10.66758401,50.09310529 11.77182103,50.08964948 10.57062661,49.66616988 10.66758401,50.09310529</coordinates></LinearRing></outerBoundaryIs></Polygon></Placemark></kml>';
			const map = setupMap();
			const vectorGeoResource = new VectorGeoResource('a_lastId', 'foo', VectorSourceType.KML).setSource(lastData, 4326);

			spyOn(map, 'getLayers').and.returnValue({ getArray: () => [{ get: () => 'a_lastId' }] });
			spyOn(interactionStorageServiceMock, 'isStorageId').and.callFake(() => true);
			spyOn(classUnderTest._overlayService, 'add').and.callFake(() => { });

			const geoResourceSpy = spyOn(geoResourceServiceMock, 'byId').and.returnValue(vectorGeoResource);
			const storageSpy = spyOn(classUnderTest._storageHandler, 'setStorageId').and.callFake(() => { });
			classUnderTest.activate(map);
			const addFeatureSpy = spyOn(classUnderTest._vectorLayer.getSource(), 'addFeature');


			setTimeout(() => {
				expect(geoResourceSpy).toHaveBeenCalledWith('a_lastId');
				expect(storageSpy).toHaveBeenCalledWith('a_lastId');
				expect(addFeatureSpy).toHaveBeenCalledTimes(1);
				done();
			});
		});


		it('looks for measurement-layer and gets no georesource', (done) => {
			setup();
			const classUnderTest = new OlMeasurementHandler();
			const map = setupMap();


			spyOn(map, 'getLayers').and.returnValue({ getArray: () => [{ get: () => 'a_lastId' }] });
			spyOn(interactionStorageServiceMock, 'isStorageId').and.callFake(() => true);
			spyOn(classUnderTest._overlayService, 'add').and.callFake(() => { });

			const geoResourceSpy = spyOn(geoResourceServiceMock, 'byId').and.returnValue(null);
			const storageSpy = spyOn(classUnderTest._storageHandler, 'setStorageId').and.callFake(() => { });
			classUnderTest.activate(map);
			const addFeatureSpy = spyOn(classUnderTest._vectorLayer.getSource(), 'addFeature');


			setTimeout(() => {
				expect(geoResourceSpy).toHaveBeenCalledWith('a_lastId');
				expect(storageSpy).not.toHaveBeenCalled();
				expect(addFeatureSpy).not.toHaveBeenCalled();
				done();
			});
		});

		it('looks for temporary measurement-layer and adds the feature to session-layer', (done) => {
			const state = { ...initialState, fileSaveResult: null };
			setup(state);
			const classUnderTest = new OlMeasurementHandler();
			const lastData = '<kml xmlns="http://www.opengis.net/kml/2.2" xmlns:gx="http://www.google.com/kml/ext/2.2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opengis.net/kml/2.2 https://developers.google.com/kml/schema/kml22gx.xsd"><Placemark id="measurement_1620710146878"><Style><LineStyle><color>ff0000ff</color><width>3</width></LineStyle><PolyStyle><color>660000ff</color></PolyStyle></Style><ExtendedData><Data name="area"/><Data name="measurement"/><Data name="partitions"/></ExtendedData><Polygon><outerBoundaryIs><LinearRing><coordinates>10.66758401,50.09310529 11.77182103,50.08964948 10.57062661,49.66616988 10.66758401,50.09310529</coordinates></LinearRing></outerBoundaryIs></Polygon></Placemark></kml>';
			const map = setupMap();
			const vectorGeoResource = new VectorGeoResource('temp_measure_id', 'foo', VectorSourceType.KML).setSource(lastData, 4326);

			spyOn(map, 'getLayers').and.returnValue({ getArray: () => [{ get: () => 'temp_measure_id' }] });
			spyOn(classUnderTest._overlayService, 'add').and.callFake(() => { });
			const spy = spyOn(geoResourceServiceMock, 'byId').and.returnValue(vectorGeoResource);

			classUnderTest.activate(map);
			const addFeatureSpy = spyOn(classUnderTest._vectorLayer.getSource(), 'addFeature');

			setTimeout(() => {
				expect(spy).toHaveBeenCalledWith('temp_measure_id');
				expect(addFeatureSpy).toHaveBeenCalledTimes(1);
				done();
			});
		});


		it('updates overlays of old features onChange', (done) => {
			setup();
			const classUnderTest = new OlMeasurementHandler();
			const lastData = '<kml xmlns="http://www.opengis.net/kml/2.2" xmlns:gx="http://www.google.com/kml/ext/2.2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opengis.net/kml/2.2 https://developers.google.com/kml/schema/kml22gx.xsd"><Placemark id="measurement_1620710146878"><Style><LineStyle><color>ff0000ff</color><width>3</width></LineStyle><PolyStyle><color>660000ff</color></PolyStyle></Style><ExtendedData><Data name="area"/><Data name="measurement"/><Data name="partitions"/></ExtendedData><Polygon><outerBoundaryIs><LinearRing><coordinates>10.66758401,50.09310529 11.77182103,50.08964948 10.57062661,49.66616988 10.66758401,50.09310529</coordinates></LinearRing></outerBoundaryIs></Polygon></Placemark></kml>';
			const map = setupMap();
			const vectorGeoResource = new VectorGeoResource('a_lastId', 'foo', VectorSourceType.KML).setSource(lastData, 4326);

			spyOn(map, 'getLayers').and.returnValue({ getArray: () => [{ get: () => 'a_lastId' }] });
			spyOn(interactionStorageServiceMock, 'isStorageId').and.callFake(() => true);
			spyOn(classUnderTest._overlayService, 'add').and.callFake(() => { });
			spyOn(geoResourceServiceMock, 'byId').and.returnValue(vectorGeoResource);
			const updateOverlaysSpy = spyOn(classUnderTest._styleService, 'updateStyle');
			let oldFeature;

			classUnderTest.activate(map);
			spyOn(classUnderTest._vectorLayer.getSource(), 'addFeature').and.callFake((f) => {
				oldFeature = f;
			});

			setTimeout(() => {
				oldFeature.getGeometry().dispatchEvent('change');
				expect(updateOverlaysSpy).toHaveBeenCalledTimes(1);
				done();
			});
		});

		it('updates overlays of old features on \'change:Resolution\'', (done) => {
			setup();
			const classUnderTest = new OlMeasurementHandler();
			const lastData = '<kml xmlns="http://www.opengis.net/kml/2.2" xmlns:gx="http://www.google.com/kml/ext/2.2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opengis.net/kml/2.2 https://developers.google.com/kml/schema/kml22gx.xsd"><Placemark id="measurement_1620710146878"><Style><LineStyle><color>ff0000ff</color><width>3</width></LineStyle><PolyStyle><color>660000ff</color></PolyStyle></Style><ExtendedData><Data name="area"/><Data name="measurement"/><Data name="partitions"/></ExtendedData><Polygon><outerBoundaryIs><LinearRing><coordinates>10.66758401,50.09310529 11.77182103,50.08964948 10.57062661,49.66616988 10.66758401,50.09310529</coordinates></LinearRing></outerBoundaryIs></Polygon></Placemark></kml>';
			const map = setupMap();
			const vectorGeoResource = new VectorGeoResource('a_lastId', 'foo', VectorSourceType.KML).setSource(lastData, 4326);

			spyOn(map, 'getLayers').and.returnValue({ getArray: () => [{ get: () => 'a_lastId' }] });
			spyOn(interactionStorageServiceMock, 'isStorageId').and.callFake(() => true);
			spyOn(classUnderTest._overlayService, 'add').and.callFake(() => { });
			spyOn(geoResourceServiceMock, 'byId').and.returnValue(vectorGeoResource);
			const updateOverlaysSpy = spyOn(classUnderTest._styleService, 'updateStyle');


			classUnderTest.activate(map);

			setTimeout(() => {
				map.getView().dispatchEvent('change:resolution');
				expect(updateOverlaysSpy).toHaveBeenCalledTimes(1);
				done();
			});
		});

		it('adds a drawn feature to the selection, after adding to layer (on addFeature)', () => {
			const geometry = new LineString([[0, 0], [500, 0], [550, 550], [0, 500], [0, 500]]);
			const feature = new Feature({ geometry: geometry });
			feature.setId('measure_1');
			const store = setup();
			const classUnderTest = new OlMeasurementHandler();
			const map = setupMap();

			classUnderTest.activate(map);
			classUnderTest._measureState.type = InteractionStateType.DRAW;
			classUnderTest._vectorLayer.getSource().addFeature(feature);

			expect(store.getState().measurement.selection).toEqual(['measure_1']);
		});


		it('updates statistics and overlays of features on \'change\'', () => {
			setup();
			const map = setupMap();
			const geometry = new LineString([[0, 0], [500, 0], [550, 550], [0, 500], [0, 500]]);
			const feature = new Feature({ geometry: geometry });
			feature.setId('measure_1');

			const classUnderTest = new OlMeasurementHandler();

			classUnderTest.activate(map);
			simulateDrawEvent('drawstart', classUnderTest._draw, feature);
			feature.getGeometry().dispatchEvent('change');
			simulateDrawEvent('drawend', classUnderTest._draw, feature);
			// modify is activated after draw ends

			const updateOverlaysSpy = spyOn(classUnderTest._overlayService, 'update');
			const statsSpy = spyOn(classUnderTest, '_updateStatistics');
			feature.getGeometry().dispatchEvent('change');


			expect(statsSpy).toHaveBeenCalledTimes(1);
			expect(updateOverlaysSpy).toHaveBeenCalledTimes(1);
		});

		it('removes overlays of features on \'drawabort\'', () => {
			setup();
			const map = setupMap();
			const geometry = new LineString([[0, 0], [500, 0], [550, 550], [0, 500], [0, 500]]);
			const feature = new Feature({ geometry: geometry });
			feature.setId('measure_1');

			const classUnderTest = new OlMeasurementHandler();
			const updateOverlaysSpy = spyOn(classUnderTest._overlayService, 'remove');
			classUnderTest.activate(map);
			simulateDrawEvent('drawabort', classUnderTest._draw, feature);

			expect(updateOverlaysSpy).toHaveBeenCalledTimes(1);
		});


	});

	describe('when deactivated over olMap', () => {

		const initialCenter = fromLonLat([11.57245, 48.14021]);
		const getTarget = () => {
			const target = document.createElement('div');
			target.style.height = '100px';
			target.style.width = '100px';
			return target;
		};
		const setupMap = () => {
			return new Map({
				layers: [
					new TileLayer({
						source: new OSM()
					}),
					new TileLayer({
						source: new TileDebug()
					})],
				target: getTarget(),
				view: new View({
					center: initialCenter,
					zoom: 1
				})
			});

		};

		const createFeature = () => {
			const feature = new Feature({ geometry: new Polygon([[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]) });
			return feature;
		};

		it('writes features to kml format for persisting purpose', (done) => {
			const state = { ...initialState, fileSaveResult: { fileId: 'barId', adminId: null } };
			setup(state);
			const classUnderTest = new OlMeasurementHandler();
			const map = setupMap();
			const feature = createFeature();
			const storageSpy = spyOn(interactionStorageServiceMock, 'store');

			classUnderTest.activate(map);
			classUnderTest._vectorLayer.getSource().addFeature(feature);
			classUnderTest.deactivate(map);

			setTimeout(() => {
				expect(classUnderTest._vectorLayer.getSource().getFeatures().length).toBe(1);
				expect(storageSpy).toHaveBeenCalledWith(jasmine.any(String), FileStorageServiceDataTypes.KML);
				done();
			});
		});

		it('uses already written features for persisting purpose', () => {
			setup();
			const classUnderTest = new OlMeasurementHandler();
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


		it('adds a vectorGeoResource for persisting purpose', (done) => {
			const state = { ...initialState, fileSaveResult: { fileId: null, adminId: null } };
			setup(state);
			const classUnderTest = new OlMeasurementHandler();
			const map = setupMap();
			const feature = createFeature();
			const addOrReplaceSpy = spyOn(geoResourceServiceMock, 'addOrReplace');
			spyOn(interactionStorageServiceMock, 'getStorageId').and.returnValue('f_ooBarId');
			const storageSpy = spyOn(interactionStorageServiceMock, 'store');
			classUnderTest.activate(map);
			classUnderTest._vectorLayer.getSource().addFeature(feature);
			classUnderTest.deactivate(map);

			setTimeout(() => {
				expect(storageSpy).toHaveBeenCalledWith(jasmine.any(String), FileStorageServiceDataTypes.KML);
				expect(addOrReplaceSpy).toHaveBeenCalledTimes(1);
				expect(addOrReplaceSpy).toHaveBeenCalledWith(jasmine.objectContaining({
					id: 'f_ooBarId',
					label: 'map_olMap_handler_measure_layer_label'
				}));
				done();
			});

		});

		it('adds layer with temporaryId while persisting layer failed', (done) => {
			const state = { ...initialState, fileSaveResult: null };
			const store = setup(state);
			const classUnderTest = new OlMeasurementHandler();
			const map = setupMap();
			const feature = createFeature();

			classUnderTest.activate(map);
			expect(classUnderTest._vectorLayer).toBeTruthy();
			classUnderTest._vectorLayer.getSource().addFeature(feature);
			classUnderTest.deactivate(map);

			setTimeout(() => {
				expect(store.getState().layers.active.length).toBe(1);
				expect(store.getState().layers.active[0].id).toBe('temp_measure_id');
				done();
			});

		});

		it('adds no layer when empty', (done) => {
			const store = setup();
			const classUnderTest = new OlMeasurementHandler();
			const map = setupMap();
			const warnSpy = spyOn(console, 'warn');

			classUnderTest.activate(map);
			expect(classUnderTest._vectorLayer).toBeTruthy();
			classUnderTest.deactivate(map);

			setTimeout(() => {
				expect(store.getState().layers.active.length).toBe(0);
				expect(warnSpy).toHaveBeenCalledWith('Cannot store empty layer');
				done();
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
						source: new OSM()
					}),
					new TileLayer({
						source: new TileDebug()
					})],
				target: target,
				view: new View({
					center: initialCenter,
					zoom: zoom
				})
			});

		};

		it('removes partition tooltips after zoom out', () => {
			setup();
			const classUnderTest = new OlMeasurementHandler();
			const map = setupMap(15);
			const geometry = new LineString([[0, 0], [1234, 0]]);
			const feature = new Feature({ geometry: geometry });

			classUnderTest.activate(map);
			classUnderTest._sketchHandler.activate(feature);
			simulateDrawEvent('drawstart', classUnderTest._draw, feature);
			feature.getGeometry().dispatchEvent('change');

			expect(feature.get('partitions').length).toBe(12);

			map.getView().setZoom(13);

			expect(feature.get('partitions').length).toBe(1);
		});

		it('removes area tooltip after finish drawing', () => {
			setup();
			const classUnderTest = new OlMeasurementHandler();
			const map = setupMap();
			const snappedGeometry = new Polygon([[[0, 0], [500, 0], [550, 550], [0, 500], [0, 0]]]);
			const feature = new Feature({ geometry: snappedGeometry });

			classUnderTest.activate(map);
			const updateSpy = spyOn(classUnderTest._overlayService, 'update').and.callThrough();
			simulateDrawEvent('drawstart', classUnderTest._draw, feature);
			feature.getGeometry().dispatchEvent('change');
			expect(feature.get('area')).toBeTruthy();
			simulateDrawEvent('drawend', classUnderTest._draw, feature);

			expect(feature.get('area')).toBeFalsy();
			expect(updateSpy).toHaveBeenCalledWith(feature, jasmine.any(Map), 'measure', jasmine.objectContaining({ geometry: jasmine.any(Geometry) }));
		});

		it('unregister tooltip-listener after finish drawing', () => {
			setup();
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
			expect(feature.get('measurement').getOffset()).toEqual([0, -15]);
		});

		it('feature gets valid id start drawing', () => {
			setup();
			const classUnderTest = new OlMeasurementHandler();
			const map = setupMap();
			const geometry = new LineString([[0, 0], [1, 0]]);
			const feature = new Feature({ geometry: geometry });

			classUnderTest.activate(map);

			simulateDrawEvent('drawstart', classUnderTest._draw, feature);

			const id = feature.getId();

			expect(id).toBeTruthy();
			expect(id).toMatch(/measure_[0-9]{13}/g);
		});

		it('positions tooltip content on the end of not closed Polygon', () => {
			setup();
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
			setup();
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
			setup();
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
			expect(classUnderTest._modify.getActive()).toBeFalse();

			simulateKeyEvent(deleteKeyCode);
			expect(classUnderTest._draw.removeLastPoint).toHaveBeenCalled();
		});

		it('removes NOT last point if other keypressed', () => {
			setup();
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
			setup();
			const classUnderTest = new OlMeasurementHandler();
			const startNewSpy = spyOn(classUnderTest, '_startNew');
			const map = setupMap();
			const geometry = new Polygon([[[0, 0], [0, 0]]]);
			const feature = new Feature({ geometry: geometry });
			const deleteKeyCode = 46;

			classUnderTest.activate(map);
			simulateDrawEvent('drawstart', classUnderTest._draw, feature);
			feature.getGeometry().dispatchEvent('change');
			expect(classUnderTest._modify.getActive()).toBeFalse();

			simulateKeyEvent(deleteKeyCode);
			expect(startNewSpy).toHaveBeenCalled();
		});

		it('removes drawn feature if keypressed', (done) => {
			setup();
			const classUnderTest = new OlMeasurementHandler();
			const map = setupMap();
			const deleteKeyCode = 46;

			classUnderTest.activate(map);

			const geometry = new Polygon([[[0, 0], [500, 0], [550, 550], [0, 500], [0, 500]]]);
			const feature = new Feature({ geometry: geometry });
			feature.setId('measure_');
			const removeFeatureSpy = spyOn(classUnderTest._vectorLayer.getSource(), 'removeFeature').and.callFake(() => {
			});

			classUnderTest._vectorLayer.getSource().addFeature(feature);
			classUnderTest._select.getFeatures().push(feature);
			classUnderTest._modify.setActive(true);
			simulateKeyEvent(deleteKeyCode);


			setTimeout(() => {
				expect(removeFeatureSpy).toHaveBeenCalledWith(feature);
				done();
			});
		});
	});

	describe('when storing layer', () => {

		let target;
		const setupMap = () => {
			target = document.createElement('div');
			target.style.height = '100px';
			target.style.width = '100px';
			const map = new Map({
				layers: [
					new TileLayer({
						source: new OSM()
					}),
					new TileLayer({
						source: new TileDebug()
					})],
				target: target,
				view: new View({
					center: [0, 0],
					zoom: 1
				})
			});

			map.renderSync();
			return map;

		};


		describe('debouncing takes place', () => {
			const afterDebounceDelay = OlMeasurementHandler.Debounce_Delay + 100;
			beforeEach(function () {
				jasmine.clock().install();
			});

			afterEach(function () {
				jasmine.clock().uninstall();
			});
			it('stores twice after a single change of a feature', async () => {
				setup();
				const classUnderTest = new OlMeasurementHandler();
				const map = setupMap();
				const storeSpy = spyOn(interactionStorageServiceMock, 'store');
				const privateSaveSpy = spyOn(classUnderTest, '_save').and.callThrough();
				const geometry = new LineString([[0, 0], [1, 0]]);
				const feature = new Feature({ geometry: geometry });

				classUnderTest.activate(map);
				classUnderTest._vectorLayer.getSource().addFeature(feature); // -> first call of _save, caused by vectorsource:addfeature-event
				feature.getGeometry().dispatchEvent('change');			// -> first call of debounced _save, caused by vectorsource:changefeature-event
				jasmine.clock().tick(afterDebounceDelay);


				expect(privateSaveSpy).toHaveBeenCalledTimes(2);
				expect(storeSpy).toHaveBeenCalledTimes(2);
			});

			it('stores twice after a feature removed', async () => {
				setup();
				const classUnderTest = new OlMeasurementHandler();
				const map = setupMap();
				const storeSpy = spyOn(interactionStorageServiceMock, 'store');
				const privateSaveSpy = spyOn(classUnderTest, '_save').and.callThrough();
				const geometry = new LineString([[0, 0], [1, 0]]);
				const feature = new Feature({ geometry: geometry });
				feature.set('debug', 'stores twice after a feature removed');

				classUnderTest.activate(map);
				classUnderTest._vectorLayer.getSource().addFeature(feature); // -> first call of _save, caused by vectorsource:addfeature-event
				classUnderTest._vectorLayer.getSource().removeFeature(feature);			// -> first call of debounced _save, caused by vectorsource:removefeature-event
				jasmine.clock().tick(afterDebounceDelay);

				expect(privateSaveSpy).toHaveBeenCalledTimes(2);
				expect(storeSpy).toHaveBeenCalledTimes(2);
			});

			it('stores only twice after multiple changes of a feature', async () => {
				setup();
				const classUnderTest = new OlMeasurementHandler();
				const map = setupMap();
				const storeSpy = spyOn(interactionStorageServiceMock, 'store');
				const privateSaveSpy = spyOn(classUnderTest, '_save').and.callThrough();
				const geometry = new LineString([[0, 0], [1, 0]]);
				const feature = new Feature({ geometry: geometry });

				classUnderTest.activate(map);
				classUnderTest._vectorLayer.getSource().addFeature(feature); // -> first call of _save, caused by vectorsource:addfeature-event
				feature.dispatchEvent('change');			// -> second call of debounced _save, caused by vectorsource:changefeature-event
				feature.dispatchEvent('change');
				feature.dispatchEvent('change');
				feature.dispatchEvent('change');
				jasmine.clock().tick(afterDebounceDelay);

				expect(privateSaveSpy).toHaveBeenCalledTimes(2);
				expect(storeSpy).toHaveBeenCalledTimes(2);
			});
		});

		it('stores after adding a feature', async (done) => {
			setup();
			const map = setupMap();
			const classUnderTest = new OlMeasurementHandler();
			const storageSpy = spyOn(classUnderTest._storageHandler, 'store').and.callFake(() => { });

			classUnderTest.activate(map);
			const feature = new Feature({ geometry: new LineString([[0, 0], [1, 0]]) });
			classUnderTest._vectorLayer.getSource().addFeature(feature);

			setTimeout(() => {
				expect(storageSpy).toHaveBeenCalledWith(jasmine.any(String), FileStorageServiceDataTypes.KML);
				done();
			});
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
						source: new OSM()
					}),
					new TileLayer({
						source: new TileDebug()
					})],
				target: target,
				view: new View({
					center: [42, 42],
					zoom: 1
				})
			});

			map.renderSync();
			return map;

		};

		it('deactivates dblclick', () => {
			setup();
			const classUnderTest = new OlMeasurementHandler();
			const map = setupMap();

			classUnderTest.activate(map);
			expect(map.getView().getZoom()).toBe(1);

			simulateMapBrowserEvent(map, MapBrowserEventType.DBLCLICK, 10, 0);

			expect(map.getView().getZoom()).toBe(1);
		});

		it('creates and activates helpTooltip', () => {
			setup();
			const classUnderTest = new OlMeasurementHandler();
			const map = setupMap();

			classUnderTest.activate(map);

			expect(classUnderTest._helpTooltip).toBeDefined();
			expect(classUnderTest._helpTooltip.active).toBeTrue();
		});

		it('creates and NOT activates helpTooltip', () => {
			setup();
			const classUnderTest = new OlMeasurementHandler();
			const environmentSpy = spyOn(environmentServiceMock, 'isTouch').and.returnValue(true);
			const map = setupMap();

			classUnderTest.activate(map);
			expect(classUnderTest._helpTooltip).toBeDefined();
			expect(classUnderTest._helpTooltip.active).toBeFalse();
			expect(environmentSpy).toHaveBeenCalled();
		});

		it('no move when dragging', () => {
			setup();
			const classUnderTest = new OlMeasurementHandler();
			const measureStateSpy = spyOn(classUnderTest._helpTooltip, 'notify');
			const map = setupMap();

			classUnderTest.activate(map);
			simulateMapBrowserEvent(map, MapBrowserEventType.POINTERMOVE, 10, 0, true);

			expect(measureStateSpy).toHaveBeenCalledWith({ type: jasmine.anything(), snap: null, coordinate: [10, 0], pointCount: 0, dragging: true });
		});

		it('change measureState, when sketch is changing', () => {
			setup();
			const classUnderTest = new OlMeasurementHandler();
			const map = setupMap();

			classUnderTest.activate(map);
			const measureStateSpy = spyOn(classUnderTest._helpTooltip, 'notify');

			simulateMapBrowserEvent(map, MapBrowserEventType.POINTERMOVE, 10, 0);

			expect(measureStateSpy).toHaveBeenCalledWith({ type: InteractionStateType.ACTIVE, snap: null, coordinate: [10, 0], pointCount: 0, dragging: jasmine.any(Boolean) });
			classUnderTest._sketchHandler.activate(new Feature({ geometry: new LineString([[0, 0], [1, 0]]) }));
			simulateMapBrowserEvent(map, MapBrowserEventType.POINTERMOVE, 20, 0);
			expect(measureStateSpy).toHaveBeenCalledWith({ type: InteractionStateType.DRAW, snap: null, coordinate: [20, 0], pointCount: 1, dragging: jasmine.any(Boolean) });
		});

		it('change measureState, when sketch is snapping to first point', () => {
			setup();
			const classUnderTest = new OlMeasurementHandler();
			const snappedGeometry = new Polygon([[[0, 0], [500, 0], [550, 550], [0, 500], [0, 500]]]);
			const feature = new Feature({ geometry: snappedGeometry });

			const map = setupMap();

			classUnderTest.activate(map);
			const measureStateSpy = spyOn(classUnderTest._helpTooltip, 'notify');

			simulateMapBrowserEvent(map, MapBrowserEventType.POINTERMOVE, 10, 0);
			expect(measureStateSpy).toHaveBeenCalledWith({ type: InteractionStateType.ACTIVE, snap: null, coordinate: [10, 0], pointCount: 0, dragging: jasmine.any(Boolean) });

			simulateDrawEvent('drawstart', classUnderTest._draw, feature);
			snappedGeometry.setCoordinates([[[0, 0], [500, 0], [550, 550], [0, 500], [0, 0], [0, 0]]]);
			feature.getGeometry().dispatchEvent('change');

			simulateMapBrowserEvent(map, MapBrowserEventType.POINTERMOVE, 0, 0);
			expect(measureStateSpy).toHaveBeenCalledWith({ type: InteractionStateType.DRAW, snap: InteractionSnapType.FIRSTPOINT, coordinate: [0, 0], pointCount: 5, dragging: jasmine.any(Boolean) });
		});

		it('change measureState, when sketch is snapping to last point', () => {
			setup();
			const classUnderTest = new OlMeasurementHandler();


			const snappedGeometry = new Polygon([[[0, 0], [500, 0], [550, 550], [0, 500], [0, 500]]]);
			const feature = new Feature({ geometry: snappedGeometry });
			const map = setupMap();

			classUnderTest.activate(map);
			const measureStateSpy = spyOn(classUnderTest._helpTooltip, 'notify');

			simulateMapBrowserEvent(map, MapBrowserEventType.POINTERMOVE, 10, 0);
			expect(measureStateSpy).toHaveBeenCalledWith({ type: InteractionStateType.ACTIVE, snap: null, coordinate: [10, 0], pointCount: 0, dragging: jasmine.any(Boolean) });

			simulateDrawEvent('drawstart', classUnderTest._draw, feature);
			snappedGeometry.setCoordinates([[[0, 0], [500, 0], [550, 550], [0, 500], [0, 500], [0, 500]]]);
			feature.getGeometry().dispatchEvent('change');
			simulateMapBrowserEvent(map, MapBrowserEventType.POINTERMOVE, 0, 500);
			expect(measureStateSpy).toHaveBeenCalledWith({ type: InteractionStateType.DRAW, snap: InteractionSnapType.LASTPOINT, coordinate: [0, 500], pointCount: 5, dragging: jasmine.any(Boolean) });
		});

		it('change statistics with two-point geometry', () => {
			const store = setup();
			const classUnderTest = new OlMeasurementHandler();


			const firstPointGeometry = new Polygon([[[0, 0]]]);
			const feature = new Feature({ geometry: firstPointGeometry });
			const map = setupMap();

			classUnderTest.activate(map);

			simulateMapBrowserEvent(map, MapBrowserEventType.POINTERMOVE, 10, 0);
			simulateDrawEvent('drawstart', classUnderTest._draw, feature);
			firstPointGeometry.setCoordinates([[[0, 0], [500, 0], [0, 0]]]);
			feature.getGeometry().dispatchEvent('change');
			expect(store.getState().measurement.statistic.length).toBeCloseTo(506, 0);
			expect(store.getState().measurement.statistic.area).toBeCloseTo(0, 1);
		});

		it('change measureState, when mouse enters draggable overlay', () => {
			setup();
			const classUnderTest = new OlMeasurementHandler();
			const map = setupMap();

			classUnderTest.activate(map);
			const measureStateSpy = spyOn(classUnderTest._helpTooltip, 'notify');

			const overlayMock = {
				set: () => { },
				get: (value) => {
					switch (value) {
						case 'feature':
							return { dispatchEvent: () => { } };
						default:
							return true;
					}
				},
				setOffset: () => { },
				setPosition: () => { }
			};
			const feature = new Feature({
				geometry: new Polygon([[[0, 0], [500, 0], [550, 550], [0, 500], [0, 500]]]),
				overlays: [overlayMock]
			});
			const layerMock = {
				getSource() {
					return { getFeatures: () => [feature] };
				}
			};
			classUnderTest._vectorLayer = layerMock;
			simulateMapBrowserEvent(map, MapBrowserEventType.POINTERMOVE, 10, 0);

			expect(measureStateSpy).toHaveBeenCalledWith({ type: InteractionStateType.OVERLAY, snap: null, coordinate: [10, 0], pointCount: 0, dragging: jasmine.any(Boolean) });
		});

		it('uses _lastPointerMoveEvent on removeLast if keypressed', () => {
			setup();
			const classUnderTest = new OlMeasurementHandler();
			const map = setupMap();
			const geometry = new Polygon([[[50, 0], [500, 0], [550, 550], [0, 500], [0, 500]]]);
			const feature = new Feature({ geometry: geometry });
			const deleteKeyCode = 46;

			classUnderTest.activate(map);
			simulateDrawEvent('drawstart', classUnderTest._draw, feature);
			simulateMapBrowserEvent(map, MapBrowserEventType.POINTERMOVE, 10, 0);
			classUnderTest._draw.removeLastPoint = jasmine.createSpy();
			classUnderTest._draw.handleEvent = jasmine.createSpy().and.callThrough();
			feature.getGeometry().dispatchEvent('change');
			expect(classUnderTest._modify.getActive()).toBeFalse();

			simulateKeyEvent(deleteKeyCode);
			expect(classUnderTest._measureState.type).toBe(InteractionStateType.DRAW);
			expect(classUnderTest._draw.removeLastPoint).toHaveBeenCalled();
			expect(classUnderTest._draw.handleEvent).toHaveBeenCalledWith(jasmine.any(MapBrowserEvent));
		});

		it('add the drawn feature to select after drawends', () => {
			setup();
			const geometry = new Polygon([[[0, 0], [500, 0], [550, 550], [0, 500], [0, 500]]]);
			const feature = new Feature({ geometry: geometry });
			feature.setId('measure_1');

			const map = setupMap();
			const classUnderTest = new OlMeasurementHandler();
			classUnderTest.activate(map);
			classUnderTest._measureState.type = InteractionStateType.DRAW;
			classUnderTest._vectorLayer.getSource().addFeature(feature);

			expect(classUnderTest._select).toBeDefined();
			expect(classUnderTest._select.getFeatures().getLength()).toBe(1);
		});

		it('calls draw.finishDrawing after finish-action', () => {
			setup();
			const classUnderTest = new OlMeasurementHandler();
			const map = setupMap();
			const geometry = new Polygon([[[0, 0], [500, 0], [550, 550], [0, 500], [0, 500]]]);
			const feature = new Feature({ geometry: geometry });

			classUnderTest.activate(map);
			const spy = spyOn(classUnderTest._draw, 'finishDrawing').and.callThrough();
			simulateDrawEvent('drawstart', classUnderTest._draw, feature);
			feature.getGeometry().dispatchEvent('change');

			finish();
			expect(spy).toHaveBeenCalled();
		});

		it('calls draw.abortDrawing after reset-action', () => {
			setup();
			const classUnderTest = new OlMeasurementHandler();
			const map = setupMap();
			const geometry = new Polygon([[[0, 0], [500, 0], [550, 550], [0, 500], [0, 500]]]);
			const feature = new Feature({ geometry: geometry });

			classUnderTest.activate(map);
			const spy = spyOn(classUnderTest._draw, 'abortDrawing').and.callThrough();
			simulateDrawEvent('drawstart', classUnderTest._draw, feature);
			feature.getGeometry().dispatchEvent('change');

			reset();
			expect(spy).toHaveBeenCalled();
		});

		describe('when switching to modify', () => {
			const geometry = new LineString([[0, 0], [100, 0]]);
			const feature = new Feature({ geometry: geometry });
			feature.setStyle(new Style({ stroke: new Stroke({ color: [0, 0, 0] }) }));

			it('pointer is not snapped on sketch', () => {
				setup();
				const classUnderTest = new OlMeasurementHandler();
				const map = setupMap();

				map.forEachFeatureAtPixel = jasmine.createSpy().and.callThrough();
				const measureStateSpy = spyOn(classUnderTest._helpTooltip, 'notify');

				classUnderTest.activate(map);
				classUnderTest._select.getFeatures().push(feature);
				classUnderTest._modify.setActive(true);

				simulateMapBrowserEvent(map, MapBrowserEventType.POINTERMOVE, 10, 0);

				expect(map.forEachFeatureAtPixel).toHaveBeenCalledWith([10, 0], jasmine.any(Function), jasmine.any(Object));
				expect(measureStateSpy).toHaveBeenCalledWith({ type: InteractionStateType.MODIFY, snap: null, coordinate: [10, 0], pointCount: 0, dragging: jasmine.any(Boolean) });
			});

			it('pointer is snapped to sketch boundary', () => {
				setup();
				const classUnderTest = new OlMeasurementHandler();
				const map = setupMap();

				const measureStateSpy = spyOn(classUnderTest._helpTooltip, 'notify');
				const snappingFeatureMock = createSnappingFeatureMock([50, 0], feature);
				map.forEachFeatureAtPixel = jasmine.createSpy().and.callFake((pixel, callback) => {
					return callback(snappingFeatureMock, undefined);
				});


				classUnderTest.activate(map);
				classUnderTest._select.getFeatures().push(feature);
				classUnderTest._modify.setActive(true);
				simulateMapBrowserEvent(map, MapBrowserEventType.POINTERMOVE, 50, 0);

				expect(map.forEachFeatureAtPixel).toHaveBeenCalledWith([50, 0], jasmine.any(Function), jasmine.any(Object));
				expect(measureStateSpy).toHaveBeenCalledWith({ type: InteractionStateType.MODIFY, snap: InteractionSnapType.EGDE, coordinate: [50, 0], pointCount: jasmine.anything(), dragging: jasmine.any(Boolean) });
			});

			it('pointer is snapped to sketch vertex', () => {
				setup();
				const classUnderTest = new OlMeasurementHandler();
				const map = setupMap();
				const measureStateSpy = spyOn(classUnderTest._helpTooltip, 'notify');
				const snappingFeatureMock = createSnappingFeatureMock([0, 0], feature);
				map.forEachFeatureAtPixel = jasmine.createSpy().and.callFake((pixel, callback) => {
					return callback(snappingFeatureMock, undefined);
				});

				classUnderTest.activate(map);
				classUnderTest._select.getFeatures().push(feature);
				classUnderTest._modify.setActive(true);
				simulateMapBrowserEvent(map, MapBrowserEventType.POINTERMOVE, 0, 0);

				expect(map.forEachFeatureAtPixel).toHaveBeenCalledWith([0, 0], jasmine.any(Function), jasmine.any(Object));
				expect(measureStateSpy).toHaveBeenCalledWith({ type: InteractionStateType.MODIFY, snap: InteractionSnapType.VERTEX, coordinate: [0, 0], pointCount: jasmine.anything(), dragging: jasmine.any(Boolean) });
			});


			it('adds/removes style for grab on vertex', () => {
				setup();
				const classUnderTest = new OlMeasurementHandler();
				const map = setupMap();
				const mapContainer = map.getTarget();


				const snappingFeatureMock = createSnappingFeatureMock([0, 0], feature);
				let toggleOnce = true;
				map.forEachFeatureAtPixel = jasmine.createSpy().and.callFake((pixel, callback) => {
					if (toggleOnce) {
						toggleOnce = false;
						return callback(snappingFeatureMock, undefined);
					}
				});

				classUnderTest.activate(map);
				classUnderTest._modify.setActive(true);
				simulateMapBrowserEvent(map, MapBrowserEventType.POINTERMOVE, 0, 0);

				expect(map.forEachFeatureAtPixel).toHaveBeenCalledWith([0, 0], jasmine.any(Function), jasmine.any(Object));
				expect(mapContainer.classList.contains('grab')).toBeTrue();
				simulateMapBrowserEvent(map, MapBrowserEventType.POINTERMOVE, 50, 0);
				expect(mapContainer.classList.contains('grab')).toBeFalse();
			});

			it('adds/removes style for grabbing while modifying', () => {
				setup();
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
				setup();
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
				setup();
				const classUnderTest = new OlMeasurementHandler();
				const map = setupMap();
				classUnderTest.activate(map);

				const geometry = new Polygon([[[0, 0], [500, 0], [550, 550], [0, 500], [0, 500]]]);
				const feature = new Feature({ geometry: geometry });
				const layerMock = {
					getSource() {
						return { getFeatures: () => [feature], hasFeature: () => true, removeFeature: () => { } };
					}
				};
				simulateDrawEvent('drawstart', classUnderTest._draw, feature);
				feature.getGeometry().dispatchEvent('change');
				simulateDrawEvent('drawend', classUnderTest._draw, feature);
				const overlay = feature.get('measurement');
				const element = overlay.getElement();

				element.dispatchEvent(new Event('pointerdown'));

				expect(overlay.get('dragging')).toBeTrue();


				classUnderTest._vectorLayer = layerMock;
				simulateMapBrowserEvent(map, MapBrowserEventType.POINTERMOVE, 50, 500);
				expect(overlay.get('manualPositioning')).toBeTrue();
				expect(overlay.getPosition()).toEqual([50, 500]);
				simulateMapBrowserEvent(map, MapBrowserEventType.POINTERUP, 50, 500);
				expect(overlay.get('dragging')).toBeFalse();
			});

			it('triggers overlay as dragable', () => {
				setup();
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
						source: new OSM()
					}),
					new TileLayer({
						source: new TileDebug()
					})],
				target: target,
				view: new View({
					center: [0, 0],
					zoom: 1
				})
			});

			map.renderSync();
			return map;

		};

		it('deselect feature, if clickposition is disjoint to selected feature', () => {
			const store = setup({ ...initialState, selection: ['measure_1'] });
			const classUnderTest = new OlMeasurementHandler();
			const map = setupMap();

			classUnderTest.activate(map);

			const geometry = new Polygon([[[0, 0], [500, 0], [550, 550], [0, 500], [0, 500]]]);
			const feature = new Feature({ geometry: geometry });
			feature.setId('measure_1');
			classUnderTest._select.getFeatures().push(feature);

			expect(classUnderTest._select).toBeDefined();
			expect(classUnderTest._select.getFeatures().getLength()).toBe(1);

			classUnderTest._measureState.type = InteractionStateType.SELECT;
			simulateMapBrowserEvent(map, MapBrowserEventType.CLICK, 600, 0);

			expect(classUnderTest._select.getFeatures().getLength()).toBe(0);
			expect(store.getState().measurement.selection.length).toBe(0);
		});


		it('select feature, if clickposition is in anyinteract to selected feature', () => {
			const store = setup();
			const geometry = new Polygon([[[0, 0], [500, 0], [550, 550], [0, 500], [0, 500]]]);
			const feature = new Feature({ geometry: geometry });
			feature.setId('measure_1');
			const map = setupMap();

			const classUnderTest = new OlMeasurementHandler();
			classUnderTest.activate(map);
			classUnderTest._vectorLayer.getSource().addFeature(feature);

			expect(classUnderTest._select).toBeDefined();

			// force deselect
			classUnderTest._select.getFeatures().clear();
			expect(classUnderTest._select.getFeatures().getLength()).toBe(0);

			map.forEachFeatureAtPixel = jasmine.createSpy().and.callFake((pixel, callback) => {
				callback(feature, classUnderTest._vectorLayer);
			});

			// re-select
			classUnderTest._measureState.type = InteractionStateType.SELECT;
			simulateMapBrowserEvent(map, MapBrowserEventType.CLICK, 250, 250);

			expect(classUnderTest._select.getFeatures().getLength()).toBe(1);
			expect(store.getState().measurement.selection.length).toBe(1);
		});

		it('switch to draw-tool, if clickposition is in anyinteract to selected measure-feature', () => {
			const store = setup();
			const geometry = new Polygon([[[0, 0], [500, 0], [550, 550], [0, 500], [0, 500]]]);
			const feature = new Feature({ geometry: geometry });
			feature.setId('draw_1');
			const map = setupMap();

			const classUnderTest = new OlMeasurementHandler();
			classUnderTest.activate(map);
			classUnderTest._vectorLayer.getSource().addFeature(feature);

			expect(classUnderTest._select).toBeDefined();

			// force deselect
			classUnderTest._select.getFeatures().clear();
			expect(classUnderTest._select.getFeatures().getLength()).toBe(0);

			map.forEachFeatureAtPixel = jasmine.createSpy().and.callFake((pixel, callback) => {
				callback(feature, classUnderTest._vectorLayer);
			});

			// re-select
			classUnderTest._measureState.type = InteractionStateType.SELECT;
			simulateMapBrowserEvent(map, MapBrowserEventType.CLICK, 250, 250);

			expect(store.getState().draw.selection.length).toBe(1);
			expect(store.getState().tools.current).toBe(ToolId.DRAWING);
		});

		it('updates statistics if clickposition is in anyinteract to selected feature', () => {

			const store = setup();
			const geometry = new Polygon([[[0, 0], [1, 0], [1, 1], [0, 1], [0, 1]]]);
			const feature = new Feature({ geometry: geometry });
			feature.setId('measure_');
			const map = setupMap();
			const classUnderTest = new OlMeasurementHandler();
			const layer = classUnderTest.activate(map);
			layer.getSource().addFeature(feature);
			finish();

			map.forEachFeatureAtPixel = jasmine.createSpy().and.callFake((pixel, callback) => {
				callback(feature, classUnderTest._vectorLayer);
			});

			// select
			classUnderTest._measureState.type = InteractionStateType.SELECT;
			simulateMapBrowserEvent(map, MapBrowserEventType.CLICK, 0.5, 0.5);
			expect(store.getState().measurement.statistic.length).toBeCloseTo(3, 1);
			expect(store.getState().measurement.statistic.area).toBeCloseTo(1, 1);
		});

		it('updates and sums statistics if clickposition is in anyinteract to selected features', () => {

			const store = setup();
			const geometry1 = new Polygon([[[0, 0], [1, 0], [1, 1], [0, 1], [0, 1]]]);
			const feature1 = new Feature({ geometry: geometry1 });
			feature1.setId('measure_1');
			const geometry2 = new LineString([[2, 0], [7, 0]]);
			const feature2 = new Feature({ geometry: geometry2 });
			feature2.setId('measure_2');
			const map = setupMap();
			const classUnderTest = new OlMeasurementHandler();
			const layer = classUnderTest.activate(map);
			layer.getSource().addFeature(feature1);
			layer.getSource().addFeature(feature2);
			finish();

			map.forEachFeatureAtPixel = jasmine.createSpy().and.callFake((pixel, callback) => {
				callback(feature1, classUnderTest._vectorLayer);
			});

			// first select
			simulateMapBrowserEvent(map, MapBrowserEventType.POINTERMOVE, 1, 0);
			simulateMapBrowserEvent(map, MapBrowserEventType.CLICK, 0.5, 0.5);
			expect(store.getState().measurement.statistic.length).toBeCloseTo(3, 1);
			expect(store.getState().measurement.statistic.area).toBeCloseTo(1, 1);

			map.forEachFeatureAtPixel = jasmine.createSpy().and.callFake((pixel, callback) => {
				callback(feature2, classUnderTest._vectorLayer);
			});

			// second select
			simulateMapBrowserEvent(map, MapBrowserEventType.CLICK, 5, 0);
			expect(store.getState().measurement.statistic.length).toBeCloseTo(8, 0);
			expect(store.getState().measurement.statistic.area).toBeCloseTo(1, 1);
		});
	});
});



