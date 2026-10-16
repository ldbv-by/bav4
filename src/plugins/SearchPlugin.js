/**
 * @module plugins/SearchPlugin
 */

import { QueryParameters } from '../domain/queryParameters';
import { $injector } from '../injection';
import { setQuery } from '../store/search/search.action';
import { BaPlugin } from './BaPlugin';

/**
 * @class
 * @author taulinger
 */
export class SearchPlugin extends BaPlugin {
	/**
	 * @override
	 */
	async register() {
		const { EnvironmentService: environmentService, SecurityService: securityService } = $injector.inject('EnvironmentService', 'SecurityService');

		const query = environmentService.getQueryParams().get(QueryParameters.QUERY);
		if (query) {
			setQuery(securityService.sanitizeHtml(query));
		}
	}
}
