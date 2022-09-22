import { $injector } from '../injection';
import { sleep } from '../utils/sleep';
import { deleteMfpJob, getMfpCapabilities, postMpfSpec } from './provider/mfp.provider';
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
 * Service for persisting and loading ASCII based geodata.
 * @author taulinger
 * @interface MfpService
 */

/**
 * Initializes this service, which means all MfpCapabilities are loaded and can be served in the future from an internal cache.
 * @function
 * @async
 * @name MfpService#init
 * @returns {Promise<Array.<MfpCapabilities>>}
 */

/**
 * @function
 * @name MfpService#getCapabilities
 * @returns {Array<MfpCapabilities>} available MfpCapabilities
 */

/**
 * @function
 * @name MfpService#getCapabilitiesById
 * @param {string} id Id of the desired {@link MfpCapabilities}
 * @returns {MfpCapabilities|null}
 */

/**
 * Creates a new MFP job and returns a URL pointing to the generated resource.
 * @function
 * @async
 * @name MfpService#createJob
 * @param {object} spec MFP3 spec
 * @returns {String} downloadURL
 */

/**
 * Cancels a running MFP job.
 * @function
 * @name MfpService#cancelJob
 */

/**
 * BVV specific service that communicates with the BVV backend to create a Mapfish Print report.
 * @class
 * @author taulinger
 * @implements {MfpService}
 */
export class BvvMfpService {

	constructor(mfpCapabilitiesProvider = getMfpCapabilities, createMpfSpecProvider = postMpfSpec, cancelJobProvider = deleteMfpJob) {
		const { EnvironmentService: environmentService } = $injector.inject('EnvironmentService');
		this._environmentService = environmentService;
		this._abortController = null;
		this._mfpCapabilities = null;
		this._mfpCapabilitiesProvider = mfpCapabilitiesProvider;
		this._createMpfSpecProvider = createMpfSpecProvider;
		this._cancelJobProvider = cancelJobProvider;
		this._urlId = '0';
		this._jobId = null;
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
				const { urlId, layouts } = await this._mfpCapabilitiesProvider();
				this._mfpCapabilities = layouts;
				this._urlId = urlId;
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
	 * Creates a new MFP3 job and returns a URL pointing to the generated resource.
	 * @param {object} spec MFP3 spec
	 * @returns download URL as string
	 */
	async createJob(spec) {
		this._abortController = new AbortController();
		try {
			const { id, downloadURL } = await this._createMpfSpecProvider(spec, this._urlId, this._abortController);
			this._jobId = id;
			return downloadURL;
		}
		catch (e) {
			if (this._environmentService.isStandalone()) {
				console.warn('No backend available, simulating Pdf request...');
				await sleep(2500); // let's fake latency
				return 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
			}
			else {
				throw new Error(`Pdf request was not successful: ${e}`);
			}
		}
		finally {
			this._abortController = null;
		}
	}

	/**
	 * Cancels a running MFP job.
	 */
	cancelJob() {
		if (this._jobId) {
			this._abortController?.abort();
			this._cancelJobProvider(this._jobId, this._urlId);
		}
		this._jobId = null;
	}

	_newFallbackCapabilities() {
		return [
			{ id: 'a4_landscape', urlId: 0, mapSize: { width: 785, height: 475 }, dpis: [72, 120, 200], scales: [2000000, 1000000, 500000, 200000, 100000, 50000, 25000, 10000, 5000, 2500, 1250, 1000, 500] },
			{ id: 'a4_portrait', urlId: 0, mapSize: { width: 539, height: 722 }, dpis: [72, 120, 200], scales: [2000000, 1000000, 500000, 200000, 100000, 50000, 25000, 10000, 5000, 2500, 1250, 1000, 500] }
		];
	}
}
