/**
 * @module services/provider/oaf_provider
 */
/**
 * BVV specific implementation of {@link module:services/ImportOafService~oafFilterCapabilitiesProvider}
 * @function
 * @type {module:services/ImportOafService~oafFilterCapabilitiesProvider}
 */

import { GeoResourceAuthenticationType, OafGeoResource } from '../../domain/geoResources';
import { MediaType } from '../../domain/mediaTypes';
import { $injector } from '../../injection/index';

export const bvvOafFilterCapabilitiesProvider = async (oafGeoResource) => {
	const {
		HttpService: httpService,
		ConfigService: configService,
		BaaCredentialService: baaCredentialService
	} = $injector.inject('HttpService', 'ConfigService', 'BaaCredentialService');
	const endpointUrl = configService.getValueAsPath('BACKEND_URL') + 'oaf/getFilterCapabilities';

	const getCredentialOrFail = (url) => {
		const failed = () => {
			throw new Error(`Fetching of filter capabilities failed. Credential for '${url}' not found`);
		};

		const credential = baaCredentialService.get(url);
		return credential ? { username: credential.username, password: credential.password } : failed();
	};

	const data =
		oafGeoResource.authenticationType === GeoResourceAuthenticationType.BAA
			? { url: oafGeoResource.url, collectionId: oafGeoResource.collectionId, ...getCredentialOrFail(oafGeoResource.url) }
			: { url: oafGeoResource.url, collectionId: oafGeoResource.collectionId };
	const result = await httpService.post(endpointUrl, JSON.stringify(data), MediaType.JSON, { timeout: 20_000 /* 30 seconds */ });
	switch (result.status) {
		case 200:
			return await result.json();
		default:
			throw new Error(`Filter capabilities for '${oafGeoResource.url}' could not be loaded: Http-Status ${result.status}`);
	}
};

/**
 * BVV specific implementation of {@link module:services/ImportOafService~oafGeoResourceProvider}
 * @function
 * @type {module:services/ImportOafService~oafGeoResourceProvider}
 */
export const bvvOafGeoResourceProvider = async (url, options) => {
	const { isAuthenticated } = options;
	const {
		HttpService: httpService,
		ConfigService: configService,
		ProjectionService: projectionService,
		BaaCredentialService: baaCredentialService
	} = $injector.inject('HttpService', 'ConfigService', 'ProjectionService', 'BaaCredentialService');
	const endpointUrl = configService.getValueAsPath('BACKEND_URL') + 'oaf/getCollections';

	const getAuthenticationType = (isBaaAuthenticated) => {
		return isBaaAuthenticated ? GeoResourceAuthenticationType.BAA : null;
	};

	const toOafGeoResource = (oafCollection, index) => {
		// we need the base URL of the OAF service
		const oafUrl = oafCollection.url.split('collections')[0];
		return new OafGeoResource(
			options.ids[index] ?? `${oafUrl}||${oafCollection.id}`,
			oafCollection.title,
			oafUrl,
			oafCollection.id,
			oafCollection.srid
		)
			.setLimit(oafCollection.totalNumberOfItems)
			.setAuthenticationType(getAuthenticationType(options.isAuthenticated));
	};

	const readCollections = (oafCollections) => {
		return (
			oafCollections
				.filter((collection) => projectionService.getProjections().includes(collection.srid))
				// we filter unwanted layers (if defined by OafImportOptions)
				.filter((collection) => (options.collections.length ? options.collections.includes(collection.id) : true))
				.map((collection, index) => toOafGeoResource(collection, index))
		);
	};

	const getCredentialOrFail = (url) => {
		const failed = () => {
			throw new Error(`Import of OAF service failed. Credential for '${url}' not found`);
		};

		const credential = baaCredentialService.get(url);
		return credential ? { username: credential.username, password: credential.password } : failed();
	};

	const data = isAuthenticated ? { url, ...getCredentialOrFail(url) } : { url };
	const result = await httpService.post(endpointUrl, JSON.stringify(data), MediaType.JSON);
	switch (result.status) {
		case 200:
			return readCollections(await result.json());
		case 404:
			return [];
		default:
			throw new Error(`GeoResource for '${url}' could not be loaded: Http-Status ${result.status}`);
	}
};
