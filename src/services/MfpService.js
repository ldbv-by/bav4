import { $injector } from '../injection';
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
		const { EnvironmentService: environmentService } = $injector.inject('EnvironmentService');
		this._environmentService = environmentService;
		this._abortController = null;
		this._mfpCapabilities = null;
		this._mfpCapabilitiesProvider = mfpCapabilitiesProvider;
	}

	/**
	 * Initializes this service, which means all MfpCapabilities are loaded and can be served in the future from the internal cache.
	 * If initialsation fails, a fallback is delivered.
	 * @public
	 * @async
	 * @returns {Promise<Array.<MfpCapabilities>>}
	 */
	async init() {
		if (!this._mfpCapabilities) {
			try {
				this._mfpCapabilities = await this._mfpCapabilitiesProvider();
			}
			catch (e) {
				this._mfpCapabilities = [];
				if (this._environmentService.isStandalone()) {
					this._mfpCapabilities.push(...this._newFallbackCapabilities());
					console.warn('MfpCapabilities could not be fetched from backend. Using fallback capabilities ...');
				}
				else {
					console.error('MfpCapabilities could not be fetched from backend.', e);
				}
			}
		}
		return this._mfpCapabilities;
	}

	/**
	 * @returns {Array<MfpCapabilities>} all available capbilities
	 */
	getCapabilities() {
		if (!this._mfpCapabilities) {
			return [];
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

	_newFallbackCapabilities() {
		return [
			{ id: 'a4_landscape', urlId: 0, mapSize: { width: 785, height: 475 }, dpis: [72, 120, 200], scales: [2000000, 1000000, 500000, 200000, 100000, 50000, 25000, 10000, 5000, 2500, 1250, 1000, 500] },
			{ id: 'a4_portrait', urlId: 0, mapSize: { width: 539, height: 722 }, dpis: [72, 120, 200], scales: [2000000, 1000000, 500000, 200000, 100000, 50000, 25000, 10000, 5000, 2500, 1250, 1000, 500] }
		];
	}
}
