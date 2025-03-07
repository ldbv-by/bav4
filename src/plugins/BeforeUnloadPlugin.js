/**
 * @module plugins/BeforeUnloadPlugin
 */
import { BaPlugin } from './BaPlugin';
import { $injector } from '../injection';
import { observe } from '../utils/storeUtils';
import { Tools } from '../domain/tools';

/**
 * This plugin registers a "beforeunload" event listener when a tool is active and removes it when the no tool is currently active.
 *
 * @class
 * @author taulinger
 */
export class BeforeUnloadPlugin extends BaPlugin {
	/**
	 * @override
	 */
	async register(store) {
		const { EnvironmentService: environmentService, GeoResourceService: geoResourceService } = $injector.inject(
			'EnvironmentService',
			'GeoResourceService'
		);

		if (!environmentService.isEmbedded()) {
			const beforeunloadEventListener = (e) => {
				// see https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeunload_event#browser_compatibility
				e.returnValue = 'string';
				e.preventDefault();
			};

			const beforeunloadEventListenerForTools = (e) => beforeunloadEventListener(e);
			const onToolChanged = (toolId) => {
				if (this._getTools().includes(toolId)) {
					window.addEventListener('beforeunload', beforeunloadEventListenerForTools);
				} else {
					window.removeEventListener('beforeunload', beforeunloadEventListenerForTools);
				}
			};

			observe(store, (state) => state.tools.current, onToolChanged, false);

			const beforeUnloadEventListenerForLayers = (e) => {
				if (store.getState().tools.current !== Tools.EXPORT) {
					beforeunloadEventListener(e);
				}
			};
			const olLayersChanged = (active) => {
				if (
					active
						.map((l) => geoResourceService.resolve(geoResourceService.byId(l.geoResourceId)))
						.flat()
						.map((gr) => gr?.localData ?? false)
						.some((v) => v === true)
				) {
					window.addEventListener('beforeunload', beforeUnloadEventListenerForLayers);
				} else {
					window.removeEventListener('beforeunload', beforeUnloadEventListenerForLayers);
				}
			};

			observe(store, (state) => state.layers.active, olLayersChanged, false);
		}
	}

	_getTools() {
		return [Tools.DRAW, Tools.MEASURE, Tools.ROUTING];
	}
}
