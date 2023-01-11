import { loadBvvElevation } from './provider/elevation.provider';
import { isCoordinate } from '../utils/checks';
import { getBvvProfile } from './provider/profile.provider';


/**
 * @typedef {Object} Profile
 * @property {Array<Altitude>} alts altitude objects of this profile
 * @property {ProfileStats} stats  stats objects of this profile
 * @property {Array<ProfileAttribute>} attrs available attributes of this profile
 */

/**
 * @typedef {Object} Altitude
 * @property {number} dist distance from the previous altitude
 * @property {number} alt the altitude (in meter)
 * @property {number} e easting
 * @property {number} n northing
 */

/**
 * @typedef {Object} ProfileStats
 * @property {number} sumUp cumulated positive altitude difference (in meter)
 * @property {number} sumDown cumulated negative altitude difference (in meter)
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
	}

	/**
	 * Returns an altitude for a coordinate.
	 * @param {Coordinate} coordinate3857
	 * @returns {Number} altitude
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
	 * Returns a profile for an array of two more coordinates
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
			throw new Error('Could not load altitude from provider: ' + e.message);
		}
	}
}
