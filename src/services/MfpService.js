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

	/**
	 * @returns {Array<MfpCapabilities>} available capbilities
     */
	async getCapabilities() {

		const scales = [2000000, 1000000, 500000, 200000, 100000, 50000, 25000, 10000, 5000, 2500, 1250, 1000, 500];
		const dpis = [125, 200];

		return [
			{ name: 'A4 landscape', scales: scales, dpis: dpis, mapSize: { width: 785, height: 475 } },
			{ name: 'A4 portrait', scales: scales, dpis: dpis, mapSize: { width: 539, height: 722 } },
			{ name: 'A3 portrait', scales: scales, dpis: dpis, mapSize: { width: 786, height: 1041 } },
			{ name: 'A3 landscape', scales: scales, dpis: dpis, mapSize: { width: 1132, height: 692 } }
		];
	}
}
