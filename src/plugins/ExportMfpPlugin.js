import { observe } from '../utils/storeUtils';
import { BaPlugin } from './BaPlugin';
import { ToolId } from '../store/tools/tools.action';
import { activate, deactivate, setCurrent } from '../store/mfp/mfp.action';
import { $injector } from '../injection';

/**
 * This plugin observes the tool slice-of-state and sets the initial mfp slice-of-state.
 *
 * @class
 * @author taulinger
 */
export class ExportMfpPlugin extends BaPlugin {

	constructor() {
		super();
		this._initialized = false;
	}

	/**
	 * @override
	 * @param {Store} store
	 */
	async register(store) {

		const initialize = async () => {

			if (!this._initialized) {
				const { MfpService: mfpService } = $injector.inject('MfpService');
				const capabilities = await mfpService.getCapabilities();
				const { id, scales, dpis } = capabilities[0];
				setCurrent({ id: id, dpi: dpis[0], scale: scales[0] });
				this._initialized = true;
			}
		};

		const onToolChanged = async toolId => {

			if (toolId !== ToolId.EXPORT) {
				deactivate();
			}
			else {
				await initialize();
				// we activate the tool after another possible active tool was deactivated
				setTimeout(() => activate());
			}
		};
		observe(store, state => state.tools.current, onToolChanged);
	}
}
