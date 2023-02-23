import { $injector } from '../../../../injection';
import {
	FALLBACK_GEORESOURCE_ID_0,
	FALLBACK_GEORESOURCE_ID_1,
	FALLBACK_GEORESOURCE_ID_2,
	FALLBACK_GEORESOURCE_ID_3
} from '../../../../services/GeoResourceService';

/**
 * Uses the BVV endpoint to load catalog definitions.
 * @function
 * @returns {Promise<Array<Object>>}
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

/**
 * Loads an example catalog without a backend.
 * @function
 * @returns {Promise<Array<Object>>}
 */
export const loadExampleCatalog = async (topicId) => {
	return loadFallbackCatalog(topicId);
};

export const loadFallbackCatalog = () => {
	//for geoResourceIds: see fallback GeoResources in GeoResourceService
	return [
		{
			label: 'Subtopic 1',
			open: true,
			children: [
				{
					geoResourceId: FALLBACK_GEORESOURCE_ID_0
				},
				{
					geoResourceId: FALLBACK_GEORESOURCE_ID_1
				},
				{
					label: 'Suptopic 2',
					children: [
						{
							geoResourceId: FALLBACK_GEORESOURCE_ID_2
						}
					]
				}
			]
		},
		{
			geoResourceId: FALLBACK_GEORESOURCE_ID_3
		}
	];
};
