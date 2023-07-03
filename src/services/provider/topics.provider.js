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

	const url = configService.getValueAsPath('BACKEND_URL') + 'topics';

	const result = await httpService.get(`${url}`);

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
