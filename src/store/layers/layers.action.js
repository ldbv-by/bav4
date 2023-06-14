/**
 * @module store/layers/layers_action
 */
import { LAYER_MODIFIED, LAYER_ADDED, LAYER_REMOVED, LAYER_RESOURCES_READY, LAYER_GEORESOURCE_CHANGED } from './layers.reducer';
import { $injector } from '../../injection';
import { GeoResource } from '../../domain/geoResources';

/**
 * Represents a layer on a map or globe.
 * See {@link LayerProperties} for its properties.
 * @typedef {Object} Layer
 */

/**
 * Properties of a {@link Layer}.
 * @typedef {Object} LayerProperties
 * @property {string} id Id of this layer
 * @property {string} geoResourceId  Id of the linked GeoResource. If not set, it will take the Id of this layer as value
 * @property {number} [opacity=1] Opacity (0, 1)
 * @property {boolean} [visible=true] Visibility
 * @property {number} [zIndex]  Index of this layer within the list of active layers. When not set, the layer will be appended at the end
 * @property {Constraints} [constraints] Constraints of the layer
 * @property {module:utils/storeUtils.EventLike<String|null>} [grChangedFlag] Flag that indicates a change of the linked GeoResource
 */

/**
 * Constraints of a {@link Layer}.
 * @typedef {Object} Constraints
 * @property {boolean} [hidden=false] Layer is not displayed in UI
 * @property {boolean} [alwaysTop=false] Layer always on top
 * @property {boolean} [cloneable=true] Layer is allowed to be cloned
 * @property {boolean} [metaData=true] Layer references meta data that can be viewed
 */

/**
 * Modifiable properties of a {@link Layer}.
 * @typedef {Object} ModifiableLayerProperties
 * @property {number} [opacity] Opacity (0, 1).
 * @property {boolean} [visible] Visibility.
 * @property {number} [zIndex] Desired index of this layer within the list of active layers
 */

const getStore = () => {
	const { StoreService: storeService } = $injector.inject('StoreService');
	return storeService.getStore();
};

/**
 * Updates the properties of a {@link Layer}.
 * @function
 * @param {string} id Id of the layer
 * @param {ModifiableLayerProperties} properties New properties
 */
export const modifyLayer = (id, properties = {}) => {
	getStore().dispatch({
		type: LAYER_MODIFIED,
		payload: { id: id, properties: properties }
	});
};

/**
 * Adds a {@link Layer} to the list of active layers.
 * @function
 * @param {string} id Id of the layer
 * @param {LayerProperties} properties layer properties
 */
export const addLayer = (id, properties = {}) => {
	getStore().dispatch({
		type: LAYER_ADDED,
		payload: { id: id, properties: properties }
	});
};

/**
 * Removes a {@link Layer} from the list of active layers.
 * @function
 * @param {string} id Id of the layer
 */
export const removeLayer = (id) => {
	getStore().dispatch({
		type: LAYER_REMOVED,
		payload: id
	});
};

/**
 * Marks the layers state as ready. That means all needed resources are available, for example the GeoResourceService has been initialized.
 * @function
 */
export const setReady = () => {
	getStore().dispatch({
		type: LAYER_RESOURCES_READY,
		payload: true
	});
};

/**
 * Announces that one or more properties of a GeoResource were changed.
 * @function
 * @param {GeoResource|string} grOrId GeoResource or its id
 */
export const geoResourceChanged = (grOrId) => {
	getStore().dispatch({
		type: LAYER_GEORESOURCE_CHANGED,
		payload: grOrId instanceof GeoResource ? grOrId.id : grOrId
	});
};
