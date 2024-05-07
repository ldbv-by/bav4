/**
 * @module plugins/ToolsPlugin
 */
import { BaPlugin } from './BaPlugin';
import { setCurrentTool } from '../store/tools/tools.action';
import { QueryParameters } from '../domain/queryParameters';
import { $injector } from '../injection';
import { WcTools, Tools } from '../domain/tools';
import { observe } from '../utils/storeUtils';

/**
 * This plugin checks for the presence of the query parameter `TOOL_ID` (see {@link QueryParameters})
 * and activates the corresponding tool.
 *
 * If the app is embedded a a web component, it observes the `TOOL_ID` attribute.
 *
 * @class
 * @author taulinger
 */
export class ToolsPlugin extends BaPlugin {
	/**
	 * @override
	 */
	async register(store) {
		const { EnvironmentService: environmentService } = $injector.inject('EnvironmentService');

		// check if we have a query parameter defining the tab id
		const toolId = environmentService.getQueryParams().get(QueryParameters.TOOL_ID);
		if (
			Object.values(Tools).includes(toolId) &&
			/**in embed mode we check the list of allowed tools*/ (!environmentService.isEmbedded() || WcTools.includes(toolId))
		) {
			setCurrentTool(toolId);
		}

		if (environmentService.isEmbeddedAsWC()) {
			// handle WC attribute changes
			observe(
				store,
				(state) => state.wcAttribute.changed,
				() => {
					const toolId = environmentService.getQueryParams().get(QueryParameters.TOOL_ID) ?? null;
					if (!toolId) {
						setCurrentTool(null);
					} else if (WcTools.includes(toolId)) {
						setCurrentTool(toolId);
					}
				}
			);
		}
	}
}
