import { observe } from '../utils/storeUtils';
import { BaPlugin } from './BaPlugin';
import { ToolId } from '../store/tools/tools.action';
import { activate, cancelJob, deactivate, setCurrent } from '../store/mfp/mfp.action';
import { $injector } from '../injection';
import { addLayer, removeLayer } from '../store/layers/layers.action';
import { emitNotification, LevelTypes } from '../store/notifications/notifications.action';

/**
 * Id of the layer used for mfp export visualization.
 * LayerHandler of a map implementation will also use this id as their key.
 */
export const MFP_LAYER_ID = 'mfp_layer';


/**
 * This plugin observes the "tool" slice-of-state and sets the initial mfp slice-of-state.
 *
 * @class
 * @author taulinger
 */
export class ExportMfpPlugin extends BaPlugin {

	constructor() {
		super();
		this._initialized = false;
		const { TranslationService: translationService } = $injector.inject('TranslationService');
		this._translationService = translationService;
	}

	/**
	 * @override
	 * @param {Store} store
	 */
	async register(store) {
		const { MfpService: mfpService, EnvironmentService: environmentService } = $injector.inject('MfpService', 'EnvironmentService');

		const lazyInitialize = async () => {

			if (!this._initialized) {
				// let's set the initial mfp properties
				try {
					const { layouts } = await mfpService.init();
					const { id, scales, dpis } = layouts[0];
					setCurrent({ id: id, dpi: dpis[0], scale: scales[0] });
					return this._initialized = true;
				}
				catch (ex) {
					console.error('MfpCapabilities could not be fetched from backend', ex);
					emitNotification(`${this._translationService.translate('global_mfpService_init_exception')}`, LevelTypes.ERROR);
				}
				return false;
			}
			return true;
		};

		const onToolChanged = async (toolId) => {

			if (toolId !== ToolId.EXPORT) {
				deactivate();
			}
			else {
				if (await lazyInitialize()) {
					// we activate the tool after another possible active tool was deactivated
					setTimeout(() => {
						activate();
					});
				}
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

		const onJobSpecChanged = async ({ payload: spec }) => {
			if (spec) {
				try {
					const url = await mfpService.createJob(spec);
					if (url) {
						environmentService.getWindow().open(url, '_blank').focus();
					}
				}
				catch (ex) {
					console.error('PDF generation was not successful.', ex);
					emitNotification(`${this._translationService.translate('global_mfpService_createJob_exception')}`, LevelTypes.ERROR);
				}
				finally {
					cancelJob();
				}

			}
			else {
				mfpService.cancelJob();
			}
		};

		observe(store, state => state.tools.current, onToolChanged);
		observe(store, state => state.mfp.active, onChange);
		observe(store, state => state.mfp.jobSpec, onJobSpecChanged);
	}
}
