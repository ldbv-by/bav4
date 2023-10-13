/**
 * @module services/RoutingService
 */
/**
 *
 * @interface RoutingService
 */

import { isCoordinate } from '../utils/checks';
import { bvvRouteProvider } from './provider/route.provider';
import { bvvRoutingCategoriesProvider } from './provider/routingCategories.provider';
import { bvvRouteStatsProvider } from './provider/routeStats.provider';

/**
 * Route result containing a multiple routes (one for each requested category/vehicle) (see also {@link module:domain/routing~Route})
 * @typedef {Object.<string, module:domain/routing~Route>} RoutingResult
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
 * @param {String} id category id
 * @returns {module:domain/routing~RoutingCategory|null} the category of `null`
 */

/**
 * Returns an array of alternative category ids. May be empty when no alternative id exists.
 * @function
 * @name module:services/RoutingService~RoutingService#getAlternativeCategoryIds
 * @param {String} id category id
 * @returns {string[]} alternative ids
 */

/**
 * Finds the parent id for a category id. Returns the given categoryId when it is the parent itself.
 * @function
 * @name module:services/RoutingService~RoutingService#getParent
 * @param {String} id category id
 * @returns {string|null} alternative ids
 */

/**
 * Calculates a route for each given category. At least two coordinates are required.
 * @function
 * @async
 * @name module:services/RoutingService~RoutingService#calculateRoute
 * @param {string[]} categories ids of the requested categories/vehicles
 * @param {module:domain/coordinateTypeDef~Coordinate[]} coordinates3857
 * @returns {Promise<module:services/RoutingService~RoutingResult|null>} the category of `null`
 */

/**
 * Calculates the statistics for a given route.
 * @function
 * @name module:services/RoutingService~RoutingService#calculateRouteStats
 * @param {module:domain/routing~Route} route the route
 * @returns {module:domain/routing~RouteStats} the statistics of the route
 */

/**
 * A function that returns a list of categories/vehicles for routing
 * @async
 * @typedef {Function} routingCategoriesProvider
 * @returns {Promise<Array<module:domain/routing~RoutingCategory>>} available categories
 */

/**
 * A function that returns a list of categories/vehicles for routing
 * @async
 * @typedef {Function} routeProvider
 * @param {string[]} categories ids of the requested categories/vehicles
 * @param {module:domain/coordinateTypeDef~Coordinate[]} coordinates3857
 * @returns {Promise<module:services/RoutingService~RoutingResult>} available categories
 */

/**
 * A function that takes a route object and returns its corresponding statistics
 * @typedef {Function} routeStatsProvider
 * @param {module:domain/routing~Route} route the route
 * @returns {module:domain/routing~RouteStats} the statistics of the route
 */

/**
 * @class
 * @implements {module:services/RoutingService~RoutingService}
 */
export class BvvRoutingService {
	/**
	 *
	 * @param {module:services/RoutingService~routingCategoriesProvider} [categoriesProvider]
	 * @param {module:services/RoutingService~routeProvider} [routeProvider]
	 * @param {module:services/RoutingService~routeStatsProvider} [routeStatsProvider]
	 */
	constructor(categoriesProvider = bvvRoutingCategoriesProvider, routeProvider = bvvRouteProvider, routeStatsProvider = bvvRouteStatsProvider) {
		this._categoriesProvider = categoriesProvider;
		this._routeProvider = routeProvider;
		this._routeStatsProvider = routeStatsProvider;
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
	 * @param {string} id category id
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

	/**
	 * @param {String} categoryId
	 * @returns {String|null}
	 */
	getParent(categoryId) {
		const cat = this.getCategoryById(categoryId);
		if (cat) {
			return (
				this.getAlternativeCategoryIds(categoryId)
					.map((catid) => this.getCategoryById(catid))
					.find((cat) => cat.subcategories.length > 0)?.id ?? categoryId
			);
		}
		return null;
	}

	/**
	 * @param {String} id category id
	 * @returns {string[]}
	 */
	getAlternativeCategoryIds(id) {
		const parentCat =
			this.getCategories().filter((cat) => cat.id === id)[0] ??
			// check if it is a subCategory and detect parent category
			this.getCategories().filter((cat) => cat.subcategories.filter((subcat) => subcat.id === id).length > 0)[0];

		if (parentCat) {
			const subCatIds = parentCat.subcategories.map((altCat) => altCat.id);
			const allIds = [parentCat.id].concat(subCatIds);

			// return all but input id
			allIds.splice(allIds.indexOf(id), 1);
			return allIds;
		}
		return [];
	}

	/**
	 * @param {string[]} categories
	 * @param {module:domain/coordinateTypeDef~Coordinate[]} coordinates3857
	 * @throws {Error} Error of the underlying provider
	 * @returns {Promise<module:services/RoutingService~RoutingResult|null>}
	 */
	async calculateRoute(categories, coordinates3857) {
		if (!Array.isArray(coordinates3857) || coordinates3857.length < 2) {
			throw new TypeError("Parameter 'coordinates3857' must be an array containing at least two coordinates");
		}
		coordinates3857.forEach((c) => {
			if (!isCoordinate(c)) {
				throw new TypeError("Parameter 'coordinates3857' contains invalid coordinates");
			}
		});
		if (!Array.isArray(categories) || categories.length < 1) {
			throw new TypeError("Parameter 'categories' must be an array containing at least one category");
		}

		try {
			return await this._routeProvider(categories, coordinates3857);
		} catch (e) {
			throw new Error('Could not retrieve a routing result from the provider', { cause: e });
		}
	}

	/**
	 *
	 * @param {module:domain/routing~Route} route the route
	 * @returns {module:domain/routing~RouteStats}
	 */
	calculateRouteStats(route) {
		return this._routeStatsProvider(route);
	}
}
