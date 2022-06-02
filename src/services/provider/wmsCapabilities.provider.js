import { $injector } from '../../injection';
import { GeoResourceAuthenticationType, WmsGeoResource } from '../domain/geoResources';
import { SourceTypeResultStatus } from '../domain/sourceType';

const Default_Credential = { username: null, password: null };

export const bvvCapabilitiesProvider = async (url, sourceTypeResult) => {
	const { HttpService: httpService, ConfigService: configService } = $injector.inject('HttpService', 'ConfigService');
	const endpoint = configService.getValueAsPath('BACKEND_URL') + 'wms/getCapabilities';

	const getExtraParams = (capabilities) => {
		return capabilities.maxHeight && capabilities.maxWidth ? { maxHeight: capabilities.maxHeight, maxWidth: capabilities.maxWidth } : {};
	};

	const getAuthenticationType = (isBaaAuthenticated) => {
		return isBaaAuthenticated ? GeoResourceAuthenticationType.BAA : null;
	};

	const toWmsGeoResource = (layer, capabilities, isBaaAuthenticated = false) => {
		return new WmsGeoResource(
			`${capabilities.onlineResourceGetMap}${layer.name}`,
			layer.title,
			capabilities.onlineResourceGetMap,
			layer.name,
			capabilities.formatsGetMap[0])
			.setAuthenticationType(getAuthenticationType(isBaaAuthenticated))
			.setExtraParams(getExtraParams(capabilities));
	};
	const readCapabilities = (capabilities) => {
		const {	MapService: mapService } = $injector.inject('MapService');
		const defaultGeodeticSRID = mapService.defaultGeodeticSRID();

		const containsSRID = (layer, srid) => layer.referenceSystems.some(srs => srs.code === srid);
		return capabilities.layers?.filter((l) => containsSRID(l, defaultGeodeticSRID)).map(
			(layer) => toWmsGeoResource(layer, capabilities, sourceTypeResult.status === SourceTypeResultStatus.BAA_AUTHENTICATED)
		);
	};

	const getCredential = (url) => {
		const {	BaaCredentialService: baaCredentialService } = $injector.inject('BaaCredentialService');
		const credential = baaCredentialService.get(url);
		return credential ? credential : Default_Credential;
	};

	const credential = sourceTypeResult.status === SourceTypeResultStatus.BAA_AUTHENTICATED ? getCredential(url) : Default_Credential;

	const result = await httpService.post(endpoint, { url: url, username: credential.username, password: credential.password });
	switch (result.status) {
		case 200:
			return readCapabilities(result.json());
		case 404:
			return [];
		default:
			throw new Error(`GeoResource for '${url}' could not be loaded: Http-Status ${result.status}`);
	}
};
