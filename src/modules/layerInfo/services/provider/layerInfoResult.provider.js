import { $injector } from '../../../../injection';
import { LayerInfoResult } from '../LayerInfoService';

/**
 * Uses the BVV endpoint to load layerinfoResult.
 * @function
 * @returns {Promise<LayerInfoResult>}
 */
export const loadBvvLayerInfo = async (geoResourceId) => {

	const { HttpService: httpService, ConfigService: configService } = $injector.inject('HttpService', 'ConfigService');
	const url = `${configService.getValueAsPath('BACKEND_URL')}georesource/info/${geoResourceId}`;

	const result = await httpService.get(url);

	switch (result.status) {
		case 200: {
			const htmlContent = await result.text();
			return new LayerInfoResult(htmlContent);
		}
		case 404: {
			return null;
		}
	}

	throw new Error(`LayerInfoResult for '${geoResourceId}' could not be loaded`);
};
