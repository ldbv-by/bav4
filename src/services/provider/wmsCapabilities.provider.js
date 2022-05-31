import { $injector } from '../../injection';
import { WmsGeoResource } from '../domain/geoResources';

const Default_Credential = { username: null, password: null };

const isValidCredential = (credential) => (credential.username && credential.password) || (credential === Default_Credential) ;

export const bvvCapabilitiesProvider = async (url, credential = Default_Credential) => {
	const { HttpService: httpService, ConfigService: configService } = $injector.inject('HttpService', 'ConfigService');
	const endpoint = configService.getValueAsPath('BACKEND_URL') + 'wms/getCapabilities';

	const toWmsGeoResource = (layer, capabilities) => {
		const wgr = new WmsGeoResource(
			`${capabilities.onlineResourceGetMap}${layer.name}`,
			layer.title,
			capabilities.onlineResourceGetMap,
			layer.name,
			capabilities.formatsGetMap[0]);

		if (capabilities.maxHeight && capabilities.maxWidth) {
			wgr.setExtraParams({ maxHeight: capabilities.maxHeight, maxWidth: capabilities.maxWidth });
		}

		return wgr;
	};
	const readCapabilities = (capabilities) => {
		const contains3857 = (layer) => layer.referenceSystems.some(srs => srs.code === 3857);
		return capabilities.layers?.filter((l) => contains3857(l)).map(
			(layer) => toWmsGeoResource(layer, capabilities)
		);
	};

	const requestCredential = isValidCredential(credential) ? credential : Default_Credential;

	const result = await httpService.post(endpoint, { url: url, username: requestCredential.username, password: requestCredential.password });
	switch (result.status) {
		case 200:
			return readCapabilities(result.json());
		case 404:
			return [];
		default:
			throw new Error(`GeoResource for '${url}' could not be loaded: Http-Status ${result.status}`);
	}
};
