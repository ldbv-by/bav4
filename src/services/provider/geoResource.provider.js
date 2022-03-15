/**
 * @module service/provider
 */
import { AggregateGeoResource, VectorGeoResource, WmsGeoResource, WMTSGeoResource, VectorSourceType, GeoResourceFuture } from '../domain/geoResources';
import { $injector } from '../../injection';
import { getBvvAttribution } from './attribution.provider';

/**
 * Maps a BVV geoResource definition to a corresponding GeoResource instance
 * @param {object} definition Configuration object for a GeoResource
 */
export const _definitionToGeoResource = definition => {

	const toGeoResource = def => {
		switch (def.type) {
			case 'wms':
				return new WmsGeoResource(def.id, def.label, def.url, def.layers, def.format)
					//set specific optional values
					.setExtraParams(def.extraParams ?? {});
			case 'wmts':
				return new WMTSGeoResource(def.id, def.label, def.url);
			case 'vector':
				return new VectorGeoResource(def.id, def.label, Symbol.for(def.sourceType)).setUrl(def.url);
			case 'aggregate':
				return new AggregateGeoResource(def.id, def.label, def.geoResourceIds);
			default:
				return null;
		}
	};
	const geoResource = toGeoResource(definition);
	if (geoResource) {
		geoResource.setAttributionProvider(getBvvAttribution);
		geoResource.setAttribution(_parseBvvAttributionDefinition(definition));
		//set common optional values
		geoResource.setOpacity(definition.opacity ?? geoResource.opacity);
		geoResource.setHidden(definition.hidden ?? geoResource.hidden);
		geoResource.setMinZoom(definition.minZoom ?? null);
		geoResource.setMaxZoom(definition.maxZoom ?? null);
		return geoResource;
	}
	return null;
};


/**
 * Uses the BVV endpoint to load geoResources.
 * @function
 * @implements geoResourceProvider
 * @returns {Promise<Array<GeoResource>>}
 */
export const loadBvvGeoResources = async () => {

	const { HttpService: httpService, ConfigService: configService } = $injector.inject('HttpService', 'ConfigService');


	const url = configService.getValueAsPath('BACKEND_URL') + 'georesources/all';

	const result = await httpService.get(url, {
		timeout: 2000
	});

	if (result.ok) {
		const geoResources = [];
		const georesourceDefinitions = await result.json();
		georesourceDefinitions.forEach(definition => {
			const geoResource = _definitionToGeoResource(definition);
			if (geoResource) {
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
export const _parseBvvAttributionDefinition = (definition) => {

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



/**
 * Uses the BVV endpoint to load a GeoResource by id
 * @function
 * @implements geoResourceByIdProvider
 * @returns {GeoResourceFuture|null}
 */
export const loadBvvGeoResourceById = id => {

	const {
		HttpService: httpService,
		ConfigService: configService,
		TranslationService: translationService
	}
		= $injector.inject('HttpService', 'ConfigService', 'TranslationService');

	const loader = async id => {
		const url = `${configService.getValueAsPath('BACKEND_URL')}georesources/byId/${id}`;

		const result = await httpService.get(url);

		if (result.ok) {
			const geoResourceDefinition = await result.json();
			const geoResource = _definitionToGeoResource(geoResourceDefinition);
			if (geoResource) {
				return geoResource;
			}
		}
		throw new Error(`GeoResource for id '${id}' could not be loaded`);
	};

	return new GeoResourceFuture(id, loader, translationService.translate('layersPlugin_store_layer_default_layer_name_future'));
};
