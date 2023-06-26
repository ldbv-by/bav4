/**
 * @module plugins/ToolsPlugin
 */
import { BaPlugin } from './BaPlugin';
import { setCurrentTool } from '../store/tools/tools.action';
import { QueryParameters } from '../domain/queryParameters';
import { $injector } from '../injection';
import { Tools } from '../domain/tools';

/**
 * This plugin checks for the presence of the query parameter `TOOL_ID` (see {@link QueryParameters})
 * and activates the corresponding tool.
 *
 * @class
 * @author taulinger
 */
export class ToolsPlugin extends BaPlugin {
	/**
	 * @override
	 */
	async register() {
		const { EnvironmentService: environmentService } = $injector.inject('EnvironmentService');

		// check if we have a query parameter defining the tab id
		const toolId = environmentService.getQueryParams().get(QueryParameters.TOOL_ID);
		if (Object.values(Tools).includes(toolId)) {
			setCurrentTool(toolId);
		}
	}
}
