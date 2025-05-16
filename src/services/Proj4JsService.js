/**
 * @module services/Proj4JsService
 */
import { loadBvvDefinitions } from './provider/proj4.provider';

/**
 * Service that registers and returns all available projections
 * @interface ProjectionService
 */

/**
 * Returns a array of all supported projections as SRID. Contains at least 4326 and 3857.
 * @function
 * @name ProjectionService#getProjections
 * @returns {Array<Number>} supported projections
 */
/**
 * @class
 * @author taulinger
 * @implements {module:services/Proj4JsService~ProjectionService}
 */
export class Proj4JsService {
	/**
	 *
	 * @param {proj4Provider} [proj4Provider=loadBvvDefinitions]
	 */
	constructor(proj4Provider = loadBvvDefinitions) {
		this._supportedSrids = [4326, 3857, ...proj4Provider()];
	}

	/**
	 * Returns a array of all supported projections as SRID. Contains at least 4326 and 3857.
	 * @returns {Array<Number>} supported projections
	 */
	getProjections() {
		return [...this._supportedSrids];
	}
}
