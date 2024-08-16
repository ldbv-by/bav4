/**
 * @module plugins/ToolsPlugin
 */
import { BaPlugin } from './BaPlugin';
import { setCurrentTool } from '../store/tools/tools.action';
import { QueryParameters } from '../domain/queryParameters';
import { $injector } from '../injection';
import { WcTools, Tools } from '../domain/tools';
import { observe, observeOnce } from '../utils/storeUtils';
import { GeoResourceFuture } from '../domain/geoResources';

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
		const queryParams = environmentService.getQueryParams();
		const toolId = queryParams.get(QueryParameters.TOOL_ID);

		const handlers = [this._fileStorageHandler, this._routingHandler, this._defaultHandler];

		if (toolId) {
			/**
			 * Iterate over different handler until one does the job
			 */
			for (const handler of handlers) {
				if (handler.apply(this, [toolId, queryParams, store])) {
					break;
				}
			}
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

	_fileStorageHandler(toolId, queryParams) {
		const { FileStorageService: fileStorageService } = $injector.inject('FileStorageService');
		if (queryParams.has(QueryParameters.LAYER)) {
			const geoResourceIds = queryParams.get(QueryParameters.LAYER).split(',');

			const adminId = geoResourceIds.find((grId) => fileStorageService.isAdminId(grId));
			const fileId = geoResourceIds.find((grId) => fileStorageService.isFileId(grId));
			if (adminId) {
				this._setToolActiveAfterGeoResourceIsLoaded(adminId, toolId);
				return true;
			} else if (fileId && [Tools.DRAW, Tools.MEASURE].includes(toolId)) {
				this._setToolActiveAfterGeoResourceIsLoaded(fileId, toolId);
				return true;
			}
		}
		return false;
	}

	_routingHandler(toolId, queryParams, store) {
		/**
		 * 	When we have route waypoints we wait until the route was loaded before setting the current tool
		 */
		if (queryParams.has(QueryParameters.ROUTE_WAYPOINTS)) {
			observeOnce(
				store,
				(state) => state.routing.route,
				() => {
					setCurrentTool(toolId);
				}
			);
			return true;
		}
		return false;
	}

	_defaultHandler(toolId) {
		const { EnvironmentService: environmentService } = $injector.inject('EnvironmentService');
		if (
			(!environmentService.isEmbedded() && Object.values(Tools).includes(toolId)) ||
			(environmentService.isEmbedded() && WcTools.includes(toolId))
		) {
			setCurrentTool(toolId);
		}
		return true;
	}

	_setToolActiveAfterGeoResourceIsLoaded(geoResourceId, toolId) {
		const { GeoResourceService: geoResourceService } = $injector.inject('GeoResourceService');

		const gr = geoResourceService.byId(geoResourceId);
		if (gr) {
			if (gr instanceof GeoResourceFuture) {
				gr.onResolve(() => {
					setCurrentTool(toolId);
				});
			} else {
				setCurrentTool(toolId);
			}
		}
	}
}
