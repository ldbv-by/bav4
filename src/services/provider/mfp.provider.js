import { $injector } from '../../injection';
import { HttpService, MediaType } from '../HttpService';

/**
 * @typedef {Object} BvvMfpCapabilities
 * @property {string} urlId
 * @property {Array<MfpCapabilities>} layouts
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
			return (await result.json());
		default:
			throw new Error(`MfpCapabilties could not be loaded: Http-Status ${result.status}`);
	}
};

/**
 * Uses the BVV backend to create a job request.
 * @function
 * @returns {String} download URL
 */
export const postMpfSpec = async (spec, urlId, abortController) => {
	const { HttpService: httpService, ConfigService: configService } = $injector.inject('HttpService', 'ConfigService');
	const url = `${configService.getValueAsPath('BACKEND_URL')}print/create/${urlId}`;
	const result = await httpService.fetch(url, {
		method: 'POST',
		mode: HttpService.DEFAULT_REQUEST_MODE,
		body: JSON.stringify(spec),
		headers: {
			'Content-Type': MediaType.JSON
		},
		timeout: 20000
	}, abortController);

	switch (result.status) {
		case 200: {
			return (await result.json()).downloadURL;
		}
		default:
			throw new Error(`Mfp spec could not be posted: Http-Status ${result.status}`);
	}
};

/**
 * Uses the BVV backend to cancel a job request.
 * @function
 */
export const deleteMfpJob = async (id, urlId) => {
	const { HttpService: httpService, ConfigService: configService } = $injector.inject('HttpService', 'ConfigService');
	const url = `${configService.getValueAsPath('BACKEND_URL')}print/cancel/${id}/${urlId}`;
	await httpService.delete(url); // no response status code evaluation needed
};
