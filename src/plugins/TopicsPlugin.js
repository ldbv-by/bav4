/**
 * @module plugins/TopicsPlugin
 */
import { $injector } from '../injection';
import { QueryParameters } from '../domain/queryParameters';
import { BaPlugin } from './BaPlugin';
import { setCurrent, setReady } from '../store/topics/topics.action';
import { setIndex, TopicsContentPanelIndex } from '../store/topicsContentPanel/topicsContentPanel.action';
import { observe } from '../utils/storeUtils';

/**
 * @class
 */
export class TopicsPlugin extends BaPlugin {
	_addTopicFromQueryParams(queryParams) {
		const { TopicsService: topicsService } = $injector.inject('TopicsService');

		const topicId = queryParams.get(QueryParameters.TOPIC);
		if (topicId && topicsService.byId(topicId)) {
			setCurrent(topicId);
			// when we have a topic we want to display the corresponding catalog
			setIndex(TopicsContentPanelIndex.CATALOG_0);
		}
	}

	async _init() {
		const { TopicsService: topicsService, EnvironmentService: environmentService } = $injector.inject('TopicsService', 'EnvironmentService');
		const queryParams = environmentService.getQueryParams();

		await topicsService.init();

		//mark the topics state as ready
		setReady();

		//from query params
		this._addTopicFromQueryParams(queryParams);
	}

	/**
	 * @override
	 */
	async register(store) {
		const result = await this._init();
		observe(
			store,
			(state) => state.topicsContentPanel.index,
			(index) => {
				/**
				 * When we are on the top-level we reset the current topic
				 */
				if (index === TopicsContentPanelIndex.TOPICS) {
					setCurrent(null);
				}
			}
		);

		return result;
	}
}
