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

/**
 * Route result containing a multiple routes (one for each requested category/vehicle)
 * @typedef {Object.<string, module:services/RoutingService~Route>} RoutingResult
 */

/**
 * Route for a particular category (vehicle)
 * @typedef Route
 * @property {object} categoryId
 * @property {string} categoryId.vehicle
 * @property {object} categoryId.hints
 * @property {string} categoryId.hints.visited_nodes.average
 * @property {string} categoryId.hints.visited_nodes.sum
 * @property {object} categoryId.info
 * @property {string[]} categoryId.info.copyrights
 * @property {number} categoryId.info.took
 * @property {object[]} categoryId.paths
 * @property {number} categoryId.paths.distance
 * @property {number} categoryId.paths.weight
 * @property {number} categoryId.paths.time
 * @property {number} categoryId.paths.transfers
 * @property {boolean} categoryId.paths.points_encoded
 * @property {number[]} categoryId.paths.bbox
 * @property {string} categoryId.paths.points
 * @property {object} categoryId.paths.legs
 * @property {object} categoryId.paths.details
 * @property {array[]|number[]|string[]} categoryId.paths.details.surface
 * @property {array[]|number[]|string[]} categoryId.paths.details.road_class
 * @property {array[]|number[]|string[]} categoryId.paths.details.track_type
 * @property {number} categoryId.paths.ascend
 * @property {number} categoryId.paths.descend
 * @property {string} categoryId.paths.snapped_waypoints
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
 * Calculates routes for given categories and at least two coordinates.
 * @function
 * @async
 * @name module:services/RoutingService~RoutingService#calculate
 * @param {string[]} categories ids of the requested categories/vehicles
 * @param {module:domain/coordinateTypeDef~Coordinate[]} coordinates3857
 * @returns {Promise<module:services/RoutingService~RoutingResult|null>} the category of `null`
 */

/**
 * A function that returns a list of categories/vehicles for routing
 * @async
 * @typedef {Function} routingCategoriesProvider
 * @returns {Promise<Array<module:domain/routing~RoutingCategory>>} available categories
 */

/**
 * @typedef {Object} ChartItemStyle
 * @property {number} id The id of this chart item
 * @property {string} label The label of this chart item
 * @property {string} [image] the stringified image, visualizing the chart item
 * @property {string} color the stringified color as rgba-value
 */

/**
 * Returns all available surface type styles
 * @function
 * @name module:services/RoutingService~RoutingService#getSurfaceTypeStyles
 * @returns {ChartItemStyle[]} surfaceTypeStyles
 */

/**
 * Returns all available road type styles
 * @function
 * @name module:services/RoutingService~RoutingService#getRoadTypeStyles
 * @returns {ChartItemStyle[]} roadTypeStyles
 */

/**
 * A function that returns a list of available ChartItems to display statistical
 * data (road type, surface type) for routing
 * @function
 * @typedef {Function} chartItemStylesProvider
 * @returns {Map<string,module:domain/routing~ChartItemStyle>} available chartItems
 */

/**
 * @typedef {Object} OSMRoadClass
 * @property {number} distance
 * @property {Array<number>} segments
 */

/**
 * A function that maps and reduces OSM road types to the name of defined {@link ChartItemStyle}.
 * @function
 * @name module:services/RoutingService~RoutingService#mapOsmRoadTypes
 * @returns {Map<string, module:services/RoutingService~RoutingService#OSMRoadClass>} mapping
 */

/**
 * A function that maps and reduces OSM road types to the name of defined {@link ChartItemStyle}
 * @async
 * @typedef {Function} osmRoadTypeMappingProvider
 * @returns {Map<string, module:services/RoutingService~RoutingService#OSMRoadClass>} mapping
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
 * @class
 * @implements {module:services/RoutingService~RoutingService}
 */
export class BvvRoutingService {
	/**
	 *
	 * @param {module:services/RoutingService~routingCategoriesProvider} [categoriesProvider]
	 * @param {module:services/RoutingService~chartItemStylesProvider} [chartItemStylesProvider]
	 * @param {module:services/RoutingService~osmRoadTypeMappingProvider} [osmRoadTypeMappingProvider]
	 * @param {module:services/RoutingService~routeProvider} [routeProvider]
	 */
	constructor(
		categoriesProvider = bvvRoutingCategoriesProvider,
		routeProvider = bvvRouteProvider,
		chartItemStylesProvider = bvvChartItemStylesProvider,
		osmRoadTypeMappingProvider = bvvOsmRoadTypeMappingProvider
	) {
		this._categoriesProvider = categoriesProvider;
		this._chartItemsStylesProvider = chartItemStylesProvider;
		this._mapper = osmRoadTypeMappingProvider;
		this._routeProvider = routeProvider;
		this._chartItemsStyles = null;
		this._categories = null;
	}

	async init() {
		if (!this._categories) {
			this._categories = await this._categoriesProvider();
		}

		if (!this._chartItemsStyles) {
			this._chartItemsStyles = this._chartItemsStylesProvider();
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
		return this._chartItemsStyles['road'] ?? {};
	}

	getSurfaceTypeStyles() {
		return this._chartItemsStyles['surface'] ?? {};
	}

	mapOsmRoadTypes(osmRoadClasses) {
		return this._mapper(osmRoadClasses);
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
	async calculate(categories, coordinates3857) {
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
