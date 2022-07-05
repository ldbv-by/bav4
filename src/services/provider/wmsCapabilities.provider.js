import { $injector } from '../../injection';
import { createUniqueId } from '../../utils/numberUtils';
import { GeoResourceAuthenticationType, WmsGeoResource } from '../domain/geoResources';
import { MediaType } from '../HttpService';


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
		return new WmsGeoResource(
			createUniqueId().toString(),
			layer.title,
			`${capabilities.onlineResourceGetMap}`,
			`${layer.name}`,
			capabilities.formatsGetMap[0])
			.setAuthenticationType(getAuthenticationType(isAuthenticated))
			.setQueryable(layer.queryable)
			.setExtraParams(getExtraParams(capabilities));
	};

	const readCapabilities = (capabilities) => {
		const {	MapService: mapService } = $injector.inject('MapService');
		const defaultGeodeticSRID = mapService.getDefaultGeodeticSrid();
		const containsSRID = (layer, srid) => layer.referenceSystems.some(srs => srs.code === srid);
		return capabilities.layers?.filter((l) => containsSRID(l, defaultGeodeticSRID)).map(
			(layer) => toWmsGeoResource(layer, capabilities, isAuthenticated)
		);
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
