/**
 * @module services/TopicsService
 */
import { $injector } from '../injection';
import { Topic } from '../domain/topic';
import { loadBvvTopics } from './provider/topics.provider';

/**
 * An async function that provides an array of {@link Topic}.
 *
 * @async
 * @typedef {function} topicsProvider
 * @throws May throw when topics cannot be loaded
 * @return {Topic[]}
 */

/**
 * Service for managing topics.
 * @class
 * @author taulinger
 */
export class TopicsService {
	/**
	 * @param {module:services/TopicsService~topicsProvider} [provider=loadBvvCatalog]
	 */
	constructor(provider = loadBvvTopics) {
		this._provider = provider;
		const { ConfigService: configService, EnvironmentService: environmentService } = $injector.inject('ConfigService', 'EnvironmentService');
		this._configService = configService;
		this._environmentService = environmentService;
		this._topics = null;
	}

	/**
	 * Initializes this service, which means all available Topics are loaded and can be served in the future from the internal cache.
	 * If initialization fails, a fallback is delivered.
	 * @public
	 * @async
	 * @returns {Promise<Array.<Topic>>}
	 * @throws Error when no topics are available
	 */
	async init() {
		if (!this._topics) {
			try {
				this._topics = await this._provider();
			} catch (e) {
				this._topics = [];
				if (this._environmentService.isStandalone()) {
					this._topics.push(...this._newFallbackTopics());
					console.warn('Topics could not be fetched from backend. Using fallback topics ...');
				} else {
					throw new Error('No topics available', { cause: e });
				}
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
		return this._topics.find((topic) => topic.id === id) || null;
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
	_newFallbackTopics() {
		const [fallbackId0, fallbackId1] = FALLBACK_TOPICS_IDS;
		return [
			new Topic(
				fallbackId0,
				'Topic 1',
				'This is a fallback topic...',
				{
					raster: [
						//see fallback GeoResources in GeoResourceService
						'tpo',
						'tpo_mono'
					],
					vector: [
						//see fallback GeoResources in GeoResourceService
						'bmde_vector',
						'bmde_vector_relief'
					]
				},
				'tpo',
				[],
				[],
				{
					hue: 300,
					icon: "<path d='M2.866 14.85c-.078.444.36.791.746.593l4.39-2.256 4.389 2.256c.386.198.824-.149.746-.592l-.83-4.73 3.522-3.356c.33-.314.16-.888-.282-.95l-4.898-.696L8.465.792a.513.513 0 0 0-.927 0L5.354 5.12l-4.898.696c-.441.062-.612.636-.283.95l3.523 3.356-.83 4.73zm4.905-2.767-3.686 1.894.694-3.957a.565.565 0 0 0-.163-.505L1.71 6.745l4.052-.576a.525.525 0 0 0 .393-.288L8 2.223l1.847 3.658a.525.525 0 0 0 .393.288l4.052.575-2.906 2.77a.565.565 0 0 0-.163.506l.694 3.957-3.686-1.894a.503.503 0 0 0-.461 0z'/>"
				}
			),
			new Topic(
				fallbackId1,
				'Topic 2',
				'This is another fallback topic...',
				{
					raster: [
						//see fallback GeoResources in GeoResourceService
						'tpo',
						'tpo_mono'
					]
				},
				'tpo',
				[],
				[],
				{
					hue: 250,
					icon: "<path d='M8 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm0 1a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0zm0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13zm8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5zM3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8zm10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0zm-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0zm9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707zM4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708z'/>"
				}
			)
		];
	}
}

/**
 * Defines valid default topic ids.
 */
export const FALLBACK_TOPICS_IDS = ['fallback0', 'fallback1'];
