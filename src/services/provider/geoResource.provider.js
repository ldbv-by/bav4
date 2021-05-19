/**
 * @module service/provider
 */
import { AggregateGeoResource, VectorGeoResource, WmsGeoResource, WMTSGeoResource, VectorSourceType } from '../domain/geoResources';
import { $injector } from '../../injection';
import { getBvvAttribution } from './attribution.provider';

/**
 * A function that returns a promise with an array of geoResources. 
 *
 * @typedef {function(coordinate) : (Promise<Array<GeoResource>>)} geoResourceProvider
 */


/**
 * Uses the BVV endpoint to load geoResources.
 * @function
 * @returns {Promise<Array<GeoResource>>}
 */
export const loadBvvGeoResources = async () => {

	const { HttpService: httpService, ConfigService: configService } = $injector.inject('HttpService', 'ConfigService');


	const url = configService.getValueAsPath('BACKEND_URL') + 'georesources';

	const result = await httpService.get(url, {
		timeout: 2000,
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
				geoResource.setAttributionProvider(getBvvAttribution);
				geoResource.attribution = parseBvvAttributionDefinition(definition);
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
 * Helper function to parse BVV attributions.
 * @param {object} definition BVV geoResouce definition
 * @returns  {Array<Attribution>|null} an array of attributions or `null`
 */
export const parseBvvAttributionDefinition = (definition) => {

	if (!definition.attribution) {
		return null;
	}

	//basic attribution values
	const { description, copyright, href } = definition.attribution;

	if (Array.isArray(definition.extendedAttributions)) {
		return definition
			.extendedAttributions
			.map(extAtt => {
				//supplement each attribution with basic attribution values if needed
				return {
					copyright: {
						label: extAtt.copyright || copyright,
						url: extAtt.href || href
					},
					description: extAtt.description || description
				};
			});
	}
	else {
		return [{
			copyright: {
				label: copyright,
				url: href
			},
			description: description
		}];
	}
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
