import { KML } from 'ol/format';
import { $injector } from '../../../../src/injection';
import { load } from '../../../../src/modules/olMap/utils/feature.provider';


describe('feature.provider', () => {

	const httpService = {
		get: async () => { }
	};

	beforeAll(() => {
		$injector
			.registerSingleton('HttpService', httpService);
	});

	it('provides features from sources loaded over http', async () => {
		const format = new KML();
		const kml = '<kml xmlns="http://www.opengis.net/kml/2.2" xmlns:gx="http://www.google.com/kml/ext/2.2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opengis.net/kml/2.2 https://developers.google.com/kml/schema/kml22gx.xsd"><Document><name>Zeichnung</name><Placemark id="marker_1613043377980"><ExtendedData><Data name="type"><value>marker</value></Data></ExtendedData><name></name><description></description><Style><IconStyle><Icon><href>https://geoportal.bayern.de/ba-backend/icons/255,0,0/marker</href><gx:w>48</gx:w><gx:h>48</gx:h></Icon><hotSpot x="24" y="4.799999999999997" xunits="pixels" yunits="pixels"/></IconStyle></Style><Point><altitudeMode>clampToGround</altitudeMode><coordinates>10.877827211723233,49.651146957741275</coordinates></Point></Placemark><Placemark id="marker_1613043382838"><ExtendedData><Data name="type"><value>marker</value></Data></ExtendedData><name></name><description></description><Style><IconStyle><Icon><href>https://geoportal.bayern.de/ba-backend/icons/255,0,0/marker</href><gx:w>48</gx:w><gx:h>48</gx:h></Icon><hotSpot x="24" y="4.799999999999997" xunits="pixels" yunits="pixels"/></IconStyle></Style><Point><altitudeMode>clampToGround</altitudeMode><coordinates>11.26197567556489,49.566766092602606</coordinates></Point></Placemark></Document></kml>';
		const kmlUrl = 'https//:some.url';
		const expectedFeatures = [];
		const vectorSourceMock = {
			getUrl() {
				return kmlUrl;
			},
			getFormat() {
				return format;
			},
			addFeatures(features) {
				expectedFeatures.push(...features);
			}
		};
		spyOn(httpService, 'get').withArgs(kmlUrl, { timeout: 2000 }).and.returnValue(Promise.resolve(
			new Response(kml)
		));
		//we have to bind the mocked vector source
		const boundLoader = load.bind(vectorSourceMock);

		await boundLoader([], 42, 'EPSG:3857');

		expect(expectedFeatures.length).toBe(2);
		//check if have transformed geometries
		expect(expectedFeatures[0].getGeometry().getCoordinates()[0]).toBeCloseTo(1210914, 0);
		expect(expectedFeatures[0].getGeometry().getCoordinates()[1]).toBeCloseTo(6386078, 0);
	});

	it('filters out features without a geometry', async () => {
		const format = new KML();
		// contains one valid and one invalid placemark
		const kml = '<kml xmlns="http://www.opengis.net/kml/2.2" xmlns:gx="http://www.google.com/kml/ext/2.2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opengis.net/kml/2.2 https://developers.google.com/kml/schema/kml22gx.xsd"><Document><name>Invalid Placemarks</name><Placemark id="Line_valid"><description></description><LineString><tessellate>1</tessellate><altitudeMode>clampToGround</altitudeMode><coordinates>10.713458946685412,49.70007647302964 11.714932179089468,48.34411758499924</coordinates></LineString></Placemark><Placemark id="Point_invalid"><description>This is a invalid Point-Placemark</description><Point><coordinates>..</coordinates></Point></Placemark></Document></kml>';
		const kmlUrl = 'https//:some.url';
		const expectedFeatures = [];
		const vectorSourceMock = {
			getUrl() {
				return kmlUrl;
			},
			getFormat() {
				return format;
			},
			addFeatures(features) {
				expectedFeatures.push(...features);
			}
		};
		spyOn(httpService, 'get').withArgs(kmlUrl, { timeout: 2000 }).and.returnValue(Promise.resolve(
			new Response(kml)
		));
		//we have to bind the mocked vector source
		const boundLoader = load.bind(vectorSourceMock);

		await boundLoader([], 42, 'EPSG:3857');

		expect(expectedFeatures.length).toBe(1);
	});

	it('logs a warn statement when source could not be loaded', async () => {
		const kmlUrl = 'https//:some.url';
		const vectorSourceMock = {
			getUrl() {
				return kmlUrl;
			}
		};
		spyOn(httpService, 'get').withArgs(kmlUrl, { timeout: 2000 }).and.returnValue(Promise.resolve(
			new Response(null, { status: 404 })
		));
		const warnSpy = spyOn(console, 'warn');
		//we have to bind the mocked vector source
		const boundLoader = load.bind(vectorSourceMock);

		await boundLoader([], 42, 'EPSG:3857');

		expect(warnSpy).toHaveBeenCalledOnceWith('Source could not be loaded from ' + kmlUrl);
	});
});
