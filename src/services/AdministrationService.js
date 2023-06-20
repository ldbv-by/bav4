/**
 * @module services/AdministrationService
 */
import { loadBvvAdministration } from './provider/administration.provider';
import { isCoordinate } from '../utils/checks';

/**
 *
 * @typedef {Object} Administration
 * @property {string} community The community at the delivered coordinate.
 * @property {string} district The district at the delivered coordinate.
 */

/**
 * @class
 */
export class AdministrationService {
	/**
	 *
	 * @param {administrationProvider} [administrationProvider=loadBvvAdministration]
	 */
	constructor(administrationProvider = loadBvvAdministration) {
		this._administrationProvider = administrationProvider;
	}

	/**
	 *
	 * An async function that provides an object
	 * with community and district as string properties.
	 * @param {Coordinate} coordinate3857
	 * @returns {Administration} administration
	 */
	async getAdministration(coordinate3857) {
		if (!isCoordinate(coordinate3857)) {
			throw new TypeError("Parameter 'coordinate3857' must be a coordinate");
		}
		try {
			const administration = await this._administrationProvider(coordinate3857);
			return administration;
		} catch (e) {
			throw new Error('Could not load administration from provider', { cause: e });
		}
	}
}
