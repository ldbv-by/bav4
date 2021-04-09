/**
 * @module service/provider
 */
import { AggregateGeoResource, VectorGeoResource, WmsGeoResource, WMTSGeoResource, VectorSourceType } from '../domain/geoResources';
import { $injector } from '../../injection';

/**
 * A function that returns a promise with an array of geoResources. 
 *
 * @typedef {function(coordinate) : (Promise<Array<GeoResource>>)} geoResourceProvider
 */


/**
 * Uses the BVV service to load geoResources.
 * @function
 * @returns {Promise<Array<GeoResource>>}
 */
export const loadBvvGeoResources = async () => {

	const { HttpService: httpService, ConfigService: configService } = $injector.inject('HttpService', 'ConfigService');


	const url = configService.getValueAsPath('BACKEND_URL') + 'georesources';

	const result = await httpService.fetch(url, {
		timeout: 2000,
		mode: 'cors'
	});

	if (result.ok) {
		const geoResources = [];
		const georesourceDefinitions = await result.json();
		georesourceDefinitions.forEach(definition => {
			let geoResource = null;
			switch (definition.type) {
				case 'wms':
					geoResource = new WmsGeoResource(definition.id, definition.label, definition.url, definition.layers, definition.format);
					break;
				case 'wmts':
					geoResource = new WMTSGeoResource(definition.id, definition.label, definition.url);
					break;
				case 'vector':
					geoResource = new VectorGeoResource(definition.id, definition.label, Symbol.for(definition.sourceType)).setUrl(definition.url);
					break;
				case 'aggregate':
					geoResource = new AggregateGeoResource(definition.id, definition.label, definition.geoResourceIds);
					break;

			}
			if (geoResource) {
				geoResource.background = definition.background;
				geoResource.opacity = definition.opacity;
				geoResources.push(geoResource);
			}
			else {
				console.warn('Could not create a GeoResource  for ' + definition.id);
			}
		});
		return geoResources;
	}
	throw new Error('GeoResources could not be loaded');
};

/**
 * Loads example georesource without a backend.
 * @function
 * @returns {Promise<Array<GeoResource>>}
 */
export const loadExampleGeoResources = async () => {
	const wms0 = new WmsGeoResource('bodendenkmal', 'Bodendenkmal', 'https://geoservices.bayern.de/wms/v1/ogc_denkmal.cgi', 'bodendenkmalO', 'image/png');
	const wms1 = new WmsGeoResource('baudenkmal', 'Baudenkmal', 'https://geoservices.bayern.de/wms/v1/ogc_denkmal.cgi', 'bauensembleO,einzeldenkmalO', 'image/png');
	const wms2 = new WmsGeoResource('dop80', 'DOP 80 Farbe', 'https://geoservices.bayern.de/wms/v2/ogc_dop80_oa.cgi?', 'by_dop80c', 'image/png');
	const wmts0 = new WMTSGeoResource('atkis_sw', 'Webkarte s/w', 'https://intergeo{31-37}.bayernwolke.de/betty/g_atkisgray/{z}/{x}/{y}');
	const vector0 = new VectorGeoResource('huetten', 'Hütten', VectorSourceType.KML).setUrl('http://www.geodaten.bayern.de/ba-data/Themen/kml/huetten.kml');
	const aggregate0 = new AggregateGeoResource('aggregate0', 'Aggregate', ['wmts0', 'wms0']);

	return [wms0, wms1, wms2, wmts0, vector0, aggregate0];
};
