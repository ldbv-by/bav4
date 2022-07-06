import { $injector } from '../injection';
import { QueryParameters } from '../services/domain/queryParameters';
import { setQuery } from '../store/search/search.action';
import { BaPlugin } from './BaPlugin';


/**
 * @class
 * @author taulinger
 */
export class QueryPlugin extends BaPlugin {

	/**
	 * @override
	 */
	async register() {
		const { EnvironmentService: environmentService, SecurityService: securityService } = $injector.inject('EnvironmentService', 'SecurityService');
		const queryParams = new URLSearchParams(environmentService.getWindow().location.search);

		const query = queryParams.get(QueryParameters.QUERY);
		if (query) {
			setQuery(securityService.sanitizeHtml(query));
		}
	}
}
