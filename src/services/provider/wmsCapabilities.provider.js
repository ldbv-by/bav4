import { $injector } from '../../injection';
import { WmsGeoResource } from '../domain/geoResources';

export const bvvCapabilitiesProvider = async (url, credential = null) => {
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
		return capabilities.layers.map(
			(layer) => toWmsGeoResource(layer, capabilities)
		);
	};

	const failed = () => {
		throw new Error(`GeoResource for '${url}' could not be loaded: Http-Status ${result.status}`);
	};

	const result = await httpService.post(endpoint, { url: url, username: credential?.username, password: credential?.password });
	return result.ok ? readCapabilities(result.json()) : failed();
};
