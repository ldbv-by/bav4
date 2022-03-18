import { $injector } from '../../../../../../src/injection';
import { VectorGeoResource, VectorSourceType } from '../../../../../../src/services/domain/geoResources';
import { load } from '../../../../../../src/modules/map/components/olMap/utils/feature.provider';
import { iconUrlFunction, mapVectorSourceTypeToFormat, VectorLayerService } from '../../../../../../src/modules/map/components/olMap/services/VectorLayerService';
import VectorSource, { VectorSourceEvent } from 'ol/source/Vector';
import { Feature, Map } from 'ol';
import { CollectionEvent } from 'ol/Collection';
import VectorLayer from 'ol/layer/Vector';


describe('VectorLayerService', () => {

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
			instanceUnderTest = new VectorLayerService();
		});

		describe('createVectorLayer', () => {

			it('returns an ol vector layer for an data based VectorGeoResource', () => {
				const id = 'someId';
				const geoResourceLabel = 'geoResourceLabel';
				const sourceAsString = 'kml';
				const olMap = new Map();
				const olSource = new VectorSource();
				const vectorGeoresource = new VectorGeoResource(id, geoResourceLabel, VectorSourceType.KML).setSource(sourceAsString, 4326);
				spyOn(instanceUnderTest, '_vectorSourceForData').withArgs(vectorGeoresource).and.returnValue(olSource);
				spyOn(instanceUnderTest, '_applyStyles').withArgs(jasmine.anything(), olMap).and.callFake(layer => layer);
				const vectorSourceForUrlSpy = spyOn(instanceUnderTest, '_vectorSourceForUrl');

				const olVectorLayer = instanceUnderTest.createVectorLayer(vectorGeoresource, olMap);

				expect(olVectorLayer.get('id')).toBe('someId');
				expect(olVectorLayer.getMinZoom()).toBeNegativeInfinity();
				expect(olVectorLayer.getMaxZoom()).toBePositiveInfinity();

				expect(olVectorLayer.constructor.name).toBe('VectorLayer');
				expect(olVectorLayer.getSource()).toEqual(olSource);
				expect(vectorSourceForUrlSpy).not.toHaveBeenCalled();
			});

			it('returns an ol vector layer for an data based VectorGeoResource containing optional properties', () => {
				const id = 'someId';
				const geoResourceLabel = 'geoResourceLabel';
				const sourceAsString = 'kml';
				const olMap = new Map();
				const olSource = new VectorSource();
				const vectorGeoresource = new VectorGeoResource(id, geoResourceLabel, VectorSourceType.KML).setSource(sourceAsString, 4326)
					.setOpacity(.5)
					.setMinZoom(5)
					.setMaxZoom(19);
				spyOn(instanceUnderTest, '_vectorSourceForData').withArgs(vectorGeoresource).and.returnValue(olSource);
				spyOn(instanceUnderTest, '_applyStyles').withArgs(jasmine.anything(), olMap).and.callFake(layer => layer);
				const vectorSourceForUrlSpy = spyOn(instanceUnderTest, '_vectorSourceForUrl');

				const olVectorLayer = instanceUnderTest.createVectorLayer(vectorGeoresource, olMap);

				expect(olVectorLayer.get('id')).toBe('someId');
				expect(olVectorLayer.getOpacity()).toBe(.5);
				expect(olVectorLayer.getMinZoom()).toBe(5);
				expect(olVectorLayer.getMaxZoom()).toBe(19);
				expect(olVectorLayer.constructor.name).toBe('VectorLayer');
				expect(olVectorLayer.getSource()).toEqual(olSource);
				expect(vectorSourceForUrlSpy).not.toHaveBeenCalled();
			});

			it('returns an ol vector layer for an URL based VectorGeoResource', () => {
				const id = 'someId';
				const geoResourceLabel = 'geoResourceLabel';
				const olMap = new Map();
				const olSource = new VectorSource();
				const vectorGeoresource = new VectorGeoResource(id, geoResourceLabel, VectorSourceType.KML).setUrl('http://foo.bar');
				spyOn(instanceUnderTest, '_vectorSourceForUrl').withArgs(vectorGeoresource).and.returnValue(olSource);
				const applyStylesSyp = spyOn(instanceUnderTest, '_applyStyles').withArgs(jasmine.anything(), olMap).and.callFake(layer => layer);
				const vectorSourceForDataSpy = spyOn(instanceUnderTest, '_vectorSourceForData');

				const olVectorLayer = instanceUnderTest.createVectorLayer(vectorGeoresource, olMap);

				expect(olVectorLayer.get('id')).toBe('someId');
				expect(olVectorLayer.getMinZoom()).toBeNegativeInfinity();
				expect(olVectorLayer.getMaxZoom()).toBePositiveInfinity();
				expect(olVectorLayer.constructor.name).toBe('VectorLayer');
				expect(olVectorLayer.getSource()).toEqual(olSource);
				expect(vectorSourceForDataSpy).not.toHaveBeenCalled();
				expect(applyStylesSyp).toHaveBeenCalled();
			});

			it('returns an ol vector layer for an URL based VectorGeoResource containing optional properties', () => {
				const id = 'someId';
				const geoResourceLabel = 'geoResourceLabel';
				const olMap = new Map();
				const olSource = new VectorSource();
				const vectorGeoresource = new VectorGeoResource(id, geoResourceLabel, VectorSourceType.KML).setUrl('http://foo.bar')
					.setOpacity(.5)
					.setMinZoom(5)
					.setMaxZoom(19);
				spyOn(instanceUnderTest, '_vectorSourceForUrl').withArgs(vectorGeoresource).and.returnValue(olSource);
				const applyStylesSyp = spyOn(instanceUnderTest, '_applyStyles').withArgs(jasmine.anything(), olMap).and.callFake(layer => layer);
				const vectorSourceForDataSpy = spyOn(instanceUnderTest, '_vectorSourceForData');

				const olVectorLayer = instanceUnderTest.createVectorLayer(vectorGeoresource, olMap);

				expect(olVectorLayer.get('id')).toBe('someId');
				expect(olVectorLayer.getOpacity()).toBe(.5);
				expect(olVectorLayer.getMinZoom()).toBe(5);
				expect(olVectorLayer.getMaxZoom()).toBe(19);
				expect(olVectorLayer.constructor.name).toBe('VectorLayer');
				expect(olVectorLayer.getSource()).toEqual(olSource);
				expect(vectorSourceForDataSpy).not.toHaveBeenCalled();
				expect(applyStylesSyp).toHaveBeenCalled();
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

			it('updates the label of an internal VectorGeoresource if possible', (done) => {
				const srid = 3857;
				const kmlName = 'kmlName';
				const geoResourceLabel = 'geoResourceLabel';
				spyOn(mapService, 'getSrid').and.returnValue(srid);
				const sourceAsString = `<kml xmlns="http://www.opengis.net/kml/2.2" xmlns:gx="http://www.google.com/kml/ext/2.2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opengis.net/kml/2.2 https://developers.google.com/kml/schema/kml22gx.xsd"><Document><name>${kmlName}</name><Placemark id="line_1617976924317"><ExtendedData><Data name="type"><value>line</value></Data></ExtendedData><description></description><Style><LineStyle><color>ff0000ff</color><width>3</width></LineStyle><PolyStyle><color>660000ff</color></PolyStyle></Style><LineString><tessellate>1</tessellate><altitudeMode>clampToGround</altitudeMode><coordinates>10.713458946685412,49.70007647302964 11.714932179089468,48.34411758499924</coordinates></LineString></Placemark></Document></kml>`;
				const vectorGeoresource = new VectorGeoResource('someId', geoResourceLabel, VectorSourceType.KML).setSource(sourceAsString, 4326);

				instanceUnderTest._vectorSourceForData(vectorGeoresource);

				setTimeout(() => {
					expect(vectorGeoresource.label).toBe(kmlName);
					done();
				});
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

				expect(styleServiceSpy).toHaveBeenCalledWith(olFeature, olMap, olLayer);
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

				expect(styleServiceAddSpy).toHaveBeenCalledWith(olFeature, olMap, olLayer);
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

		describe('_applyStyles', () => {

			it('returns the olLayer ', () => {
				const olMap = new Map();
				const olSource = new VectorSource();
				const olLayer = new VectorLayer({ source: olSource });

				const result = instanceUnderTest._applyStyles(olLayer, olMap);

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

					instanceUnderTest._applyStyles(olLayer, olMap);
					olSource.dispatchEvent(new VectorSourceEvent('addfeature', olFeature));

					expect(styleServiceAddSpy).not.toHaveBeenCalledWith(olFeature, olMap, olLayer);
					expect(registerStyleEventListenersSpy).not.toHaveBeenCalledWith(olSource, olMap);
				});
			});

			describe('checks if a feature needs a specific styling', () => {

				it('adds a style and registers style event listeners', () => {
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

				it('does NOT apply style to features when they don\'t need them', () => {
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
	});
});
