/**
 * @module plugins/TopicsPlugin
 */
import { $injector } from '../injection';
import { QueryParameters } from '../domain/queryParameters';
import { BaPlugin } from './BaPlugin';
import { setCurrent, setReady } from '../store/topics/topics.action';

/**
 * @class
 */
export class TopicsPlugin extends BaPlugin {
	_addTopicFromQueryParams(queryParams) {
		const { TopicsService: topicsService } = $injector.inject('TopicsService');

		const topicId = queryParams.get(QueryParameters.TOPIC);
		if (topicsService.byId(topicId)) {
			setCurrent(topicId);
		} else {
			//fallback
			this._addTopicFromConfig();
		}
	}

	_addTopicFromConfig() {
		const { TopicsService: topicsService } = $injector.inject('TopicsService');

		//update store
		setCurrent(topicsService.default().id);
	}

	async _init() {
		const { TopicsService: topicsService, EnvironmentService: environmentService } = $injector.inject('TopicsService', 'EnvironmentService');
		const queryParams = environmentService.getQueryParams();

		try {
			await topicsService.init();
		} catch (e) {
			throw new Error('No topics found. Is the backend running and properly configured?', { cause: e });
		}
		//mark the topics state as ready
		setReady();

		//from query params
		if (queryParams.has(QueryParameters.TOPIC)) {
			this._addTopicFromQueryParams(queryParams);
		}
		//from config
		else {
			this._addTopicFromConfig();
		}
	}

	/**
	 * @override
	 * @param {store} store
	 */
	async register() {
		return await this._init();
	}
}
