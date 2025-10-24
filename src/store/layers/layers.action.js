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
	createDefaultLayerProperties,
	LAYER_PROPS_MODIFIED,
	LAYER_UI_FILTER,
	LAYER_UI_SETTINGS
} from './layers.reducer';
import { $injector } from '../../injection';
import { GeoResource } from '../../domain/geoResources';
import { isBoolean, isNumber, isString } from '../../utils/checks';

/**
 * Represents a layer on a map or globe.
 *
 * @typedef {Object} Layer
 * @property {string} id Id of this layer
 * @property {string} geoResourceId  Id of the linked GeoResource. If not set, it will take the Id of this layer as value
 * @property {number} [opacity=1] Opacity (0, 1)
 * @property {boolean} [visible=true] Visibility
 * @property {string} [timestamp=null] Timestamp
 * @property {number} [zIndex]  Index of this layer within the list of active layers. When not set, the layer will be appended at the end
 * @property {LayerState} [state=LayerState.OK]  The current state of the layer
 * @property {module:store/layers/layers_action~LayerProps} [props={}] Optional properties of the layer
 * @property {module:domain/styles/Style|null} [style=null]  The current style of the layer
 * @property {module:store/layers/layers_action~Constraints} [constraints] Constraints of the layer
 * @property {module:utils/storeUtils.EventLike<String|null>} [grChangedFlag] Flag that indicates a change of the linked GeoResource
 */

/**
 * Constraints of a {@link Layer}.
 * @typedef {Object} Constraints
 * @property {boolean} [hidden=false] Layer is not displayed in UI and is not referenced as query parameter
 * @property {boolean} [alwaysTop=false] Layer always on top
 * @property {boolean} [cloneable=true] Layer is allowed to be cloned
 * @property {boolean} [metaData=true] Layer references meta data that can be viewed
 * @property {string|null} [filter=null] Filter expression for this layer
 * @property {SwipeAlignment} [swipeAlignment=SwipeAlignment.NOT_SET] The alignment of the layer is visible if the swipe feature is active
 * @property {number|null} [updateInterval=null] The update interval of the layer in seconds
 * @property {boolean|null} [displayFeatureLabels=null] Labels of features should be displayed (if available). `Null` means "not defined for this layer"
 */

/**
 * Optional properties of a {@link Layer}.
 * @typedef {Object} LayerProps
 * @property {number} [featureCount] Number of features this layer contains
 */

/**
 * Modifiable options of a {@link Layer}.
 * @typedef {Object} ModifyLayerOptions
 * @property {number} [opacity] The new `opacity` value (0, 1)
 * @property {boolean} [visible] The new `visible` value
 * @property {string} [timestamp] The new `timestamp `value
 * @property {number} [zIndex] The new `zIndex` of this layer within the list of active layers
 * @property {LayerState} [state] The new `state` of the layer
 * @property {LayerProps} [props] The new `properties` of the layer
 * @property {module:domain/styles/Style} [style] The new `style` of the layer
 * @property {boolean} [hidden] The new `hidden` constraint of the layer
 * @property {boolean} [alwaysTop] The new `alwaysTop` constraint of the layer
 * @property {string|null} [filter] The new `filter` constraint of the layer or `null` to reset the filter
 * @property {SwipeAlignment} [swipeAlignment] The new `swipeAlignment` constraint of the layer if the swipe feature is active
 * @property {number|null} [updateInterval] The update interval of the layer in seconds
 * @property {boolean|null} [displayFeatureLabels] Labels of features should be displayed (if available)
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
 * @property {LayerState} [state] The `state` of the layer
 * @property {LayerProps} [props] The properties of the layer
 * @property {module:domain/styles/Style} [style] The `style` of the layer
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
 * @property {Constraints} [constraints] Constraints of the layer
 */

/**
 * The side a layers is shown if the swipe feature is active
 * @readonly
 * @enum {Number}
 */
export const SwipeAlignment = Object.freeze({
	NOT_SET: 'b',
	LEFT: 'l',
	RIGHT: 'r'
});

/**
 * The state of a layer.
 * @readonly
 * @enum {Number}
 */
export const LayerState = Object.freeze({
	OK: 'ok',
	LOADING: 'loading',
	INCOMPLETE_DATA: 'incomplete_data',
	ERROR: 'error'
});

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
	const { swipeAlignment, hidden, alwaysTop, filter, updateInterval, displayFeatureLabels, ...properties } = options;
	const constraints = {};
	if (isBoolean(hidden)) {
		constraints.hidden = hidden;
	}
	if (isBoolean(alwaysTop)) {
		constraints.alwaysTop = alwaysTop;
	}
	if (Object.values(SwipeAlignment).includes(swipeAlignment)) {
		constraints.swipeAlignment = swipeAlignment;
	}
	if (isString(filter) || filter === null) {
		constraints.filter = filter;
	}
	if (isNumber(updateInterval) || updateInterval === null) {
		constraints.updateInterval = updateInterval;
	}
	if (isBoolean(displayFeatureLabels) || displayFeatureLabels === null) {
		constraints.displayFeatureLabels = displayFeatureLabels;
	}
	getStore().dispatch({
		type: LAYER_MODIFIED,
		payload: { id: id, properties, constraints }
	});
};

/**
 * Updates the `props` of a {@link Layer}.
 * @param {string} id Id of the layer
 * @param {module:store/layers/layers_action~LayerProps} props
 * @param {boolean} [replace=true] `true` if all existing properties should be replaced by the new `props` object. Default is `false` which means a partial update
 */
export const modifyLayerProps = (id, props, replace = false) => {
	getStore().dispatch({
		type: LAYER_PROPS_MODIFIED,
		payload: { id: id, props, replace }
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
				state: layer.state,
				props: { ...layer.props },
				style: { ...layer.style },
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

/**
 * Opens the Filter-UI for a specific layer.
 * @function
 * @param {string} layerId
 */
export const openLayerFilterUI = (layerId) => {
	getStore().dispatch({
		type: LAYER_UI_FILTER,
		payload: layerId
	});
};

/**
 *  Closes the Filter-UI.
 *  Dispatches an action to set the layer filter UI state to closed (payload: `null`).).
 */
export const closeLayerFilterUI = () => {
	getStore().dispatch({
		type: LAYER_UI_FILTER,
		payload: null
	});
};

/**
 * Opens the Settings-UI for a specific layer.
 * @param {String} layerId
 */
export const openLayerSettingsUI = (layerId) => {
	getStore().dispatch({
		type: LAYER_UI_SETTINGS,
		payload: layerId
	});
};

/**
 *  Closes the Settings-UI.
 *  Dispatches an action to set the layer settings UI state to closed (payload: `null`).
 */
export const closeLayerSettingsUI = () => {
	getStore().dispatch({
		type: LAYER_UI_SETTINGS,
		payload: null
	});
};
