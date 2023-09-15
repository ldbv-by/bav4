import { observe } from '../utils/storeUtils';
import { addLayer, removeLayer } from '../store/layers/layers.action';
import { BaPlugin } from './BaPlugin';
import { activate, deactivate } from '../store/routing/routing.action';
import { Tools } from '../domain/tools';

/**
 * Id of the layer used for measurement interaction.
 * LayerHandler of a map implementation will also use this id as their key.
 */
export const ROUTING_LAYER_ID = 'routing_layer';

/**
 * This plugin observes the 'active' property of the routing store.
 * On changes, it adds a layer with a specific and constant id
 * to the layers store or removes this layer from the store (see: {@link ROUTING_LAYER_ID}).
 *
 * As a result of the change of the layers store, a map implementation will search for a handler registered for that id,
 * and, if found, will activate or deactivate this handler.
 *
 * @class
 * @author taulinger
 */
export class RoutingPlugin extends BaPlugin {
	/**
	 * @override
	 * @param {Store} store
	 */
	async register(store) {
		const onToolChanged = (toolId) => {
			if (toolId !== Tools.ROUTING) {
				deactivate();
			} else {
				// we activate the tool after another possible active tool was deactivated
				setTimeout(() => activate());
			}
		};

		const onChange = (changedState) => {
			if (changedState) {
				addLayer(ROUTING_LAYER_ID, { constraints: { hidden: true, alwaysTop: true } });
			} else {
				removeLayer(ROUTING_LAYER_ID);
			}
		};

		observe(store, (state) => state.routing.active, onChange);
		observe(store, (state) => state.tools.current, onToolChanged, false);
	}
}
