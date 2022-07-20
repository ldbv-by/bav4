/**
 *
 * @typedef {Object} MfpCapabilities
 * @property {string} name
 * @property {Array<number>} scales
 * @property {Array<number>} dpis
 * @property {MfpMapSize} mapSize
 */

/**
 * @typedef {Object} MfpMapSize
 * @property {number} width
 * @property {number} height
 */


/**
 * @class
 * @author taulinger
 */
export class MfpService {

	_getMockCapabilities() {
		const scales = [2000000, 1000000, 500000, 200000, 100000, 50000, 25000, 10000, 5000, 2500, 1250, 1000, 500];
		const dpis = [125, 200];

		return [
			{ id: 'a4_portrait', scales: scales, dpis: dpis, mapSize: { width: 539, height: 722 } },
			{ id: 'a4_landscape', scales: scales, dpis: dpis, mapSize: { width: 785, height: 475 } },
			{ id: 'a3_portrait', scales: scales, dpis: dpis, mapSize: { width: 786, height: 1041 } },
			{ id: 'a3_landscape', scales: scales, dpis: dpis, mapSize: { width: 1132, height: 692 } }
		];
	}

	/**
	 * @returns {Array<MfpCapabilities>} available capbilities
	 */
	async getCapabilities() {
		return this._getMockCapabilities();
	}

	/**
	* Returns the corresponding  {@link MfpCapabilities} for an id.
	* @public
	* @param {string} id Id of the desired {@link MfpCapabilities}
	* @returns {MfpCapabilities | null}
	*/
	byId(id) {
		return this._getMockCapabilities().find(cp => cp.id === id) ?? null;
	}
}
