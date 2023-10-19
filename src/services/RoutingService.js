/**
 * @module services/RoutingService
 */
/**
 *
 * @interface RoutingService
 */

import { bvvOsmRoadTypeMappingProvider } from './provider/osmRoadTypeMapper.provider';
import { bvvChartItemStylesProvider } from './provider/chartItemStyles.provider';
import { isCoordinate } from '../utils/checks';
import { bvvRouteProvider } from './provider/route.provider';
import { bvvRoutingCategoriesProvider } from './provider/routingCategories.provider';
import { bvvRouteStatsProvider } from './provider/routeStats.provider';
import { bvvEtaCalculatorProvider } from './provider/etaCalculator.provider';

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
 * Returns all available surface type styles
 * @function
 * @name module:services/RoutingService~RoutingService#getSurfaceTypeStyles
 * @returns {Array<module:domain/routing~ChartItemStyle>} surfaceTypeStyles
 */

/**
 * Returns all available road type styles
 * @function
 * @name module:services/RoutingService~RoutingService#getRoadTypeStyles
 * @returns {Array<module:domain/routing~ChartItemStyle>} roadTypeStyles
 */

/**
 * A function that returns a list of available ChartItems to display statistical
 * data (road type, surface type) for routing
 * @function
 * @typedef {Function} chartItemStylesProvider
 * @returns {Map<string,module:domain/routing~ChartItemStyle>} available chartItems
 */

/**
 * A default {@link module:domain/routing~ChartItemStyle} object for chart items of road-classes
 * if the {@link module:services/RoutingService~chartItemStylesProvider} cannot
 * provide a specific style
 */
export const CHART_ITEM_ROAD_STYLE_UNKNOWN = {
	id: 0,
	color: 'transparent',
	image: 'repeating-linear-gradient(45deg,#eee 0px,#eee 7px, #999 8px, #999 10px, #eee 11px)',
	label: 'Unknown'
};

/**
 * A default {@link module:domain/routing~ChartItemStyle} object for chart items of surface-classes
 * if the {@link module:services/RoutingService~chartItemStylesProvider} cannot
 * provide a specific style
 */
export const CHART_ITEM_SURFACE_STYLE_UNKNOWN = {
	id: 0,
	color: 'transparent',
	image: 'repeating-linear-gradient(45deg,gray 25%, transparent 25%,transparent 50%, gray 50%, gray 55%, transparent 55%, transparent)',
	label: 'Unknown'
};

/**
 * A function that maps and reduces {@link module:domain/routing~RouteDetailTypeAttribute}
 * with OSM road type names to the name of defined {@link module:domain/routing~ChartItemStyle}
 * @function
 * @name module:services/RoutingService~RoutingService#mapOsmRoadTypes
 * @returns {Map<string,module:domain/routing~RouteDetailTypeAttribute>} mapping
 */

/**
 * A function that maps and reduces {@link module:domain/routing~RouteDetailTypeAttribute}
 * with OSM road type names to the name of defined {@link module:domain/routing~ChartItemStyle}
 * @typedef {Function} osmRoadTypeMappingProvider
 * @returns {Map<string,module:domain/routing~RouteDetailTypeAttribute>} mapping
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
 * A Calculator for ETAs (Estimated Time Arrived)
 * @typedef {Object} ETACalculator
 * @param {Number} distance distance in meter
 * @param {Number} elevationUp elevation upwards in meter
 * @param {Number} elevationDown  elevation downwards in meter
 * @property {function(distance, elevationUp, elevationDown):(number)} getETAfor function that returns the ETA in milliseconds.
 */

/**
 * A function that provides a ETACalculator for a defined category
 * @function
 * @name module:services/RoutingService~RoutingService#getETACalculatorFor
 * @param {string} categoryId
 * @returns {module:services/RoutingService~ETACalculator| null} etaCalculator
 */

/**
 * A function that provides a ETACalculator for a defined vehicle type.
 * @typedef {Function} etaCalculatorProvider
 * @param {string} categoryId id of the requested category
 * @returns {module:services/RoutingService~ETACalculator| null} etaCalculator
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
	 * @param {module:services/RoutingService~chartItemStylesProvider} [chartItemStylesProvider]
	 * @param {module:services/RoutingService~osmRoadTypeMappingProvider} [osmRoadTypeMappingProvider]
	 * @param {module:services/RoutingService~etaCalculatorProvider} [etaCalculatorProvider]
	 *
	 */
	constructor(
		categoriesProvider = bvvRoutingCategoriesProvider,
		routeProvider = bvvRouteProvider,
		routeStatsProvider = bvvRouteStatsProvider,
		chartItemStylesProvider = bvvChartItemStylesProvider,
		osmRoadTypeMappingProvider = bvvOsmRoadTypeMappingProvider,
		etaCalculatorProvider = bvvEtaCalculatorProvider
	) {
		this._categoriesProvider = categoriesProvider;
		this._chartItemsStylesProvider = chartItemStylesProvider;
		this._mapper = osmRoadTypeMappingProvider;
		this._routeProvider = routeProvider;
		this._chartItemsStyles = null;
		this._routeStatsProvider = routeStatsProvider;
		this._etaCalculatorProvider = etaCalculatorProvider;
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

	getRoadTypeStyles() {
		if (!this._chartItemsStyles) {
			this._chartItemsStyles = this._chartItemsStylesProvider();
		}
		return this._chartItemsStyles['road'] ?? {};
	}

	getSurfaceTypeStyles() {
		if (!this._chartItemsStyles) {
			this._chartItemsStyles = this._chartItemsStylesProvider();
		}
		return this._chartItemsStyles['surface'] ?? {};
	}

	mapOsmRoadTypes(routeDetailTypeAttributes) {
		return this._mapper(routeDetailTypeAttributes);
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

	/**
	 * Returns a ETACalculator for a defined vehicle type
	 * @param {string} categoryId
	 */
	getETACalculatorFor(categoryId) {
		return this._etaCalculatorProvider(categoryId);
	}
}
