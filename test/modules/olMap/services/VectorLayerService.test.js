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

describe('VectorLayerService', () => {
	const urlService = {
		proxifyInstant: () => {},
		pathParams: () => {},
		originAndPathname: () => {}
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
		addClusterStyle: () => {}
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
				expect(mapVectorSourceTypeToFormat(VectorSourceType.KML).constructor.name).toBe('KML');
				expect(mapVectorSourceTypeToFormat(VectorSourceType.GPX).constructor.name).toBe('GPX');
				expect(mapVectorSourceTypeToFormat(VectorSourceType.GEOJSON).constructor.name).toBe('GeoJSON');
				expect(() => {
					mapVectorSourceTypeToFormat('unknown');
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
				spyOn(urlService, 'originAndPathname').withArgs(iconUrl).and.returnValue(iconUrl);

				expect(bvvIconUrlFunction(iconUrl)).toBe('https://proxy.url?url=' + iconUrl);
			});

			it('provides a function that maps a legacy BVV icon URL', () => {
				const backendUrl = 'https://backend.url/';
				const iconUrl = 'https://geoportal.bayern.de/ba-backend/icons/255,0,0/marker';
				spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
				spyOn(urlService, 'pathParams').withArgs(iconUrl).and.returnValue(['ba-backend', 'icons', '255,0,0', 'marker']);
				spyOn(urlService, 'originAndPathname').withArgs(iconUrl).and.returnValue(iconUrl);

				expect(bvvIconUrlFunction(iconUrl)).toBe(`${backendUrl}icons/255,0,0/marker.png`);
			});

			it('provides a function that leaves any other legacy BVV icon URL untouched', () => {
				const backendUrl = 'https://backend.url/';
				const anyOtherLegacyUrl = 'https://geoportal.bayern.de/ba-backend/other';
				spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
				spyOn(urlService, 'pathParams').withArgs(anyOtherLegacyUrl).and.returnValue(['ba-backend', 'other']);
				spyOn(urlService, 'originAndPathname').withArgs(anyOtherLegacyUrl).and.returnValue(anyOtherLegacyUrl);

				expect(bvvIconUrlFunction(anyOtherLegacyUrl)).toBe(anyOtherLegacyUrl);
			});

			it('provides a function that leaves a BVV icon URL untouched', () => {
				const backendUrl = 'https://backend.url/';
				const iconUrl = `${backendUrl}icons/255,0,0/marker`;
				spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
				spyOn(urlService, 'originAndPathname').withArgs(iconUrl).and.returnValue(iconUrl);

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

		describe('createVectorLayer', () => {
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
				spyOn(instanceUnderTest, '_applyStyles')
					.withArgs(jasmine.anything(), olMap)
					.and.callFake((layer) => layer);

				const olVectorLayer = instanceUnderTest.createVectorLayer(id, vectorGeoresource, olMap);

				expect(olVectorLayer.get('id')).toBe(id);
				expect(olVectorLayer.get('geoResourceId')).toBe(geoResourceId);
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
				spyOn(instanceUnderTest, '_applyClusterStyle')
					.withArgs(jasmine.anything())
					.and.callFake((layer) => layer);

				const olVectorLayer = instanceUnderTest.createVectorLayer(id, vectorGeoresource, olMap);

				expect(olVectorLayer.get('id')).toBe(id);
				expect(olVectorLayer.get('geoResourceId')).toBe(geoResourceId);
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
				spyOn(instanceUnderTest, '_applyStyles')
					.withArgs(jasmine.anything(), olMap)
					.and.callFake((layer) => layer);

				const olVectorLayer = instanceUnderTest.createVectorLayer(id, vectorGeoResource, olMap);

				expect(olVectorLayer.get('id')).toBe(id);
				expect(olVectorLayer.get('geoResourceId')).toBe(geoResourceId);
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
				spyOn(instanceUnderTest, '_applyClusterStyle')
					.withArgs(jasmine.anything())
					.and.callFake((layer) => layer);

				const olVectorLayer = instanceUnderTest.createVectorLayer(id, vectorGeoResource, olMap);

				expect(olVectorLayer.get('id')).toBe(id);
				expect(olVectorLayer.get('geoResourceId')).toBe(geoResourceId);
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
				const vectorGeoResource = new VectorGeoResource('someId', geoResourceLabel, VectorSourceType.KML).setSource(sourceAsString, sourceSrid);

				const olVectorSource = instanceUnderTest._vectorSourceForData(vectorGeoResource);

				expect(olVectorSource.constructor.name).toBe('VectorSource');
				expect(olVectorSource.getFeatures().length).toBe(1);
				expect(olVectorSource.getFeatures()[0].get('type')).toBe(expectedTypeValue);

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
			it('adds four listeners', () => {
				setup();
				const { addFeatureListenerKey, removeFeatureListenerKey, clearFeaturesListenerKey, addLayerListenerKey } =
					instanceUnderTest._registerStyleEventListeners(new VectorSource(), new VectorLayer(), new Map());

				expect(addFeatureListenerKey).toBeDefined();
				expect(removeFeatureListenerKey).toBeDefined();
				expect(clearFeaturesListenerKey).toBeDefined();
				expect(addLayerListenerKey).toBeDefined();
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

			it('calls StyleService#removeStyle on "removeFeature"', () => {
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

			it('calls StyleService#removeStyle on "clearFeatures"', () => {
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

			it('calls _updateStyle on "addLayer"', () => {
				setup();
				const olMap = new Map();
				const olFeature = new Feature();
				const olSource = new VectorSource({ features: [olFeature] });
				const olLayer = new VectorLayer();
				const updateStyleSpy = spyOn(instanceUnderTest, '_updateStyle');
				instanceUnderTest._registerStyleEventListeners(olSource, olLayer, olMap);

				olMap.getLayers().dispatchEvent(new CollectionEvent('add', olLayer));

				expect(updateStyleSpy).toHaveBeenCalledWith(olFeature, olLayer, olMap);
			});

			it('does not call _updateStyle when other layers are added', () => {
				setup();
				const olMap = new Map();
				const olFeature = new Feature();
				const olSource = new VectorSource({ features: [olFeature] });
				const olLayer = new VectorLayer();
				const otherOlLayer = new VectorLayer();
				const updateStyleSpy = spyOn(instanceUnderTest, '_updateStyle');
				instanceUnderTest._registerStyleEventListeners(olSource, olLayer, olMap);

				olMap.getLayers().dispatchEvent(new CollectionEvent('add', otherOlLayer));

				expect(updateStyleSpy).not.toHaveBeenCalledWith(olFeature, olLayer, olMap);
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
		});

		describe('_applyStyles', () => {
			it('returns the olLayer ', () => {
				setup();
				const olMap = new Map();
				const olSource = new VectorSource();
				const olLayer = new VectorLayer({ source: olSource });

				const result = instanceUnderTest._applyStyles(olLayer, olMap);

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

					instanceUnderTest._applyStyles(olLayer, olMap);
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

					instanceUnderTest._applyStyles(olLayer, olMap);

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

					instanceUnderTest._applyStyles(olLayer, olMap);

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

					instanceUnderTest._applyStyles(olLayer, olMap);

					expect(styleServiceAddSpy).not.toHaveBeenCalled();
					expect(updateStyleSpy).not.toHaveBeenCalled();
					expect(registerStyleEventListenersSpy).toHaveBeenCalledOnceWith(olSource, olLayer, olMap);
				});
			});
		});

		describe('_applyClusterStyle', () => {
			it('calls the StyleService and returns the olLayer ', () => {
				setup();
				const olSource = new VectorSource();
				const olLayer = new VectorLayer({ source: olSource });
				spyOn(styleService, 'addClusterStyle').and.returnValue(olLayer);

				const result = instanceUnderTest._applyClusterStyle(olLayer);

				expect(result).toBe(olLayer);
			});
		});
	});
});
