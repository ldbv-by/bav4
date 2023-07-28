/**
 * @module services/RoutingService
 */
/**
 *
 * @interface RoutingService
 */

/**
 * Initializes this service, which means all RoutingCategory objects are loaded and can be served in the future from an internal cache.
 * @function
 * @async
 * @name module:services/RoutingService~RoutingService#init
 * @returns {Promise<module:domain/routing~RoutingCategory[]>} categories
 */

/**
 * Returns all available categories
 * @function
 * @name module:services/RoutingService~RoutingService#getCategories
 * @returns {module:domain/routing~RoutingCategory[]} categories
 */

/**
 * Returns the corresponding category or `null`.
 * @function
 * @name module:services/RoutingService~RoutingService#getCategoryById
 * @param {String} id
 * @returns {module:domain/routing~RoutingCategory|null} the category of `null`
 */

/**
 * A function that returns a list of categories for routing
 * @async
 * @typedef {Function} routingCategoriesProvider
 * @returns {Promise<Array<String>>} available categories
 */

/**
 * TODO: will be replaced and removed later
 */
export const mockCategoriesProvider = async () => {
	const hike = {
		id: 'hike',
		label: 'Wandern',
		subcategories: []
	};
	const bvv_hike = {
		id: 'bvv-hike',
		label: 'Wandern (Freizeitwege)',
		subcategories: [hike]
	};
	const bayernnetz_bike = {
		id: 'bayernnetz-bike',
		label: 'Mountainbike (Bayernnetz)',
		subcategories: []
	};
	const bike = {
		id: 'bike',
		label: 'Fahrrad',
		subcategories: []
	};
	const bvv_bike = {
		id: 'bvv-bike',
		label: 'Fahrrad (Freizeitwege)',
		subcategories: [bike, bayernnetz_bike]
	};
	const mtb = {
		id: 'mtb',
		label: 'Mountainbike',
		subcategories: []
	};
	const bvv_mtb = {
		id: 'bvv-mtb',
		label: 'Mountainbike (Freizeitwege)',
		subcategories: [mtb]
	};
	const race = {
		id: 'racingbike',
		label: 'Rennrad',
		subcategories: []
	};

	return [bvv_hike, bvv_bike, bvv_mtb, race];
};

/**
 * @class
 * @implements {module:services/RoutingService~RoutingService}
 */
export class BvvRoutingService {
	/**
	 *
	 * @param {module:services/RoutingService~routingCategoriesProvider} [categoriesProvider]
	 */
	constructor(categoriesProvider = mockCategoriesProvider) {
		this._categoriesProvider = categoriesProvider;
		this._categories = null;
	}

	async init() {
		if (!this._categories) {
			this._categories = await this._categoriesProvider();
		}
		return this._categories;
	}
	/**
	 *
	 * @returns {module:domain/routing~RoutingCategory[]}
	 */
	getCategories() {
		return this._categories ?? [];
	}

	/**
	 *
	 * @param {string} id
	 * @returns {module:domain/routing~RoutingCategory|null}
	 */
	getCategoryById(id) {
		return (
			this._categories
				.map((c) => [c, ...[c.subcategories]])
				.flat(2)
				.find((c) => c.id === id) ?? null
		);
	}
}
