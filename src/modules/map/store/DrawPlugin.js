import { observe } from '../../../utils/storeUtils';
import { addLayer, removeLayer } from '../../../store/layers/layers.action';
import { BaPlugin } from '../../../store/BaPlugin';

/**
 * Id of the layer used for draw interaction.  
 * LayerHandler of a map implementation will also use this id as their key.
 */
export const DRAW_LAYER_ID = 'draw_layer';


/**
 * Id of the tool used for drawing interaction.  
 * Feature of a layer will also use this id as part their id.
 */
export const DRAW_TOOL_ID = 'draw';

/**
 * This plugin observes the 'active' property of the drawing store.
 * On changes, it adds a layer with a specific and constant id 
 * to the layers store or removes this layer from the store (see: {@link DRAW_LAYER_ID}).   
 * 
 * As a result of the change of the layers store, a map implementation will search for a handler registered for that id,
 * and, if found, will activate or deactivate this handler.
 * 
 * @class
 * @author taulinger
 * @author thiloSchlemmer
 */
export class DrawPlugin extends BaPlugin {


	/**
	 * @override
	 * @param {Store} store 
	 */
	async register(store) {

		const extract = (state) => {
			return state.draw.active;

		};
		const onChange = (changedState) => {
			if (changedState) {
				addLayer(DRAW_LAYER_ID, { constraints: { hidden: true, alwaysTop: true } });
			}
			else {
				removeLayer(DRAW_LAYER_ID);
			}
		};

		observe(store, extract, onChange);
	}
}