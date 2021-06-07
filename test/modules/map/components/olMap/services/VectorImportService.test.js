import { $injector } from '../../../../../../src/injection';
import { VectorGeoResource, VectorSourceType } from '../../../../../../src/services/domain/geoResources';
import { load } from '../../../../../../src/modules/map/components/olMap/utils/feature.provider';
import { iconUrlFunction, mapVectorSourceTypeToFormat, VectorImportService } from '../../../../../../src/modules/map/components/olMap/services/VectorImportService';
import VectorSource, { VectorSourceEvent } from 'ol/source/Vector';
import { Feature, Map } from 'ol';


describe('VectorImportService', () => {

	const urlService = {
		proxifyInstant: () => { }
	};

	const mapService = {
		getSrid: () => { }
	};

	const styleService = {
		addStyle: () => { },
		removeStyle: () => {}
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

		describe('vectorSourceFromInternalData', () => {

			it('builds an olVectorSource for an internal VectorGeoresource', (done) => {
				const map  = new Map();
				const srid = 3857;
				const kmlName = '';
				const geoResourceLabel = 'geoResourceLabel';
				spyOn(mapService, 'getSrid').and.returnValue(srid);
				const sourceAsString = `<kml xmlns="http://www.opengis.net/kml/2.2" xmlns:gx="http://www.google.com/kml/ext/2.2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opengis.net/kml/2.2 https://developers.google.com/kml/schema/kml22gx.xsd"><Document><name>${kmlName}</name><Placemark id="line_1617976924317"><ExtendedData><Data name="type"><value>line</value></Data></ExtendedData><description></description><Style><LineStyle><color>ff0000ff</color><width>3</width></LineStyle><PolyStyle><color>660000ff</color></PolyStyle></Style><LineString><tessellate>1</tessellate><altitudeMode>clampToGround</altitudeMode><coordinates>10.713458946685412,49.70007647302964 11.714932179089468,48.34411758499924</coordinates></LineString></Placemark></Document></kml>`;
				const vectorGeoresource = new VectorGeoResource('someId', geoResourceLabel, VectorSourceType.KML).setSource(sourceAsString, 4326);
				const applyStylingSpy = spyOn(instanceUnderTest, 'applyStyling');

				const olVectorSource = instanceUnderTest.vectorSourceFromInternalData(vectorGeoresource, map);

				expect(olVectorSource.constructor.name).toBe('VectorSource');
				expect(applyStylingSpy).toHaveBeenCalledWith(olVectorSource, map);
				//features are loaded from a promise
				setTimeout(() => {
					expect(olVectorSource.getFeatures().length).toBe(1);
					expect(olVectorSource.getFeatures()[0].get('srid')).toBe(srid);
					done();
				});
			});

			it('updates the label of an internal VectorGeoresource if possible', (done) => {
				const srid = 3857;
				const kmlName = 'kmlName';
				const geoResourceLabel = 'geoResourceLabel';
				spyOn(mapService, 'getSrid').and.returnValue(srid);
				const sourceAsString = `<kml xmlns="http://www.opengis.net/kml/2.2" xmlns:gx="http://www.google.com/kml/ext/2.2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opengis.net/kml/2.2 https://developers.google.com/kml/schema/kml22gx.xsd"><Document><name>${kmlName}</name><Placemark id="line_1617976924317"><ExtendedData><Data name="type"><value>line</value></Data></ExtendedData><description></description><Style><LineStyle><color>ff0000ff</color><width>3</width></LineStyle><PolyStyle><color>660000ff</color></PolyStyle></Style><LineString><tessellate>1</tessellate><altitudeMode>clampToGround</altitudeMode><coordinates>10.713458946685412,49.70007647302964 11.714932179089468,48.34411758499924</coordinates></LineString></Placemark></Document></kml>`;
				const vectorGeoresource = new VectorGeoResource('someId', geoResourceLabel, VectorSourceType.KML).setSource(sourceAsString, 4326);

				instanceUnderTest.vectorSourceFromInternalData(vectorGeoresource,  new Map());

				setTimeout(() => {
					expect(vectorGeoresource.label).toBe(kmlName);
					done();
				});
			});

			it('logs a warn statement when source can not be resolved', (done) => {
				const warnSpy = spyOn(console, 'warn');
				const vectorGeoresource = new VectorGeoResource('someId', 'Label', VectorSourceType.KML).setSource(Promise.reject('somethingGotWrong'), 4326);

				instanceUnderTest.vectorSourceFromInternalData(vectorGeoresource, new Map());

				//features are loaded from a promise
				setTimeout(() => {
					expect(warnSpy).toHaveBeenCalledWith('somethingGotWrong');
					done();
				});
			});
		});

		describe('vectorSourceFromInternalData', () => {

			it('builds an olVectorSource for an external VectorGeoresource', () => {
				const map  = new Map();
				const url = 'https://some.url';
				spyOn(urlService, 'proxifyInstant').withArgs(url).and.returnValue('https://proxy.url?' + url);
				const vectorGeoresource = new VectorGeoResource('someId', 'Label', VectorSourceType.KML).setUrl(url);
				const applyStylingSpy = spyOn(instanceUnderTest, 'applyStyling');

				const olVectorSource = instanceUnderTest.vectorSourceFromExternalData(vectorGeoresource, map);

				expect(olVectorSource.constructor.name).toBe('VectorSource');
				expect(olVectorSource.getUrl()).toBe('https://proxy.url?' + url);
				expect(olVectorSource.getFormat().constructor.name).toBe('KML');
				expect(olVectorSource.loader_).toEqual(load);
				expect(olVectorSource.getFormat().iconUrlFunction_).toEqual(iconUrlFunction);
				expect(applyStylingSpy).toHaveBeenCalledWith(olVectorSource, map);
			});
		});

		describe('applyStyling', () => {

			it('adds two listeners', () => {

				const { addListenerKey, removeListenerKey, clearListenerKey } = instanceUnderTest.applyStyling(new VectorSource(), new Map());

				expect(addListenerKey).toBeDefined();
				expect(removeListenerKey).toBeDefined();
				expect(clearListenerKey).toBeDefined();
			});

			it('calls #addStyle of the styleService on "addfeature"', () => {
				const olMap = new Map();
				const olSource = new VectorSource();
				const olFeature = new Feature();
				const styleServiceSpy = spyOn(styleService, 'addStyle');
				instanceUnderTest.applyStyling(olSource, olMap);

				olSource.dispatchEvent(new VectorSourceEvent('addfeature', olFeature));

				expect(styleServiceSpy).toHaveBeenCalledWith(olMap, olFeature);
			});
			
			it('calls #removeStyle of the styleService on "removefeature"', () => {
				const olMap = new Map();
				const olSource = new VectorSource();
				const olFeature = new Feature();
				const styleServiceSpy = spyOn(styleService, 'removeStyle');
				instanceUnderTest.applyStyling(olSource, olMap);

				olSource.dispatchEvent(new VectorSourceEvent('removefeature', olFeature));

				expect(styleServiceSpy).toHaveBeenCalledWith(olMap, olFeature);
			});


			it('calls #removeStyle of the styleService on "clear"', () => {
				const olMap = new Map();
				const olFeature = new Feature();
				const olSource = new VectorSource({ features:[olFeature] });
				const styleServiceSpy = spyOn(styleService, 'removeStyle');
				instanceUnderTest.applyStyling(olSource, olMap);

				olSource.dispatchEvent(new VectorSourceEvent('clear'));

				expect(styleServiceSpy).toHaveBeenCalledWith(olMap, olFeature);
			});
		});
	});
});
