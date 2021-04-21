import { observe } from '../../../utils/storeUtils';
import { addLayer, removeLayer } from './layers.action';
import { BaPlugin } from '../../../store/BaPlugin';

/**
 * Id of the layer used for measurement interaction
 */
export const MEASUREMENT_LAYER_ID = 'measurement_layer';

/**
 * @class
 * @author taulinger
 */
export class MeasurementPlugin extends BaPlugin {


	/**
	 * @override
	 * @param {Store} store 
	 */
	async register(store) {

		const extract = (state) => {
			return state.measurement.active;

		};
		const onChange = (changedState) => {
			if (changedState) {
				addLayer(MEASUREMENT_LAYER_ID, { constraints: { hidden: true, alwaysTop: true } });
			}
			else {
				removeLayer(MEASUREMENT_LAYER_ID);
			}
		};

		observe(store, extract, onChange);
	}
}