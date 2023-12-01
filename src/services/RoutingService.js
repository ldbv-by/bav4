/**
 * @module services/RoutingService
 */
/**
 *
 * @interface RoutingService
 */

import { bvvOsmRoadTypeMappingProvider } from './provider/osmRoadTypeMapping.provider';
import { bvvChartItemStylesProvider } from './provider/chartItemStyles.provider';
import { isCoordinate } from '../utils/checks';
import { bvvRouteProvider } from './provider/route.provider';
import { bvvRoutingCategoriesProvider } from './provider/routingCategories.provider';
import { $injector } from '../injection/index';

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
 * @returns {module:domain/routing~RoutingCategory|null} the category or `null`
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
 * @returns {Promise<module:domain/routing~GhRoutingResult|null>} the category of `null`
 */

/**
 * Calculates the statistics for a given route.
 * @function
 * @async
 * @name module:services/RoutingService~RoutingService#calculateRouteStats
 * @param {module:domain/routing~GhRoute} route the route
 * @param {module:domain/coordinateTypeDef~Coordinate[]} coordinates3857 the coordinates suitable for calculating a {@link module:domain/elevationProfile~Profile} for that route
 * @returns {module:domain/routing~RouteStats|null} the statistics of the route or `null` of stats could not be calculated
 */

/**
 * Returns all available surface type styles
 * @function
 * @name module:services/RoutingService~RoutingService#getSurfaceTypeStyles
 * @returns {module:domain/routing~ChartItemStyleCatalog} surfaceTypeStyles
 */

/**
 * Returns all available road type styles
 * @function
 * @name module:services/RoutingService~RoutingService#getRoadTypeStyles
 * @returns {module:domain/routing~ChartItemStyleCatalog} roadTypeStyles
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
 * A function that maps and reduces {@link module:domain/routing~ChartData}
 * with OSM road type names to the catalogId of defined {@link module:domain/routing~ChartItemStyle}
 * @function
 * @name module:services/RoutingService~RoutingService#mapRoadTypesToCatalogId
 * @param {Object.<string, module:domain/routing~ChartData>} routeChartData
 * @returns {Object.<string, module:domain/routing~ChartData>} the mapped chartData
 */

/**
 * A function that returns a list of categories/vehicles for routing
 * @async
 * @typedef {Function} routingCategoriesProvider
 * @returns {Promise<Array<module:domain/routing~RoutingCategory>>} available categories
 */

/**
 * A function that maps the name of a OSM road type
 * to the catalogId a of defined {@link module:domain/routing~ChartItemStyle}
 * @typedef {Function} osmRoadTypeMappingProvider
 * @param {string} osmRoadTypeName the name of a OSM road type
 * @returns {string} the mapped catalogId
 */

/**
 * A function that returns a list of categories/vehicles for routing
 * @async
 * @typedef {Function} routeProvider
 * @param {string[]} categories ids of the requested categories/vehicles
 * @param {module:domain/coordinateTypeDef~Coordinate[]} coordinates3857
 * @returns {Promise<module:domain/routing~GhRoutingResult>} available categories
 */

/**
 * A function that takes a `GhRoute` and a corresponding `ProfileStats` object and returns statistics data for that route
 * @typedef {Function} routeStatsProvider
 * @param {module:domain/routing~GhRoute} route the route
 * @param {module:services/ElevationService~ProfileStats} profileStats statistic data of a profile of the route
 * @returns {module:domain/routing~RouteStats} the statistics of the route
 */

/**
 * A function that returns a list of available ChartItems to display statistical
 * data (road type, surface type) for routing
 * @function
 * @typedef {Function} chartItemStylesProvider
 * @returns {module:domain/routing~ChartItemStyleCatalogs} available chartItems
 */

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
 * @class
 * @implements {module:services/RoutingService~RoutingService}
 */
export class BvvRoutingService {
	/**
	 *
	 * @param {module:services/RoutingService~routingCategoriesProvider} [categoriesProvider]
	 * @param {module:services/RoutingService~routeProvider} [routeProvider]
	 * @param {module:services/RoutingService~chartItemStylesProvider} [chartItemStylesProvider]
	 * @param {module:services/RoutingService~osmRoadTypeMappingProvider} [osmRoadTypeMappingProvider]
	 *
	 */
	constructor(
		categoriesProvider = bvvRoutingCategoriesProvider,
		routeProvider = bvvRouteProvider,
		chartItemStylesProvider = bvvChartItemStylesProvider,
		osmRoadTypeMappingProvider = bvvOsmRoadTypeMappingProvider
	) {
		this._categoriesProvider = categoriesProvider;
		this._chartItemsStylesProvider = chartItemStylesProvider;
		this._osmRoadTypeMapper = osmRoadTypeMappingProvider;
		this._routeProvider = routeProvider;
		const { ElevationService } = $injector.inject('ElevationService');
		this._elevationService = ElevationService;
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
		return this._chartItemsStylesProvider()['road']
			? { unknown: CHART_ITEM_ROAD_STYLE_UNKNOWN, ...this._chartItemsStylesProvider()['road'] }
			: { unknown: CHART_ITEM_ROAD_STYLE_UNKNOWN };
	}

	getSurfaceTypeStyles() {
		return this._chartItemsStylesProvider()['surface']
			? { unknown: CHART_ITEM_SURFACE_STYLE_UNKNOWN, ...this._chartItemsStylesProvider()['surface'] }
			: { unknown: CHART_ITEM_SURFACE_STYLE_UNKNOWN };
	}

	mapRoadTypesToCatalogId(routeChartData) {
		const merge = (roadType, data) => {
			return {
				...roadType,
				absolute: roadType.absolute + data.absolute,
				relative: roadType.relative + data.relative,
				segments: roadType.segments.concat(data.segments)
			};
		};
		const add = (data) => {
			return {
				absolute: data.absolute,
				relative: data.relative,
				segments: data.segments
			};
		};

		const mappedChartData = {};
		Object.keys(routeChartData).forEach((key) => {
			const catalogId = this._osmRoadTypeMapper(key);
			if (catalogId) {
				mappedChartData[catalogId] = mappedChartData[catalogId] ? merge(mappedChartData[catalogId], routeChartData[key]) : add(routeChartData[key]);
			} else {
				mappedChartData[key] = add(routeChartData[key]);
			}
		});
		return mappedChartData;
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
	 * @returns {Promise<module:domain/routing~GhRoutingResult|null>}
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
}
