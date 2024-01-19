/**
 * @module services/ElevationService
 */
import { loadBvvElevation } from './provider/elevation.provider';
import { isCoordinateLike } from '../utils/checks';
import { getBvvProfile } from './provider/profile.provider';
import { $injector } from '../injection';
import { hashCode } from '../utils/hashCode';
import { deepClone } from '../utils/clone';

/**
 * @typedef {Object} Profile
 * @property {Array<Elevation>} elevations elevations objects of this profile
 * @property {string} refSystem label of the underlying height reference system
 * @property {ProfileStats} [stats] statistic data of this profile
 * @property {Array<ProfileAttribute>} attrs available attributes of this profile (may be empty)
 */

/**
 * @typedef {Object} Elevation
 * @property {number} dist distance from the previous elevation
 * @property {number} z the elevation (in meter)
 * @property {number} e easting
 * @property {number} n northing
 * @property {number} [slope] the slope (percentage value)
 */

/**
 * @typedef {Object} ProfileStats
 * @property {number} [sumUp] cumulated positive elevation difference (in meter)
 * @property {number} [sumDown] cumulated negative elevation difference (in meter)
 * @property {number} verticalHeight difference between first and last point
 * @property {number} [highestPoint] highest point
 * @property {number} [lowestPoint] lowest point
 * @property {number} linearDistance linear distance (from start to end)
 */

/**
 * @typedef {Object} ProfileAttribute
 * @property {string} id
 * @property {Array<Array<string|number>>} values
 * @property {string} [prefix]
 * @property {string} [unit]
 */

/**
 * A function that takes an array of coordinates (in 3857) and returns a promise resolving to  a {@link Profile}.
 * @typedef {Function}  profileProvider
 * @param {Array<module:domain/coordinateTypeDef~CoordinateLike>} coordinates3857
 * @returns {Promise<module:services/ElevationService~Profile>} available categories
 */

/**
 * A function that takes a coordinate (in 3857) and returns a promise with a number.
 * @typedef {Function}  elevationProvider
 * @param {module:domain/coordinateTypeDef~CoordinateLike} coordinate3857
 * @returns {Promise<Number>} the elevation value
 */

/**
 * @class
 */
export class ElevationService {
	#lastProfileResult = {};
	#environmentService;

	/**
	 *
	 * @param {module:services/ElevationService~elevationProvider}  [elevationProvider=loadBvvElevation]
	 * @param {module:services/ElevationService~profileProvider} [profileProvider=getBvvProfile]
	 */
	constructor(elevationProvider = loadBvvElevation, profileProvider = getBvvProfile) {
		this._elevationProvider = elevationProvider;
		this._profileProvider = profileProvider;
		const { EnvironmentService: environmentService } = $injector.inject('EnvironmentService');
		this.#environmentService = environmentService;
	}

	/**
	 * Returns an elevation for a coordinate.
	 * @param {module:domain/coordinateTypeDef~CoordinateLike} coordinate3857
	 * @returns {Promise<Number>} elevation
	 * @throws {Error} Error of the underlying provider
	 * @throws {TypeError} Parameter must be a valid {@link module:domain/coordinateTypeDef~Coordinate}
	 */
	async getElevation(coordinate3857) {
		if (!isCoordinateLike(coordinate3857)) {
			throw new TypeError("Parameter 'coordinate3857' must be a CoordinateLike type");
		}

		try {
			return await this._elevationProvider(coordinate3857);
		} catch (e) {
			if (this.#environmentService.isStandalone()) {
				console.warn('Could not fetch an elevation from backend. Returning a mocked value ...');
				return this._createMockElevation();
			}
			throw new Error('Could not load an elevation from provider', { cause: e });
		}
	}

	/**
	 * Returns a profile for an array of two or more coordinates
	 * @param {Array<module:domain/coordinateTypeDef~CoordinateLike>} coordinates3857
	 * @returns {Promise<Profile>} the profile
	 * @throws {Error} Error of the underlying provider
	 * @throws {TypeError} Parameter must be a valid Array of {@link module:domain/coordinateTypeDef~Coordinate}
	 */
	async getProfile(coordinates3857) {
		if (!Array.isArray(coordinates3857) || coordinates3857.length < 2) {
			throw new TypeError("Parameter 'coordinates3857' must be an array containing at least two coordinates");
		}
		coordinates3857.forEach((c) => {
			if (!isCoordinateLike(c)) {
				throw new TypeError("Parameter 'coordinates3857' contains invalid coordinates");
			}
		});

		const hc = hashCode(coordinates3857);
		if (this.#lastProfileResult[hc]) {
			return deepClone(this.#lastProfileResult[hc]);
		}

		// clear the cache
		Object.keys(this.#lastProfileResult).forEach((key) => delete this.#lastProfileResult[key]);

		try {
			const profile = await this._profileProvider(coordinates3857);
			this.#lastProfileResult[hc] = profile;
			return deepClone(profile);
		} catch (e) {
			if (this.#environmentService.isStandalone()) {
				console.warn('Could not fetch an elevation profile from backend. Returning a mocked profile ...');
				return this._createMockElevationProfile(coordinates3857);
			}
			throw new Error('Could not load an elevation profile from provider', { cause: e });
		}
	}

	_createMockElevation() {
		return Math.round(500 + Math.random() * 100);
	}

	_createMockElevationProfile(coordinates3857) {
		const profileStats = {
			sumUp: 0,
			sumDown: 0,
			verticalHeight: 0,
			highestPoint: 0,
			lowestPoint: 0,
			linearDistance: 0
		};
		const elevations = coordinates3857.map((c, index) => ({
			dist: index * 100,
			z: 500 + Math.random() * 100,
			e: c[0],
			n: c[1]
		}));
		return {
			elevations,
			stats: profileStats,
			attrs: [],
			refSystem: 'refSystem'
		};
	}
}
