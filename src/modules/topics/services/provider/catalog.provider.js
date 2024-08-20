/**
 * @module modules/topics/services/provider/catalog_provider
 */
import { $injector } from '../../../../injection';

/**
 * Uses the BVV endpoint to load the catalog definition for a topic
 * @function
 * @param {string} topicId Id of the Topic
 * @type {module:modules/topics/services/CatalogService~catalogProvider}
 */
export const loadBvvCatalog = async (topicId) => {
	const { HttpService: httpService, ConfigService: configService } = $injector.inject('HttpService', 'ConfigService');

	const url = `${configService.getValueAsPath('BACKEND_URL')}adminui/catalog/${topicId}`;

	const adminToken = configService.getValue('ADMIN_TOKEN_KEY');
	const result = await httpService.get(url, {
		headers: {
			'X-AUTH-ADMIN-TOKEN': adminToken
		}
	});

	if (result.ok) {
		return await result.json();
	}
	throw new Error(`Catalog for '${topicId}' could not be loaded`);
};

export const copyCatalogToProd = async (topicId) => {
	const { HttpService: httpService, ConfigService: configService } = $injector.inject('HttpService', 'ConfigService');

	const baseURL = configService.getValueAsPath('BACKEND_URL');

	const url = `${baseURL}adminui/copy2prod/catalog/${topicId}`;
	const adminToken = configService.getValue('ADMIN_TOKEN_KEY');

	const result = await httpService.post(`${url}`, {
		headers: {
			'X-AUTH-ADMIN-TOKEN': adminToken
		}
	});

	return result;
};

export const copyCatalogToTest = async (topicId) => {
	console.log('🚀 ~ copyCatalogToTest ~ topicId:', topicId);
	const { HttpService: httpService, ConfigService: configService } = $injector.inject('HttpService', 'ConfigService');

	const baseURL = configService.getValueAsPath('BACKEND_URL');

	const url = `${baseURL}adminui/copy2test/catalog/${topicId}`;
	const adminToken = configService.getValue('ADMIN_TOKEN_KEY');
	console.log('🚀 ~ copyCatalogToTest ~ url:', url);

	const result = await httpService.post(`${url}`, {
		headers: {
			'X-AUTH-ADMIN-TOKEN': adminToken
		}
	});

	return result;
};
