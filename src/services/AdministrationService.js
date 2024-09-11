/**
 * @module services/AdministrationService
 */
import { loadBvvAdministration } from './provider/administration.provider';
import { isCoordinate } from '../utils/checks';

/**
 * A function that takes a coordinate and returns a promise with an administration object.
 * @async
 * @param {module:domain/coordinateTypeDef~Coordinate}  coordinate
 * @typedef {Function} administrationProvider
 * @throws `Error`
 * @returns {module:services/AdministrationService~Administration|null} the result or `null` if no administration info is available for that coordinate
 */

/**
 *
 * @typedef {Object} Administration
 * @property {string} community The community at the delivered coordinate.
 * @property {string} district The district at the delivered coordinate.
 * @property {string|null} parcel The parcel number at the delivered coordinate.
 */

/**
 * @class
 */
export class AdministrationService {
	/**
	 *
	 * @param {module:services/AdministrationService~administrationProvider} [administrationProvider=loadBvvAdministration]
	 */
	constructor(administrationProvider = loadBvvAdministration) {
		this._administrationProvider = administrationProvider;
	}

	/**
	 *
	 * Provides an administration object for a coordinate.
	 * @param {module:domain/coordinateTypeDef~Coordinate} coordinate3857
	 * @returns {module:services/AdministrationService~Administration|null} administration
	 * @throws error of the underlying provider
	 */
	async getAdministration(coordinate3857) {
		if (!isCoordinate(coordinate3857)) {
			throw new TypeError("Parameter 'coordinate3857' must be a coordinate");
		}
		try {
			return await this._administrationProvider(coordinate3857);
		} catch (e) {
			throw new Error('Could not load administration from provider', { cause: e });
		}
	}
}
