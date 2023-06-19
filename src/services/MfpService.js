/**
 * @module services/MfpService
 */
import { $injector } from '../injection';
import { sleep } from '../utils/timer';
import { getMfpCapabilities, postMfpSpec } from './provider/mfp.provider';

/**
 * @typedef {Object} MfpCapabilities
 * @property {Array<MfpLayout>} layouts available layouts
 * @property {Object} grSubstitutions map containing non-printable GeoResource ids that must be replaced
 * @property {number} srid SRID of the MFP service
 * @property {Extent} extent printable extent (in 3857)
 */

/**
 *
 * @typedef {Object} MfpLayout
 * @property {string} id
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
 * Service for creating a MapFishPrint report.
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
 * @name MfpService#getLayoutById
 * @param {string} id Id of the desired {@link MfpLayout}
 * @returns {MfpLayout|null}
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
 * @implements {module:services/MfpService~MfpService}
 */
export class BvvMfpService {
	constructor(mfpCapabilitiesProvider = getMfpCapabilities, createMfpSpecProvider = postMfpSpec) {
		const { EnvironmentService: environmentService } = $injector.inject('EnvironmentService');
		this._environmentService = environmentService;
		this._abortController = null;
		this._mfpCapabilities = null;
		this._mfpCapabilitiesProvider = mfpCapabilitiesProvider;
		this._createMfpSpecProvider = createMfpSpecProvider;
		this._urlId = '0';
	}

	/**
	 * Initializes this service, which means all MfpCapabilities are loaded and can be served in the future from the internal cache.
	 * If initialsation fails, a fallback is delivered.
	 * @public
	 * @async
	 * @returns {Promise<Array.<MfpCapabilities>>}
	 * @throws Error when capabilities could not be provided
	 */
	async init() {
		if (!this._mfpCapabilities) {
			try {
				const { urlId, layouts, grSubstitutions, srid, extent } = await this._mfpCapabilitiesProvider();
				this._mfpCapabilities = { layouts, grSubstitutions, srid, extent };
				this._urlId = urlId;
			} catch (e) {
				if (this._environmentService.isStandalone()) {
					this._mfpCapabilities = this._newFallbackCapabilities();
					console.warn('MfpCapabilities could not be fetched from backend. Using fallback capabilities ...');
				} else {
					throw e;
				}
			}
		}
		return this._mfpCapabilities;
	}

	/**
	 * @returns {MfpCapabilities|null} all available capbilities
	 */
	getCapabilities() {
		if (!this._mfpCapabilities) {
			return null;
		}
		return this._mfpCapabilities;
	}

	/**
	 * Returns the corresponding  {@link MfpLayout} for a specific id.
	 * @param {string} id Id of the desired {@link MfpLayout}
	 * @returns {MfpLayout|null}
	 */
	getLayoutById(id) {
		return this._mfpCapabilities?.layouts?.find((cp) => cp.id === id) ?? null;
	}

	/**
	 * Creates a new MFP3 job and returns a URL pointing to the generated resource.
	 * @param {object} spec MFP3 spec
	 * @returns download URL as string or `null`
	 * @throws Error when PDF generation was not successful
	 */
	async createJob(spec) {
		this._abortController = new AbortController();
		try {
			const result = await this._createMfpSpecProvider(spec, this._urlId, this._abortController);
			if (result) {
				const { downloadURL } = result;
				return downloadURL;
			}
			return null;
		} catch (e) {
			if (this._environmentService.isStandalone()) {
				console.warn('No backend available, simulating Pdf request...');
				await sleep(2500); // let's fake latency
				return 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
			} else {
				throw new Error(`Pdf request was not successful`, { cause: e });
			}
		} finally {
			this._abortController = null;
		}
	}

	/**
	 * Cancels a running MFP job.
	 */
	cancelJob() {
		this._abortController?.abort();
	}

	_newFallbackCapabilities() {
		return {
			srid: 3857,
			extent: [667916.9447596414, 4865942.279503176, 1558472.8711058302, 7558415.656081782],
			grSubstitutions: {},
			layouts: [
				{
					id: 'a4_landscape',
					urlId: 0,
					mapSize: { width: 785, height: 475 },
					dpis: [72, 120, 200],
					scales: [2000000, 1000000, 500000, 200000, 100000, 50000, 25000, 10000, 5000, 2500, 1250, 1000, 500]
				},
				{
					id: 'a4_portrait',
					urlId: 0,
					mapSize: { width: 539, height: 722 },
					dpis: [72, 120, 200],
					scales: [2000000, 1000000, 500000, 200000, 100000, 50000, 25000, 10000, 5000, 2500, 1250, 1000, 500]
				}
			]
		};
	}
}
