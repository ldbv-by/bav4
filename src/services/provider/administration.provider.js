/**
 * @module services/provider/administration_provider
 */
import { $injector } from '../../injection';

/**
 * BVV specific implementation of {@link module:services/AdministrationService~administrationProvider}
 * @function
 * @type {module:services/AdministrationService~administrationProvider}
 */
export const loadBvvAdministration = async (coordinate3857) => {
	const { HttpService: httpService, ConfigService: configService } = $injector.inject('HttpService', 'ConfigService');

	const url = configService.getValueAsPath('BACKEND_URL') + 'administration/info';

	const result = await httpService.get(`${url}/${coordinate3857[0]}/${coordinate3857[1]}`);

	switch (result.status) {
		case 200: {
			const { gemeinde: community, gemarkung: district } = await result.json();
			return {
				community,
				district
			};
		}
		case 404: {
			return null;
		}
		default:
			throw new Error(`Administration could not be retrieved: Http-Status ${result.status}`);
	}
};
