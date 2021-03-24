/**
 * Action creators to change the list of active layers and update properties of a layer.
 * @module map/action
 */
import { LAYER_MODIFIED, LAYER_ADDED, LAYER_REMOVED } from './layers.reducer';
import { $injector } from '../../../injection';


/**
 * Reflects the state of a layer.
 * @typedef {Object} LayerProperties
 * @property {string} opacity Id of this layer
 * @property {label} label Label of this layer
 * @property {number} [opacity=1] Opacity (0, 1).
 * @property {boolean} [visible=true] Visibility.
 * @property {number} [zIndex]  Index of this layer within the list of active layers. When not set, the layer will be appended at the end.
 * @property {Constraints} [constraints] Constraints of the layer.
 */

/**
 * @typedef {Object} Constraints
 * @property {boolean} [hidden=false] Layer is not displayed in UI
 * @property {boolean} [alwaysTop=false] Layer always on top
 */

/**
 * Properties to change the state of a layer.
 * @typedef {Object} ModifyableLayerProperties
 * @property {number} [opacity] Opacity (0, 1).
 * @property {boolean} [visible] Visibility.
 * @property {number} [zIndex] Desired index of this layer within the list of active layers.
 */


const getStore = () => {
	const { StoreService: storeService } = $injector.inject('StoreService');
	return storeService.getStore();
};

/**
 * Updates the properties of a layer.
 * @function
 * @param {string} id Id of the layer
 * @param {ModifyableLayerProperties} properties New properties
 */
export const modifyLayer = (id, properties = {}) => {
	getStore().dispatch({
		type: LAYER_MODIFIED,
		payload: { id: id, properties: properties }
	});
};

/**
 * Adds a layer to the list of active layers.
 * @function
 * @param {string} id Id of the layer
 * @param {LayerProperties} properties New properties
 */
export const addLayer = (id, properties = {}) => {
	getStore().dispatch({
		type: LAYER_ADDED,
		payload: { id: id, properties: properties }
	});
};

/**
 * Removes a layer from the list of active layers.
 * @function
 * @param {string} id Id of the layer
 */
export const removeLayer = (id) => {
	getStore().dispatch({
		type: LAYER_REMOVED,
		payload: id
	});
};

