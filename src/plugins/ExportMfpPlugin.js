import { observe } from '../utils/storeUtils';
import { BaPlugin } from './BaPlugin';
import { ToolId } from '../store/tools/tools.action';
import { activate, deactivate, setCurrent } from '../store/mfp/mfp.action';
import { $injector } from '../injection';
import { addLayer, removeLayer } from '../store/layers/layers.action';

/**
 * Id of the layer used for mfp export visualization.
 * LayerHandler of a map implementation will also use this id as their key.
 */
export const MFP_LAYER_ID = 'mfp_layer';


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

		const lazyInitialize = async () => {

			if (!this._initialized) {
				// let's set the initial mfp properties
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
				await lazyInitialize();
				// we activate the tool after another possible active tool was deactivated
				setTimeout(() => activate());
			}
		};

		const onChange = (changedState) => {
			if (changedState) {
				addLayer(MFP_LAYER_ID, { constraints: { hidden: true, alwaysTop: true } });
			}
			else {
				removeLayer(MFP_LAYER_ID);
			}
		};

		observe(store, state => state.tools.current, onToolChanged);
		observe(store, state => state.mfp.active, onChange);
	}
}
