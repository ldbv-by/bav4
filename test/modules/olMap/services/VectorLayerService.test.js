import { $injector } from '../../../../src/injection';
import { VectorGeoResource, VectorSourceType } from '../../../../src/domain/geoResources';
import {
	bvvIconUrlFunction,
	iconUrlFunction,
	mapVectorSourceTypeToFormat,
	VectorLayerService
} from '../../../../src/modules/olMap/services/VectorLayerService';
import VectorSource, { VectorSourceEvent } from 'ol/source/Vector';
import { Feature, Map } from 'ol';
import { CollectionEvent } from 'ol/Collection';
import VectorLayer from 'ol/layer/Vector';
import { TestUtils } from '../../../test-utils';
import { createDefaultLayer, layersReducer } from '../../../../src/store/layers/layers.reducer';
import { UnavailableGeoResourceError } from '../../../../src/domain/errors';

describe('VectorLayerService', () => {
	const urlService = {
		proxifyInstant: () => {}
	};

	const configService = {
		getValueAsPath: () => {}
	};

	const mapService = {
		getSrid: () => {}
	};

	const styleService = {
		addStyle: () => {},
		removeStyle: () => {},
		updateStyle: () => {},
		isStyleRequired: () => {},
		addClusterStyle: () => {},
		sanitizeStyle: () => {}
	};

	beforeEach(() => {
		$injector
			.registerSingleton('UrlService', urlService)
			.registerSingleton('MapService', mapService)
			.registerSingleton('StyleService', styleService)
			.registerSingleton('ConfigService', configService);
	});

	afterEach(() => {
		$injector.reset();
	});

	describe('utils', () => {
		describe('mapVectorSourceTypeToFormat', () => {
			it('maps vectorSourceType to olFormats', () => {
				expect(mapVectorSourceTypeToFormat(new VectorGeoResource('id', 'label', VectorSourceType.KML)).constructor.name).toBe('KML');
				expect(
					mapVectorSourceTypeToFormat(new VectorGeoResource('id', 'label', VectorSourceType.KML).setShowPointNames(false)).showPointNames_
				).toBeFalse();
				expect(mapVectorSourceTypeToFormat(new VectorGeoResource('id', 'label', VectorSourceType.GPX)).constructor.name).toBe('GPX');
				expect(mapVectorSourceTypeToFormat(new VectorGeoResource('id', 'label', VectorSourceType.GEOJSON)).constructor.name).toBe('GeoJSON');
				expect(mapVectorSourceTypeToFormat(new VectorGeoResource('id', 'label', VectorSourceType.EWKT)).constructor.name).toBe('WKT');
				expect(() => {
					mapVectorSourceTypeToFormat({ sourceType: 'unknown' });
				}).toThrowError(/unknown currently not supported/);
			});
		});

		describe('iconUrlFunction', () => {
			it('provides a function that proxifies an url', () => {
				const iconUrl = 'https://some.url';
				spyOn(urlService, 'proxifyInstant')
					.withArgs(iconUrl, false)
					.and.returnValue('https://proxy.url?url=' + iconUrl);

				expect(iconUrlFunction(iconUrl)).toBe('https://proxy.url?url=' + iconUrl);
			});
		});

		describe('bvvIconUrlFunction', () => {
			it('provides a function that just proxifies a URL', () => {
				const iconUrl = 'https://some.url';
				spyOn(urlService, 'proxifyInstant')
					.withArgs(iconUrl, false)
					.and.returnValue('https://proxy.url?url=' + iconUrl);

				expect(bvvIconUrlFunction(iconUrl)).toBe('https://proxy.url?url=' + iconUrl);
			});

			it('provides a function that maps a legacy BVV icon URL', () => {
				const backendUrl = 'https://backend.url/';
				const iconUrl = 'https://geoportal.bayern.de/ba-backend/icons/255,0,0/marker';
				spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);

				expect(bvvIconUrlFunction(iconUrl)).toBe(`${backendUrl}icons/255,0,0/marker.png`);
			});

			it('provides a function that leaves any other legacy BVV icon URL untouched', () => {
				const backendUrl = 'https://backend.url/';
				const anyOtherLegacyUrl = 'https://geoportal.bayern.de/ba-backend/other';
				spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);

				expect(bvvIconUrlFunction(anyOtherLegacyUrl)).toBe(anyOtherLegacyUrl);
			});

			it('provides a function that leaves a BVV icon URL untouched', () => {
				const backendUrl = 'https://backend.url/';
				const iconUrl = `${backendUrl}icons/255,0,0/marker`;
				spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);

				expect(bvvIconUrlFunction(iconUrl)).toBe(iconUrl);
			});

			it('provides a function that leaves a value which is not an URL untouched', () => {
				const iconUrl = 'data:image/svg+xml;base64,PHN2ZyBpZD0ibWFya2VyIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC==';

				expect(bvvIconUrlFunction(iconUrl)).toBe(iconUrl);
			});
		});
	});

	describe('service methods', () => {
		let instanceUnderTest;
		const setup = (state = {}) => {
			TestUtils.setupStoreAndDi(state, {
				layers: layersReducer
			});
			$injector
				.registerSingleton('UrlService', urlService)
				.registerSingleton('MapService', mapService)
				.registerSingleton('StyleService', styleService);
			instanceUnderTest = new VectorLayerService();
		};

		describe('createLayer', () => {
			it('returns an ol vector layer for a data based VectorGeoResource', () => {
				setup();
				const id = 'id';
				const geoResourceId = 'geoResourceId';
				const geoResourceLabel = 'geoResourceLabel';
				const sourceAsString = 'kml';
				const olMap = new Map();
				const olSource = new VectorSource();
				const vectorGeoresource = new VectorGeoResource(geoResourceId, geoResourceLabel, VectorSourceType.KML).setSource(sourceAsString, 4326);
				spyOn(instanceUnderTest, '_vectorSourceForData').withArgs(vectorGeoresource).and.returnValue(olSource);
				const sanitizeSpy = spyOn(instanceUnderTest, 'sanitizeStyles')
					.withArgs(jasmine.any(VectorLayer))
					.and.callFake(() => {});

				spyOn(instanceUnderTest, 'applyStyles')
					.withArgs(jasmine.anything(), olMap)
					.and.callFake((layer) => layer);

				const olVectorLayer = instanceUnderTest.createLayer(id, vectorGeoresource, olMap);

				expect(sanitizeSpy).toHaveBeenCalledWith(olVectorLayer);

				expect(olVectorLayer.get('id')).toBe(id);
				expect(olVectorLayer.getMinZoom()).toBeNegativeInfinity();
				expect(olVectorLayer.getMaxZoom()).toBePositiveInfinity();

				expect(olVectorLayer.constructor.name).toBe('VectorLayer');
				expect(olVectorLayer.getSource()).toEqual(olSource);
			});

			it('returns an ol vector layer for a clustered data based VectorGeoResource', () => {
				setup();
				const id = 'id';
				const geoResourceId = 'geoResourceId';
				const geoResourceLabel = 'geoResourceLabel';
				const sourceAsString = 'kml';
				const olMap = new Map();
				const olSource = new VectorSource();
				const vectorGeoresource = new VectorGeoResource(geoResourceId, geoResourceLabel, VectorSourceType.KML)
					.setSource(sourceAsString, 4326)
					.setClusterParams({ foo: 'bar' });
				spyOn(instanceUnderTest, '_vectorSourceForData').withArgs(vectorGeoresource).and.returnValue(olSource);
				spyOn(instanceUnderTest, 'applyClusterStyle')
					.withArgs(jasmine.anything())
					.and.callFake((layer) => layer);

				const olVectorLayer = instanceUnderTest.createLayer(id, vectorGeoresource, olMap);

				expect(olVectorLayer.get('id')).toBe(id);
				expect(olVectorLayer.getMinZoom()).toBeNegativeInfinity();
				expect(olVectorLayer.getMaxZoom()).toBePositiveInfinity();

				expect(olVectorLayer.constructor.name).toBe('VectorLayer');
				expect(olVectorLayer.getSource()).toEqual(olSource);
			});

			it('returns an ol vector layer for a data based VectorGeoResource containing optional properties', () => {
				setup();
				const id = 'id';
				const geoResourceId = 'geoResourceId';
				const geoResourceLabel = 'geoResourceLabel';
				const sourceAsString = 'kml';
				const olMap = new Map();
				const olSource = new VectorSource();
				const vectorGeoResource = new VectorGeoResource(geoResourceId, geoResourceLabel, VectorSourceType.KML)
					.setSource(sourceAsString, 4326)
					.setOpacity(0.5)
					.setMinZoom(5)
					.setMaxZoom(19);
				spyOn(instanceUnderTest, '_vectorSourceForData').withArgs(vectorGeoResource).and.returnValue(olSource);
				spyOn(instanceUnderTest, 'applyStyles')
					.withArgs(jasmine.anything(), olMap)
					.and.callFake((layer) => layer);

				const olVectorLayer = instanceUnderTest.createLayer(id, vectorGeoResource, olMap);

				expect(olVectorLayer.get('id')).toBe(id);
				expect(olVectorLayer.getOpacity()).toBe(0.5);
				expect(olVectorLayer.getMinZoom()).toBe(5);
				expect(olVectorLayer.getMaxZoom()).toBe(19);
				expect(olVectorLayer.constructor.name).toBe('VectorLayer');
				expect(olVectorLayer.getSource()).toEqual(olSource);
			});

			it('returns an ol vector layer for a clustered data based VectorGeoResource containing optional properties', () => {
				setup();
				const id = 'id';
				const geoResourceId = 'geoResourceId';
				const geoResourceLabel = 'geoResourceLabel';
				const sourceAsString = 'kml';
				const olMap = new Map();
				const olSource = new VectorSource();
				const vectorGeoResource = new VectorGeoResource(geoResourceId, geoResourceLabel, VectorSourceType.KML)
					.setSource(sourceAsString, 4326)
					.setOpacity(0.5)
					.setMinZoom(5)
					.setMaxZoom(19)
					.setClusterParams({ foo: 'bar' });
				spyOn(instanceUnderTest, '_vectorSourceForData').withArgs(vectorGeoResource).and.returnValue(olSource);
				spyOn(instanceUnderTest, 'applyClusterStyle')
					.withArgs(jasmine.anything())
					.and.callFake((layer) => layer);

				const olVectorLayer = instanceUnderTest.createLayer(id, vectorGeoResource, olMap);

				expect(olVectorLayer.get('id')).toBe(id);
				expect(olVectorLayer.getOpacity()).toBe(0.5);
				expect(olVectorLayer.getMinZoom()).toBe(5);
				expect(olVectorLayer.getMaxZoom()).toBe(19);
				expect(olVectorLayer.constructor.name).toBe('VectorLayer');
				expect(olVectorLayer.getSource()).toEqual(olSource);
			});
		});

		describe('_vectorSourceForData', () => {
			it('builds an olVectorSource for an internal VectorGeoResource', async () => {
				setup();
				const sourceSrid = 4326;
				const destinationSrid = 3857;
				const expectedTypeValue = 'line';
				const kmlName = '';
				const geoResourceLabel = 'geoResourceLabel';
				spyOn(mapService, 'getSrid').and.returnValue(destinationSrid);
				const sourceAsString = `<kml xmlns="http://www.opengis.net/kml/2.2" xmlns:gx="http://www.google.com/kml/ext/2.2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opengis.net/kml/2.2 https://developers.google.com/kml/schema/kml22gx.xsd"><Document><name>${kmlName}</name><Placemark id="line_1617976924317"><ExtendedData><Data name="type"><value>line</value></Data></ExtendedData><description></description><Style><LineStyle><color>ff0000ff</color><width>3</width></LineStyle><PolyStyle><color>660000ff</color></PolyStyle></Style><LineString><tessellate>1</tessellate><altitudeMode>clampToGround</altitudeMode><coordinates>10.713458946685412,49.70007647302964 11.714932179089468,48.34411758499924</coordinates></LineString></Placemark></Document></kml>`;
				const vectorGeoResource = new VectorGeoResource('someId', geoResourceLabel, VectorSourceType.KML)
					.setSource(sourceAsString, sourceSrid)
					.setShowPointNames(false);

				const olVectorSource = instanceUnderTest._vectorSourceForData(vectorGeoResource);

				expect(olVectorSource.constructor.name).toBe('VectorSource');
				expect(olVectorSource.getFeatures().length).toBe(1);
				expect(olVectorSource.getFeatures()[0].get('type')).toBe(expectedTypeValue);
				expect(olVectorSource.getFeatures()[0].get('showPointNames')).toBeFalse();

				await TestUtils.timeout();
				expect(vectorGeoResource.label).toBe(geoResourceLabel);
			});

			it('builds an olVectorSource for an internal clustered VectorGeoResource', async () => {
				setup();
				const sourceSrid = 4326;
				const destinationSrid = 3857;
				const expectedTypeValue = 'line';
				const kmlName = '';
				const geoResourceLabel = 'geoResourceLabel';
				spyOn(mapService, 'getSrid').and.returnValue(destinationSrid);
				const sourceAsString = `<kml xmlns="http://www.opengis.net/kml/2.2" xmlns:gx="http://www.google.com/kml/ext/2.2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opengis.net/kml/2.2 https://developers.google.com/kml/schema/kml22gx.xsd"><Document><name>${kmlName}</name><Placemark id="line_1617976924317"><ExtendedData><Data name="type"><value>line</value></Data></ExtendedData><description></description><Style><LineStyle><color>ff0000ff</color><width>3</width></LineStyle><PolyStyle><color>660000ff</color></PolyStyle></Style><LineString><tessellate>1</tessellate><altitudeMode>clampToGround</altitudeMode><coordinates>10.713458946685412,49.70007647302964 11.714932179089468,48.34411758499924</coordinates></LineString></Placemark></Document></kml>`;
				const vectorGeoResource = new VectorGeoResource('someId', geoResourceLabel, VectorSourceType.KML)
					.setSource(sourceAsString, sourceSrid)
					.setClusterParams({ distance: 42, minDistance: 21 });

				const olVectorSource = instanceUnderTest._vectorSourceForData(vectorGeoResource);

				expect(olVectorSource.constructor.name).toBe('Cluster');
				expect(olVectorSource.getDistance()).toBe(42);
				expect(olVectorSource.getMinDistance()).toBe(21);
				expect(olVectorSource.getSource().constructor.name).toBe('VectorSource');
				expect(olVectorSource.getSource().getFeatures().length).toBe(1);
				expect(olVectorSource.getSource().getFeatures()[0].get('type')).toBe(expectedTypeValue);
				expect(olVectorSource.getSource().getFeatures()[0].get('showPointNames')).toBeTrue();

				await TestUtils.timeout();
				expect(vectorGeoResource.label).toBe(geoResourceLabel);
			});

			it('builds an olVectorSource for an internal VectorGeoresource of type EWKT', () => {
				setup();
				const sourceSrid = 4326;
				const destinationSrid = 3857;
				const geoResourceLabel = 'geoResourceLabel';
				spyOn(mapService, 'getSrid').and.returnValue(destinationSrid);
				const sourceAsString = `SRID=${sourceSrid};POINT(11 49)`;
				const vectorGeoresource = new VectorGeoResource('someId', geoResourceLabel, VectorSourceType.EWKT).setSource(sourceAsString, sourceSrid);

				const olVectorSource = instanceUnderTest._vectorSourceForData(vectorGeoresource);

				expect(olVectorSource.constructor.name).toBe('VectorSource');
				expect(olVectorSource.getFeatures().length).toBe(1);
			});

			it('throws an UnavailableGeoResourceError when data cannot be parsed', async () => {
				setup();
				const sourceSrid = 4326;
				const destinationSrid = 3857;
				const geoResourceLabel = 'geoResourceLabel';
				spyOn(mapService, 'getSrid').and.returnValue(destinationSrid);
				const sourceAsString = `SRID=4326;POLYGON((7.58081 48.13805,7.58081 48.100 46,7.57031 48.10046,7.57031 48.13805,7.58081 48.13805))`;
				const geoResourceId = 'someId';
				const vectorGeoResource = new VectorGeoResource(geoResourceId, geoResourceLabel, VectorSourceType.EWKT).setSource(sourceAsString, sourceSrid);

				expect(() => {
					instanceUnderTest._vectorSourceForData(vectorGeoResource);
				}).toThrowMatching((t) => {
					return (
						t.message === `Data of VectorGeoResource could not be parsed` &&
						t instanceof UnavailableGeoResourceError &&
						t.geoResourceId === geoResourceId
					);
				});
			});

			it('filters out features without a geometry', () => {
				setup();
				const sourceSrid = 4326;
				const expectedSrid = 3857;
				const geoResourceLabel = 'geoResourceLabel';
				spyOn(mapService, 'getSrid').and.returnValue(expectedSrid);
				// contains one valid and one invalid placemark
				const sourceAsString =
					'<kml xmlns="http://www.opengis.net/kml/2.2" xmlns:gx="http://www.google.com/kml/ext/2.2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opengis.net/kml/2.2 https://developers.google.com/kml/schema/kml22gx.xsd"><Document><name>Invalid Placemarks</name><Placemark id="Line_valid"><description></description><LineString><tessellate>1</tessellate><altitudeMode>clampToGround</altitudeMode><coordinates>10.713458946685412,49.70007647302964 11.714932179089468,48.34411758499924</coordinates></LineString></Placemark><Placemark id="Point_invalid"><description>This is a invalid Point-Placemark</description><Point><coordinates>..</coordinates></Point></Placemark></Document></kml>';
				const vectorGeoresource = new VectorGeoResource('someId', geoResourceLabel, VectorSourceType.KML).setSource(sourceAsString, sourceSrid);

				const olVectorSource = instanceUnderTest._vectorSourceForData(vectorGeoresource);

				expect(olVectorSource.constructor.name).toBe('VectorSource');
				expect(olVectorSource.getFeatures().length).toBe(1);
			});

			describe('KML VectorGeoresource has no label', () => {
				it('updates the label of an internal VectorGeoresource and calls the propertyChanged action', async () => {
					setup();
					const id = 'someId';
					const srid = 3857;
					const kmlName = 'kmlName';
					spyOn(mapService, 'getSrid').and.returnValue(srid);
					const sourceAsString = `<kml xmlns="http://www.opengis.net/kml/2.2" xmlns:gx="http://www.google.com/kml/ext/2.2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opengis.net/kml/2.2 https://developers.google.com/kml/schema/kml22gx.xsd"><Document><name>${kmlName}</name><Placemark id="line_1617976924317"><ExtendedData><Data name="type"><value>line</value></Data></ExtendedData><description></description><Style><LineStyle><color>ff0000ff</color><width>3</width></LineStyle><PolyStyle><color>660000ff</color></PolyStyle></Style><LineString><tessellate>1</tessellate><altitudeMode>clampToGround</altitudeMode><coordinates>10.713458946685412,49.70007647302964 11.714932179089468,48.34411758499924</coordinates></LineString></Placemark></Document></kml>`;
					const vectorGeoresource = new VectorGeoResource(id, null, VectorSourceType.KML).setSource(sourceAsString, 4326);

					instanceUnderTest._vectorSourceForData(vectorGeoresource);

					await TestUtils.timeout();
					expect(vectorGeoresource.label).toBe(kmlName);
				});
			});
		});

		describe('_registerEvents', () => {
			it('adds five listeners', () => {
				setup();
				const { addFeatureListenerKey, removeFeatureListenerKey, clearFeaturesListenerKey, layerChangeListenerKey, layerListChangedListenerKey } =
					instanceUnderTest._registerStyleEventListeners(new VectorSource(), new VectorLayer(), new Map());

				expect(addFeatureListenerKey).toBeDefined();
				expect(removeFeatureListenerKey).toBeDefined();
				expect(clearFeaturesListenerKey).toBeDefined();
				expect(layerChangeListenerKey).toBeDefined();
				expect(layerListChangedListenerKey).toBeDefined();
			});

			it('calls StyleService#addStyle on "addFeature"', () => {
				const id = 'id';
				const state = {
					layers: {
						active: [{ ...createDefaultLayer(id) }]
					}
				};
				setup(state);
				const olMap = new Map();
				const olSource = new VectorSource();
				const olLayer = new VectorLayer({ id: id });
				const olFeature = new Feature();
				const styleServiceSpy = spyOn(styleService, 'addStyle');
				instanceUnderTest._registerStyleEventListeners(olSource, olLayer, olMap);

				olSource.dispatchEvent(new VectorSourceEvent('addfeature', olFeature));

				expect(styleServiceSpy).toHaveBeenCalledWith(olFeature, olMap, olLayer);
			});

			it('calls StyleService#updateStyle on "addFeature" when layer is attached', () => {
				setup();
				const olMap = new Map();
				const olSource = new VectorSource();
				const olFeature = new Feature();
				const styleServiceAddSpy = spyOn(styleService, 'addStyle');
				const styleServiceUpdateSpy = spyOn(instanceUnderTest, '_updateStyle');
				const olLayer = new VectorLayer();
				instanceUnderTest._registerStyleEventListeners(olSource, olLayer, olMap);

				olSource.dispatchEvent(new VectorSourceEvent('addfeature', olFeature));

				expect(styleServiceAddSpy).toHaveBeenCalledWith(olFeature, olMap, olLayer);
				expect(styleServiceUpdateSpy).toHaveBeenCalledWith(olFeature, olLayer, olMap);
			});

			it('calls #removeStyle on "removeFeature"', () => {
				setup();
				const olMap = new Map();
				const olSource = new VectorSource();
				const olFeature = new Feature();
				const styleServiceSpy = spyOn(styleService, 'removeStyle');
				const olLayer = new VectorLayer();
				instanceUnderTest._registerStyleEventListeners(olSource, olLayer, olMap);

				olSource.dispatchEvent(new VectorSourceEvent('removefeature', olFeature));

				expect(styleServiceSpy).toHaveBeenCalledWith(olFeature, olMap);
			});

			it('calls #removeStyle on "clearFeatures"', () => {
				setup();
				const olMap = new Map();
				const olFeature = new Feature();
				const olSource = new VectorSource({ features: [olFeature] });
				const olLayer = new VectorLayer();
				const styleServiceSpy = spyOn(styleService, 'removeStyle');
				instanceUnderTest._registerStyleEventListeners(olSource, olLayer, olMap);

				olSource.dispatchEvent(new VectorSourceEvent('clear'));

				expect(styleServiceSpy).toHaveBeenCalledWith(olFeature, olMap);
			});

			it('calls #_updateStyle on layer "change:visible"', () => {
				setup();
				const olMap = new Map();
				const olFeature = new Feature();
				const olSource = new VectorSource({ features: [olFeature] });
				const olLayer = new VectorLayer();
				const updateStyleSpy = spyOn(instanceUnderTest, '_updateStyle');
				instanceUnderTest._registerStyleEventListeners(olSource, olLayer, olMap);

				olLayer.setVisible(false);

				expect(updateStyleSpy).toHaveBeenCalledWith(olFeature, olLayer, olMap);
			});

			it('calls #_updateStyle on layer "change:opacity"', () => {
				setup();
				const olMap = new Map();
				const olFeature = new Feature();
				const olSource = new VectorSource({ features: [olFeature] });
				const olLayer = new VectorLayer();
				const updateStyleSpy = spyOn(instanceUnderTest, '_updateStyle');
				instanceUnderTest._registerStyleEventListeners(olSource, olLayer, olMap);

				olLayer.setOpacity(0.42);

				expect(updateStyleSpy).toHaveBeenCalledWith(olFeature, olLayer, olMap);
			});

			it('calls #_updateStyle on layer "change:zIndex"', () => {
				setup();
				const olMap = new Map();
				const olFeature = new Feature();
				const olSource = new VectorSource({ features: [olFeature] });
				const olLayer = new VectorLayer();
				const updateStyleSpy = spyOn(instanceUnderTest, '_updateStyle');
				instanceUnderTest._registerStyleEventListeners(olSource, olLayer, olMap);

				olLayer.setZIndex(1);

				expect(updateStyleSpy).toHaveBeenCalledWith(olFeature, olLayer, olMap);
			});

			it('calls #_updateStyle when layers are added', () => {
				setup();
				const olMap = new Map();
				const olFeature = new Feature();
				const olSource = new VectorSource({ features: [olFeature] });
				const olLayer = new VectorLayer();
				const otherOlLayer = new VectorLayer();
				const updateStyleSpy = spyOn(instanceUnderTest, '_updateStyle');
				instanceUnderTest._registerStyleEventListeners(olSource, olLayer, olMap);

				olMap.getLayers().dispatchEvent(new CollectionEvent('add', otherOlLayer));

				expect(updateStyleSpy).toHaveBeenCalledWith(olFeature, olLayer, olMap);
			});

			it('calls #_updateStyle when layers are removed', () => {
				setup();
				const olMap = new Map();
				const olFeature = new Feature();
				const olSource = new VectorSource({ features: [olFeature] });
				const olLayer = new VectorLayer();
				const otherOlLayer = new VectorLayer();
				const updateStyleSpy = spyOn(instanceUnderTest, '_updateStyle')
					.withArgs(olFeature, olLayer, olMap)
					.and.callFake(() => {});
				instanceUnderTest._registerStyleEventListeners(olSource, olLayer, olMap);

				olMap.addLayer(otherOlLayer);
				olMap.removeLayer(otherOlLayer);

				expect(updateStyleSpy).toHaveBeenCalledTimes(2);
			});
		});

		describe('_updateStyle', () => {
			it('calls #updateStyle of the underlying StyleService', () => {
				const id = 'id';
				const state = {
					layers: {
						active: [
							{ ...createDefaultLayer(id) },
							{ ...createDefaultLayer('otherLayer') } //topmost layer
						]
					}
				};
				setup(state);
				const updateProperties = { visible: false, top: false, opacity: 0.5 };
				const olMap = new Map();
				const olFeature = new Feature();
				const olSource = new VectorSource();
				const olLayer = new VectorLayer({ id: id, source: olSource, visible: updateProperties.visible, opacity: updateProperties.opacity });
				const styleServiceSpy = spyOn(styleService, 'updateStyle');

				instanceUnderTest._updateStyle(olFeature, olLayer, olMap);

				expect(styleServiceSpy).toHaveBeenCalledWith(olFeature, olMap, updateProperties);
			});

			it('calls #updateStyle of the underlying StyleService ignoring hidden layers', () => {
				const id = 'id';
				const state = {
					layers: {
						active: [
							{ ...createDefaultLayer('otherLayer') },
							{ ...createDefaultLayer(id) },
							{ ...createDefaultLayer('hiddenLayer'), constraints: { hidden: true } } //topmost layer is a hidden layer
						]
					}
				};
				setup(state);
				const updateProperties = { visible: false, top: true, opacity: 0.5 };
				const olMap = new Map();
				const olFeature = new Feature();
				const olSource = new VectorSource();
				const olLayer = new VectorLayer({ id: id, source: olSource, visible: updateProperties.visible, opacity: updateProperties.opacity });
				const styleServiceSpy = spyOn(styleService, 'updateStyle');

				instanceUnderTest._updateStyle(olFeature, olLayer, olMap);

				expect(styleServiceSpy).toHaveBeenCalledWith(olFeature, olMap, updateProperties);
			});

			it('calls #updateStyle of the underlying StyleService ignoring hidden layers (only one hidden layer present)', () => {
				const id = 'id';
				const state = {
					layers: {
						active: [
							{ ...createDefaultLayer('hiddenLayer'), constraints: { hidden: true } } //topmost layer is a hidden layer
						]
					}
				};
				setup(state);
				const updateProperties = { visible: false, top: false, opacity: 0.5 };
				const olMap = new Map();
				const olFeature = new Feature();
				const olSource = new VectorSource();
				const olLayer = new VectorLayer({ id: id, source: olSource, visible: updateProperties.visible, opacity: updateProperties.opacity });
				const styleServiceSpy = spyOn(styleService, 'updateStyle');

				instanceUnderTest._updateStyle(olFeature, olLayer, olMap);

				expect(styleServiceSpy).toHaveBeenCalledWith(olFeature, olMap, updateProperties);
			});
		});

		describe('sanitizeStyles', () => {
			it('calls the StyleService to sanitize each present feature ', () => {
				setup();
				const olFeature0 = new Feature();
				const olFeature1 = new Feature();
				const olSource = new VectorSource({ features: [olFeature0, olFeature1] });
				const olLayer = new VectorLayer({ source: olSource });
				const spy = spyOn(styleService, 'sanitizeStyle')
					.withArgs(jasmine.any(Feature))
					.and.callFake(() => {});

				instanceUnderTest.sanitizeStyles(olLayer);

				expect(spy).toHaveBeenCalledTimes(2);
			});
		});

		describe('applyStyles', () => {
			it('returns the olLayer ', () => {
				setup();
				const olMap = new Map();
				const olSource = new VectorSource();
				const olLayer = new VectorLayer({ source: olSource });

				const result = instanceUnderTest.applyStyles(olLayer, olMap);

				expect(result).toBe(olLayer);
			});

			describe('when feature that does not needs a specific styling', () => {
				it('does nothing', () => {
					setup();
					const olMap = new Map();
					const olFeature = new Feature();
					const olSource = new VectorSource();
					const olLayer = new VectorLayer({ source: olSource });
					spyOn(styleService, 'isStyleRequired').and.returnValue(false);
					const registerStyleEventListenersSpy = spyOn(instanceUnderTest, '_registerStyleEventListeners');
					const styleServiceAddSpy = spyOn(styleService, 'addStyle');

					instanceUnderTest.applyStyles(olLayer, olMap);
					olSource.dispatchEvent(new VectorSourceEvent('addfeature', olFeature));

					expect(styleServiceAddSpy).not.toHaveBeenCalledWith(olFeature, olMap, olLayer);
					expect(registerStyleEventListenersSpy).not.toHaveBeenCalledWith(olSource, olMap);
				});
			});

			describe('checks if a feature needs a specific styling', () => {
				it('adds a style and registers style event listeners', () => {
					setup();
					const olMap = new Map();
					const olFeature0 = new Feature();
					const olFeature1 = new Feature();
					const olSource = new VectorSource({ features: [olFeature0, olFeature1] });
					const olLayer = new VectorLayer({ source: olSource });
					spyOn(styleService, 'isStyleRequired').and.returnValue(true);
					const registerStyleEventListenersSpy = spyOn(instanceUnderTest, '_registerStyleEventListeners');
					const styleServiceAddSpy = spyOn(styleService, 'addStyle');
					const updateStyleSpy = spyOn(instanceUnderTest, '_updateStyle');

					instanceUnderTest.applyStyles(olLayer, olMap);

					expect(styleServiceAddSpy).toHaveBeenCalledWith(olFeature0, olMap, olLayer);
					expect(styleServiceAddSpy).toHaveBeenCalledWith(olFeature1, olMap, olLayer);
					expect(updateStyleSpy).toHaveBeenCalledWith(olFeature0, olLayer, olMap);
					expect(updateStyleSpy).toHaveBeenCalledWith(olFeature1, olLayer, olMap);
					expect(registerStyleEventListenersSpy).toHaveBeenCalledOnceWith(olSource, olLayer, olMap);
				});

				it('does NOT add a style and does NOT registers style event listeners', () => {
					setup();
					const olMap = new Map();
					const olFeature0 = new Feature();
					const olFeature1 = new Feature();
					const olSource = new VectorSource({ features: [olFeature0, olFeature1] });
					const olLayer = new VectorLayer({ source: olSource });
					spyOn(styleService, 'isStyleRequired').and.returnValue(false);
					const registerStyleEventListenersSpy = spyOn(instanceUnderTest, '_registerStyleEventListeners');
					const styleServiceAddSpy = spyOn(styleService, 'addStyle');
					const updateStyleSpy = spyOn(instanceUnderTest, '_updateStyle');

					instanceUnderTest.applyStyles(olLayer, olMap);

					expect(styleServiceAddSpy).not.toHaveBeenCalled();
					expect(updateStyleSpy).not.toHaveBeenCalled();
					expect(registerStyleEventListenersSpy).not.toHaveBeenCalled();
				});

				it("does NOT apply style to features when they don't need them", () => {
					setup();
					const olMap = new Map();
					const olFeature0 = new Feature();
					const olFeature1 = new Feature();
					const olSource = new VectorSource({ features: [olFeature0, olFeature1] });
					const olLayer = new VectorLayer({ source: olSource });
					let firstTimeCall = true;
					spyOn(styleService, 'isStyleRequired').and.callFake(() => {
						if (firstTimeCall) {
							firstTimeCall = false;
							return true;
						}
						return false;
					});
					const registerStyleEventListenersSpy = spyOn(instanceUnderTest, '_registerStyleEventListeners');
					const styleServiceAddSpy = spyOn(styleService, 'addStyle');
					const updateStyleSpy = spyOn(instanceUnderTest, '_updateStyle');

					instanceUnderTest.applyStyles(olLayer, olMap);

					expect(styleServiceAddSpy).not.toHaveBeenCalled();
					expect(updateStyleSpy).not.toHaveBeenCalled();
					expect(registerStyleEventListenersSpy).toHaveBeenCalledOnceWith(olSource, olLayer, olMap);
				});
			});
		});

		describe('applyClusterStyle', () => {
			it('calls the StyleService and returns the olLayer ', () => {
				setup();
				const olSource = new VectorSource();
				const olLayer = new VectorLayer({ source: olSource });
				spyOn(styleService, 'addClusterStyle').and.returnValue(olLayer);

				const result = instanceUnderTest.applyClusterStyle(olLayer);

				expect(result).toBe(olLayer);
			});
		});
	});
});
