import { loadBvvDefinitions } from './provider/proj4.provider';

/**
 * Registers all additional projections.
 * @class
 * @author taulinger
 */
export class Proj4JsService {

	/**
     *
     * @param {proj4Provider} [proj4Provider=loadBvvDefinitions]
     */
	constructor(proj4Provider = loadBvvDefinitions) {
		this._supportedSrids = [4326, 3857, ...(proj4Provider())];
	}

	/**
     * Returns a array of all supported projections as SRID. Contains at least 4326 and 3857.
     * @returns supported projections
     */
	getProjections() {
		return this._supportedSrids;
	}
}
