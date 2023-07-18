/**
 * @module services/provider/mfp_provider
 */
import { $injector } from '../../injection';
import { HttpService } from '../HttpService';
import { MediaType } from '../../domain/mediaTypes';

/**
 * @typedef {Object} BvvMfpCapabilities
 * @property {string} urlId
 * @property {Array<MfpCapabilities>} layouts
 */

/**
 * @typedef {Object} BvvMfpJob
 * @property {string} downloadUrl
 * @property {string} id jobId
 */

/**
 * Uses the BVV backend to load an array of BvvMfpCapabilities.
 * @function
 * @returns {Array<BvvMfpCapabilities>}
 */
export const getMfpCapabilities = async () => {
	const { HttpService: httpService, ConfigService: configService } = $injector.inject('HttpService', 'ConfigService');
	const url = configService.getValueAsPath('BACKEND_URL') + 'print/info';
	const result = await httpService.get(url);

	switch (result.status) {
		case 200:
			return await result.json();
		default:
			throw new Error(`MfpCapabilties could not be loaded: Http-Status ${result.status}`);
	}
};

/**
 * Uses the BVV backend to create a job request.
 * @function
 * @returns {BvvMfpJob|null} job
 */
export const postMfpSpec = async (spec, urlId, abortController) => {
	const { HttpService: httpService, ConfigService: configService } = $injector.inject('HttpService', 'ConfigService');
	const url = `${configService.getValueAsPath('BACKEND_URL')}print/create/${urlId}`;

	try {
		const result = await httpService.fetch(
			url,
			{
				method: 'POST',
				mode: HttpService.DEFAULT_REQUEST_MODE,
				body: JSON.stringify(spec),
				headers: {
					'Content-Type': MediaType.JSON
				},
				timeout: 40000
			},
			abortController
		);

		switch (result.status) {
			case 200: {
				return await result.json();
			}
			default:
				throw new Error(`Mfp spec could not be posted: Http-Status ${result.status}`);
		}
	} catch (ex) {
		// handle abort exception https://developer.mozilla.org/en-US/docs/Web/API/AbortController
		if (ex instanceof DOMException) {
			return null;
		}
		throw ex;
	}
};
