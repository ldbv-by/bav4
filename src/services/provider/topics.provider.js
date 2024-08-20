/**
 * @module services/provider/topics_provider
 */
import { $injector } from '../../injection';
import { Topic } from '../../domain/topic';
/**
 * @returns {Array} with topics loaded from backend
 */

/**
 * Uses the BVV endpoint to load Topics
 * @function
 * @type {module:services/TopicsService~topicsProvider}
 */
export const loadBvvTopics = async () => {
	const { HttpService: httpService, ConfigService: configService } = $injector.inject('HttpService', 'ConfigService');

	const url = configService.getValueAsPath('BACKEND_URL') + 'adminui/topics';
	const adminToken = configService.getValue('ADMIN_TOKEN_KEY');

	const result = await httpService.get(`${url}`, {
		headers: {
			'X-AUTH-ADMIN-TOKEN': adminToken
		}
	});

	if (result.ok) {
		const topics = [];
		const payload = await result.json();
		payload.forEach((definition) => {
			let topic = null;
			topic = new Topic(
				definition.id,
				definition.label,
				definition.description,
				definition.baseGeoRs,
				definition.defaultBaseGeoR,
				definition.activatedGeoRs,
				definition.selectedGeoRs,
				definition.style
			);
			//at least the id, label, description properties should be set
			if (topic.id && topic.label && topic.description) {
				topics.push(topic);
			} else {
				console.warn('Could not create topic');
			}
		});
		return topics;
	}
	throw new Error('Topics could not be retrieved');
};

/**
 * @typedef {Object} TopicsResponse
 * @property {Topic[]} topics
 */

/**
 * @returns {Promise<TopicsResponse>}
 */

/**
 * @param {string} topicId
 * @returns {Promise<void>}
 */
// eslint-disable-next-line no-unused-vars
export const deleteBvvTopic = async (topicId) => {
	const { HttpService: httpService, ConfigService: configService } = $injector.inject('HttpService', 'ConfigService');

	const url = configService.getValueAsPath('BACKEND_URL') + 'adminui/topics/${topicId}';
	const adminToken = configService.getValue('ADMIN_TOKEN_KEY');

	const result = await httpService.delete(`${url}`, {
		headers: {
			'X-AUTH-ADMIN-TOKEN': adminToken
		}
	});

	return result;
};

export const copyTopicToProd = async (topicId) => {
	const { HttpService: httpService, ConfigService: configService } = $injector.inject('HttpService', 'ConfigService');

	const baseURL = configService.getValueAsPath('BACKEND_URL');

	const url = `${baseURL}adminui/copy2prod/topic/${topicId}`;
	const adminToken = configService.getValue('ADMIN_TOKEN_KEY');

	const result = await httpService.post(`${url}`, {
		headers: {
			'X-AUTH-ADMIN-TOKEN': adminToken
		}
	});

	return result;
};

export const copyTopicToTest = async (topicId) => {
	const { HttpService: httpService, ConfigService: configService } = $injector.inject('HttpService', 'ConfigService');

	const baseURL = configService.getValueAsPath('BACKEND_URL');

	const url = `${baseURL}adminui/copy2test/topic/${topicId}`;
	const adminToken = configService.getValue('ADMIN_TOKEN_KEY');

	const result = await httpService.post(`${url}`, {
		headers: {
			'X-AUTH-ADMIN-TOKEN': adminToken
		}
	});

	return result;
};
