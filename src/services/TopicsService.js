import { $injector } from '../injection';
import { Topic } from './domain/topic';
import { loadBvvTopics } from './provider/topics.provider';

/**
 * Service for managing topics.
 * @class
 */
export class TopicsService {

	constructor(provider = loadBvvTopics) {
		this._provider = provider;
		const { ConfigService: configService } = $injector.inject('ConfigService');
		this._configService = configService;
		this._topics = null;
	}

	/**
	 * Initializes this service, which means all available Topics are loaded and can be served in the future from the internal cache.
	 * If initialsation fails, a fallback is delivered. 
	 * @public
	 * @async
	 * @returns {Promise<Array.<Topic>>}
	 */
	async init() {
		if (!this._topics) {
			try {
				this._topics = await this._provider();
				return this._topics;
			}
			catch (e) {
				this._topics = [this._newFallbackTopic()];
				console.warn('Topics could not be fetched from backend. Using fallback topics ...');
			}
		}
		return this._topics;
	}

	/**
	* Returns all available {@link Topic}.
	* @public
	* @returns  {Array.<Topic>}
	*/
	all() {
		if (!this._topics) {
			console.warn('TopicsService not yet initialized');
			return [];
		}
		return this._topics;
	}

	/**
	* Returns the corresponding  {@link Topic} for an id.
	* @public
	* @param {string} id Id of the desired {@link Topic}
	* @returns {Topic | null}
	*/
	byId(id) {
		if (!this._topics) {
			console.warn('TopicsService not yet initialized');
			return null;
		}
		return this._topics.find(topic => topic.id === id) || null;
	}

	/**
	 * Returns the configured default {@link Topic} or if not available a fallback topic.
	 * @returns {Topic | null}
	 */
	default() {
		return this.byId(this._configService.getValue('DEFAULT_TOPIC_ID', 'ba')) || this.all()[0] || null;
	}

	/**
	 * @private
	 */
	_newFallbackTopic() {
		return new Topic('fallback', 'Fallback Topic', 'This is a fallback topic...', [
			//see fallback georesources in GeoResourceService
			'atkis',
			'atkis_sw'
		]);
	}

}