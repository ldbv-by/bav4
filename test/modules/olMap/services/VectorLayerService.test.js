import { $injector } from '@src/injection';
import { GeoResourceAuthenticationType, OafGeoResource, VectorGeoResource, VectorSourceType } from '@src/domain/geoResources';
import {
	bvvIconUrlFunction,
	iconUrlFunction,
	mapSourceTypeToFormat,
	mapVectorSourceTypeToFormat,
	VectorLayerService
} from '@src/modules/olMap/services/VectorLayerService';
import VectorSource from 'ol/source/Vector';
import { Map } from 'ol';
import VectorLayer from 'ol/layer/Vector';
import { TestUtils } from '@test/test-utils';
import { layersReducer } from '@src/store/layers/layers.reducer';
import { UnavailableGeoResourceError } from '@src/domain/errors';
import { StyleHint } from '@src/domain/styles';
import { BaGeometry } from '@src/domain/geometry';
import { BaFeature } from '@src/domain/feature';
import { SourceType } from '@src/domain/sourceType';
import { getBvvOafLoadFunction } from '@src/modules/olMap/utils/olLoadFunction.provider';
import { bbox } from 'ol/loadingstrategy.js';
import { asInternalProperty } from '@src/utils/propertyUtils';
import { ObjectEvent } from 'ol/Object';

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
		addInternalFeatureStyle: () => {},
		removeInternalFeatureStyle: () => {},
		updateInternalFeatureStyle: () => {},
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
					mapVectorSourceTypeToFormat(new VectorGeoResource('id', 'label', VectorSourceType.KML).setDisplayFeatureLabels(false)).showPointNames_
				).toBe(false);
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
				expect(mapSourceTypeToFormat(SourceType.forKml(), false).showPointNames_).toBe(false);
				expect(mapSourceTypeToFormat(SourceType.forKml(), true).showPointNames_).toBe(true);
				expect(mapSourceTypeToFormat(SourceType.forKml()).showPointNames_).toBe(true);
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
				const urlServiceSpy = vi.spyOn(urlService, 'proxifyInstant').mockReturnValue('https://proxy.url?url=' + iconUrl);

				expect(iconUrlFunction(iconUrl)).toBe('https://proxy.url?url=' + iconUrl);
				expect(urlServiceSpy).toHaveBeenCalledWith(iconUrl, false);
			});
		});

		describe('bvvIconUrlFunction', () => {
			it('provides a function that just proxifies a URL', () => {
				const iconUrl = 'https://some.url';
				const urlServiceSpy = vi.spyOn(urlService, 'proxifyInstant').mockReturnValue('https://proxy.url?url=' + iconUrl);

				expect(bvvIconUrlFunction(iconUrl)).toBe('https://proxy.url?url=' + iconUrl);
				expect(urlServiceSpy).toHaveBeenCalledWith(iconUrl, false);
			});

			it('provides a function that maps a legacy BVV icon URL', () => {
				const backendUrl = 'https://backend.url/';
				const iconUrl = 'https://geoportal.bayern.de/ba-backend/icons/255,0,0/marker';
				const configServiceSpy = vi.spyOn(configService, 'getValueAsPath').mockReturnValue(backendUrl);

				expect(bvvIconUrlFunction(iconUrl)).toBe(`${backendUrl}icons/255,0,0/marker.png`);
				expect(configServiceSpy).toHaveBeenCalledWith('BACKEND_URL');
			});

			it('provides a function that leaves any other legacy BVV icon URL untouched', () => {
				const backendUrl = 'https://backend.url/';
				const anyOtherLegacyUrl = 'https://geoportal.bayern.de/ba-backend/other';
				const configServiceSpy = vi.spyOn(configService, 'getValueAsPath').mockReturnValue(backendUrl);

				expect(bvvIconUrlFunction(anyOtherLegacyUrl)).toBe(anyOtherLegacyUrl);
				expect(configServiceSpy).not.toHaveBeenCalled();
			});

			it('provides a function that leaves a BVV icon URL untouched', () => {
				const backendUrl = 'https://backend.url/';
				const iconUrl = `${backendUrl}icons/255,0,0/marker`;
				const configServiceSpy = vi.spyOn(configService, 'getValueAsPath').mockReturnValue(backendUrl);

				expect(bvvIconUrlFunction(iconUrl)).toBe(iconUrl);
				expect(configServiceSpy).toHaveBeenCalledWith('BACKEND_URL');
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

		describe('class', () => {
			it('defines constant values', async () => {
				expect(VectorLayerService.REFRESH_DEBOUNCE_DELAY_MS).toBe(500);
			});
		});

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
				const vectorSourceForDataSpy = vi.spyOn(instanceUnderTest, '_vectorSourceForData').mockReturnValue(olSource);
				const applyStyleSpy = vi.spyOn(styleService, 'applyStyle').mockImplementation((olLayer) => olLayer);

				const olVectorLayer = instanceUnderTest.createLayer(id, vectorGeoResource, olMap);

				expect(olVectorLayer.get('id')).toBe(id);
				expect(olVectorLayer.get('geoResourceId')).toBe(geoResourceId);
				expect(olVectorLayer.getMinZoom()).toBe(-Infinity);
				expect(olVectorLayer.getMaxZoom()).toBe(Infinity);

				expect(olVectorLayer.constructor.name).toBe('VectorLayer');
				expect(olVectorLayer.getSource()).toEqual(olSource);
				expect(vectorSourceForDataSpy).toHaveBeenCalledWith(vectorGeoResource);
				expect(applyStyleSpy).toHaveBeenCalledWith(expect.anything(), olMap, vectorGeoResource);
			});

			it('returns an ol vector layer for a OafVectorGeoResource', () => {
				setup();
				const id = 'id';
				const geoResourceId = 'geoResourceId';
				const geoResourceLabel = 'geoResourceLabel';
				const olMap = new Map();
				const olSource = new VectorSource();
				const vectorGeoResource = new OafGeoResource(geoResourceId, geoResourceLabel, 'url', 'collectionId');
				const vectorSourceForOafSpy = vi.spyOn(instanceUnderTest, '_vectorSourceForOaf').mockReturnValue(olSource);
				const applyStyleSpy = vi.spyOn(styleService, 'applyStyle').mockImplementation((olLayer) => olLayer);

				const olVectorLayer = instanceUnderTest.createLayer(id, vectorGeoResource, olMap);

				expect(olVectorLayer.get('id')).toBe(id);
				expect(olVectorLayer.get('geoResourceId')).toBe(geoResourceId);
				expect(olVectorLayer.getMinZoom()).toBe(-Infinity);
				expect(olVectorLayer.getMaxZoom()).toBe(Infinity);

				expect(olVectorLayer.constructor.name).toBe('VectorLayer');
				expect(olVectorLayer.getSource()).toEqual(olSource);
				expect(vectorSourceForOafSpy).toHaveBeenCalledWith(vectorGeoResource, expect.any(VectorLayer), olMap);
				expect(applyStyleSpy).toHaveBeenCalledWith(expect.anything(), olMap, vectorGeoResource);
			});

			it('registers a `featuresloadend` listener that calls the StyleService', () => {
				setup();
				const id = 'id';
				const geoResourceId = 'geoResourceId';
				const geoResourceLabel = 'geoResourceLabel';
				const sourceAsString = 'kml';
				const olMap = new Map();
				const olSource = new VectorSource();
				const vectorGeoResource = new VectorGeoResource(geoResourceId, geoResourceLabel, VectorSourceType.KML).setSource(sourceAsString, 4326);
				const vectorSourceForDataSpy = vi.spyOn(instanceUnderTest, '_vectorSourceForData').mockReturnValue(olSource);
				const applyStyleSpy = vi.spyOn(styleService, 'applyStyle').mockImplementation((olLayer) => olLayer);

				instanceUnderTest.createLayer(id, vectorGeoResource, olMap);

				expect(applyStyleSpy).toHaveBeenCalledTimes(1);

				olSource.dispatchEvent('featuresloadend');

				expect(applyStyleSpy).toHaveBeenCalledTimes(2);
				expect(applyStyleSpy).toHaveBeenLastCalledWith(expect.anything(), olMap, vectorGeoResource);
				expect(vectorSourceForDataSpy).toHaveBeenCalledWith(vectorGeoResource);
			});

			it('registers a `propertychange` listener that that calls the StyleService', () => {
				setup();
				const id = 'id';
				const geoResourceId = 'geoResourceId';
				const geoResourceLabel = 'geoResourceLabel';
				const sourceAsString = 'kml';
				const olMap = new Map();
				const olSource = new VectorSource();
				const vectorGeoResource = new VectorGeoResource(geoResourceId, geoResourceLabel, VectorSourceType.KML).setSource(sourceAsString, 4326);
				const vectorSourceForDataSpy = vi.spyOn(instanceUnderTest, '_vectorSourceForData').mockReturnValue(olSource);
				const applyStyleSpy = vi.spyOn(styleService, 'applyStyle').mockImplementation((olLayer) => olLayer);

				const olLayer = instanceUnderTest.createLayer(id, vectorGeoResource, olMap);

				expect(applyStyleSpy).toHaveBeenCalledTimes(1);

				olLayer.set('foo', 'bar');

				expect(applyStyleSpy).toHaveBeenCalledTimes(1);

				olLayer.set('style', { baseColor: '#34ebcd' });

				expect(applyStyleSpy).toHaveBeenCalledTimes(2);

				olLayer.set('displayFeatureLabels', false);

				expect(applyStyleSpy).toHaveBeenCalledTimes(3);
				expect(vectorSourceForDataSpy).toHaveBeenCalledWith(vectorGeoResource);
			});
		});

		describe('_vectorSourceForOaf', () => {
			beforeEach(() => {
				vi.useFakeTimers();
			});

			afterEach(() => {
				vi.useRealTimers();
			});

			it('builds an olVectorSource for a OafGeoResource', async () => {
				const getBvvOafLoadFunctionCustomProviderSpy = vi.fn().mockReturnValue('loaded');
				setup(undefined, getBvvOafLoadFunctionCustomProviderSpy);
				const destinationSrid = 3857;
				vi.spyOn(mapService, 'getSrid').mockReturnValue(destinationSrid);
				const olVectorLayer = new VectorLayer();
				const vectorGeoResource = new OafGeoResource('someId', 'label', 'https://oaf.foo', 'collectionId');
				const olMap = new Map();

				const olVectorSource = instanceUnderTest._vectorSourceForOaf(vectorGeoResource, olVectorLayer, olMap);

				expect(olVectorSource.constructor.name).toBe('VectorSource');
				expect(olVectorSource.loader_).toBe(getBvvOafLoadFunctionCustomProviderSpy());
				expect(olVectorSource.strategy_).toEqual(bbox);
				expect(getBvvOafLoadFunctionCustomProviderSpy).toHaveBeenCalledWith(vectorGeoResource.id, olVectorLayer);
			});

			it('builds an olVectorSource for a BAA restricted OafGeoResource', async () => {
				const url = 'https://some.url';
				const getBvvOafLoadFunctionCustomProviderSpy = vi.fn().mockReturnValue('loaded');
				setup(undefined, getBvvOafLoadFunctionCustomProviderSpy);
				const destinationSrid = 3857;
				vi.spyOn(mapService, 'getSrid').mockReturnValue(destinationSrid);
				const credential = { username: 'u', password: 'p' };
				const baaCredentialServiceSpy = vi.spyOn(baaCredentialService, 'get').mockReturnValue(credential);
				const olVectorLayer = new VectorLayer();
				const vectorGeoResource = new OafGeoResource('someId', 'label', url, 'collectionId').setAuthenticationType(GeoResourceAuthenticationType.BAA);
				const olMap = new Map();

				const olVectorSource = instanceUnderTest._vectorSourceForOaf(vectorGeoResource, olVectorLayer, olMap);

				expect(olVectorSource.constructor.name).toBe('VectorSource');
				expect(olVectorSource.loader_).toBe(getBvvOafLoadFunctionCustomProviderSpy());
				expect(olVectorSource.strategy_).toEqual(bbox);
				expect(getBvvOafLoadFunctionCustomProviderSpy).toHaveBeenCalledWith(vectorGeoResource.id, olVectorLayer, credential);
				expect(baaCredentialServiceSpy).toHaveBeenCalledWith(url);
			});

			it('registers a propertychange listener that calls `refresh` of the ol.source when the `filter` property changes', () => {
				const getBvvOafLoadFunctionCustomProviderSpy = vi.fn().mockReturnValue('loaded');
				setup(undefined, getBvvOafLoadFunctionCustomProviderSpy);
				const destinationSrid = 3857;
				vi.spyOn(mapService, 'getSrid').mockReturnValue(destinationSrid);
				const olVectorLayer = new VectorLayer();
				const vectorGeoResource = new OafGeoResource('someId', 'label', 'https://oaf.foo', 'collectionId');
				const olMap = new Map();
				const olVectorSource = instanceUnderTest._vectorSourceForOaf(vectorGeoResource, olVectorLayer, olMap);
				const olSourceSpy = vi.spyOn(olVectorSource, 'refresh');

				olVectorLayer.set('foo', 'bar');

				expect(olSourceSpy).not.toHaveBeenCalled();

				olVectorLayer.set('filter', 'foo=bar');
				olVectorLayer.set('filter', 'foo=bar');

				expect(olSourceSpy).toHaveBeenCalledTimes(1);
			});

			it('registers a change:resolution listener that calls `refresh` in a debounced manner of the ol.source when the data of the source are incomplete', async () => {
				const getBvvOafLoadFunctionCustomProviderSpy = vi.fn().mockReturnValue('loaded');
				setup(undefined, getBvvOafLoadFunctionCustomProviderSpy);
				const destinationSrid = 3857;
				vi.spyOn(mapService, 'getSrid').mockReturnValue(destinationSrid);
				const olVectorLayer = new VectorLayer();
				const olMap = new Map();
				olMap.getLayers().push(olVectorLayer);
				const vectorGeoResource = new OafGeoResource('someId', 'label', 'https://oaf.foo', 'collectionId');
				const olVectorSource = instanceUnderTest._vectorSourceForOaf(vectorGeoResource, olVectorLayer, olMap);
				const olSourceSpy = vi.spyOn(olVectorSource, 'refresh');

				vi.spyOn(olMap.getView(), 'get').mockImplementation((key) => {
					if (key === 'resolution') {
						return 100;
					}
				});
				const resolutionIncreaseChangeEvent = new ObjectEvent('change:resolution', 'resolution', 1000 /** old resolution */);
				const resolutionDecreaseChangeEvent = new ObjectEvent('change:resolution', 'resolution', 50 /** old resolution */);

				olMap.getView().dispatchEvent(resolutionIncreaseChangeEvent);
				olMap.getView().dispatchEvent(resolutionIncreaseChangeEvent);
				olMap.getView().dispatchEvent(resolutionIncreaseChangeEvent);

				vi.advanceTimersByTime(VectorLayerService.REFRESH_DEBOUNCE_DELAY_MS + 100);

				expect(olSourceSpy).not.toHaveBeenCalled();

				olVectorSource.set('incomplete_data', true);

				olMap.getView().dispatchEvent(resolutionIncreaseChangeEvent);
				olMap.getView().dispatchEvent(resolutionIncreaseChangeEvent);
				olMap.getView().dispatchEvent(resolutionIncreaseChangeEvent);

				vi.advanceTimersByTime(VectorLayerService.REFRESH_DEBOUNCE_DELAY_MS + 100);

				expect(olSourceSpy).toHaveBeenCalledTimes(1);

				olVectorSource.unset('incomplete_data', true);
				olVectorSource.set('possible_incomplete_data', true);

				olMap.getView().dispatchEvent(resolutionIncreaseChangeEvent);
				olMap.getView().dispatchEvent(resolutionIncreaseChangeEvent);
				olMap.getView().dispatchEvent(resolutionIncreaseChangeEvent);

				vi.advanceTimersByTime(VectorLayerService.REFRESH_DEBOUNCE_DELAY_MS + 100);

				expect(olSourceSpy).toHaveBeenCalledTimes(2);

				olMap.getView().dispatchEvent(resolutionDecreaseChangeEvent);
				olMap.getView().dispatchEvent(resolutionDecreaseChangeEvent);
				olMap.getView().dispatchEvent(resolutionDecreaseChangeEvent);

				vi.advanceTimersByTime(VectorLayerService.REFRESH_DEBOUNCE_DELAY_MS + 100);

				expect(olSourceSpy).toHaveBeenCalledTimes(2);
			});

			it('unregisters a change:resolution listener when the layer is not attached to the map', () => {
				const getBvvOafLoadFunctionCustomProviderSpy = vi.fn().mockReturnValue('loaded');
				setup(undefined, getBvvOafLoadFunctionCustomProviderSpy);
				const destinationSrid = 3857;
				vi.spyOn(mapService, 'getSrid').mockReturnValue(destinationSrid);
				const olVectorLayer = new VectorLayer();
				const olMap = new Map();
				const vectorGeoResource = new OafGeoResource('someId', 'label', 'https://oaf.foo', 'collectionId');
				const olVectorSource = instanceUnderTest._vectorSourceForOaf(vectorGeoResource, olVectorLayer, olMap);
				const olSourceSpy = vi.spyOn(olVectorSource, 'refresh');
				const unRegisterSpy = vi.spyOn(instanceUnderTest, '_unregisterOlListener');

				olMap.getView().dispatchEvent('change:resolution');

				expect(unRegisterSpy).toHaveBeenCalledWith(expect.anything());
				expect(olSourceSpy).not.toHaveBeenCalled();
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
				vi.spyOn(mapService, 'getSrid').mockReturnValue(destinationSrid);
				const sourceAsString = `<kml xmlns="http://www.opengis.net/kml/2.2" xmlns:gx="http://www.google.com/kml/ext/2.2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opengis.net/kml/2.2 https://developers.google.com/kml/schema/kml22gx.xsd"><Document><name>${kmlName}</name><Placemark id="line_1617976924317"><ExtendedData><Data name="type"><value>line</value></Data></ExtendedData><description></description><Style><LineStyle><color>ff0000ff</color><width>3</width></LineStyle><PolyStyle><color>660000ff</color></PolyStyle></Style><LineString><tessellate>1</tessellate><altitudeMode>clampToGround</altitudeMode><coordinates>10.713458946685412,49.70007647302964 11.714932179089468,48.34411758499924</coordinates></LineString></Placemark></Document></kml>`;
				const vectorGeoResource = new VectorGeoResource('someId', geoResourceLabel, VectorSourceType.KML)
					.setSource(sourceAsString, sourceSrid)
					.setDisplayFeatureLabels(false);

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
				vi.spyOn(mapService, 'getSrid').mockReturnValue(destinationSrid);
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
				vi.spyOn(mapService, 'getSrid').mockReturnValue(destinationSrid);
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
				vi.spyOn(mapService, 'getSrid').mockReturnValue(destinationSrid);
				const sourceAsString = `SRID=4326;POLYGON((7.58081 48.13805,7.58081 48.100 46,7.57031 48.10046,7.57031 48.13805,7.58081 48.13805))`;
				const geoResourceId = 'someId';
				const vectorGeoResource = new VectorGeoResource(geoResourceId, geoResourceLabel, VectorSourceType.EWKT).setSource(sourceAsString, sourceSrid);

				expect(() => {
					instanceUnderTest._vectorSourceForData(vectorGeoResource);
				}).toThrow(new UnavailableGeoResourceError('Data of VectorGeoResource could not be parsed', geoResourceId));
			});

			it('filters out features without a geometry', () => {
				setup();
				const sourceSrid = 4326;
				const expectedSrid = 3857;
				const geoResourceLabel = 'geoResourceLabel';
				vi.spyOn(mapService, 'getSrid').mockReturnValue(expectedSrid);
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
					vi.spyOn(mapService, 'getSrid').mockReturnValue(srid);
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
					vi.spyOn(mapService, 'getSrid').mockReturnValue(srid);
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
						const baFeature = new BaFeature(baGeometry, featureId).setStyleHint(StyleHint.HIGHLIGHT).setStyle('myStyle').set('foo', 'bar');
						const destinationSrid = 3857;
						const geoResourceLabel = 'geoResourceLabel';
						const expectedTypeValue = 'line';
						vi.spyOn(mapService, 'getSrid').mockReturnValue(destinationSrid);
						const vectorGeoResource = new VectorGeoResource('someId', geoResourceLabel).addFeature(baFeature).setDisplayFeatureLabels(false);

						const olVectorSource = instanceUnderTest._vectorSourceForData(vectorGeoResource);

						expect(olVectorSource.constructor.name).toBe('VectorSource');
						expect(olVectorSource.getFeatures().length).toBe(1);
						expect(olVectorSource.getFeatures()[0].getId()).toBe(featureId);
						expect(olVectorSource.getFeatures()[0].get('type')).toBe(expectedTypeValue);
						expect(olVectorSource.getFeatures()[0].get(asInternalProperty('styleHint'))).toBe(StyleHint.HIGHLIGHT);
						expect(olVectorSource.getFeatures()[0].get(asInternalProperty('style'))).toBe('myStyle');
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
						vi.spyOn(mapService, 'getSrid').mockReturnValue(destinationSrid);
						const vectorGeoResource = new VectorGeoResource('someId', geoResourceLabel).setFeatures([baFeatureO, baFeature1]);

						const olVectorSource = instanceUnderTest._vectorSourceForData(vectorGeoResource);

						expect(olVectorSource.constructor.name).toBe('VectorSource');
						expect(olVectorSource.getFeatures().length).toBe(2);
						expect(olVectorSource.getFeatures()[1].get('type')).toBe(expectedTypeValue);
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
						vi.spyOn(mapService, 'getSrid').mockReturnValue(destinationSrid);
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
