import { $injector } from '../../../../../../src/injection';
import { VectorGeoResource, VectorSourceType } from '../../../../../../src/services/domain/geoResources';
import { load } from '../../../../../../src/modules/map/components/olMap/utils/feature.provider';
import { iconUrlFunction, mapVectorSourceTypeToFormat, VectorImportService } from '../../../../../../src/modules/map/components/olMap/services/VectorImportService';
import VectorSource, { VectorSourceEvent } from 'ol/source/Vector';
import { Feature, Map } from 'ol';
import { CollectionEvent } from 'ol/Collection';
import VectorLayer from 'ol/layer/Vector';


describe('VectorImportService', () => {

	const urlService = {
		proxifyInstant: () => { }
	};

	const mapService = {
		getSrid: () => { }
	};

	const styleService = {
		addStyle: () => { },
		removeStyle: () => { },
		updateStyle: () => { },
		isStyleRequired: () => { }
	};
	let instanceUnderTest;

	beforeAll(() => {
		$injector
			.registerSingleton('UrlService', urlService)
			.registerSingleton('MapService', mapService)
			.registerSingleton('StyleService', styleService);
	});

	describe('utils', () => {

		describe('mapVectorSourceTypeToFormat', () => {

			it('maps vectorSourceType to olFormats', () => {

				expect(mapVectorSourceTypeToFormat(VectorSourceType.KML).constructor.name).toBe('KML');
				expect(mapVectorSourceTypeToFormat(VectorSourceType.GPX).constructor.name).toBe('GPX');
				expect(mapVectorSourceTypeToFormat(VectorSourceType.GEOJSON).constructor.name).toBe('GeoJSON');
				expect(() => {
					mapVectorSourceTypeToFormat('unknown');
				})
					.toThrowError(/unknown currently not supported/);
			});
		});


		describe('iconUrlFunction', () => {

			it('provides a function that proxifies an url', () => {
				const iconUrl = 'https://some.url';
				spyOn(urlService, 'proxifyInstant').withArgs(iconUrl).and.returnValue('https://proxy.url?url=' + iconUrl);

				expect(iconUrlFunction(iconUrl)).toBe('https://proxy.url?url=' + iconUrl);
			});
		});

	});

	describe('service methods', () => {

		beforeEach(() => {
			instanceUnderTest = new VectorImportService();
		});

		describe('createVectorSource', () => {

			it('returns an ol vector source for an data based VectorGeoResource ', () => {
				const expectedResult = 'foo';
				const geoResourceLabel = 'geoResourceLabel';
				const sourceAsString = 'kml';
				const vectorGeoresource = new VectorGeoResource('someId', geoResourceLabel, VectorSourceType.KML).setSource(sourceAsString, 4326);
				spyOn(instanceUnderTest, '_vectorSourceForData').withArgs(vectorGeoresource).and.returnValue(expectedResult);
				const vectorSourceForUrlSpy = spyOn(instanceUnderTest, '_vectorSourceForUrl');

				const olVectorSource = instanceUnderTest.createVectorSource(vectorGeoresource);

				expect(olVectorSource).toEqual(expectedResult);
				expect(vectorSourceForUrlSpy).not.toHaveBeenCalled();
			});

			it('returns an ol vector source for an URL based VectorGeoResource ', () => {
				const expectedResult = 'foo';
				const geoResourceLabel = 'geoResourceLabel';
				const vectorGeoresource = new VectorGeoResource('someId', geoResourceLabel, VectorSourceType.KML).setUrl('http://foo.bar');
				spyOn(instanceUnderTest, '_vectorSourceForUrl').withArgs(vectorGeoresource).and.returnValue(expectedResult);
				const vectorSourceForDataSpy = spyOn(instanceUnderTest, '_vectorSourceForData');

				const olVectorSource = instanceUnderTest.createVectorSource(vectorGeoresource);

				expect(olVectorSource).toEqual(expectedResult);
				expect(vectorSourceForDataSpy).not.toHaveBeenCalled();
			});
		});

		describe('_vectorSourceForData', () => {

			it('builds an olVectorSource for an internal VectorGeoresource', () => {
				const srid = 3857;
				const kmlName = '';
				const geoResourceLabel = 'geoResourceLabel';
				spyOn(mapService, 'getSrid').and.returnValue(srid);
				const sourceAsString = `<kml xmlns="http://www.opengis.net/kml/2.2" xmlns:gx="http://www.google.com/kml/ext/2.2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opengis.net/kml/2.2 https://developers.google.com/kml/schema/kml22gx.xsd"><Document><name>${kmlName}</name><Placemark id="line_1617976924317"><ExtendedData><Data name="type"><value>line</value></Data></ExtendedData><description></description><Style><LineStyle><color>ff0000ff</color><width>3</width></LineStyle><PolyStyle><color>660000ff</color></PolyStyle></Style><LineString><tessellate>1</tessellate><altitudeMode>clampToGround</altitudeMode><coordinates>10.713458946685412,49.70007647302964 11.714932179089468,48.34411758499924</coordinates></LineString></Placemark></Document></kml>`;
				const vectorGeoresource = new VectorGeoResource('someId', geoResourceLabel, VectorSourceType.KML).setSource(sourceAsString, 4326);

				const olVectorSource = instanceUnderTest._vectorSourceForData(vectorGeoresource);

				expect(olVectorSource.constructor.name).toBe('VectorSource');
				expect(olVectorSource.getFeatures().length).toBe(1);
				expect(olVectorSource.getFeatures()[0].get('srid')).toBe(srid);
			});

			it('updates the label of an internal VectorGeoresource if possible', () => {
				const srid = 3857;
				const kmlName = 'kmlName';
				const geoResourceLabel = 'geoResourceLabel';
				spyOn(mapService, 'getSrid').and.returnValue(srid);
				const sourceAsString = `<kml xmlns="http://www.opengis.net/kml/2.2" xmlns:gx="http://www.google.com/kml/ext/2.2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opengis.net/kml/2.2 https://developers.google.com/kml/schema/kml22gx.xsd"><Document><name>${kmlName}</name><Placemark id="line_1617976924317"><ExtendedData><Data name="type"><value>line</value></Data></ExtendedData><description></description><Style><LineStyle><color>ff0000ff</color><width>3</width></LineStyle><PolyStyle><color>660000ff</color></PolyStyle></Style><LineString><tessellate>1</tessellate><altitudeMode>clampToGround</altitudeMode><coordinates>10.713458946685412,49.70007647302964 11.714932179089468,48.34411758499924</coordinates></LineString></Placemark></Document></kml>`;
				const vectorGeoresource = new VectorGeoResource('someId', geoResourceLabel, VectorSourceType.KML).setSource(sourceAsString, 4326);

				instanceUnderTest._vectorSourceForData(vectorGeoresource);

				expect(vectorGeoresource.label).toBe(kmlName);
			});
		});

		describe('_vectorSourceForUrl', () => {

			it('builds an olVectorSource for an external VectorGeoresource', () => {
				const url = 'https://some.url';
				spyOn(urlService, 'proxifyInstant').withArgs(url).and.returnValue('https://proxy.url?' + url);
				const vectorGeoresource = new VectorGeoResource('someId', 'Label', VectorSourceType.KML).setUrl(url);

				const olVectorSource = instanceUnderTest._vectorSourceForUrl(vectorGeoresource);

				expect(olVectorSource.constructor.name).toBe('VectorSource');
				expect(olVectorSource.getUrl()).toBe('https://proxy.url?' + url);
				expect(olVectorSource.getFormat().constructor.name).toBe('KML');
				expect(olVectorSource.loader_).toEqual(load);
				expect(olVectorSource.getFormat().iconUrlFunction_).toEqual(iconUrlFunction);
			});
		});

		describe('_registerEvents', () => {

			it('adds four listeners', () => {

				const { addFeatureListenerKey, removeFeatureListenerKey, clearFeaturesListenerKey, addLayerListenerKey }
					= instanceUnderTest._registerStyleEventListeners(new VectorSource(), new VectorLayer(), new Map());

				expect(addFeatureListenerKey).toBeDefined();
				expect(removeFeatureListenerKey).toBeDefined();
				expect(clearFeaturesListenerKey).toBeDefined();
				expect(addLayerListenerKey).toBeDefined();
			});


			it('calls StyleService#addStyle on "addFeature"', () => {
				const olMap = new Map();
				const olSource = new VectorSource();
				const olLayer = new VectorLayer();
				const olFeature = new Feature();
				const styleServiceSpy = spyOn(styleService, 'addStyle');
				instanceUnderTest._registerStyleEventListeners(olSource, olLayer, olMap);

				olSource.dispatchEvent(new VectorSourceEvent('addfeature', olFeature));

				expect(styleServiceSpy).toHaveBeenCalledWith(olFeature, olMap);
			});

			it('calls StyleService#updateStyle on "addFeature" when layer is attached', () => {
				const olMap = new Map();
				const olSource = new VectorSource();
				const olFeature = new Feature();
				const styleServiceAddSpy = spyOn(styleService, 'addStyle');
				const styleServiceUpdateSpy = spyOn(instanceUnderTest, '_updateStyle');
				const olLayer = new VectorLayer();
				instanceUnderTest._registerStyleEventListeners(olSource, olLayer, olMap);

				olSource.dispatchEvent(new VectorSourceEvent('addfeature', olFeature));

				expect(styleServiceAddSpy).toHaveBeenCalledWith(olFeature, olMap);
				expect(styleServiceUpdateSpy).toHaveBeenCalledWith(olFeature, olLayer, olMap);
			});

			it('calls StyleService#removeStyle on "removeFeature"', () => {
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

			it('does nothing', () => {
				const updateProperties = { visible: false, top: false, opacity: .5 };
				const olMap = new Map();
				const olFeature = new Feature();
				const olSource = new VectorSource();
				const olLayer = new VectorLayer({ source: olSource, visible: updateProperties.visible, opacity: updateProperties.opacity });
				const styleServiceSpy = spyOn(styleService, 'updateStyle');

				instanceUnderTest._updateStyle(olFeature, olLayer, olMap);

				expect(styleServiceSpy).toHaveBeenCalledWith(olFeature, olMap, updateProperties);
			});
		});

		describe('applyStyles', () => {

			it('returns the olLayer ', () => {
				const olMap = new Map();
				const olSource = new VectorSource();
				const olLayer = new VectorLayer({ source: olSource });

				const result = instanceUnderTest.applyStyles(olLayer, olMap);

				expect(result).toBe(olLayer);
			});

			describe('when feature that does not needs a specific styling', () => {

				it('does nothing', () => {
					const olMap = new Map();
					const olFeature = new Feature();
					const olSource = new VectorSource();
					const olLayer = new VectorLayer({ source: olSource });
					spyOn(styleService, 'isStyleRequired').and.returnValue(false);
					const registerStyleEventListenersSpy = spyOn(instanceUnderTest, '_registerStyleEventListeners');
					const styleServiceAddSpy = spyOn(styleService, 'addStyle');

					instanceUnderTest.applyStyles(olLayer, olMap);
					olSource.dispatchEvent(new VectorSourceEvent('addfeature', olFeature));

					expect(styleServiceAddSpy).not.toHaveBeenCalledWith(olFeature, olMap);
					expect(registerStyleEventListenersSpy).not.toHaveBeenCalledWith(olSource, olMap);
				});
			});

			describe('when a feature needs a specific styling', () => {

				it('adds a style and registers style event listeners', () => {
					const olMap = new Map();
					const olFeature = new Feature();
					const olSource = new VectorSource();
					const olLayer = new VectorLayer({ source: olSource });
					spyOn(styleService, 'isStyleRequired').and.returnValue(true);
					const registerStyleEventListenersSpy = spyOn(instanceUnderTest, '_registerStyleEventListeners');
					const styleServiceAddSpy = spyOn(styleService, 'addStyle');
					const updateStyleSpy = spyOn(instanceUnderTest, '_updateStyle');

					instanceUnderTest.applyStyles(olLayer, olMap);
					//we dispatch two events in order to check if the listener is unregistered after the first event
					olSource.dispatchEvent(new VectorSourceEvent('addfeature', olFeature));
					olSource.dispatchEvent(new VectorSourceEvent('addfeature', olFeature));

					expect(styleServiceAddSpy).toHaveBeenCalledOnceWith(olFeature, olMap);
					expect(updateStyleSpy).toHaveBeenCalledOnceWith(olFeature, olLayer, olMap);
					expect(registerStyleEventListenersSpy).toHaveBeenCalledOnceWith(olSource, olLayer, olMap);
				});
			});
		});
	});
});
