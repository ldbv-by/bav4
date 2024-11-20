/**
 * @module store/layers/layers_action
 */
import {
	LAYER_MODIFIED,
	LAYER_ADDED,
	LAYER_REMOVED,
	LAYER_RESOURCES_READY,
	LAYER_GEORESOURCE_CHANGED,
	LAYER_REMOVE_AND_SET,
	createDefaultLayerProperties
} from './layers.reducer';
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
 * @property {string} [timestamp=null] Timestamp
 * @property {number} [zIndex]  Index of this layer within the list of active layers. When not set, the layer will be appended at the end
 * @property {Constraints} [constraints] Constraints of the layer
 * @property {module:utils/storeUtils.EventLike<String|null>} [grChangedFlag] Flag that indicates a change of the linked GeoResource
 */

/**
 * Constraints of a {@link Layer}.
 * @typedef {Object} Constraints
 * @property {boolean} [hidden=false] Layer is not displayed in UI and is not referenced as query parameter
 * @property {boolean} [alwaysTop=false] Layer always on top
 * @property {boolean} [cloneable=true] Layer is allowed to be cloned
 * @property {boolean} [metaData=true] Layer references meta data that can be viewed
 */

/**
 * Modifiable options of a {@link Layer}.
 * @typedef {Object} ModifyLayerOptions
 * @property {number} [opacity] The new opacity value (0, 1)
 * @property {boolean} [visible] The new visibility value
 * @property {string} [timestamp] The new timestamp value
 * @property {number} [zIndex] The new index of this layer within the list of active layers
 */

/**
 * Options for cloning a {@link Layer}.
 * @typedef {Object} CloneLayerOptions
 * @property {number} [opacity] The new opacity value (0, 1)
 * @property {boolean} [visible] The new visibility value
 * @property {string} [timestamp] The new timestamp value
 * @property {number} [zIndex] The new index of this layer within the list of active layers
 */

/**
 * Options for adding a {@link Layer}.
 * @typedef {Object} AddLayerOptions
 * @property {string} [geoResourceId]  Id of the linked GeoResource. If not set, it will take the Id of this layer as value
 * @property {number} [opacity=1] Opacity (0, 1)
 * @property {boolean} [visible=true] Visibility
 * @property {string} [timestamp=null] Timestamp
 * @property {number} [zIndex]  Index of this layer within the list of active layers. When not set, the layer will be appended at the end
 * @property {Constraints} [constraints] Constraints of the layer
 */

/**
 * Options for a new {@link Layer} which may be added together with other layers atomically
 * @typedef {Object} AtomicallyAddLayerOptions
 * @property {string} id Id of the layer
 * @property {string} [geoResourceId]  Id of the linked GeoResource. If not set, it will take the Id of this layer as value
 * @property {number} [opacity=1] Opacity (0, 1)
 * @property {boolean} [visible=true] Visibility
 * @property {string} [timestamp=null] Timestamp
 */

const getStore = () => {
	const { StoreService: storeService } = $injector.inject('StoreService');
	return storeService.getStore();
};

/**
 * Updates the properties of a {@link Layer}.
 * @function
 * @param {string} id Id of the layer
 * @param {module:store/layers/layers_action~ModifyLayerOptions} options options
 */
export const modifyLayer = (id, options = {}) => {
	getStore().dispatch({
		type: LAYER_MODIFIED,
		payload: { id: id, properties: options }
	});
};

/**
 * Adds a {@link Layer} to the list of active layers.
 * @function
 * @param {string} id Id of the layer
 * @param {module:store/layers/layers_action~AddLayerOptions} options layer options
 */
export const addLayer = (id, options = {}) => {
	getStore().dispatch({
		type: LAYER_ADDED,
		payload: { id: id, properties: options }
	});
};

/**
 * Adds a {@link Layer} to the list of active layers but only if the referenced GeoResource is not already present.
 * @function
 * @param {string} id Id of the layer
 * @param {module:store/layers/layers_action~AddLayerOptions} options layer options
 */
export const addLayerIfNotPresent = (id, options = {}) => {
	if (
		!getStore()
			.getState()
			.layers.active.some((l) => l.geoResourceId === (options.geoResourceId ?? id))
	) {
		addLayer(id, options);
	}
};

/**
 * Clones an existing {@link Layer} and adds it to the list of active layers.
 * @function
 * @param {string} id the Id of the layer that should be cloned
 * @param {string} clonedId the Id of the  cloned layer
 * @param {module:store/layers/layers_action~CloneLayerOptions} options layer options
 */
export const cloneAndAddLayer = (id, clonedId, options = {}) => {
	const layer = getStore()
		.getState()
		.layers.active.find((l) => l.id === id);

	if (layer?.constraints.cloneable) {
		const layerAddOptions = {
			...{
				geoResourceId: layer.geoResourceId,
				opacity: layer.opacity,
				visible: layer.visible,
				timestamp: layer.timestamp,
				zIndex: createDefaultLayerProperties().zIndex,
				constraints: { ...layer.constraints }
			},
			...options
		};
		addLayer(clonedId, layerAddOptions);
	}
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
 * Atomically removes all current layers and (optionally) adds a list of layers.
 * @function
 * @param {Array<module:store/layers/layers_action~AtomicallyAddLayerOptions>} [options=[]] Options, one for each layer
 * @param {boolean} [restoreHiddenLayers=false] `true` if existing hidden layers should be restored. The hidden layers will be appended to the given layers (see param `options`). Default is `false`
 */
export const removeAndSetLayers = (options = [], restoreHiddenLayers = false) => {
	getStore().dispatch({
		type: LAYER_REMOVE_AND_SET,
		payload: { layerOptions: [...options], restoreHiddenLayers }
	});
};

/**
 * Removes all {@link Layer} which references a certain GeoResource from the list of active layers
 * @function
 * @param {string} geoResourceId The id of a GeoResource
 */
export const removeLayerOf = (geoResourceId) => {
	getStore()
		.getState()
		.layers.active.forEach((l) => {
			if (l.geoResourceId === geoResourceId) {
				removeLayer(l.id);
			}
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
