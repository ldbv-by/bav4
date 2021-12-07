import { $injector } from '../../../../injection';
import { GeoResourceInfoResult } from '../GeoResourceInfoService';

/**
 * Uses the BVV endpoint to load GeoResourceInfoResult.
 * @function
 * @returns {Promise<GeoResourceInfoResult>}
 */
export const loadBvvGeoResourceInfo = async (geoResourceId) => {

	const { HttpService: httpService, ConfigService: configService } = $injector.inject('HttpService', 'ConfigService');
	const url = `${configService.getValueAsPath('BACKEND_URL')}georesource/info/${geoResourceId}`;

	const result = await httpService.get(url);

	switch (result.status) {
		case 200: {
			const htmlContent = await result.text();
			return new GeoResourceInfoResult(htmlContent);
		}
		case 404: {
			return null;
		}
	}

	throw new Error(`GeoResourceInfoResult for '${geoResourceId}' could not be loaded`);
};
