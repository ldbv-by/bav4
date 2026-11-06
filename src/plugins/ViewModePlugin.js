/**
 * @module plugins/ViewModePlugin
 */
import { QueryParameters } from '@src/domain/queryParameters';
import { ViewMode } from '@src/domain/view';
import { setViewMode } from '@src/store/view/view.action';
import { $injector } from '../injection';
import { BaPlugin } from './BaPlugin';

/**
 */
export class ViewModePlugin extends BaPlugin {
	/**
	 * @override
	 * @param {Store} store
	 */
	async register(store) {
		const { EnvironmentService: environmentService } = $injector.inject('EnvironmentService');

		const viewMode = environmentService.getQueryParams().get(QueryParameters.VIEW_MODE);
		if (Object.values(ViewMode).includes(viewMode)) {
			setViewMode(viewMode);
		} else {
			setViewMode(ViewMode.D2);
		}
	}
}
