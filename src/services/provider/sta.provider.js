/**
 * @module services/provider/sta_provider
 */

import { GeoResourceAuthenticationType, StaGeoResource } from '@src/domain/geoResources';
import { MediaType } from '@src/domain/mediaTypes';
import { $injector } from '@src/injection';

/**
 * BVV specific implementation of {@link module:services/ImportStaService~staGeoResourceProvider}
 * @function
 * @type {module:services/ImportStaService~staGeoResourceProvider}
 */
export const bvvStaGeoResourceProvider = async (url, options) => {
	const { isAuthenticated } = options;
	const {
		HttpService: httpService,
		ConfigService: configService,
		BaaCredentialService: baaCredentialService
	} = $injector.inject('HttpService', 'ConfigService', 'BaaCredentialService');
	const endpointUrl = configService.getValueAsPath('BACKEND_URL') + 'sta/getObservedProperties';

	const getAuthenticationType = (isBaaAuthenticated) => {
		return isBaaAuthenticated ? GeoResourceAuthenticationType.BAA : null;
	};

	const toStaGeoResource = (staEntity, index) => {
		return new StaGeoResource(
			options.ids[index] ?? `${staEntity.url}||${staEntity.id}`,
			staEntity.name,
			staEntity.url,
			staEntity.id
		).setAuthenticationType(getAuthenticationType(options.isAuthenticated));
	};

	const readObservedProperties = (entities) => {
		return (
			entities
				// we filter unwanted layers (if defined by StaImportOptions)
				.filter((entity) => (options.observedPropertyIds.length ? options.observedPropertyIds.includes(entity.id) : true))
				.map((entity, index) => toStaGeoResource(entity, index))
		);
	};

	const getCredentialOrFail = (url) => {
		const failed = () => {
			throw new Error(`Import of STA service failed. Credential for '${url}' not found`);
		};

		const credential = baaCredentialService.get(url);
		return credential ? { username: credential.username, password: credential.password } : failed();
	};

	const data = isAuthenticated ? { url, ...getCredentialOrFail(url) } : { url };
	const result = await httpService.post(endpointUrl, JSON.stringify(data), MediaType.JSON);
	switch (result.status) {
		case 200:
			return readObservedProperties(await result.json());
		case 404:
			return [];
		default:
			throw new Error(`GeoResource for '${url}' could not be loaded: Http-Status ${result.status}`);
	}
};
