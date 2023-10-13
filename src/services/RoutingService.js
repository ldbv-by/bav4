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
	// eslint-disable-next-line no-unused-vars
	calculateRouteStats(route) {
		return {
			time: 20553004,
			details: {
				surface: {
					other: {
						distance: 1897.9661809258098,
						segments: [
							[0, 13],
							[225, 244],
							[464, 466],
							[874, 876],
							[909, 919],
							[1189, 1196]
						]
					},
					asphalt: {
						distance: 100792.90107550545,
						segments: [
							[13, 225],
							[244, 464],
							[466, 874],
							[876, 909],
							[919, 1189],
							[1196, 1948]
						]
					}
				},
				road_class: {
					track_grade2: {
						distance: 457.5300388069273,
						segments: [
							[0, 13],
							[242, 244],
							[464, 466]
						]
					},
					secondary: {
						distance: 29684.734480945262,
						segments: [
							[13, 113],
							[215, 222],
							[303, 374],
							[398, 402],
							[415, 453],
							[478, 580],
							[714, 874],
							[880, 881],
							[932, 943],
							[947, 964],
							[1001, 1002],
							[1047, 1073],
							[1456, 1466],
							[1541, 1544],
							[1734, 1739],
							[1878, 1902]
						]
					},
					tertiary: {
						distance: 29272.20437937065,
						segments: [
							[113, 215],
							[259, 283],
							[615, 630],
							[634, 654],
							[1073, 1131],
							[1233, 1234],
							[1245, 1246],
							[1310, 1311],
							[1418, 1428],
							[1445, 1456],
							[1572, 1693],
							[1698, 1734],
							[1739, 1834],
							[1850, 1878],
							[1902, 1948]
						]
					},
					residential: {
						distance: 8721.934764111478,
						segments: [
							[222, 225],
							[246, 254],
							[289, 291],
							[374, 398],
							[402, 403],
							[414, 415],
							[453, 455],
							[477, 478],
							[583, 584],
							[654, 714],
							[874, 876],
							[905, 909],
							[919, 926],
							[930, 932],
							[943, 947],
							[1012, 1026],
							[1035, 1047],
							[1131, 1132],
							[1196, 1197],
							[1234, 1238],
							[1240, 1245],
							[1272, 1273],
							[1308, 1310],
							[1428, 1434],
							[1490, 1493],
							[1532, 1541],
							[1693, 1698],
							[1834, 1850]
						]
					},
					track_grade3: { distance: 676.7598133050363, segments: [[225, 242]] },
					track_grade1: {
						distance: 4435.33992013613,
						segments: [
							[244, 246],
							[613, 615],
							[1026, 1035],
							[1165, 1172],
							[1297, 1305],
							[1493, 1532]
						]
					},
					unclassified: {
						distance: 440.08219063893426,
						segments: [
							[254, 259],
							[283, 289],
							[1250, 1251],
							[1406, 1407]
						]
					},
					cycleway: {
						distance: 24618.191923391933,
						segments: [
							[291, 300],
							[403, 414],
							[580, 583],
							[597, 603],
							[876, 880],
							[881, 905],
							[926, 930],
							[964, 1001],
							[1002, 1012],
							[1132, 1165],
							[1172, 1189],
							[1197, 1233],
							[1246, 1250],
							[1251, 1272],
							[1273, 1297],
							[1305, 1308],
							[1311, 1406],
							[1407, 1418],
							[1434, 1445],
							[1466, 1490],
							[1544, 1572]
						]
					},
					primary: { distance: 37.34415357921526, segments: [[300, 303]] },
					path_grade1: {
						distance: 3476.883722331524,
						segments: [
							[455, 464],
							[466, 477],
							[584, 597],
							[603, 613],
							[630, 634]
						]
					},
					path_grade2: {
						distance: 738.4962062949494,
						segments: [
							[909, 919],
							[1189, 1196]
						]
					},
					other: { distance: 131.36566351924574, segments: [[1238, 1240]] }
				}
			},
			warnings: {
				500: {
					message: 'Evtl. hohes Verkehrsaufkommen',
					criticality: 'Hint',
					segments: [
						[13, 113],
						[215, 222],
						[300, 303],
						[303, 374],
						[398, 402],
						[415, 453],
						[478, 580],
						[714, 874],
						[880, 881],
						[932, 943],
						[947, 964],
						[1001, 1002],
						[1047, 1073],
						[1456, 1466],
						[1541, 1544],
						[1734, 1739],
						[1878, 1902]
					]
				}
			},
			stats: { sumUp: 927, sumDown: 981.3 },
			diff: -54.30000000000001,
			twoDiff: [927, 981.3],
			elPoi: [562.2, 323.7],
			dist: 102690.86725643142,
			slopeDist: 102055.31270225867
		};
	}
}
