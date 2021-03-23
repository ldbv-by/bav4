import { $injector } from '../../../injection';
import { QueryParameters } from '../../../services/domain/queryParameters';
import { BaObserver } from '../../BaObserver';
import { setCurrent } from './topics.action';


/**
 * @class
 */
export class TopicsObserver extends BaObserver {


	_addTopicFromQueryParams(queryParams) {
		const { TopicsService: topicsService } = $injector.inject('TopicsService');

		const topicId = queryParams.get(QueryParameters.TOPIC);
		if (topicsService.byId(topicId)) {
			setCurrent(topicId);
		}
		else {
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
		const queryParams = new URLSearchParams(environmentService.getWindow().location.search);

		//no try-catch needed, service at least delivers a fallback
		await topicsService.init();

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
