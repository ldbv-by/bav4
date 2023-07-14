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

	const url = `${configService.getValueAsPath('BACKEND_URL')}catalog/${topicId}`;

	const result = await httpService.get(url);

	if (result.ok) {
		return await result.json();
	}
	throw new Error(`Catalog for '${topicId}' could not be loaded`);
};
