import { OlMeasurementHandler } from '../../../../../src/modules/olMap/handler/measure/OlMeasurementHandler';
import { Point, LineString, Polygon, Geometry } from 'ol/geom';
import Map from 'ol/Map';
import View from 'ol/View';
import { Feature } from 'ol';
import { Draw, Modify, Select, Snap } from 'ol/interaction';
import { DrawEvent } from 'ol/interaction/Draw';
import { MapBrowserEvent } from 'ol';
import MapBrowserEventType from 'ol/MapBrowserEventType';
import { $injector } from '../../../../../src/injection';
import { TestUtils } from '../../../../test-utils.js';
import proj4 from 'proj4';
import { VectorGeoResource, VectorSourceType } from '../../../../../src/domain/geoResources';
import { register } from 'ol/proj/proj4';
import { MEASUREMENT_LAYER_ID } from '../../../../../src/plugins/MeasurementPlugin';
import { ModifyEvent } from 'ol/interaction/Modify';
import { layersReducer } from '../../../../../src/store/layers/layers.reducer';
import { finish, remove, reset, setDisplayRuler, setStatistic } from '../../../../../src/store/measurement/measurement.action';
import { OverlayService } from '../../../../../src/modules/olMap/services/OverlayService';
import { Stroke, Style } from 'ol/style';
import { InteractionSnapType, InteractionStateType } from '../../../../../src/modules/olMap/utils/olInteractionUtils';
import { measurementReducer } from '../../../../../src/store/measurement/measurement.reducer';
import { sharedReducer } from '../../../../../src/store/shared/shared.reducer';
import { notificationReducer } from '../../../../../src/store/notifications/notifications.reducer';
import { LevelTypes } from '../../../../../src/store/notifications/notifications.action';
import { acknowledgeTermsOfUse } from '../../../../../src/store/shared/shared.action';
import { simulateMapBrowserEvent } from '../../mapTestUtils';
import { drawReducer } from '../../../../../src/store/draw/draw.reducer';
import { toolsReducer } from '../../../../../src/store/tools/tools.reducer';
import { getAttributionForLocallyImportedOrCreatedGeoResource } from '../../../../../src/services/provider/attribution.provider';
import { Layer } from 'ol/layer';
import { Tools } from '../../../../../src/domain/tools';
import { BaOverlay } from '../../../../../src/modules/olMap/components/BaOverlay.js';
import { GEODESIC_FEATURE_PROPERTY, GeodesicGeometry } from '../../../../../src/modules/olMap/ol/geodesic/geodesicGeometry.js';
import { fileStorageReducer } from '../../../../../src/store/fileStorage/fileStorage.reducer.js';
import { KML_EMPTY_CONTENT } from '../../../../../src/modules/olMap/formats/kml.js';
import { PROJECTED_LENGTH_GEOMETRY_PROPERTY } from '../../../../../src/modules/olMap/utils/olGeometryUtils.js';
import { GeometryType } from '../../../../../src/domain/geometryTypes.js';
import { setAdminAndFileId } from '../../../../../src/store/fileStorage/fileStorage.action.js';
import {
	asInternalProperty,
	EXPORTABLE_INTERNAL_FEATURE_PROPERTY_KEYS,
	LEGACY_INTERNAL_FEATURE_PROPERTY_KEYS
} from '../../../../../src/utils/propertyUtils.js';

proj4.defs('EPSG:25832', '+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +axis=neu');
register(proj4);
window.customElements.define(BaOverlay.tag, BaOverlay);

describe('OlMeasurementHandler', () => {
	class MockClass {
		constructor() {
			this.get = "I'm a StyleService.";
		}

		addInternalFeatureStyle() {}

		updateInternalFeatureStyle() {}

		removeInternalFeatureStyle() {}

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

	const mapServiceMock = {
		getSrid: () => 3857,
		getLocalProjectedSrid: () => 25832,
		getLocalProjectedSridExtent: () => [5, -80, 14, 80],
		calcLength: () => 1,
		calcArea: () => 1
	};

	const fileStorageServiceMock = {
		isAdminId: () => false,
		isFileId: () => false
	};

	const translationServiceMock = { translate: (key, params = []) => `${key}${params.length ? ` [${params.join(',')}]` : ''}` };
	const environmentServiceMock = { isTouch: () => false, isStandalone: () => false, isEmbedded: () => false };
	const initialMeasureState = {
		active: false,
		statistic: { length: 0, area: 0 },
		displayRuler: true,
		selection: [],
		reset: null
	};

	const initialFileStorageState = { adminId: null, fileId: null, data: null, latest: null };

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

	const setup = (measurementState = initialMeasureState, fileStorageState = initialFileStorageState) => {
		const state = {
			measurement: measurementState,
			layers: {
				active: [],
				background: 'null'
			},
			shared: {
				termsOfUseAcknowledged: false
			},
			notifications: {
				notification: null
			},
			fileStorage: fileStorageState
		};
		const store = TestUtils.setupStoreAndDi(state, {
			measurement: measurementReducer,
			draw: drawReducer,
			layers: layersReducer,
			shared: sharedReducer,
			notifications: notificationReducer,
			tools: toolsReducer,
			fileStorage: fileStorageReducer
		});
		$injector
			.registerSingleton('TranslationService', translationServiceMock)
			.registerSingleton('MapService', mapServiceMock)
			.registerSingleton('EnvironmentService', environmentServiceMock)
			.registerSingleton('GeoResourceService', geoResourceServiceMock)
			.registerSingleton('FileStorageService', fileStorageServiceMock)
			.registerSingleton('IconService', { getUrl: () => 'some.url' })
			.registerSingleton('UnitsService', {
				// eslint-disable-next-line no-unused-vars
				formatDistance: (distance, decimals) => {
					return { value: distance, localizedValue: distance, unit: 'm' };
				},
				// eslint-disable-next-line no-unused-vars
				formatArea: (area, decimals) => {
					return { value: area, localizedValue: area, unit: 'm²' };
				},
				// eslint-disable-next-line no-unused-vars
				formatAngle: (angle, decimals) => {
					return { value: angle, localizedValue: angle, unit: '°' };
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

	const simulateDrawEvent = (type, draw, feature) => {
		const eventType = type;
		const drawEvent = new DrawEvent(eventType, feature);

		draw.dispatchEvent(drawEvent);
	};

	const simulateKeyEvent = (keyCode, key) => {
		const keyEvent = new KeyboardEvent('keyup', { key: key, keyCode: keyCode, which: keyCode });

		document.dispatchEvent(keyEvent);
	};

	const createFeature = (id = null) => {
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
		if (id) {
			feature.setId(id);
		}
		return feature;
	};

	describe('when activated over olMap', () => {
		it('adds a label to the session vectorlayer', () => {
			setup();
			const map = setupMap();
			const classUnderTest = new OlMeasurementHandler();
			classUnderTest.activate(map);

			expect(classUnderTest._vectorLayer.label).toBe('olMap_handler_draw_layer_label');
		});

		it('adds a keyup-EventListener to the document', () => {
			setup();
			const documentSpy = spyOn(document, 'addEventListener').and.callThrough();
			const map = setupMap();
			const classUnderTest = new OlMeasurementHandler();
			classUnderTest.activate(map);

			expect(documentSpy).toHaveBeenCalledWith('keyup', jasmine.any(Function));
		});

		it('removes a keyup-EventListener from the document', async () => {
			setup();
			const documentSpy = spyOn(document, 'removeEventListener').and.callThrough();
			const map = setupMap();
			const classUnderTest = new OlMeasurementHandler();
			classUnderTest.activate(map);
			await TestUtils.timeout();
			classUnderTest.deactivate(map);

			expect(documentSpy).toHaveBeenCalledWith('keyup', jasmine.any(Function));
		});

		describe('when not TermsOfUseAcknowledged', () => {
			it('emits a notification', async () => {
				const store = setup();
				const map = setupMap();
				const classUnderTest = new OlMeasurementHandler();

				expect(store.getState().shared.termsOfUseAcknowledged).toBeFalse();
				classUnderTest.activate(map);

				expect(store.getState().shared.termsOfUseAcknowledged).toBeTrue();
				await TestUtils.timeout();
				// check notification
				expect(store.getState().notifications.latest.payload.content).toBe('olMap_handler_termsOfUse [global_terms_of_use]');
				expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.INFO);
			});

			describe('when termsOfUse are empty', () => {
				it('does NOT emit a notification', async () => {
					const store = setup();
					const map = setupMap();
					spyOn(translationServiceMock, 'translate').and.callFake(() => '');
					const classUnderTest = new OlMeasurementHandler();

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
			it('does NOT emit a notification', async () => {
				const store = setup();
				const map = setupMap();
				const classUnderTest = new OlMeasurementHandler();
				acknowledgeTermsOfUse();
				expect(store.getState().shared.termsOfUseAcknowledged).toBeTrue();
				classUnderTest.activate(map);

				await TestUtils.timeout();
				//check notification
				expect(store.getState().notifications.latest).toBeFalsy();
			});
		});

		describe('when embedded ', () => {
			it('does NOT emit a notification', async () => {
				const store = setup();
				const map = setupMap();
				const classUnderTest = new OlMeasurementHandler();
				spyOn(environmentServiceMock, 'isEmbedded').and.returnValue(true);

				classUnderTest.activate(map);

				await TestUtils.timeout();
				//check notification
				expect(store.getState().notifications.latest).toBeFalsy();
			});
		});

		describe('_save', () => {
			it('updates the fileStorage slice-of-state with data', async () => {
				const store = await setup(initialMeasureState, { ...initialFileStorageState, fileId: 'f_ooBarId' });
				const classUnderTest = new OlMeasurementHandler();
				const map = setupMap();
				const feature = createFeature();

				classUnderTest.activate(map);
				await TestUtils.timeout();
				classUnderTest._vectorLayer.getSource().addFeature(feature);
				classUnderTest._save(map);

				await TestUtils.timeout();
				expect(classUnderTest._vectorLayer.getSource().getFeatures().length).toBe(1);

				expect(store.getState().fileStorage.data).toContain('<kml');
			});

			it('updates the fileStorage slice-of-state without internal properties data', async () => {
				const store = await setup(initialMeasureState, { ...initialFileStorageState, fileId: 'f_ooBarId' });
				const containsProperty = (content, propertyName) => content.includes(`<Data name="${propertyName}"/>`);
				const classUnderTest = new OlMeasurementHandler();
				const map = setupMap();
				const feature = createFeature();
				LEGACY_INTERNAL_FEATURE_PROPERTY_KEYS.forEach((key) => {
					feature.set(asInternalProperty(key), null);
				});

				classUnderTest.activate(map);
				await TestUtils.timeout();
				classUnderTest._vectorLayer.getSource().addFeature(feature);
				classUnderTest._save(map);

				await TestUtils.timeout();
				expect(classUnderTest._vectorLayer.getSource().getFeatures().length).toBe(1);

				expect(store.getState().fileStorage.data).toContain('<kml');
				const exportedPropertyExists = [...LEGACY_INTERNAL_FEATURE_PROPERTY_KEYS].map((propertyKey) =>
					containsProperty(store.getState().fileStorage.data, asInternalProperty(propertyKey))
				);

				expect(exportedPropertyExists.filter((p) => p === true).length).toBe(EXPORTABLE_INTERNAL_FEATURE_PROPERTY_KEYS.length);
				expect(exportedPropertyExists.filter((p) => p === false).length).toBe(
					LEGACY_INTERNAL_FEATURE_PROPERTY_KEYS.length - EXPORTABLE_INTERNAL_FEATURE_PROPERTY_KEYS.length
				);
			});

			it('updates the fileStorage slice-of-state with no data (kml without content)', async () => {
				const store = await setup(initialMeasureState, { ...initialFileStorageState, fileId: 'f_ooBarId' });
				const classUnderTest = new OlMeasurementHandler();
				const map = setupMap();
				const feature = createFeature();

				classUnderTest.activate(map);
				await TestUtils.timeout();
				classUnderTest._vectorLayer.getSource().addFeature(feature);
				classUnderTest._vectorLayer.getSource().removeFeature(feature); // second save
				classUnderTest._save();

				await TestUtils.timeout();
				expect(classUnderTest._storedContent).toBe(KML_EMPTY_CONTENT);
				expect(store.getState().fileStorage.data).toBe(KML_EMPTY_CONTENT);
			});

			it('updates the fileStorage slice-of-state and uses old georesourceId storeId, due to no data-changes', async () => {
				const store = await setup(initialMeasureState, { ...initialFileStorageState, fileId: null });
				const classUnderTest = new OlMeasurementHandler();
				const lastData =
					'<kml xmlns="http://www.opengis.net/kml/2.2" xmlns:gx="http://www.google.com/kml/ext/2.2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opengis.net/kml/2.2 https://developers.google.com/kml/schema/kml22gx.xsd"><Placemark id="measurement_1620710146878"><Style><LineStyle><color>ff0000ff</color><width>3</width></LineStyle><PolyStyle><color>660000ff</color></PolyStyle></Style><ExtendedData><Data name="area"/><Data name="measurement"/><Data name="partitions"/></ExtendedData><Polygon><outerBoundaryIs><LinearRing><coordinates>10.66758401,50.09310529 11.77182103,50.08964948 10.57062661,49.66616988 10.66758401,50.09310529</coordinates></LinearRing></outerBoundaryIs></Polygon></Placemark></kml>';
				const map = setupMap();
				const vectorGeoResource = new VectorGeoResource('f_lastId', 'foo', VectorSourceType.KML).setSource(lastData, 4326);

				map.addLayer(new Layer({ geoResourceId: 'f_lastId', render: () => {} }));
				spyOn(fileStorageServiceMock, 'isFileId').and.callFake(() => true);
				spyOn(classUnderTest._overlayService, 'add').and.callFake(() => {});
				const geoResourceServiceSpy = spyOn(geoResourceServiceMock, 'byId').withArgs('f_lastId').and.returnValue(vectorGeoResource);

				classUnderTest.activate(map);

				await TestUtils.timeout();

				expect(classUnderTest._storeId).toBe('f_lastId');
				const saveSpy = spyOn(classUnderTest, '_save').and.callThrough();

				geoResourceServiceSpy.calls.reset();
				classUnderTest._convertToPermanentLayer(); // third and last save
				await TestUtils.timeout();
				expect(saveSpy).toHaveBeenCalledTimes(1);
				expect(geoResourceServiceSpy).toHaveBeenCalled();
				expect(store.getState().fileStorage.data).toBeTruthy();
			});
		});

		describe('uses Interactions', () => {
			it('adds a Draw-Interaction', () => {
				setup();
				const classUnderTest = new OlMeasurementHandler();
				const map = setupMap();
				map.addInteraction = jasmine.createSpy();

				classUnderTest.activate(map);

				// adds Interaction for select, draw, modify,snap
				expect(map.addInteraction).toHaveBeenCalledTimes(4);
			});

			it('removes Interaction', async () => {
				setup();
				const classUnderTest = new OlMeasurementHandler();
				const map = setupMap();
				const layerStub = {};
				map.removeInteraction = jasmine.createSpy();
				classUnderTest.activate(map);
				await TestUtils.timeout();
				classUnderTest.deactivate(map, layerStub);

				// removes Interaction for select, draw, modify, snap
				expect(map.removeInteraction).toHaveBeenCalledTimes(4);
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

			it('register observer for last fileId', () => {
				setup();
				const classUnderTest = new OlMeasurementHandler();
				const map = setupMap();
				map.addInteraction = jasmine.createSpy();
				const updateStoreIdSpy = spyOn(classUnderTest, '_updateStoreId').and.callThrough();

				classUnderTest.activate(map);
				setAdminAndFileId('foo', 'bar');
				expect(updateStoreIdSpy).toHaveBeenCalledWith('bar');
				expect(classUnderTest._storeId).toBe('bar');
			});
		});

		it('looks for existing measurement-layer and adds the feature for update/copy on save', async () => {
			setup();
			const classUnderTest = new OlMeasurementHandler();
			const lastData =
				'<kml xmlns="http://www.opengis.net/kml/2.2" xmlns:gx="http://www.google.com/kml/ext/2.2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opengis.net/kml/2.2 https://developers.google.com/kml/schema/kml22gx.xsd"><Placemark id="measure_1620710146878"><Style><LineStyle><color>ff0000ff</color><width>3</width></LineStyle><PolyStyle><color>660000ff</color></PolyStyle></Style><ExtendedData><Data name="area"/><Data name="measurement"/><Data name="partitions"/></ExtendedData><Polygon><outerBoundaryIs><LinearRing><coordinates>10.66758401,50.09310529 11.77182103,50.08964948 10.57062661,49.66616988 10.66758401,50.09310529</coordinates></LinearRing></outerBoundaryIs></Polygon></Placemark></kml>';
			const map = setupMap();
			const vectorGeoResource = new VectorGeoResource('a_lastId', 'foo', VectorSourceType.KML).setSource(lastData, 4326);
			spyOn(fileStorageServiceMock, 'isAdminId').withArgs('a_lastId').and.returnValue(true);

			// we add two fileStorage related layers
			map.addLayer(new Layer({ geoResourceId: 'a_lastId', render: () => {} }));
			map.addLayer(new Layer({ geoResourceId: 'a_notWanted', render: () => {} }));
			spyOn(classUnderTest._overlayService, 'add').and.callFake(() => {});

			const geoResourceSpy = spyOn(geoResourceServiceMock, 'byId').and.returnValue(vectorGeoResource);
			classUnderTest.activate(map);
			const addFeatureSpy = spyOn(classUnderTest._vectorLayer.getSource(), 'addFeature');

			await TestUtils.timeout();
			expect(geoResourceSpy).toHaveBeenCalledWith('a_lastId');
			expect(addFeatureSpy).toHaveBeenCalledTimes(1);
		});

		it('looks for existing measurement-layer and use the geoResourceId as value for storeId', async () => {
			setup();
			const classUnderTest = new OlMeasurementHandler();
			const lastData =
				'<kml xmlns="http://www.opengis.net/kml/2.2" xmlns:gx="http://www.google.com/kml/ext/2.2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opengis.net/kml/2.2 https://developers.google.com/kml/schema/kml22gx.xsd"><Placemark id="measure_1620710146878"><Style><LineStyle><color>ff0000ff</color><width>3</width></LineStyle><PolyStyle><color>660000ff</color></PolyStyle></Style><ExtendedData><Data name="area"/><Data name="measurement"/><Data name="partitions"/></ExtendedData><Polygon><outerBoundaryIs><LinearRing><coordinates>10.66758401,50.09310529 11.77182103,50.08964948 10.57062661,49.66616988 10.66758401,50.09310529</coordinates></LinearRing></outerBoundaryIs></Polygon></Placemark></kml>';
			const map = setupMap();
			const vectorGeoResource = new VectorGeoResource('a_lastId', 'foo', VectorSourceType.KML).setSource(lastData, 4326);
			spyOn(fileStorageServiceMock, 'isAdminId').withArgs('a_lastId').and.returnValue(true);

			// we add two fileStorage related layers
			map.addLayer(new Layer({ geoResourceId: 'a_lastId', render: () => {} }));
			map.addLayer(new Layer({ geoResourceId: 'a_notWanted', render: () => {} }));
			spyOn(classUnderTest._overlayService, 'add').and.callFake(() => {});

			const geoResourceSpy = spyOn(geoResourceServiceMock, 'byId').and.returnValue(vectorGeoResource);
			classUnderTest.activate(map);

			await TestUtils.timeout();
			expect(geoResourceSpy).toHaveBeenCalledWith('a_lastId');
			expect(classUnderTest._storeId).toBe('a_lastId');
		});

		it('looks for measurement-layer and gets no georesource', async () => {
			setup();
			const classUnderTest = new OlMeasurementHandler();
			const map = setupMap();

			map.addLayer(new Layer({ geoResourceId: 'a_lastId', render: () => {} }));
			spyOn(fileStorageServiceMock, 'isAdminId').and.callFake(() => true);
			spyOn(classUnderTest._overlayService, 'add').and.callFake(() => {});

			const geoResourceSpy = spyOn(geoResourceServiceMock, 'byId').and.returnValue(null);
			classUnderTest.activate(map);
			const addFeatureSpy = spyOn(classUnderTest._vectorLayer.getSource(), 'addFeature');

			await TestUtils.timeout();
			expect(geoResourceSpy).toHaveBeenCalledWith('a_lastId');
			expect(addFeatureSpy).not.toHaveBeenCalled();
		});

		it('adds style on old features', async () => {
			setup();
			const classUnderTest = new OlMeasurementHandler();
			const lastData =
				'<kml xmlns="http://www.opengis.net/kml/2.2" xmlns:gx="http://www.google.com/kml/ext/2.2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opengis.net/kml/2.2 https://developers.google.com/kml/schema/kml22gx.xsd"><Placemark id="measure_1620710146878"><Style><LineStyle><color>ff0000ff</color><width>3</width></LineStyle><PolyStyle><color>660000ff</color></PolyStyle></Style><ExtendedData><Data name="area"/><Data name="measurement"/><Data name="partitions"/></ExtendedData><Polygon><outerBoundaryIs><LinearRing><coordinates>10.66758401,50.09310529 11.77182103,50.08964948 10.57062661,49.66616988 10.66758401,50.09310529</coordinates></LinearRing></outerBoundaryIs></Polygon></Placemark></kml>';
			const map = setupMap();
			const vectorGeoResource = new VectorGeoResource('a_lastId', 'foo', VectorSourceType.KML).setSource(lastData, 4326);
			map.addLayer(new Layer({ geoResourceId: 'a_lastId', render: () => {} }));
			spyOn(fileStorageServiceMock, 'isAdminId').and.callFake(() => true);
			spyOn(classUnderTest._overlayService, 'add').and.callFake(() => {});
			spyOn(geoResourceServiceMock, 'byId').and.returnValue(vectorGeoResource);
			const addInternalFeatureStyleSpy = spyOn(classUnderTest._styleService, 'addInternalFeatureStyle');
			let oldFeature;

			classUnderTest.activate(map);
			spyOn(classUnderTest._vectorLayer.getSource(), 'addFeature').and.callFake((f) => {
				oldFeature = f;
			});

			await TestUtils.timeout();
			expect(addInternalFeatureStyleSpy).toHaveBeenCalledWith(oldFeature, map, classUnderTest._vectorLayer);
		});

		it('adds geodesic property on old measurement features', async () => {
			setup();
			const classUnderTest = new OlMeasurementHandler();
			const lastData =
				'<kml xmlns="http://www.opengis.net/kml/2.2" xmlns:gx="http://www.google.com/kml/ext/2.2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opengis.net/kml/2.2 https://developers.google.com/kml/schema/kml22gx.xsd"><Placemark id="measure_1620710146878"><Style><LineStyle><color>ff0000ff</color><width>3</width></LineStyle><PolyStyle><color>660000ff</color></PolyStyle></Style><ExtendedData><Data name="area"/><Data name="measurement"/><Data name="partitions"/></ExtendedData><Polygon><outerBoundaryIs><LinearRing><coordinates>10.66758401,50.09310529 11.77182103,50.08964948 10.57062661,49.66616988 10.66758401,50.09310529</coordinates></LinearRing></outerBoundaryIs></Polygon></Placemark><Placemark id="fooId"><Style><LineStyle><color>ff0000ff</color><width>3</width></LineStyle><PolyStyle><color>660000ff</color></PolyStyle></Style><Polygon><outerBoundaryIs><LinearRing><coordinates>10.66758401,50.09310529 11.77182103,50.08964948 10.57062661,49.66616988 10.66758401,50.09310529</coordinates></LinearRing></outerBoundaryIs></Polygon></Placemark></kml>';
			const map = setupMap();
			const vectorGeoResource = new VectorGeoResource('a_lastId', 'foo', VectorSourceType.KML).setSource(lastData, 4326);
			map.addLayer(new Layer({ geoResourceId: 'a_lastId', render: () => {} }));
			spyOn(fileStorageServiceMock, 'isFileId').and.callFake(() => true);
			spyOn(classUnderTest._overlayService, 'add').and.callFake(() => {});
			spyOn(geoResourceServiceMock, 'byId').and.returnValue(vectorGeoResource);

			classUnderTest.activate(map);

			await TestUtils.timeout();

			const loadedFeatures = classUnderTest._vectorLayer.getSource().getFeatures();
			expect(loadedFeatures.filter((f) => f.get(asInternalProperty(GEODESIC_FEATURE_PROPERTY)) && f.getId().startsWith('measure_'))).toHaveSize(1);
			expect(loadedFeatures.filter((f) => !f.get(asInternalProperty(GEODESIC_FEATURE_PROPERTY)) && !f.getId().startsWith('measure_'))).toHaveSize(1);
		});

		const getLastDataWith = (property, value) => {
			const extendedData = `<Data name="${property}"><value>${value}</value></Data>`;
			return `<kml xmlns="http://www.opengis.net/kml/2.2" xmlns:gx="http://www.google.com/kml/ext/2.2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opengis.net/kml/2.2 https://developers.google.com/kml/schema/kml22gx.xsd"><Placemark id="measure_1620710146878"><Style><LineStyle><color>ff0000ff</color><width>3</width></LineStyle><PolyStyle><color>660000ff</color></PolyStyle></Style><ExtendedData>${extendedData}<Data name="area"/><Data name="measurement"/><Data name="partitions"/></ExtendedData><Polygon><outerBoundaryIs><LinearRing><coordinates>10.66758401,50.09310529 11.77182103,50.08964948 10.57062661,49.66616988 10.66758401,50.09310529</coordinates></LinearRing></outerBoundaryIs></Polygon></Placemark><Placemark id="fooId"><Style><LineStyle><color>ff0000ff</color><width>3</width></LineStyle><PolyStyle><color>660000ff</color></PolyStyle></Style><Polygon><outerBoundaryIs><LinearRing><coordinates>10.66758401,50.09310529 11.77182103,50.08964948 10.57062661,49.66616988 10.66758401,50.09310529</coordinates></LinearRing></outerBoundaryIs></Polygon></Placemark></kml>`;
		};

		it('starts with active drawing based on old measurement features missing', async () => {
			setup();
			const classUnderTest = new OlMeasurementHandler();
			const lastData =
				'<kml xmlns="http://www.opengis.net/kml/2.2" xmlns:gx="http://www.google.com/kml/ext/2.2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opengis.net/kml/2.2 https://developers.google.com/kml/schema/kml22gx.xsd"><Placemark id="draw_1620710146878"><Style><LineStyle><color>ff0000ff</color><width>3</width></LineStyle><PolyStyle><color>660000ff</color></PolyStyle></Style><ExtendedData><Data name="area"/></ExtendedData><Polygon><outerBoundaryIs><LinearRing><coordinates>10.66758401,50.09310529 11.77182103,50.08964948 10.57062661,49.66616988 10.66758401,50.09310529</coordinates></LinearRing></outerBoundaryIs></Polygon></Placemark></kml>';
			const map = setupMap();
			const vectorGeoResource = new VectorGeoResource('a_lastId', 'foo', VectorSourceType.KML).setSource(lastData, 4326);
			map.addLayer(new Layer({ geoResourceId: 'a_lastId', render: () => {} }));
			spyOn(fileStorageServiceMock, 'isFileId').and.callFake(() => true);
			spyOn(classUnderTest._overlayService, 'add').and.callFake(() => {});
			spyOn(geoResourceServiceMock, 'byId').and.returnValue(vectorGeoResource);
			const finishSpy = spyOn(classUnderTest, '_finish').and.callThrough();

			classUnderTest.activate(map);

			await TestUtils.timeout();

			expect(classUnderTest._vectorLayer.getSource().getFeatures().length).toBe(1);
			expect(classUnderTest._measureState.type).toBe(InteractionStateType.ACTIVE);
			expect(classUnderTest._draw.getActive()).toBeTrue();
			expect(classUnderTest._modify.getActive()).toBeFalse();
			expect(finishSpy).not.toHaveBeenCalled();
		});

		it('does NOT start with active drawing, but modify based on old measurement features existing', async () => {
			setup();
			const classUnderTest = new OlMeasurementHandler();
			const lastData =
				'<kml xmlns="http://www.opengis.net/kml/2.2" xmlns:gx="http://www.google.com/kml/ext/2.2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opengis.net/kml/2.2 https://developers.google.com/kml/schema/kml22gx.xsd"><Placemark id="measure_1620710146878"><Style><LineStyle><color>ff0000ff</color><width>3</width></LineStyle><PolyStyle><color>660000ff</color></PolyStyle></Style><ExtendedData><Data name="area"/></ExtendedData><Polygon><outerBoundaryIs><LinearRing><coordinates>10.66758401,50.09310529 11.77182103,50.08964948 10.57062661,49.66616988 10.66758401,50.09310529</coordinates></LinearRing></outerBoundaryIs></Polygon></Placemark></kml>';
			const map = setupMap();
			const vectorGeoResource = new VectorGeoResource('a_lastId', 'foo', VectorSourceType.KML).setSource(lastData, 4326);
			map.addLayer(new Layer({ geoResourceId: 'a_lastId', render: () => {} }));
			spyOn(fileStorageServiceMock, 'isFileId').and.callFake(() => true);
			spyOn(classUnderTest._overlayService, 'add').and.callFake(() => {});
			spyOn(geoResourceServiceMock, 'byId').and.returnValue(vectorGeoResource);
			const finishSpy = spyOn(classUnderTest, '_finish').and.callThrough();

			classUnderTest.activate(map);

			await TestUtils.timeout();

			expect(classUnderTest._vectorLayer.getSource().getFeatures().length).toBe(1);
			expect(classUnderTest._measureState.type).toBe(InteractionStateType.SELECT);
			expect(classUnderTest._draw.getActive()).toBeFalse();
			expect(classUnderTest._modify.getActive()).toBeTrue();
			expect(finishSpy).toHaveBeenCalled();
		});

		it('updates displayruler based on old measurement features with FALSE', async () => {
			const store = setup();
			const classUnderTest = new OlMeasurementHandler();
			const map = setupMap();
			const vectorGeoResource = new VectorGeoResource('a_lastId', 'foo', VectorSourceType.KML).setSource(
				getLastDataWith(asInternalProperty('displayruler'), 'false'),
				4326
			);
			map.addLayer(new Layer({ geoResourceId: 'a_lastId', render: () => {} }));
			spyOn(fileStorageServiceMock, 'isFileId').and.callFake(() => true);
			spyOn(classUnderTest._overlayService, 'add').and.callFake(() => {});
			spyOn(geoResourceServiceMock, 'byId').and.returnValues(vectorGeoResource);

			classUnderTest.activate(map);

			await TestUtils.timeout();

			expect(store.getState().measurement.displayRuler).toBeFalse();
		});

		it('updates displayruler based on old measurement features to TRUE', async () => {
			const store = setup();
			const classUnderTest = new OlMeasurementHandler();
			const map = setupMap();
			const vectorGeoResource = new VectorGeoResource('a_lastId', 'foo', VectorSourceType.KML).setSource(
				getLastDataWith(asInternalProperty('displayruler'), 'true'),
				4326
			);
			map.addLayer(new Layer({ geoResourceId: 'a_lastId', render: () => {} }));
			spyOn(fileStorageServiceMock, 'isFileId').and.callFake(() => true);
			spyOn(classUnderTest._overlayService, 'add').and.callFake(() => {});
			spyOn(geoResourceServiceMock, 'byId').and.returnValue(vectorGeoResource);

			classUnderTest.activate(map);

			await TestUtils.timeout();

			expect(store.getState().measurement.displayRuler).toBeTrue();
		});

		it('updates overlays of old features onChange', async () => {
			setup();
			const classUnderTest = new OlMeasurementHandler();
			const lastData =
				'<kml xmlns="http://www.opengis.net/kml/2.2" xmlns:gx="http://www.google.com/kml/ext/2.2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opengis.net/kml/2.2 https://developers.google.com/kml/schema/kml22gx.xsd"><Placemark id="measure_1620710146878"><Style><LineStyle><color>ff0000ff</color><width>3</width></LineStyle><PolyStyle><color>660000ff</color></PolyStyle></Style><ExtendedData><Data name="area"/><Data name="measurement"/><Data name="partitions"/></ExtendedData><Polygon><outerBoundaryIs><LinearRing><coordinates>10.66758401,50.09310529 11.77182103,50.08964948 10.57062661,49.66616988 10.66758401,50.09310529</coordinates></LinearRing></outerBoundaryIs></Polygon></Placemark></kml>';
			const map = setupMap();
			const vectorGeoResource = new VectorGeoResource('a_lastId', 'foo', VectorSourceType.KML).setSource(lastData, 4326);

			map.addLayer(new Layer({ geoResourceId: 'a_lastId', render: () => {} }));
			spyOn(fileStorageServiceMock, 'isFileId').and.callFake(() => true);
			spyOn(classUnderTest._overlayService, 'add').and.callFake(() => {});
			spyOn(geoResourceServiceMock, 'byId').and.returnValue(vectorGeoResource);
			const updateOverlaysSpy = spyOn(classUnderTest._styleService, 'updateInternalFeatureStyle');
			let oldFeature;

			classUnderTest.activate(map);
			spyOn(classUnderTest._vectorLayer.getSource(), 'addFeature').and.callFake((f) => {
				oldFeature = f;
			});

			await TestUtils.timeout();
			oldFeature.getGeometry().dispatchEvent('change');
			expect(updateOverlaysSpy).toHaveBeenCalledTimes(1);
		});

		it('updates measurement property of old features onChange', async () => {
			setup();
			const classUnderTest = new OlMeasurementHandler();
			const lastData =
				'<kml xmlns="http://www.opengis.net/kml/2.2" xmlns:gx="http://www.google.com/kml/ext/2.2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opengis.net/kml/2.2 https://developers.google.com/kml/schema/kml22gx.xsd"><Placemark id="measure_1620710146878"><Style><LineStyle><color>ff0000ff</color><width>3</width></LineStyle><PolyStyle><color>660000ff</color></PolyStyle></Style><ExtendedData><Data name="area"/><Data name="measurement"/><Data name="partitions"/></ExtendedData><Polygon><outerBoundaryIs><LinearRing><coordinates>10.66758401,50.09310529 11.77182103,50.08964948 10.57062661,49.66616988 10.66758401,50.09310529</coordinates></LinearRing></outerBoundaryIs></Polygon></Placemark></kml>';
			const map = setupMap();
			const vectorGeoResource = new VectorGeoResource('a_lastId', 'foo', VectorSourceType.KML).setSource(lastData, 4326);

			map.addLayer(new Layer({ geoResourceId: 'a_lastId', render: () => {} }));
			spyOn(fileStorageServiceMock, 'isFileId').and.callFake(() => true);
			spyOn(classUnderTest._overlayService, 'add').and.callFake(() => {});
			spyOn(geoResourceServiceMock, 'byId').and.returnValue(vectorGeoResource);
			let oldFeature, styledOldFeature, measureGeometry;
			const updateOverlaysSpy = spyOn(classUnderTest._styleService, 'updateInternalFeatureStyle').and.callFake((f, m, props) => {
				styledOldFeature = f;
				measureGeometry = props.geometry;
			});

			classUnderTest.activate(map);
			spyOn(classUnderTest._vectorLayer.getSource(), 'addFeature').and.callFake((f) => {
				oldFeature = f;
			});
			await TestUtils.timeout();

			//reset feature property to detect a change
			oldFeature.set(asInternalProperty(PROJECTED_LENGTH_GEOMETRY_PROPERTY), 0);
			expect(oldFeature.get(asInternalProperty(PROJECTED_LENGTH_GEOMETRY_PROPERTY))).toBe(0);

			oldFeature.dispatchEvent('change');
			expect(updateOverlaysSpy).toHaveBeenCalledTimes(1);
			expect(oldFeature.get(asInternalProperty(PROJECTED_LENGTH_GEOMETRY_PROPERTY))).toBe(1);
			expect(styledOldFeature.get(asInternalProperty(PROJECTED_LENGTH_GEOMETRY_PROPERTY))).toBe(1);
			expect(measureGeometry.get(asInternalProperty(PROJECTED_LENGTH_GEOMETRY_PROPERTY))).toBe(1);
		});

		it('adds a drawn feature to the selection, after adding to layer (on addFeature)', async () => {
			const geometry = new LineString([
				[0, 0],
				[500, 0],
				[550, 550],
				[0, 500],
				[0, 500]
			]);
			const feature = new Feature({ geometry: geometry });
			feature.setId('measure');
			const store = setup();
			const classUnderTest = new OlMeasurementHandler();
			const map = setupMap();

			classUnderTest.activate(map);
			await TestUtils.timeout();
			classUnderTest._measureState.type = InteractionStateType.DRAW;
			classUnderTest._vectorLayer.getSource().addFeature(feature);

			expect(store.getState().measurement.selection).toEqual(['measure']);
		});

		it("updates statistic and overlays of features on 'change'", () => {
			setup();
			const map = setupMap();
			const geometry = new LineString([
				[0, 0],
				[500, 0],
				[550, 550],
				[0, 500],
				[0, 500]
			]);
			const feature = new Feature({ geometry: geometry });
			feature.setId('measure');

			const classUnderTest = new OlMeasurementHandler();

			classUnderTest.activate(map);
			simulateDrawEvent('drawstart', classUnderTest._draw, feature);
			feature.getGeometry().dispatchEvent('change');
			simulateDrawEvent('drawend', classUnderTest._draw, feature);
			// modify is activated after draw ends

			const updateOverlaysSpy = spyOn(classUnderTest._overlayService, 'update');
			const statsSpy = spyOn(classUnderTest, '_updateStatistic');
			feature.getGeometry().dispatchEvent('change');

			expect(statsSpy).toHaveBeenCalledTimes(1);
			expect(updateOverlaysSpy).toHaveBeenCalledTimes(1);
		});

		it('sets a geodesic geometry on drawstart', () => {
			setup();
			const map = setupMap();
			const geometry = new LineString([
				[0, 0],
				[500, 0],
				[550, 550],
				[0, 500],
				[0, 500]
			]);
			const feature = new Feature({ geometry: geometry });
			feature.setId('measure');

			const classUnderTest = new OlMeasurementHandler();

			classUnderTest.activate(map);
			simulateDrawEvent('drawstart', classUnderTest._draw, feature);

			expect(feature.get(asInternalProperty(GEODESIC_FEATURE_PROPERTY))).toEqual(jasmine.any(GeodesicGeometry));
		});

		it("updates overlays while drawing on 'change:Resolution'", async () => {
			setup();
			const classUnderTest = new OlMeasurementHandler();
			const map = setupMap();

			const updateOverlaysSpy = spyOn(classUnderTest._overlayService, 'update');
			const geometry = new LineString([
				[0, 0],
				[500, 0],
				[550, 550],
				[0, 500],
				[0, 500]
			]);
			const feature = new Feature({ geometry: geometry });
			feature.setId('measure');

			classUnderTest.activate(map);
			simulateDrawEvent('drawstart', classUnderTest._draw, feature);

			await TestUtils.timeout();
			map.getView().dispatchEvent('change:resolution');
			expect(updateOverlaysSpy).toHaveBeenCalledTimes(1);
		});

		it("removes overlays of features on 'drawabort'", () => {
			setup();
			const map = setupMap();
			const geometry = new LineString([
				[0, 0],
				[500, 0],
				[550, 550],
				[0, 500],
				[0, 500]
			]);
			const feature = new Feature({ geometry: geometry });
			feature.setId('measure');

			const classUnderTest = new OlMeasurementHandler();
			const updateOverlaysSpy = spyOn(classUnderTest._overlayService, 'remove');
			classUnderTest.activate(map);
			simulateDrawEvent('drawabort', classUnderTest._draw, feature);

			expect(updateOverlaysSpy).toHaveBeenCalledTimes(1);
		});

		it("updates 'displayruler' property and style of features when store changes", async () => {
			setup();
			const classUnderTest = new OlMeasurementHandler();
			const lastData =
				'<kml xmlns="http://www.opengis.net/kml/2.2" xmlns:gx="http://www.google.com/kml/ext/2.2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opengis.net/kml/2.2 https://developers.google.com/kml/schema/kml22gx.xsd"><Placemark id="measure_1620710146878"><Style><LineStyle><color>ff0000ff</color><width>3</width></LineStyle><PolyStyle><color>660000ff</color></PolyStyle></Style><ExtendedData><Data name="area"/><Data name="measurement"/><Data name="partitions"/></ExtendedData><Polygon><outerBoundaryIs><LinearRing><coordinates>10.66758401,50.09310529 11.77182103,50.08964948 10.57062661,49.66616988 10.66758401,50.09310529</coordinates></LinearRing></outerBoundaryIs></Polygon></Placemark></kml>';
			const map = setupMap();
			const vectorGeoResource = new VectorGeoResource('a_lastId', 'foo', VectorSourceType.KML).setSource(lastData, 4326);

			map.addLayer(new Layer({ geoResourceId: 'a_lastId', render: () => {} }));
			spyOn(fileStorageServiceMock, 'isFileId').and.callFake(() => true);
			spyOn(classUnderTest._overlayService, 'add').and.callFake(() => {});
			spyOn(geoResourceServiceMock, 'byId').and.returnValue(vectorGeoResource);
			const updateOverlaysSpy = spyOn(classUnderTest._styleService, 'updateInternalFeatureStyle');
			const updateStyleSpy = spyOn(classUnderTest, '_updateStyle').and.callThrough();
			classUnderTest.activate(map);

			await TestUtils.timeout();

			// store changes
			setDisplayRuler(false);
			expect(
				classUnderTest._vectorLayer
					.getSource()
					.getFeatures()
					.every((f) => f.get(asInternalProperty('displayruler')) === 'false')
			);
			expect(updateOverlaysSpy).toHaveBeenCalledTimes(1);
			expect(updateStyleSpy).toHaveBeenCalledTimes(1);
			updateOverlaysSpy.calls.reset();

			// store changes
			setDisplayRuler(true);

			expect(
				classUnderTest._vectorLayer
					.getSource()
					.getFeatures()
					.every((f) => f.get(asInternalProperty('displayruler')) === 'true')
			);
			expect(updateOverlaysSpy).toHaveBeenCalledTimes(1);
			expect(updateStyleSpy).toHaveBeenCalledTimes(2);
		});
	});

	describe('when deactivated over olMap', () => {
		it('writes features to kml format for persisting purpose', async () => {
			const store = await setup(initialMeasureState, { ...initialFileStorageState, fileId: 'f_ooBarId' });
			const classUnderTest = new OlMeasurementHandler();
			const map = setupMap();
			const feature = createFeature();

			classUnderTest.activate(map);
			await TestUtils.timeout();
			classUnderTest._vectorLayer.getSource().addFeature(feature);
			classUnderTest.deactivate(map);

			await TestUtils.timeout();
			expect(store.getState().fileStorage.data).toContain('<kml');
		});

		it('adds a vectorGeoResource for persisting purpose', async () => {
			const fileStorageState = { ...initialFileStorageState, fileId: 'f_ooBarId' };
			setup(initialMeasureState, fileStorageState);
			const classUnderTest = new OlMeasurementHandler();
			const map = setupMap();
			const feature = createFeature();
			const addOrReplaceSpy = spyOn(geoResourceServiceMock, 'addOrReplace');
			classUnderTest.activate(map);
			await TestUtils.timeout();
			classUnderTest._vectorLayer.getSource().addFeature(feature);
			classUnderTest.deactivate(map);

			await TestUtils.timeout();
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
			const fileStorageState = { ...initialFileStorageState, fileId: 'f_ooBarId' };
			const store = await setup(initialMeasureState, fileStorageState);
			const classUnderTest = new OlMeasurementHandler();
			const map = setupMap();
			const feature = createFeature();

			classUnderTest.activate(map);
			await TestUtils.timeout();
			expect(classUnderTest._vectorLayer).toBeTruthy();
			classUnderTest._vectorLayer.getSource().addFeature(feature);
			classUnderTest.deactivate(map);

			await TestUtils.timeout();
			expect(store.getState().layers.active.length).toBe(1);
			expect(store.getState().layers.active[0].id).toBe('f_ooBarId_draw');
			expect(store.getState().layers.active[0].geoResourceId).toBe('f_ooBarId');
			expect(store.getState().layers.active[0].constraints.metaData).toBeFalse();
		});

		it('adds layer and reuse id of old layer', async () => {
			const fileStorageState = { ...initialFileStorageState, fileId: 'f_ooBarId' };
			const lastData =
				'<kml xmlns="http://www.opengis.net/kml/2.2" xmlns:gx="http://www.google.com/kml/ext/2.2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opengis.net/kml/2.2 https://developers.google.com/kml/schema/kml22gx.xsd"><Placemark id="measurement_1620710146878"><Style><LineStyle><color>ff0000ff</color><width>3</width></LineStyle><PolyStyle><color>660000ff</color></PolyStyle></Style><ExtendedData><Data name="area"/><Data name="measurement"/><Data name="partitions"/></ExtendedData><Polygon><outerBoundaryIs><LinearRing><coordinates>10.66758401,50.09310529 11.77182103,50.08964948 10.57062661,49.66616988 10.66758401,50.09310529</coordinates></LinearRing></outerBoundaryIs></Polygon></Placemark></kml>';

			const vectorGeoResource = new VectorGeoResource('f_ooBarId', 'foo', VectorSourceType.KML).setSource(lastData, 4326);
			spyOn(geoResourceServiceMock, 'byId').and.returnValue(vectorGeoResource);
			const store = await setup(initialMeasureState, fileStorageState);
			const classUnderTest = new OlMeasurementHandler();

			const map = setupMap();
			const feature = createFeature();
			const saveSpy = spyOn(classUnderTest, '_save').and.callThrough();
			spyOn(fileStorageServiceMock, 'isAdminId').withArgs('f_ooBarId').and.returnValue(true);

			// we add an existing(old) fileStorage related layer
			map.addLayer(new Layer({ id: 'a_oldLayer_id', geoResourceId: 'f_ooBarId', render: () => {} }));

			classUnderTest.activate(map);
			await TestUtils.timeout();
			expect(saveSpy).not.toHaveBeenCalledTimes(1);
			expect(classUnderTest._layerId).toBe('a_oldLayer_id');
			expect(classUnderTest._vectorLayer).toBeTruthy();
			classUnderTest._vectorLayer.getSource().addFeature(feature);
			classUnderTest.deactivate(map);

			await TestUtils.timeout();
			expect(classUnderTest._layerId).toBeNull();
			expect(store.getState().layers.active.length).toBe(1);
			expect(store.getState().layers.active[0].id).toBe('a_oldLayer_id');
			expect(store.getState().layers.active[0].geoResourceId).toBe('f_ooBarId');
			expect(store.getState().layers.active[0].constraints.metaData).toBeFalse();
		});

		it('adds no layer when empty', async () => {
			const store = setup();
			const classUnderTest = new OlMeasurementHandler();
			const map = setupMap();

			classUnderTest.activate(map);
			await TestUtils.timeout();
			expect(classUnderTest._vectorLayer).toBeTruthy();
			classUnderTest.deactivate(map);

			await TestUtils.timeout();
			expect(store.getState().layers.active.length).toBe(0);
		});

		it('clears the drawing listeners', async () => {
			await setup();
			const classUnderTest = new OlMeasurementHandler();
			const map = setupMap();
			const geometry = new LineString([
				[0, 0],
				[1, 0]
			]);
			const feature = new Feature({ geometry: geometry });

			classUnderTest.activate(map);
			await TestUtils.timeout();
			simulateDrawEvent('drawstart', classUnderTest._draw, feature);

			expect(classUnderTest._drawingListeners).toHaveSize(2);

			classUnderTest.deactivate(map);

			expect(classUnderTest._drawingListeners).toEqual(jasmine.arrayWithExactContents([{}, {}]));
		});

		it('does NOT clears the selection, if select-interaction is missing ', async () => {
			await setup();
			const classUnderTest = new OlMeasurementHandler();
			const map = setupMap();

			classUnderTest.activate(map);
			await TestUtils.timeout();
			const spy = spyOn(classUnderTest._vectorLayer.getSource(), 'getFeatureById').and.callThrough();
			classUnderTest.deactivate(map);

			classUnderTest._setSelection([]);

			expect(spy).not.toHaveBeenCalled();
		});
	});

	describe('when draw a line', () => {
		it('removes partition tooltips after zoom out', () => {
			setup();
			const classUnderTest = new OlMeasurementHandler();
			const map = setupMap([0, 0], 16);
			const geometry = new LineString([
				[0, 0],
				[1234, 0]
			]);
			const feature = new Feature({ geometry: geometry });

			classUnderTest.activate(map);
			classUnderTest._sketchHandler.activate(feature);
			simulateDrawEvent('drawstart', classUnderTest._draw, feature);
			spyOn(mapServiceMock, 'calcLength').and.returnValue(1234);
			feature.getGeometry().dispatchEvent('change');

			expect(feature.get(asInternalProperty('partitions')).length).toBe(12);

			map.getView().setZoom(13);

			expect(feature.get(asInternalProperty('partitions')).length).toBe(1);
		});

		it('removes area tooltip after finish drawing', () => {
			setup();
			const classUnderTest = new OlMeasurementHandler();
			const map = setupMap();
			const snappedGeometry = new Polygon([
				[
					[0, 0],
					[500, 0],
					[550, 550],
					[0, 500],
					[0, 0]
				]
			]);
			const feature = new Feature({ geometry: snappedGeometry });

			classUnderTest.activate(map);
			const updateSpy = spyOn(classUnderTest._overlayService, 'update').and.callThrough();
			simulateDrawEvent('drawstart', classUnderTest._draw, feature);
			feature.getGeometry().dispatchEvent('change');
			expect(feature.get(asInternalProperty('area'))).toBeTruthy();
			simulateDrawEvent('drawend', classUnderTest._draw, feature);

			expect(feature.get(asInternalProperty('area'))).toBeFalsy();
			expect(updateSpy).toHaveBeenCalledWith(feature, jasmine.any(Map), 'measure', jasmine.objectContaining({ geometry: jasmine.any(Geometry) }));
		});

		it('unregister tooltip-listener after finish drawing', () => {
			setup();
			const classUnderTest = new OlMeasurementHandler();
			const map = setupMap();
			const geometry = new LineString([
				[0, 0],
				[1, 0]
			]);
			const feature = new Feature({ geometry: geometry });

			classUnderTest.activate(map);

			simulateDrawEvent('drawstart', classUnderTest._draw, feature);
			feature.getGeometry().dispatchEvent('change');
			simulateDrawEvent('drawend', classUnderTest._draw, feature);

			const baOverlay = feature.get(asInternalProperty('measurement')).getElement();

			expect(baOverlay.static).toBeTrue();
			expect(feature.get(asInternalProperty('measurement')).getOffset()).toEqual([0, -15]);
		});

		it('feature gets valid id start drawing', () => {
			setup();
			const classUnderTest = new OlMeasurementHandler();
			const map = setupMap();
			const geometry = new LineString([
				[0, 0],
				[1, 0]
			]);
			const feature = new Feature({ geometry: geometry });

			classUnderTest.activate(map);

			simulateDrawEvent('drawstart', classUnderTest._draw, feature);

			const id = feature.getId();

			expect(id).toBeTruthy();
			expect(id).toMatch(/measure_[0-9]{13}/g);
		});

		it('feature gets style properties for sketch features', () => {
			setup();
			const classUnderTest = new OlMeasurementHandler();
			const sketchStyleSpy = spyOn(classUnderTest, '_getSketchStyleOptions').and.callThrough();
			const map = setupMap();
			const geometry = new Polygon([
				[
					[0, 0],
					[1, 0],
					[0, 1]
				]
			]);
			const feature = new Feature({ geometry: geometry });

			classUnderTest.activate(map);

			simulateDrawEvent('drawstart', classUnderTest._draw, feature);
			feature.dispatchEvent('change');

			expect(sketchStyleSpy).toHaveBeenCalled();
			expect(feature.get(asInternalProperty('displayruler'))).toBe('true');
		});

		it('positions tooltip content on the end of not closed Polygon', () => {
			setup();
			const classUnderTest = new OlMeasurementHandler();
			const map = setupMap();
			const snappedGeometry = new Polygon([
				[
					[0, 0],
					[500, 0],
					[550, 550],
					[0, 500],
					[0, 0]
				]
			]);
			const feature = new Feature({ geometry: snappedGeometry });

			classUnderTest.activate(map);
			simulateDrawEvent('drawstart', classUnderTest._draw, feature);
			feature.getGeometry().dispatchEvent('change');

			const overlay = feature.get(asInternalProperty('measurement'));

			expect(overlay.getPosition()[0]).toBe(0);
			expect(overlay.getPosition()[1]).toBeCloseTo(500, 0);
		});

		it('positions tooltip content on the end of a updated not closed Polygon', () => {
			setup();
			const classUnderTest = new OlMeasurementHandler();
			const map = setupMap();
			const snappedGeometry = new Polygon([
				[
					[0, 0],
					[500, 0],
					[550, 550],
					[0, 500],
					[0, 500]
				]
			]);
			const feature = new Feature({ geometry: snappedGeometry });

			classUnderTest.activate(map);
			simulateDrawEvent('drawstart', classUnderTest._draw, feature);
			feature.getGeometry().dispatchEvent('change');

			const overlay = feature.get(asInternalProperty('measurement'));
			expect(overlay.getPosition()[0]).toBe(0);
			expect(overlay.getPosition()[1]).toBeCloseTo(500, 0);
			snappedGeometry.setCoordinates([
				[
					[0, 0],
					[500, 0],
					[550, 550],
					[0, 500],
					[0, 250],
					[0, 250]
				]
			]);
			feature.getGeometry().dispatchEvent('change');
			simulateDrawEvent('drawend', classUnderTest._draw, feature);

			expect(overlay.getPosition()[0]).toBe(0);
			expect(overlay.getPosition()[1]).toBeCloseTo(250, 0);
		});

		it('removes last point if keypressed', () => {
			setup();
			const classUnderTest = new OlMeasurementHandler();
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
			const deleteKeyCode = 46;

			classUnderTest.activate(map);
			simulateDrawEvent('drawstart', classUnderTest._draw, feature);
			classUnderTest._draw.removeLastPoint = jasmine.createSpy();
			classUnderTest._draw.handleEvent = jasmine.createSpy().and.callThrough();
			feature.getGeometry().dispatchEvent('change');
			expect(classUnderTest._modify.getActive()).toBeFalse();

			simulateKeyEvent(deleteKeyCode, 'Delete');
			expect(classUnderTest._draw.removeLastPoint).toHaveBeenCalled();
		});

		it('removes NOT last point if other keypressed', () => {
			setup();
			const classUnderTest = new OlMeasurementHandler();
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
			const someKeyCode = 42;

			classUnderTest.activate(map);
			simulateDrawEvent('drawstart', classUnderTest._draw, feature);
			classUnderTest._draw.removeLastPoint = jasmine.createSpy();
			feature.getGeometry().dispatchEvent('change');

			simulateKeyEvent(someKeyCode, 'some');
			expect(classUnderTest._draw.removeLastPoint).not.toHaveBeenCalled();
		});

		it('removes currently drawing two-point feature if keypressed', () => {
			setup();
			const classUnderTest = new OlMeasurementHandler();
			const startNewSpy = spyOn(classUnderTest, '_startNew');
			const map = setupMap();
			const geometry = new Polygon([
				[
					[0, 0],
					[0, 1]
				]
			]);
			const feature = new Feature({ geometry: geometry });
			const deleteKeyCode = 46;

			classUnderTest.activate(map);
			simulateDrawEvent('drawstart', classUnderTest._draw, feature);
			feature.getGeometry().dispatchEvent('change');
			expect(classUnderTest._modify.getActive()).toBeFalse();

			simulateKeyEvent(deleteKeyCode, 'Delete');
			expect(startNewSpy).toHaveBeenCalled();
		});

		it('removes drawn feature if keypressed', async () => {
			setup();
			const classUnderTest = new OlMeasurementHandler();
			const map = setupMap();
			const deleteKeyCode = 46;

			classUnderTest.activate(map);

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
			feature.setId('measure_');
			const removeFeatureSpy = spyOn(classUnderTest._vectorLayer.getSource(), 'removeFeature').and.callFake(() => {});

			classUnderTest._vectorLayer.getSource().addFeature(feature);
			classUnderTest._select.getFeatures().push(feature);
			classUnderTest._modify.setActive(true);
			simulateKeyEvent(deleteKeyCode, 'Delete');

			await TestUtils.timeout();
			expect(removeFeatureSpy).toHaveBeenCalledWith(feature);
		});

		it('aborts measurement if keyup', async () => {
			setup();
			const classUnderTest = new OlMeasurementHandler();
			const map = setupMap();
			const abortKeyCode = 27;

			classUnderTest.activate(map);

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
			feature.setId('measure_');
			const startNewSpy = spyOn(classUnderTest, '_startNew').and.callThrough();

			classUnderTest._vectorLayer.getSource().addFeature(feature);
			classUnderTest._select.getFeatures().push(feature);
			classUnderTest._modify.setActive(true);
			simulateKeyEvent(abortKeyCode, 'Escape');

			await TestUtils.timeout();
			expect(startNewSpy).toHaveBeenCalled();
		});
	});

	describe('when storing layer', () => {
		const afterDebounceDelay = OlMeasurementHandler.Debounce_Delay + 100;

		describe('debouncing takes place', () => {
			it('stores once after a single change of a feature', async () => {
				setup();
				const classUnderTest = new OlMeasurementHandler();
				const map = setupMap();

				const geometry = new LineString([
					[0, 0],
					[1, 0]
				]);
				const feature = new Feature({ geometry: geometry });

				classUnderTest.activate(map);
				await TestUtils.timeout();
				const privateSaveSpy = spyOn(classUnderTest, '_save').and.callFake(() => {});
				classUnderTest._vectorLayer.getSource().addFeature(feature); // -> first call of _save, caused by vectorsource:addfeature-event
				feature.getGeometry().dispatchEvent('change'); // -> second call of _save, caused by vectorsource:changefeature-event
				feature.getGeometry().dispatchEvent('change'); // -> third call of _save, caused by vectorsource:changefeature-event
				await TestUtils.timeout(afterDebounceDelay);
				expect(privateSaveSpy).toHaveBeenCalledTimes(3);
			});

			it('stores once after a feature removed', async () => {
				setup();
				const classUnderTest = new OlMeasurementHandler();
				const map = setupMap();

				const geometry = new LineString([
					[0, 0],
					[1, 0]
				]);
				const feature = new Feature({ geometry: geometry });
				feature.set('debug', 'stores once after a feature removed');
				classUnderTest.activate(map);
				await TestUtils.timeout();
				const privateSaveSpy = spyOn(classUnderTest, '_save').and.callFake(() => {});

				classUnderTest._vectorLayer.getSource().addFeature(feature); // -> first call of debounced _save, caused by vectorsource:addfeature-event
				classUnderTest._vectorLayer.getSource().removeFeature(feature); // -> second call of debounced _save, caused by vectorsource:removefeature-event
				await TestUtils.timeout(afterDebounceDelay);

				expect(privateSaveSpy).toHaveBeenCalledTimes(2);
			});

			describe('when in embedded mode', () => {
				const withinDebounceDelay = OlMeasurementHandler.Debounce_Delay / 10;
				it('stores after each change of a feature', async () => {
					setup();
					spyOn(environmentServiceMock, 'isEmbedded').and.returnValue(true);
					const classUnderTest = new OlMeasurementHandler();
					const map = setupMap();
					const geometry = new LineString([
						[0, 0],
						[1, 0]
					]);
					const feature = new Feature({ geometry: geometry });
					classUnderTest.activate(map);
					await TestUtils.timeout();
					const privateSaveSpy = spyOn(classUnderTest, '_save').and.callFake(() => {});

					classUnderTest._vectorLayer.getSource().addFeature(feature); // -> call of debounced _save, caused by vectorsource:addfeature-event
					feature.dispatchEvent('change'); // -> second call of debounced _save, caused by vectorsource:changefeature-event
					await TestUtils.timeout(withinDebounceDelay);
					feature.dispatchEvent('change');
					await TestUtils.timeout(withinDebounceDelay);
					feature.dispatchEvent('change');
					await TestUtils.timeout(withinDebounceDelay);
					feature.dispatchEvent('change');
					await TestUtils.timeout(withinDebounceDelay);

					expect(privateSaveSpy).toHaveBeenCalledTimes(5);
				});
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
		it('deactivates dblclick', () => {
			setup();
			const classUnderTest = new OlMeasurementHandler();
			const map = setupMap(null, 1);

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

			expect(measureStateSpy).toHaveBeenCalledWith({
				type: InteractionStateType.ACTIVE,
				snap: null,
				coordinate: [10, 0],
				pointCount: 0,
				dragging: jasmine.any(Boolean)
			});
			classUnderTest._sketchHandler.activate(
				new Feature({
					geometry: new LineString([
						[0, 0],
						[1, 0]
					])
				}),
				map
			);
			simulateMapBrowserEvent(map, MapBrowserEventType.POINTERMOVE, 20, 0);
			expect(measureStateSpy).toHaveBeenCalledWith({
				type: InteractionStateType.DRAW,
				snap: null,
				coordinate: [20, 0],
				pointCount: 1,
				dragging: jasmine.any(Boolean)
			});
		});

		it('change measureState, when sketch is snapping to first point', () => {
			setup();
			const classUnderTest = new OlMeasurementHandler();
			const snappedGeometry = new Polygon([
				[
					[0, 0],
					[500, 0],
					[550, 550],
					[0, 500],
					[0, 500]
				]
			]);
			const feature = new Feature({ geometry: snappedGeometry });

			const map = setupMap();

			classUnderTest.activate(map);
			const measureStateSpy = spyOn(classUnderTest._helpTooltip, 'notify');

			simulateMapBrowserEvent(map, MapBrowserEventType.POINTERMOVE, 10, 0);
			expect(measureStateSpy).toHaveBeenCalledWith({
				type: InteractionStateType.ACTIVE,
				snap: null,
				coordinate: [10, 0],
				pointCount: 0,
				dragging: jasmine.any(Boolean)
			});

			simulateDrawEvent('drawstart', classUnderTest._draw, feature);
			snappedGeometry.setCoordinates([
				[
					[0, 0],
					[500, 0],
					[550, 550],
					[0, 500],
					[0, 0],
					[0, 0]
				]
			]);
			feature.getGeometry().dispatchEvent('change');

			simulateMapBrowserEvent(map, MapBrowserEventType.POINTERMOVE, 0, 0);
			expect(measureStateSpy).toHaveBeenCalledWith({
				type: InteractionStateType.DRAW,
				snap: InteractionSnapType.FIRSTPOINT,
				coordinate: [0, 0],
				pointCount: 5,
				dragging: jasmine.any(Boolean)
			});
		});

		it('change measureState, when sketch is snapping to last point', () => {
			setup();
			const classUnderTest = new OlMeasurementHandler();

			const snappedGeometry = new Polygon([
				[
					[0, 0],
					[500, 0],
					[550, 550],
					[0, 500],
					[0, 500]
				]
			]);
			const feature = new Feature({ geometry: snappedGeometry });
			const map = setupMap();

			classUnderTest.activate(map);
			const measureStateSpy = spyOn(classUnderTest._helpTooltip, 'notify');

			simulateMapBrowserEvent(map, MapBrowserEventType.POINTERMOVE, 10, 0);
			expect(measureStateSpy).toHaveBeenCalledWith({
				type: InteractionStateType.ACTIVE,
				snap: null,
				coordinate: [10, 0],
				pointCount: 0,
				dragging: jasmine.any(Boolean)
			});

			simulateDrawEvent('drawstart', classUnderTest._draw, feature);
			snappedGeometry.setCoordinates([
				[
					[0, 0],
					[500, 0],
					[550, 550],
					[0, 500],
					[0, 500],
					[0, 500]
				]
			]);
			feature.getGeometry().dispatchEvent('change');
			simulateMapBrowserEvent(map, MapBrowserEventType.POINTERMOVE, 0, 500);
			expect(measureStateSpy).toHaveBeenCalledWith({
				type: InteractionStateType.DRAW,
				snap: InteractionSnapType.LASTPOINT,
				coordinate: [0, 500],
				pointCount: 5,
				dragging: jasmine.any(Boolean)
			});
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
			spyOn(mapServiceMock, 'calcLength').and.returnValue(500);
			spyOn(mapServiceMock, 'calcArea').and.returnValue(0);
			firstPointGeometry.setCoordinates([
				[
					[0, 0],
					[500, 0],
					[0, 0]
				]
			]);
			feature.getGeometry().dispatchEvent('change');
			expect(store.getState().measurement.statistic.length).toBe(500);
			expect(store.getState().measurement.statistic.area).toBe(0);
		});

		it('change measureState, when mouse enters draggable overlay', () => {
			setup();
			const classUnderTest = new OlMeasurementHandler();
			const map = setupMap();

			classUnderTest.activate(map);
			const measureStateSpy = spyOn(classUnderTest._helpTooltip, 'notify');

			const overlayMock = {
				set: () => {},
				get: (value) => {
					switch (value) {
						case 'feature':
							return { dispatchEvent: () => {} };
						default:
							return true;
					}
				},
				setOffset: () => {},
				setPosition: () => {}
			};
			const feature = new Feature({
				geometry: new Polygon([
					[
						[0, 0],
						[500, 0],
						[550, 550],
						[0, 500],
						[0, 500]
					]
				]),
				_ba_overlays: [overlayMock]
			});
			const layerMock = {
				getSource() {
					return { getFeatures: () => [feature] };
				}
			};
			classUnderTest._vectorLayer = layerMock;
			simulateMapBrowserEvent(map, MapBrowserEventType.POINTERMOVE, 10, 0);

			expect(measureStateSpy).toHaveBeenCalledWith({
				type: InteractionStateType.OVERLAY,
				snap: null,
				coordinate: [10, 0],
				pointCount: 0,
				dragging: jasmine.any(Boolean)
			});
		});

		it('uses _lastPointerMoveEvent on removeLast if keypressed', () => {
			setup();
			const classUnderTest = new OlMeasurementHandler();
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
			simulateDrawEvent('drawstart', classUnderTest._draw, feature);
			simulateMapBrowserEvent(map, MapBrowserEventType.POINTERMOVE, 10, 0);
			classUnderTest._draw.removeLastPoint = jasmine.createSpy();
			classUnderTest._draw.handleEvent = jasmine.createSpy().and.callThrough();
			feature.getGeometry().dispatchEvent('change');
			expect(classUnderTest._modify.getActive()).toBeFalse();

			simulateKeyEvent(deleteKeyCode, 'Delete');
			expect(classUnderTest._measureState.type).toBe(InteractionStateType.DRAW);
			expect(classUnderTest._draw.removeLastPoint).toHaveBeenCalled();
			expect(classUnderTest._draw.handleEvent).toHaveBeenCalledWith(jasmine.any(MapBrowserEvent));
		});

		it('add the drawn feature to select after drawends', async () => {
			setup();
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
			feature.setId('measure_1');

			const map = setupMap();
			const classUnderTest = new OlMeasurementHandler();
			classUnderTest.activate(map);
			await TestUtils.timeout();
			classUnderTest._measureState.type = InteractionStateType.DRAW;
			classUnderTest._vectorLayer.getSource().addFeature(feature);

			expect(classUnderTest._select).toBeDefined();
			expect(classUnderTest._select.getFeatures().getLength()).toBe(1);
		});

		it('calls draw.finishDrawing after finish-action', () => {
			setup();
			const classUnderTest = new OlMeasurementHandler();
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

			classUnderTest.activate(map);
			const spy = spyOn(classUnderTest._draw, 'abortDrawing').and.callThrough();
			simulateDrawEvent('drawstart', classUnderTest._draw, feature);
			feature.getGeometry().dispatchEvent('change');

			reset();
			expect(spy).toHaveBeenCalled();
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
				const classUnderTest = new OlMeasurementHandler();
				const map = setupMap();

				map.forEachFeatureAtPixel = jasmine.createSpy().and.callThrough();
				const measureStateSpy = spyOn(classUnderTest._helpTooltip, 'notify');

				classUnderTest.activate(map);
				classUnderTest._select.getFeatures().push(feature);
				classUnderTest._modify.setActive(true);

				simulateMapBrowserEvent(map, MapBrowserEventType.POINTERMOVE, 10, 0);

				expect(map.forEachFeatureAtPixel).toHaveBeenCalledWith([10, 0], jasmine.any(Function), jasmine.any(Object));
				expect(measureStateSpy).toHaveBeenCalledWith({
					type: InteractionStateType.MODIFY,
					snap: null,
					coordinate: [10, 0],
					pointCount: 0,
					dragging: jasmine.any(Boolean),
					geometryType: jasmine.any(String)
				});
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
				expect(measureStateSpy).toHaveBeenCalledWith({
					type: InteractionStateType.MODIFY,
					snap: InteractionSnapType.EDGE,
					coordinate: [50, 0],
					pointCount: jasmine.anything(),
					dragging: jasmine.any(Boolean),
					geometryType: jasmine.any(String)
				});
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
				expect(measureStateSpy).toHaveBeenCalledWith({
					type: InteractionStateType.MODIFY,
					snap: InteractionSnapType.VERTEX,
					coordinate: [0, 0],
					pointCount: jasmine.anything(),
					dragging: jasmine.any(Boolean),
					geometryType: 'LineString'
				});
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

			it('updates feature property while geometry changes', () => {
				setup();
				const expectedLength = 42;
				const classUnderTest = new OlMeasurementHandler();
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
				feature.set(asInternalProperty('projectedLength'), 0);
				classUnderTest.activate(map);
				simulateDrawEvent('drawstart', classUnderTest._draw, feature);

				simulateDrawEvent('drawend', classUnderTest._draw, feature);
				const calcLengthSpy = spyOn(mapServiceMock, 'calcLength').and.returnValue(expectedLength);
				feature.getGeometry().dispatchEvent('change');

				expect(calcLengthSpy).toHaveBeenCalled();
				expect(feature.get(asInternalProperty('projectedLength'))).toBe(expectedLength);
			});
		});

		describe('drags overlays', () => {
			it('change overlay-property on pointerdown', () => {
				const state = { ...initialMeasureState, active: true };
				setup(state);
				const classUnderTest = new OlMeasurementHandler();
				const map = setupMap();
				classUnderTest.activate(map);

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
				feature.getGeometry().dispatchEvent('change');
				simulateDrawEvent('drawend', classUnderTest._draw, feature);
				const overlay = feature.get(asInternalProperty('measurement'));
				const element = overlay.getElement();

				element.dispatchEvent(new Event('pointerdown'));

				expect(overlay.get(asInternalProperty('dragging'))).toBeTrue();
			});

			it('changes position of overlay on pointermove', () => {
				const state = { ...initialMeasureState, active: true };
				setup(state);
				const classUnderTest = new OlMeasurementHandler();
				const map = setupMap();
				classUnderTest.activate(map);

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
				const layerMock = {
					getSource() {
						return { getFeatures: () => [feature], hasFeature: () => true, removeFeature: () => {} };
					}
				};
				simulateDrawEvent('drawstart', classUnderTest._draw, feature);
				feature.getGeometry().dispatchEvent('change');
				simulateDrawEvent('drawend', classUnderTest._draw, feature);
				const overlay = feature.get(asInternalProperty('measurement'));
				const element = overlay.getElement();

				element.dispatchEvent(new Event('pointerdown'));

				expect(overlay.get(asInternalProperty('dragging'))).toBeTrue();

				classUnderTest._vectorLayer = layerMock;
				simulateMapBrowserEvent(map, MapBrowserEventType.POINTERMOVE, 50, 500);
				expect(overlay.get(asInternalProperty('manualPositioning'))).toBeTrue();
				expect(overlay.getPosition()).toEqual([50, 500]);
				simulateMapBrowserEvent(map, MapBrowserEventType.POINTERUP, 50, 500);
				expect(overlay.get(asInternalProperty('dragging'))).toBeFalse();
			});

			it('triggers overlay as draggable', () => {
				const state = { ...initialMeasureState, active: true };
				setup(state);
				const classUnderTest = new OlMeasurementHandler();
				const map = setupMap();
				classUnderTest.activate(map);

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
				feature.getGeometry().dispatchEvent('change');
				simulateDrawEvent('drawend', classUnderTest._draw, feature);
				const overlay = feature.get(asInternalProperty('measurement'));
				const element = overlay.getElement();

				element.dispatchEvent(new Event('mouseenter'));
				expect(overlay.get(asInternalProperty('draggable'))).toBeTrue();

				element.dispatchEvent(new Event('mouseleave'));
				expect(overlay.get(asInternalProperty('draggable'))).toBeFalse();
			});
		});
	});

	describe('when pointer click', () => {
		it('deselect feature, if clickposition is disjoint to selected feature', () => {
			const store = setup({ ...initialMeasureState, selection: ['measure'] });
			const classUnderTest = new OlMeasurementHandler();
			const map = setupMap();

			classUnderTest.activate(map);

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
			expect(store.getState().tools.current).toBe(Tools.DRAW);
		});

		it('updates statistic if clickposition is in anyinteract to selected feature', () => {
			const store = setup();
			const geometry = new Polygon([
				[
					[0, 0],
					[1, 0],
					[1, 1],
					[0, 1],
					[0, 1]
				]
			]);
			const feature = new Feature({ geometry: geometry });
			feature.setId('measure_');
			const map = setupMap();
			const classUnderTest = new OlMeasurementHandler();
			const layer = classUnderTest.activate(map);
			layer.getSource().addFeature(feature);
			spyOn(mapServiceMock, 'calcLength').and.returnValue(3);
			finish();

			map.forEachFeatureAtPixel = jasmine.createSpy().and.callFake((pixel, callback) => {
				callback(feature, classUnderTest._vectorLayer);
			});

			// select
			classUnderTest._measureState.type = InteractionStateType.SELECT;
			simulateMapBrowserEvent(map, MapBrowserEventType.CLICK, 0.5, 0.5);
			expect(store.getState().measurement.statistic.length).toBe(3);
			expect(store.getState().measurement.statistic.area).toBeCloseTo(1, 1);
		});

		it('updates and sums statistic if clickposition is in anyinteract to selected features', () => {
			const store = setup();
			const geometry1 = new Polygon([
				[
					[0, 0],
					[1, 0],
					[1, 1],
					[0, 1],
					[0, 1]
				]
			]);
			const feature1 = new Feature({ geometry: geometry1 });
			feature1.setId('measure_1');
			const geometry2 = new LineString([
				[2, 0],
				[7, 0]
			]);
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
			expect(store.getState().measurement.statistic.length).toBeCloseTo(1, 1);
			expect(store.getState().measurement.statistic.area).toBeCloseTo(1, 1);

			map.forEachFeatureAtPixel = jasmine.createSpy().and.callFake((pixel, callback) => {
				callback(feature2, classUnderTest._vectorLayer);
			});

			// second select
			simulateMapBrowserEvent(map, MapBrowserEventType.CLICK, 5, 0);
			expect(store.getState().measurement.statistic.length).toBeCloseTo(2, 0);
			expect(store.getState().measurement.statistic.area).toBeCloseTo(1, 1);
		});

		it('updates the measureState while pointerclick the drawing', () => {
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
			const classUnderTest = new OlMeasurementHandler();
			const layer = classUnderTest.activate(map);
			layer.getSource().addFeature(feature);

			const updateMeasureStateSpy = spyOn(classUnderTest, '_updateMeasureState');

			// initial Phase: the drawing will be activated after this click-event
			classUnderTest._sketchHandler.activate(feature, map);
			classUnderTest._measureState.type = InteractionStateType.ACTIVE;

			simulateMapBrowserEvent(map, MapBrowserEventType.CLICK, 0.5, 0.5);

			expect(updateMeasureStateSpy).toHaveBeenCalled();
			updateMeasureStateSpy.calls.reset();

			// Phase 2: the drawing will be end after this click-event
			classUnderTest._sketchHandler.deactivate();
			classUnderTest._measureState.type = InteractionStateType.DRAW;

			simulateMapBrowserEvent(map, MapBrowserEventType.CLICK, 0.5, 0.5);

			expect(updateMeasureStateSpy).toHaveBeenCalled();
		});

		it('updates the measureState while pointerclick into nothing', () => {
			const store = setup();

			const map = setupMap();
			const classUnderTest = new OlMeasurementHandler();
			classUnderTest.activate(map);
			setStatistic({ geometryType: GeometryType.LINE, coordinate: null, azimuth: 5, length: 42, area: null });
			finish();

			// no selection possible
			map.forEachFeatureAtPixel = jasmine.createSpy().and.callFake(() => {});

			simulateMapBrowserEvent(map, MapBrowserEventType.POINTERMOVE, 1, 0);
			simulateMapBrowserEvent(map, MapBrowserEventType.CLICK, 0.5, 0.5);
			expect(store.getState().measurement.statistic).toEqual({ geometryType: null, coordinate: null, azimuth: null, length: null, area: null });
		});
	});

	describe('_getSketchStyleOptions', () => {
		it('provides a styleFunction for LineString', () => {
			setup();

			const classUnderTest = new OlMeasurementHandler();

			const options = classUnderTest._getSketchStyleOptions();
			expect(classUnderTest._getSketchStyleOptions()).toEqual(jasmine.objectContaining({ LineString: jasmine.any(Function) }));

			const feature = new Feature({ geometry: new LineString([[0, 1]]) });
			expect(options.LineString(feature, 1)).toEqual(jasmine.arrayContaining([jasmine.any(Style)]));

			feature.dispatchEvent('change');

			expect(feature.get(asInternalProperty('displayruler'))).toBe('true');
		});
	});
});
