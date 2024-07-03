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

		const toolId = environmentService.getQueryParams().get(QueryParameters.TOOL_ID);
		/**
		 *  Default mode:
		 *  - check if we have a valid query parameter defining the tool id, if so we activate
		 *  - when we have route waypoints we do nothing, all further processing is done by the RoutingPlugin
		 *  Embed mode
		 *  - we check the list of allowed tools
		 */
		if (
			(!environmentService.isEmbedded() &&
				Object.values(Tools).includes(toolId) &&
				!environmentService.getQueryParams().has(QueryParameters.ROUTE_WAYPOINTS)) ||
			(environmentService.isEmbedded() && WcTools.includes(toolId))
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
