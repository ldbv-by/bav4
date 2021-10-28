import { $injector } from '../../injection';

/**
 * Uses the BVV endpoint to load layerinfo.
 * @function
 * @returns {Promise<Object>}
 */
export const loadBvvLayerInfo = async (geoResourceId) => {

	const { HttpService: httpService, ConfigService: configService } = $injector.inject('HttpService', 'ConfigService');

	const url = `${configService.getValueAsPath('BACKEND_URL')}layerinfo/${geoResourceId}`;

	const result = await httpService.get(url);

	if (result.ok) {
		const htmlContent = await result.text();
		return { content: htmlContent };
	}
	throw new Error(`LayerInfo for '${geoResourceId}' could not be loaded`);
};
