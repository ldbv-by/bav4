import { $injector } from '../../injection';
import { LayerInfoResult } from '../../modules/layerInfo/services/LayerInfoService';

/**
 * Uses the BVV endpoint to load layerinfoResult.
 * @function
 * @returns {Promise<LayerInfoResult>}
 */
export const loadBvvLayerInfo = async (geoResourceId) => {

	const { HttpService: httpService, ConfigService: configService } = $injector.inject('HttpService', 'ConfigService');
	const url = `${configService.getValueAsPath('BACKEND_URL')}layerinfo/${geoResourceId}`;

	const result = await httpService.get(url);

	if (result.ok) {
		const htmlContent = await result.text();
		if (htmlContent && htmlContent.length > 0) {
			return new LayerInfoResult(htmlContent, null);
		}
	}
	throw new Error(`LayerInfoResult for '${geoResourceId}' could not be loaded`);
};
