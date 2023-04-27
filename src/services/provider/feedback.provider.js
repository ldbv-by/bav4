/**
 * @module services/provider/feedback_provider
 */
import { $injector } from '../../injection';
import { MediaType } from '../HttpService';

/**
 * Bvv specific immplementation of {@link module:services/MapFeedbackService~mapFeedbackStorageProvider}
 * @implements {module:services/MapFeedbackService~feedbackStorageProvider}
 */
export const bvvFeedbackStorageProvider = async (mapFeedback) => {
	const { HttpService: httpService, ConfigService: configService } = $injector.inject('HttpService', 'ConfigService');
	const url = `${configService.getValueAsPath('BACKEND_URL')}tim/message`;

	const result = await httpService.post(url, JSON.stringify(mapFeedback), MediaType.JSON, { timeout: 2000 });

	switch (result.status) {
		case 200: {
			return true;
		}
		default:
			throw new Error(`MapFeedback could not be stored: Http-Status ${result.status}`);
	}
};

/**
 * Bvv specific immplementation of {@link module:services/MapFeedbackService~mapFeedbackCategoriesProvider}
 * @async
 * @implements {module:services/MapFeedbackService~mapFeedbackCategoriesProvider}
 */
export const bvvMapFeedbackCategoriesProvider = async () => {
	const { HttpService: httpService, ConfigService: configService } = $injector.inject('HttpService', 'ConfigService');
	const url = `${configService.getValueAsPath('BACKEND_URL')}tim/categories`;
	const result = await httpService.get(url);

	switch (result.status) {
		case 200:
			return await result.json();
		default:
			throw new Error(`MapFeedback categories could not be loaded: Http-Status ${result.status}`);
	}
};
