/**
 *
 * @typedef {Object} MfpCapabilities
 * @property {string} name
 * @property {Array<number>} scales
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

	/**
	 * @returns {Array<MfpCapabilities>} available capbilities
     */
	async getCapabilities() {

		return [
			{ name: 'A4 landscape', scales: [2000000, 1000000, 500000, 200000, 100000, 50000, 25000, 10000, 5000, 2500, 1250, 1000, 500], mapSize: { width: 785, height: 475 } },
			{ name: 'A4 portrait', scales: [2000000, 1000000, 500000, 200000, 100000, 50000, 25000, 10000, 5000, 2500, 1250, 1000, 500], mapSize: { width: 539, height: 722 } },
			{ name: 'A3 portrait', scales: [2000000, 1000000, 500000, 200000, 100000, 50000, 25000, 10000, 5000, 2500, 1250, 1000, 500], mapSize: { width: 786, height: 1041 } },
			{ name: 'A3 landscape', scales: [2000000, 1000000, 500000, 200000, 100000, 50000, 25000, 10000, 5000, 2500, 1250, 1000, 500], mapSize: { width: 1132, height: 692 } }
		];
	}
}
