/**
 * @module services/provider/geoResource_provider
 */
import { AggregateGeoResource, VectorGeoResource, WmsGeoResource, XyzGeoResource, GeoResourceFuture, VTGeoResource } from '../../domain/geoResources';
import { SourceTypeName, SourceTypeResultStatus } from '../../domain/sourceType';
import { $injector } from '../../injection';
import { isHttpUrl } from '../../utils/checks';
import { createUniqueId } from '../../utils/numberUtils';
import { getBvvAttribution } from './attribution.provider';

export const _definitionToGeoResource = (definition) => {
	const toGeoResource = (def) => {
		switch (def.type) {
			case 'wms':
				return (
					new WmsGeoResource(def.id, def.label, def.url, def.layers, def.format)
						//set specific optional values
						.setExtraParams(def.extraParams ?? {})
				);
			case 'xyz':
				return (
					new XyzGeoResource(def.id, def.label, def.urls)
						//set specific optional values
						.setTileGridId(def.tileGridId)
				);
			case 'vt':
				return new VTGeoResource(def.id, def.label, def.url);
			case 'vector': {
				const loader = async () => {
					const { UrlService: urlService } = $injector.inject('UrlService');
					const vectorGeoResource = await defaultVectorGeoResourceLoaderForUrl(
						urlService.proxifyInstant(def.url),
						Symbol.for(def.sourceType),
						def.id,
						def.label
					)();
					return setPropertiesAndProviders(vectorGeoResource.setClusterParams(def.clusterParams ?? {}));
				};
				return new GeoResourceFuture(def.id, loader, def.label);
			}
			case 'aggregate':
				return new AggregateGeoResource(def.id, def.label, def.geoResourceIds);
			default:
				return null;
		}
	};
	const setPropertiesAndProviders = (geoResource) => {
		return geoResource
			? geoResource
					.setAttributionProvider(getBvvAttribution)
					.setAttribution(_parseBvvAttributionDefinition(definition))
					//set common optional values
					.setOpacity(definition.opacity ?? geoResource.opacity)
					.setHidden(definition.hidden ?? geoResource.hidden)
					.setMinZoom(definition.minZoom ?? null)
					.setMaxZoom(definition.maxZoom ?? null)
					.setQueryable(definition.queryable ?? true)
					.setExportable(definition.exportable ?? true)
			: null;
	};
	return setPropertiesAndProviders(toGeoResource(definition));
};

/**
 * Uses the BVV endpoint to load geoResources.
 * @function
 * @type {module:services/GeoResourceService~geoResourceProvider}
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
		georesourceDefinitions.forEach((definition) => {
			const geoResource = _definitionToGeoResource(definition);
			if (geoResource) {
				geoResources.push(geoResource);
			} else {
				console.warn('Could not create a GeoResource  for ' + definition.id);
			}
		});
		return geoResources;
	}
	throw new Error('GeoResources could not be loaded');
};

export const _parseBvvAttributionDefinition = (definition) => {
	if (Array.isArray(definition.extendedAttributions)) {
		return definition.extendedAttributions.map((extAtt) => ({
			copyright: extAtt.copyright ?? definition?.attribution?.copyright ?? null,
			description: extAtt.description ?? definition?.attribution?.description ?? null
		}));
	}
	return definition.attribution ?? null;
};

/**
 * Uses the BVV endpoint to load a GeoResource by id
 * @function
 * @param {string} id Id of the requested GeoResource
 * @type {module:services/GeoResourceService~geoResourceByIdProvider}
 */
export const loadBvvGeoResourceById = (id) => {
	const { HttpService: httpService, ConfigService: configService } = $injector.inject('HttpService', 'ConfigService');

	const loader = async (id) => {
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
 * Loader for external URL-based ID: An URL-based ID must basically match the following pattern:
 * `{url}||{extraParam1}||{extraParam2}`.
 *
 * In detail:
 *
 * KML,GPX,GEOJSON,EWKT: `{url}||[{label}]`
 *
 * WMS: `{url}||{layer}||[{label}]`
 * @function
 * @param {string} urlBasedAsId URL-based ID of the requested GeoResource
 * @type {module:services/GeoResourceService~geoResourceByIdProvider}
 */
export const loadExternalGeoResource = (urlBasedAsId) => {
	const parts = urlBasedAsId.split('||');

	if (parts.length && isHttpUrl(parts[0])) {
		const {
			SourceTypeService: sourceTypeService,
			ImportVectorDataService: importVectorDataService,
			ImportWmsService: importWmsService
		} = $injector.inject('SourceTypeService', 'ImportVectorDataService', 'ImportWmsService');

		const loader = async () => {
			const url = parts[0];
			const { status, sourceType } = await sourceTypeService.forUrl(url);

			if (status === SourceTypeResultStatus.OK || status === SourceTypeResultStatus.BAA_AUTHENTICATED) {
				const getGeoResource = async (sourceType) => {
					switch (sourceType.name) {
						case SourceTypeName.GEOJSON:
						case SourceTypeName.GPX:
						case SourceTypeName.KML:
						case SourceTypeName.EWKT: {
							const label = parts[1];
							const geoResource = await importVectorDataService
								.forUrl(url, { sourceType: sourceType, id: urlBasedAsId })
								// we get a GeoResourceFuture, so we have to wait until it is resolved
								.get();
							return label?.length ? geoResource.setLabel(label) : geoResource;
						}
						case SourceTypeName.WMS: {
							const throwWmsImportError = () => {
								throw new Error(`Unsupported WMS: '${url}'`);
							};
							const layer = parts[1]; // when we have no layer argument, we return the first returned WmsGeoResource
							const label = parts[2];
							const importWmsOptions = layer
								? { sourceType: sourceType, layers: [layer], ids: [urlBasedAsId] }
								: { sourceType: sourceType, layers: [], ids: [urlBasedAsId] };
							importWmsOptions.isAuthenticated = status === SourceTypeResultStatus.BAA_AUTHENTICATED;
							const geoResources = await importWmsService.forUrl(url, importWmsOptions);
							const geoResource = geoResources[0] ?? throwWmsImportError();
							return label?.length ? geoResource.setLabel(label) : geoResource;
						}
						default:
							throw new Error(`Unsupported source type '${Object.keys(sourceType.name)[0]}'`);
					}
				};
				return getGeoResource(sourceType);
			}
			throw new Error(
				`SourceTypeService returns status=${Object.keys(SourceTypeResultStatus).find((key) => SourceTypeResultStatus[key] === status)} for ${url}`
			);
		};
		return new GeoResourceFuture(urlBasedAsId, loader);
	}
	return null;
};

/**
 * Returns an GeoResourceLoader for an URL-based VectorGeoResource.
 * @function
 * @param {string} url
 * @param {VectorSourceType} sourceType
 * @param {string | null} [id]
 * @param {string | null} [label]
 * @returns {module:domain/geoResources~asyncGeoResourceLoader}
 * @throws when resource cannot be loaded
 */
export const defaultVectorGeoResourceLoaderForUrl = (url, sourceType, id = createUniqueId().toString(), label = null) => {
	return async () => {
		const { HttpService: httpService } = $injector.inject('HttpService');
		const result = await httpService.get(url, { timeout: 5000 });

		if (result.ok) {
			const data = await result.text();

			return new VectorGeoResource(id, label, sourceType).setSource(data, 4326 /**valid for kml, gpx and geoJson**/);
		}
		throw new Error(`GeoResource for '${url}' could not be loaded: Http-Status ${result.status}`);
	};
};
