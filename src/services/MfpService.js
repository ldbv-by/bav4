import { sleep } from '../utils/sleep';
import { loadBvvMfpCapabilities } from './provider/mfp.provider';
/**
 *
 * @typedef {Object} MfpCapabilities
 * @property {string} id
 * @property {string} urlId
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

	constructor(mfpCapabilitiesProvider = loadBvvMfpCapabilities) {
		this._abortController = null;
		this._mfpCapabilities = null;
		this._mfpCapabilitiesProvider = mfpCapabilitiesProvider;
	}

	/**
	 * @returns {Array<MfpCapabilities>} all available capbilities
	 */
	async getCapabilities() {
		if (!this._mfpCapabilities) {
			this._mfpCapabilities = await this._mfpCapabilitiesProvider();
		}
		return this._mfpCapabilities;
	}

	/**
	* Returns the corresponding  {@link MfpCapabilities} for a specific id.
	* @param {string} id Id of the desired {@link MfpCapabilities}
	* @returns {MfpCapabilities|null}
	*/
	getCapabilitiesById(id) {
		return this._mfpCapabilities?.find(cp => cp.id === id) ?? null;
	}

	/**
	 * Creates a new MFP job and returns a URL pointing to the generated resource.
	 * @param {object} mfp spec
	 * @returns url as string
	 */
	// eslint-disable-next-line no-unused-vars
	async createJob(spec) {
		this._abortController = new AbortController();
		await sleep(2500); // let's fake latency
		this._abortController = null;
		return 'http://www.africau.edu/images/default/sample.pdf';
	}

	/**
	 * Cancels a running MFP job.
	 */
	cancelJob() {
		this._abortController?.abort();
	}
}
