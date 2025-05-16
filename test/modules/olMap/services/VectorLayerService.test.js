import { $injector } from '../../../../src/injection';
import { GeoResourceAuthenticationType, OafGeoResource, VectorGeoResource, VectorSourceType } from '../../../../src/domain/geoResources';
import {
	bvvIconUrlFunction,
	iconUrlFunction,
	mapSourceTypeToFormat,
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
import { StyleHint } from '../../../../src/domain/styles';
import { BaGeometry } from '../../../../src/domain/geometry';
import { BaFeature } from '../../../../src/domain/feature';
import { SourceType } from '../../../../src/domain/sourceType';
import { getBvvOafLoadFunction } from '../../../../src/modules/olMap/utils/olLoadFunction.provider';
import { bbox } from 'ol/loadingstrategy.js';

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
		addFeatureStyle: () => {},
		removeFeatureStyle: () => {},
		updateFeatureStyle: () => {},
		applyStyle: () => {}
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
			it('maps a `VectorSourceType` to olFormats', () => {
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

		describe('mapSourceTypeToFormat', () => {
			it('maps a `SourceType` to olFormats', () => {
				expect(mapSourceTypeToFormat(SourceType.forKml()).constructor.name).toBe('KML');
				expect(mapSourceTypeToFormat(SourceType.forKml(), false).showPointNames_).toBeFalse();
				expect(mapSourceTypeToFormat(SourceType.forKml(), true).showPointNames_).toBeTrue();
				expect(mapSourceTypeToFormat(SourceType.forKml()).showPointNames_).toBeTrue();
				expect(mapSourceTypeToFormat(SourceType.forGpx()).constructor.name).toBe('GPX');
				expect(mapSourceTypeToFormat(SourceType.forGeoJSON()).constructor.name).toBe('GeoJSON');
				expect(mapSourceTypeToFormat(SourceType.forEwkt(12345)).constructor.name).toBe('WKT');
				expect(() => {
					mapSourceTypeToFormat(new SourceType('Foo'));
				}).toThrowError(/Foo currently not supported/);
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

	describe('VectorLayerService', () => {
		const baaCredentialService = {
			get: () => {}
		};

		let instanceUnderTest;
		const setup = (state = {}, oafLoadFunctionProvider) => {
			TestUtils.setupStoreAndDi(state, {
				layers: layersReducer
			});
			$injector
				.registerSingleton('UrlService', urlService)
				.registerSingleton('MapService', mapService)
				.registerSingleton('StyleService', styleService)
				.registerSingleton('BaaCredentialService', baaCredentialService);
			instanceUnderTest = new VectorLayerService(oafLoadFunctionProvider);
		};

		describe('constructor', () => {
			it('initializes the service with default providers', () => {
				setup();
				const instanceUnderTest = new VectorLayerService();
				expect(instanceUnderTest._oafLoadFunctionProvider).toEqual(getBvvOafLoadFunction);
			});

			it('initializes the service with custom provider', () => {
				const getBvvOafLoadFunctionCustomProvider = () => {};
				setup(undefined, getBvvOafLoadFunctionCustomProvider);
				expect(instanceUnderTest._oafLoadFunctionProvider).toEqual(getBvvOafLoadFunctionCustomProvider);
			});
		});

		describe('createLayer', () => {
			it('returns an ol vector layer for a VectorGeoResource', () => {
				setup();
				const id = 'id';
				const geoResourceId = 'geoResourceId';
				const geoResourceLabel = 'geoResourceLabel';
				const sourceAsString = 'kml';
				const olMap = new Map();
				const olSource = new VectorSource();
				const vectorGeoResource = new VectorGeoResource(geoResourceId, geoResourceLabel, VectorSourceType.KML).setSource(sourceAsString, 4326);
				spyOn(instanceUnderTest, '_vectorSourceForData').withArgs(vectorGeoResource).and.returnValue(olSource);
				spyOn(styleService, 'applyStyle')
					.withArgs(jasmine.anything(), olMap, vectorGeoResource)
					.and.callFake((olLayer) => olLayer);

				const olVectorLayer = instanceUnderTest.createLayer(id, vectorGeoResource, olMap);

				expect(olVectorLayer.get('id')).toBe(id);
				expect(olVectorLayer.get('geoResourceId')).toBe(geoResourceId);
				expect(olVectorLayer.getMinZoom()).toBeNegativeInfinity();
				expect(olVectorLayer.getMaxZoom()).toBePositiveInfinity();

				expect(olVectorLayer.constructor.name).toBe('VectorLayer');
				expect(olVectorLayer.getSource()).toEqual(olSource);
			});

			it('returns an ol vector layer for a OafVectorGeoResource', () => {
				setup();
				const id = 'id';
				const geoResourceId = 'geoResourceId';
				const geoResourceLabel = 'geoResourceLabel';
				const olMap = new Map();
				const olSource = new VectorSource();
				const vectorGeoResource = new OafGeoResource(geoResourceId, geoResourceLabel, 'url', 'collectionId');
				spyOn(instanceUnderTest, '_vectorSourceForOaf').withArgs(vectorGeoResource, jasmine.any(VectorLayer)).and.returnValue(olSource);
				spyOn(styleService, 'applyStyle')
					.withArgs(jasmine.anything(), olMap, vectorGeoResource)
					.and.callFake((olLayer) => olLayer);

				const olVectorLayer = instanceUnderTest.createLayer(id, vectorGeoResource, olMap);

				expect(olVectorLayer.get('id')).toBe(id);
				expect(olVectorLayer.get('geoResourceId')).toBe(geoResourceId);
				expect(olVectorLayer.getMinZoom()).toBeNegativeInfinity();
				expect(olVectorLayer.getMaxZoom()).toBePositiveInfinity();

				expect(olVectorLayer.constructor.name).toBe('VectorLayer');
				expect(olVectorLayer.getSource()).toEqual(olSource);
			});
		});

		describe('_vectorSourceForOaf', () => {
			it('builds an olVectorSource for a OafGeoResource', async () => {
				const getBvvOafLoadFunctionCustomProviderSpy = jasmine.createSpy().and.returnValue('loaded');
				setup(undefined, getBvvOafLoadFunctionCustomProviderSpy);
				const destinationSrid = 3857;
				spyOn(mapService, 'getSrid').and.returnValue(destinationSrid);
				const olVectorLayer = new VectorLayer();
				const vectorGeoResource = new OafGeoResource('someId', 'label', 'https://oaf.foo', 'collectionId');

				const olVectorSource = instanceUnderTest._vectorSourceForOaf(vectorGeoResource, olVectorLayer);

				expect(olVectorSource.constructor.name).toBe('VectorSource');
				expect(olVectorSource.loader_).toBe(getBvvOafLoadFunctionCustomProviderSpy());
				expect(olVectorSource.strategy_).toEqual(bbox);
				expect(getBvvOafLoadFunctionCustomProviderSpy).toHaveBeenCalledWith(vectorGeoResource.id, olVectorLayer);
			});

			it('builds an olVectorSource for a BAA restricted OafGeoResource', async () => {
				const url = 'https://some.url';
				const getBvvOafLoadFunctionCustomProviderSpy = jasmine.createSpy().and.returnValue('loaded');
				setup(undefined, getBvvOafLoadFunctionCustomProviderSpy);
				const destinationSrid = 3857;
				spyOn(mapService, 'getSrid').and.returnValue(destinationSrid);
				const credential = { username: 'u', password: 'p' };
				spyOn(baaCredentialService, 'get').withArgs(url).and.returnValue(credential);
				const olVectorLayer = new VectorLayer();
				const vectorGeoResource = new OafGeoResource('someId', 'label', url, 'collectionId').setAuthenticationType(GeoResourceAuthenticationType.BAA);

				const olVectorSource = instanceUnderTest._vectorSourceForOaf(vectorGeoResource, olVectorLayer);

				expect(olVectorSource.constructor.name).toBe('VectorSource');
				expect(olVectorSource.loader_).toBe(getBvvOafLoadFunctionCustomProviderSpy());
				expect(olVectorSource.strategy_).toEqual(bbox);
				expect(getBvvOafLoadFunctionCustomProviderSpy).toHaveBeenCalledWith(vectorGeoResource.id, olVectorLayer, credential);
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

			describe('KML VectorGeoresource has empty placemark ids', () => {
				it('sets the id of the corresponding feature to `undefined`', async () => {
					setup();
					const id = 'someId';
					const srid = 3857;
					const kmlName = 'kmlName';
					spyOn(mapService, 'getSrid').and.returnValue(srid);
					const sourceAsString = `<kml xmlns="http://www.opengis.net/kml/2.2" xmlns:gx="http://www.google.com/kml/ext/2.2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opengis.net/kml/2.2 https://developers.google.com/kml/schema/kml22gx.xsd"><Document><name>${kmlName}</name><Placemark id=" "><ExtendedData><Data name="type"><value>line</value></Data></ExtendedData><description></description><Style><LineStyle><color>ff0000ff</color><width>3</width></LineStyle><PolyStyle><color>660000ff</color></PolyStyle></Style><LineString><tessellate>1</tessellate><altitudeMode>clampToGround</altitudeMode><coordinates>10.713458946685412,49.70007647302964 11.714932179089468,48.34411758499924</coordinates></LineString></Placemark></Document></kml>`;
					const vectorGeoresource = new VectorGeoResource(id, null, VectorSourceType.KML).setSource(sourceAsString, 4326);

					const olVectorSource = instanceUnderTest._vectorSourceForData(vectorGeoresource);

					expect(olVectorSource.getFeatures().length).toBe(1);
					expect(olVectorSource.getFeatures()[0].getId()).toBeUndefined();
				});
			});

			describe('VectorGeoResource holds its data as `BaFeature`', () => {
				describe('exactly one feature', () => {
					it('builds an olVectorSource for a VectorGeoResource', async () => {
						setup();
						const kmlName = 'kmlName';
						const featureId = 'featureIO';
						const data = `<kml xmlns="http://www.opengis.net/kml/2.2" xmlns:gx="http://www.google.com/kml/ext/2.2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opengis.net/kml/2.2 https://developers.google.com/kml/schema/kml22gx.xsd"><Document><name>${kmlName}</name><Placemark id=" "><ExtendedData><Data name="type"><value>line</value></Data></ExtendedData><description></description><Style><LineStyle><color>ff0000ff</color><width>3</width></LineStyle><PolyStyle><color>660000ff</color></PolyStyle></Style><LineString><tessellate>1</tessellate><altitudeMode>clampToGround</altitudeMode><coordinates>10.713458946685412,49.70007647302964 11.714932179089468,48.34411758499924</coordinates></LineString></Placemark></Document></kml>`;
						const baGeometry = new BaGeometry(data, SourceType.forKml());
						const baFeature = new BaFeature(baGeometry, featureId).setStyleHint(StyleHint.HIGHLIGHT).set('foo', 'bar');
						const destinationSrid = 3857;
						const geoResourceLabel = 'geoResourceLabel';
						const expectedTypeValue = 'line';
						spyOn(mapService, 'getSrid').and.returnValue(destinationSrid);
						const vectorGeoResource = new VectorGeoResource('someId', geoResourceLabel).addFeature(baFeature).setShowPointNames(false);

						const olVectorSource = instanceUnderTest._vectorSourceForData(vectorGeoResource);

						expect(olVectorSource.constructor.name).toBe('VectorSource');
						expect(olVectorSource.getFeatures().length).toBe(1);
						expect(olVectorSource.getFeatures()[0].getId()).toBe(featureId);
						expect(olVectorSource.getFeatures()[0].get('type')).toBe(expectedTypeValue);
						expect(olVectorSource.getFeatures()[0].get('showPointNames')).toBeFalse();
						expect(olVectorSource.getFeatures()[0].get('styleHint')).toBe(StyleHint.HIGHLIGHT);
						expect(olVectorSource.getFeatures()[0].get('foo')).toBe('bar');
					});
				});

				describe('more than one feature', () => {
					it('builds an olVectorSource for a VectorGeoResource', async () => {
						setup();
						const kmlName = 'kmlName';
						const data = `<kml xmlns="http://www.opengis.net/kml/2.2" xmlns:gx="http://www.google.com/kml/ext/2.2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opengis.net/kml/2.2 https://developers.google.com/kml/schema/kml22gx.xsd"><Document><name>${kmlName}</name><Placemark id=" "><ExtendedData><Data name="type"><value>line</value></Data></ExtendedData><description></description><Style><LineStyle><color>ff0000ff</color><width>3</width></LineStyle><PolyStyle><color>660000ff</color></PolyStyle></Style><LineString><tessellate>1</tessellate><altitudeMode>clampToGround</altitudeMode><coordinates>10.713458946685412,49.70007647302964 11.714932179089468,48.34411758499924</coordinates></LineString></Placemark></Document></kml>`;
						const baGeometry = new BaGeometry(data, SourceType.forKml());
						const baFeatureO = new BaFeature(baGeometry, 'featureIdO');
						const baFeature1 = new BaFeature(baGeometry, 'featureId1');
						const destinationSrid = 3857;
						const geoResourceLabel = 'geoResourceLabel';
						const expectedTypeValue = 'line';
						spyOn(mapService, 'getSrid').and.returnValue(destinationSrid);
						const vectorGeoResource = new VectorGeoResource('someId', geoResourceLabel).setFeatures([baFeatureO, baFeature1]);

						const olVectorSource = instanceUnderTest._vectorSourceForData(vectorGeoResource);

						expect(olVectorSource.constructor.name).toBe('VectorSource');
						expect(olVectorSource.getFeatures().length).toBe(2);
						expect(olVectorSource.getFeatures()[1].get('type')).toBe(expectedTypeValue);
						expect(olVectorSource.getFeatures()[1].get('showPointNames')).toBeTrue();
					});
				});
				describe('the feature`s Geometry contains EWKT data', () => {
					it('builds an olVectorSource for an internal VectorGeoResource', () => {
						setup();
						const sourceSrid = 4326;
						const destinationSrid = 3857;
						const geoResourceLabel = 'geoResourceLabel';
						const data = `SRID=${sourceSrid};POINT(11 49)`;
						const baGeometry = new BaGeometry(data, SourceType.forEwkt(sourceSrid));
						const baFeature = new BaFeature(baGeometry, 'featureId');
						spyOn(mapService, 'getSrid').and.returnValue(destinationSrid);
						const vectorGeoResource = new VectorGeoResource('someId', geoResourceLabel, VectorSourceType.EWKT).addFeature(baFeature);

						const olVectorSource = instanceUnderTest._vectorSourceForData(vectorGeoResource);

						expect(olVectorSource.constructor.name).toBe('VectorSource');
						expect(olVectorSource.getFeatures().length).toBe(1);
					});
				});
			});
		});
	});
});
