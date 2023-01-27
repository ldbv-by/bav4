/**
 * @module service/provider
 */
import { AggregateGeoResource, VectorGeoResource, WmsGeoResource, XyzGeoResource, VectorSourceType, GeoResourceFuture, VTGeoResource } from '../../domain/geoResources';
import { SourceTypeName, SourceTypeResultStatus } from '../../domain/sourceType';
import { $injector } from '../../injection';
import { isHttpUrl } from '../../utils/checks';
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
			case 'xyz':
				return new XyzGeoResource(def.id, def.label, def.url)
					//set specific optional values
					.setTileGridId(def.tileGridId);
			case 'vt':
				return new VTGeoResource(def.id, def.label, def.url);
			case 'vector':
				//Todo: Let's try to load it as GeoResourceFuture, than we can use the onResolve callback
				return new VectorGeoResource(def.id, def.label, Symbol.for(def.sourceType))
					//set specific optional values
					.setUrl(def.url);
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
		geoResource.setQueryable(definition.queryable ?? true);
		geoResource.setExportable(definition.exportable ?? true);
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
 * @param {object} definition BVV GeoResource definition
 * @returns  {Array<Attribution>|null} an array of attributions or `null`
 */
export const _parseBvvAttributionDefinition = (definition) => {

	if (Array.isArray(definition.extendedAttributions)) {
		return definition
			.extendedAttributions
			.map(extAtt =>
				({
					copyright: extAtt.copyright ?? definition?.attribution?.copyright ?? null,
					description: extAtt.description ?? definition?.attribution?.description ?? null
				})
			);
	}
	return definition.attribution ?? null;
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
	const xyz0 = new XyzGeoResource('atkis_sw', 'Webkarte s/w', 'https://intergeo{31-37}.bayernwolke.de/betty/g_atkisgray/{z}/{x}/{y}');
	const vector0 = new VectorGeoResource('huetten', 'Hütten', VectorSourceType.KML).setUrl('http://www.geodaten.bayern.de/ba-data/Themen/kml/huetten.kml');
	const aggregate0 = new AggregateGeoResource('aggregate0', 'Aggregate', ['xyz0', 'wms0']);

	return [wms0, wms1, wms2, xyz0, vector0, aggregate0];
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
		ConfigService: configService
	}
		= $injector.inject('HttpService', 'ConfigService');

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

	return new GeoResourceFuture(id, loader);
};

/**
 * Loader for URL-based ID: An URL-based ID must match the following pattern:
 * `{SourceType}`||{Url}||{extraParam0}||{extraParam1}
 * @function
 * @implements geoResourceByIdProvider
 * @returns {GeoResourceFuture|null}
 */
export const loadGeoResourceByUrlBasedId = urlBasedAsId => {

	const parts = urlBasedAsId.split('||');

	if (parts.length > 1 && isHttpUrl(parts[1]) && parts[0] /**type*/ in SourceTypeName) {
		const {
			SourceTypeService: sourceTypeService,
			ImportVectorDataService: importVectorDataService
		}
			= $injector.inject('SourceTypeService', 'ImportVectorDataService');

		const loader = async () => {

			const url = parts[1];
			const { status, sourceType } = await sourceTypeService.forUrl(url);

			if (status === SourceTypeResultStatus.OK) {
				switch (sourceType.name) {
					case SourceTypeName.GEOJSON:
					case SourceTypeName.GPX:
					case SourceTypeName.KML:
					case SourceTypeName.EWKT: {
						return await importVectorDataService.forUrl(url, { sourceType: sourceType, id: urlBasedAsId })
							// we get a GeoResourceFuture, so we have to wait until it is resolved
							.get();
					}
					default:
						throw new Error(`Unsupported source type '${Object.keys(sourceType.name)[0]}'`);
				}
			}
			throw new Error(`SourceTypeService returns status=${Object.keys(SourceTypeResultStatus).find(key => SourceTypeResultStatus[key] === status)} for ${url}`);
		};
		return new GeoResourceFuture(urlBasedAsId, loader);
	}
	return null;
};
