/**
 * @module services/provider/feedback_provider
 */
import { $injector } from '../../injection';
import { GeneralFeedback, MapFeedback } from '../FeedbackService';
import { MediaType } from '../HttpService';

/**
 * Bvv specific implementation of {@link module:services/FeedbackService~feedbackStorageProvider}
 * @implements {module:services/FeedbackService~feedbackStorageProvider}
 * @function
 */
export const bvvFeedbackStorageProvider = async (mapFeedback) => {
	const { HttpService: httpService, ConfigService: configService } = $injector.inject('HttpService', 'ConfigService');

	const getResult = async () => {
		switch (mapFeedback.constructor) {
			case MapFeedback: {
				return await httpService.post(
					`${configService.getValueAsPath('BACKEND_URL')}feedback/tim/message`,
					JSON.stringify(mapFeedback),
					MediaType.JSON,
					{ timeout: 2000 }
				);
			}
			case GeneralFeedback:
				return await httpService.post(
					`${configService.getValueAsPath('BACKEND_URL')}feedback/general/message`,
					JSON.stringify(mapFeedback),
					MediaType.JSON,
					{ timeout: 2000 }
				);
			default:
				throw new Error(`Feedback could not be stored: Unknown feedback class`);
		}
	};

	const result = await getResult();
	switch (result.status) {
		case 200: {
			return true;
		}
		default:
			throw new Error(`Feedback could not be stored: Http-Status ${result.status}`);
	}
};

/**
 * Bvv specific implementation of {@link module:services/FeedbackService~mapFeedbackCategoriesProvider}
 * @async
 * @implements {module:services/FeedbackService~feedbackCategoriesProvider}
 * @function
 */
export const bvvMapFeedbackCategoriesProvider = async () => {
	const { HttpService: httpService, ConfigService: configService } = $injector.inject('HttpService', 'ConfigService');
	const url = `${configService.getValueAsPath('BACKEND_URL')}feedback/tim/categories`;
	const result = await httpService.get(url);

	switch (result.status) {
		case 200:
			return await result.json();
		default:
			throw new Error(`MapFeedback categories could not be loaded: Http-Status ${result.status}`);
	}
};

/**
 * Bvv specific implementation of {@link module:services/FeedbackService~mapFeedbackOverlayGeoResourceProvider}
 * @function
 * @implements {module:services/FeedbackService~mapFeedbackOverlayGeoResourceProvider}
 */
export const bvvMapFeedbackOverlayGeoResourceProvider = () => 'tim';
