import { loadBvvElevation } from './provider/elevation.provider';
import { isCoordinate } from '../utils/checks';
import { getBvvProfile } from './provider/profile.provider';
import { $injector } from '../injection';


/**
 * @typedef {Object} Profile
 * @property {Array<Elevation>} elevations elevations objects of this profile
 * @property {ProfileStats} stats  [stats] objects of this profile
 * @property {Array<ProfileAttribute>} attrs available attributes of this profile (may be empty)
 */

/**
 * @typedef {Object} Elevation
 * @property {number} dist distance from the previous elevation
 * @property {number} z the elevation (in meter)
 * @property {number} e easting
 * @property {number} n northing
 */

/**
 * @typedef {Object} ProfileStats
 * @property {number} sumUp cumulated positive elevation difference (in meter)
 * @property {number} sumDown cumulated negative elevation difference (in meter)
 * @property {number} verticalHeight difference between highest and lowest point
 * @property {number} highestPoint highest point
 * @property {number} lowestPoint lowest point
 * @property {number} linearDistance linear distance (from start to end)
 */

/**
 * @typedef {Object} ProfileAttribute
 * @property {string} id
 * @property {Array<Array<string|number>>} values
 */

/**
 * @class
 */
export class ElevationService {

	/**
	 *
	 * @param {elevationProvider} [elevationProvider=loadBvvElevation]
	 * @param {profileProvider} [profileProvider=getBvvProfile]
	 */
	constructor(elevationProvider = loadBvvElevation, profileProvider = getBvvProfile) {
		this._elevationProvider = elevationProvider;
		this._profileProvider = profileProvider;
		const { EnvironmentService: environmentService } = $injector.inject('EnvironmentService');
		this._environmentService = environmentService;
	}

	/**
	 * Returns an elevation for a coordinate.
	 * @param {Coordinate} coordinate3857
	 * @returns {Number} elevation
	 */
	async getElevation(coordinate3857) {
		if (!isCoordinate(coordinate3857)) {
			throw new TypeError('Parameter \'coordinate3857\' must be a coordinate');
		}

		try {
			return await this._elevationProvider(coordinate3857);
		}
		catch (e) {
			throw new Error('Could not load elevation from provider: ' + e.message);
		}
	}

	/**
	 * Returns a profile for an array of two or more coordinates
	 * @param {Array<Coordinate>} coordinates3857
	 * @returns the profile
	 */
	async getProfile(coordinates3857) {
		if (!Array.isArray(coordinates3857) || coordinates3857.length < 2) {
			throw new TypeError('Parameter \'coordinates3857\' must be an array containing at least two coordinates');
		}
		coordinates3857.forEach(c => {
			if (!isCoordinate(c)) {
				throw new TypeError('Parameter \'coordinates3857\' contains invalid coordinates');
			}
		});

		try {
			return await this._profileProvider(coordinates3857);
		}
		catch (e) {
			if (this._environmentService.isStandalone()) {
				console.warn('Elevation profile could not be fetched from backend. Returning a mocked elevation profile ...');
				return this._createMockElevationProfile(coordinates3857);
			}
			else {

				throw new Error('Could not load an elevation profile from provider: ' + e.message);
			}
		}
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
			attrs: []
		};
	}
}
