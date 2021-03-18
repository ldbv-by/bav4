import { Topic } from './domain/topic';
import { loadBvvTopics } from './provider/topics.provider';

export class TopicsService {

	constructor(provider = loadBvvTopics) {
		this._provider = provider;
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
    * Returns the current active  {@link Topic}.
    * @public
    * @returns {Topic | null}
    */
	current() {
		if (!this._topics) {
			console.warn('TopicsService not yet initialized');
			return null;
		}
		//Todo: use the store the determine the current active topic id
		return this._topics[0];
	}

	/**
     * @private
     */
	_newFallbackTopic() {
		return new Topic('fallback', 'Fallback Topic', 'This is a fallback topic...', ['fallback']);
	}

}