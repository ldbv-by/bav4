import { $injector } from '../../../../injection';


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

	return fallbackCatalogFor(topicId);
};

export const fallbackCatalogFor = (topicId) => {
	//for geoResouceIds: see fallback GeoResources in GeoResourceService
	return [
		{
			label: `Suptopic1 ${topicId}`,
			open: true,
			children: [
				{
					geoResourceId: 'atkis'
				},
				{
					geoResourceId: 'atkis_sw'
				},
				{
					label: `Suptopic2 ${topicId}`,
					children: [{
						geoResourceId: 'atkis_sw'
					}]
				}
			]
		}, {
			geoResourceId: 'atkis_sw'
		}
	];
};
