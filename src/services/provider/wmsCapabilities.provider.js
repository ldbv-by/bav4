import { $injector } from '../../injection';
import { createUniqueId } from '../../utils/numberUtils';
import { GeoResourceAuthenticationType, WmsGeoResource } from '../../domain/geoResources';
import { MediaType } from '../HttpService';

/**
 * Supported (content) and preferred (order) media types for getMap requests.
 */
export const supportedGetMapMediaTypes = [
	'image/webp',
	'image/png',
	'image/gif',
	'image/jpeg', // no transparency
	'image/svg+xml' // supports transparency, but is more kind of experimental
];

export const _determinePreferredFormat = (arr) => {
	const values = Array.isArray(arr) ? arr : [];
	const sorted = [...values]
		.filter(f => supportedGetMapMediaTypes.includes(f))
		.sort((a, b) => supportedGetMapMediaTypes.indexOf(a) - supportedGetMapMediaTypes.indexOf(b));
	if (sorted.length < 1) {
		console.warn(`No supported media type found. Valid media types are: ${supportedGetMapMediaTypes}`);
	}
	return sorted;
};


export const bvvCapabilitiesProvider = async (url, sourceType, isAuthenticated) => {
	const { HttpService: httpService, ConfigService: configService } = $injector.inject('HttpService', 'ConfigService');
	const endpoint = configService.getValueAsPath('BACKEND_URL') + 'wms/getCapabilities';

	const getExtraParams = (capabilities) => {
		return capabilities.maxHeight && capabilities.maxWidth ? { maxHeight: capabilities.maxHeight, maxWidth: capabilities.maxWidth } : {};
	};

	const getAuthenticationType = (isBaaAuthenticated) => {
		return isBaaAuthenticated ? GeoResourceAuthenticationType.BAA : null;
	};

	const toWmsGeoResource = (layer, capabilities, isAuthenticated = false) => {
		const format = _determinePreferredFormat(capabilities.formatsGetMap);
		return format.length > 0
			? new WmsGeoResource(
				createUniqueId().toString(),
				layer.title,
				`${capabilities.onlineResourceGetMap}`,
				`${layer.name}`,
				format[0])
				.setAuthenticationType(getAuthenticationType(isAuthenticated))
				.setQueryable(layer.queryable)
				.setExtraParams(getExtraParams(capabilities))
			: null;
	};

	const readCapabilities = (capabilities) => {
		const {	MapService: mapService } = $injector.inject('MapService');
		const containsSRID = (layer, srid) => layer.referenceSystems.some(srs => srs.code === srid);
		return capabilities.layers
			?.filter((l) => containsSRID(l, mapService.getSrid()))
			.map((layer) => toWmsGeoResource(layer, capabilities, isAuthenticated))
			.filter(l => !!l); // toWmsGeoResource may return null
	};

	const getCredentialOrFail = (url) => {
		const failed = () => {
			throw new Error(`Import of WMS failed. Credential for '${url}' not found.`);
		};

		const {	BaaCredentialService: baaCredentialService } = $injector.inject('BaaCredentialService');
		const credential = baaCredentialService.get(url);
		return credential ? { username: credential.username, password: credential.password } : failed();
	};

	const data = isAuthenticated ? { url: url, ...getCredentialOrFail(url) } : { url: url };
	const result = await httpService.post(endpoint, JSON.stringify(data), MediaType.JSON);
	switch (result.status) {
		case 200:
			return readCapabilities(await result.json()) ?? [];
		case 404:
			return [];
		default:
			throw new Error(`GeoResource for '${url}' could not be loaded: Http-Status ${result.status}`);
	}
};
