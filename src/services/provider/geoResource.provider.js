/**
 * @module services/provider/geoResource_provider
 */
import { UnavailableGeoResourceError } from '../../domain/errors';
import {
	AggregateGeoResource,
	VectorGeoResource,
	WmsGeoResource,
	XyzGeoResource,
	GeoResourceFuture,
	VTGeoResource,
	RtVectorGeoResource,
	OafGeoResource
} from '../../domain/geoResources';
import { SourceTypeName, SourceTypeResultStatus } from '../../domain/sourceType';
import { $injector } from '../../injection';
import { isExternalGeoResourceId } from '../../utils/checks';
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
						.setMaxSize(def.maxSize ?? null)
				);
			case 'xyz':
				return (
					new XyzGeoResource(def.id, def.label, def.urls)
						//set specific optional values
						.setTileGridId(def.tileGridId)
				);
			case 'vt':
				return new VTGeoResource(def.id, def.label, def.url);
			case 'oaf':
				return (
					new OafGeoResource(def.id, def.label, def.url, def.collectionId, def.srid ?? 3857)
						//set specific optional values
						.setLimit(def.limit)
						.setFilter(def.filter)
						.setClusterParams(def.clusterParams ?? {})
						.setStyle(def.baseColor ? { baseColor: def.baseColor } : null)
				);
			case 'vector': {
				return new GeoResourceFuture(
					def.id,
					getBvvVectorGeoResourceLoaderForUrl(def.url, Symbol.for(def.sourceType), def.id, def.label),
					def.label
				).onResolve((resolved) => {
					// @ts-ignore
					setPropertiesAndProviders(resolved.setClusterParams(def.clusterParams ?? {}).setStyle(def.baseColor ? { baseColor: def.baseColor } : null));
				});
			}
			case 'rtvector': {
				return (
					new RtVectorGeoResource(def.id, def.label, def.url, Symbol.for(def.sourceType))
						//set specific optional values
						.setClusterParams(def.clusterParams ?? {})
						.setStyle(def.baseColor ? { baseColor: def.baseColor } : null)
				);
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
					.setAuthRoles(definition.authRoles ?? [])
					.setTimestamps(definition.timestamps ?? [])
					.setUpdateInterval(definition.updateInterval ?? null)
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

	const result = await httpService.get(url);

	if (result.ok) {
		const geoResources = [];
		const geoResourceDefinitions = await result.json();
		geoResourceDefinitions.forEach((definition) => {
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
		throw new UnavailableGeoResourceError(`GeoResource for id '${id}' could not be loaded`, id, result.status);
	};

	return new GeoResourceFuture(id, loader);
};

/**
 * Loader for external URL-based ID: An URL-based ID must basically match the following pattern:
 * `{url}||[{optionalParam1}]||[{optionalParam2}]`.
 *
 * In detail:
 *
 * KML: `{url}||[{label}]||[{showPointNames}]`
 *
 * GPX,GEOJSON,EWKT: `{url}||[{label}]`
 *
 * WMS: `{url}||{layer}||[{label}]`
 *
 * OAF: `{url}||{collectionId}||[{label}]`
 *
 * @function
 * @param {string} urlBasedAsId URL-based ID of the requested GeoResource
 * @type {module:services/GeoResourceService~geoResourceByIdProvider}
 */
export const loadExternalGeoResource = (urlBasedAsId) => {
	if (isExternalGeoResourceId(urlBasedAsId)) {
		const parts = urlBasedAsId.split('||');
		const {
			SourceTypeService: sourceTypeService,
			ImportVectorDataService: importVectorDataService,
			ImportWmsService: importWmsService,
			ImportOafService: importOafService
		} = $injector.inject('SourceTypeService', 'ImportVectorDataService', 'ImportWmsService', 'ImportOafService');

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
							const showPointNames = parts[2];
							const geoResource = await importVectorDataService
								.forUrl(url, { sourceType: sourceType, id: urlBasedAsId })
								// we get a GeoResourceFuture, so we have to wait until it is resolved
								.get();
							if (showPointNames === 'false') {
								// in any other cases we use the default value from the VectorGeoResource
								geoResource.setShowPointNames(false);
							}
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
						case SourceTypeName.OAF: {
							const throwOafImportError = () => {
								throw new Error(`Unsupported OAF: '${url}'`);
							};
							const collectionId = parts[1];
							const label = parts[2];
							const importOafOptions = collectionId
								? { sourceType: sourceType, collections: [collectionId], ids: [urlBasedAsId] }
								: { sourceType: sourceType, collections: [], ids: [urlBasedAsId] };
							importOafOptions.isAuthenticated = status === SourceTypeResultStatus.BAA_AUTHENTICATED;
							const geoResources = await importOafService.forUrl(url, importOafOptions);
							const geoResource = geoResources[0] ?? throwOafImportError();
							return label?.length ? geoResource.setLabel(label) : geoResource;
						}
						default:
							throw new Error(`Unsupported source type '${Object.keys(sourceType.name)[0]}'`);
					}
				};
				return getGeoResource(sourceType);
			}
			throw new UnavailableGeoResourceError(
				`SourceTypeService returns status=${Object.keys(SourceTypeResultStatus).find((key) => SourceTypeResultStatus[key] === status)} for ${url}`,
				urlBasedAsId
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
 */
export const getDefaultVectorGeoResourceLoaderForUrl = (url, sourceType, id = createUniqueId().toString(), label = null) => {
	return async () => {
		const { HttpService: httpService } = $injector.inject('HttpService');
		const result = await httpService.get(url);

		if (result.ok) {
			const data = await result.text();

			return new VectorGeoResource(id, label, sourceType).setSource(data, 4326 /**valid for kml, gpx and geoJson**/);
		}
		throw new UnavailableGeoResourceError(`VectorGeoResource for '${url}' could not be loaded`, id, result.status);
	};
};

/**
 * Returns an {@link module:domain/geoResources~asyncGeoResourceLoader} for an URL-based BVV VectorGeoResource.
 * @function
 * @param {string} url
 * @param {VectorSourceType} sourceType
 * @param {string | null} [id]
 * @param {string | null} [label]
 * @returns {module:domain/geoResources~asyncGeoResourceLoader}
 */
export const getBvvVectorGeoResourceLoaderForUrl = (url, sourceType, id, label) => {
	return async () => {
		const {
			HttpService: httpService,
			UrlService: urlService,
			GeoResourceService: geoResourceService
		} = $injector.inject('HttpService', 'UrlService', 'GeoResourceService');
		const result = await httpService.get(urlService.proxifyInstant(url), {
			response: [geoResourceService.getAuthResponseInterceptorForGeoResource(id)]
		});

		if (result.ok) {
			const data = await result.text();

			return new VectorGeoResource(id, label, sourceType).setSource(data, 4326 /**valid for kml, gpx and geoJson**/);
		}
		throw new UnavailableGeoResourceError(`VectorGeoResource for '${url}' could not be loaded`, id, result.status);
	};
};
