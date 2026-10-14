/**
 * @module domain/layer
 */
/**
 * Lowest possible update interval of a `Layer` in seconds
 * @constant
 */
export const DEFAULT_MIN_LAYER_UPDATE_INTERVAL_SECONDS = 60;

/**
 * Specifies the orientation of a `Layer` when Compare mode is active.
 * @readonly
 * @enum {Number}
 */
export const SwipeAlignment = Object.freeze({
	NOT_SET: 'b',
	LEFT: 'l',
	RIGHT: 'r'
});

/**
 * The state of a `Layer`.
 * @readonly
 * @enum {Number}
 */
export const LayerState = Object.freeze({
	OK: 'ok',
	LOADING: 'loading',
	INCOMPLETE_DATA: 'incomplete_data',
	ERROR: 'error'
});

/**
 * Represents a layer on a map or globe.
 *
 * @typedef {Object} Layer
 * @property {string} id Id of this layer
 * @property {string} geoResourceId  Id of the linked GeoResource. If not set, it will take the Id of this layer as value
 * @property {number} [opacity=1] Opacity (0, 1)
 * @property {boolean} [visible=true] Visibility
 * @property {string|null} [timestamp=null] Timestamp
 * @property {number} [zIndex]  Index of this layer within the list of active layers. When not set, the layer will be appended at the end
 * @property {LayerState} [state=LayerState.OK]  The current state of the layer
 * @property {module:domain/layer~LayerProps} [props={}] Optional properties of the layer
 * @property {module:domain/styles/Style|null} [style=null]  The current style of the layer
 * @property {boolean} [cluster=false]  The layer displays clustered features
 * @property {module:domain/layer~Constraints}} [constraints] Constraints of the layer
 * @property {module:utils/storeUtils.EventLike<String|null>} [grChangedFlag] Flag that indicates a change of the linked GeoResource
 */

/**
 * Constraints of a {@link module:domain/layer~Layer}.
 * @typedef {Object} Constraints
 * @property {boolean} [hidden=false] Layer is not displayed in UI and is not referenced as query parameter
 * @property {boolean} [alwaysTop=false] Layer always on top
 * @property {boolean} [cloneable=true] Layer is allowed to be cloned
 * @property {boolean} [metaData=true] Layer references meta data that can be viewed
 * @property {string|null} [filter=null] Filter expression for this layer
 * @property {SwipeAlignment} [swipeAlignment=SwipeAlignment.NOT_SET] The alignment of the layer is visible if the swipe feature is active
 * @property {number|null} [updateInterval=null] The update interval of the layer in seconds
 * @property {boolean|null} [displayFeatureLabels=null] Labels of features should be displayed (if available). `Null` means "not defined for this layer"
 * @property {module:domain/geoResources~ClusterParams|null} [clusterParams] The cluster parameters
 */

/**
 * Optional properties of a {@link module:domain/layer~Layer}.
 * @typedef {Object} LayerProps
 * @property {number} [featureCount] Number of features this layer contains
 */
