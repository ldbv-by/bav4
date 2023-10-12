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
		const { EnvironmentService: environmentService } = $injector.inject('EnvironmentService');

		if (!environmentService.isEmbedded()) {
			const beforeunloadEventListener = (e) => {
				// see https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeunload_event#browser_compatibility
				e.returnValue = 'string';
				e.preventDefault();
			};

			const onToolChanged = async (toolId) => {
				if (this._getTools().includes(toolId)) {
					window.addEventListener('beforeunload', beforeunloadEventListener);
				} else {
					window.removeEventListener('beforeunload', beforeunloadEventListener);
				}
			};

			observe(store, (state) => state.tools.current, onToolChanged, false);
		}
	}

	_getTools() {
		return [Tools.DRAW, Tools.MEASURE];
	}
}
