import { AbstractVectorGeoResource } from '../../domain/geoResources';
import { $injector } from '../../injection/index';
import { hashCode } from '../../utils/hashCode';
import { EventLike } from '../../utils/storeUtils';
import { LayerState, SwipeAlignment } from './layers.action';

export const LAYER_ADDED = 'layer/added';
export const LAYER_REMOVED = 'layer/removed';
export const LAYER_REMOVE_AND_SET = 'layer/removeAndSet';
export const LAYER_MODIFIED = 'layer/modified';
export const LAYER_PROPS_MODIFIED = 'layer/props/modified';
export const LAYER_RESOURCES_READY = 'layer/resources/ready';
export const LAYER_GEORESOURCE_CHANGED = 'layer/geoResource/changed';
export const LAYER_UI_FILTER = 'layer/ui/filter/changed';
export const LAYER_UI_SETTINGS = 'layer/ui/settings/changed';

export const initialState = {
	/**
	 * List of currently active {@link Layer}.
	 */
	active: [],
	/**
	 * Contains the ids of the latest removed layers
	 * @property {EventLike<String[]>}
	 */
	removed: new EventLike([]),
	/**
	 * Contains the ids of the latest added layers
	 * @property {EventLike<String[]>}
	 */
	added: new EventLike([]),
	/**
	 * Flag that indicates if the layer store is ready. "Ready" means all required resources are available.
	 */
	ready: false,

	/**
	 * LayerId for which a filter mask is currently open
	 * @property {string}
	 */
	activeFilterUI: null,

	/**
	 * LayerId for which a settings mask is currently open
	 * @property {string}
	 */
	activeSettingsUI: null
};

/**
 * Sets the zIndex based of the current order within the layer list.
 * @param {*} list
 */
export const index = (list) => {
	list.forEach((element, index) => {
		element.zIndex = index;
	});
	return list;
};

/**
 * Sorts the list based on the zIndex regarding the alwaysTop constraints.
 * Finally it calls {@link index()}.
 * @param {*} list
 */
export const sort = (list) => {
	const layersWithAlwaysTopConstraint = list.filter((l) => l.constraints.alwaysTop);
	const sorted = list.sort((a, b) => a.zIndex - b.zIndex);

	//we insert alwaysTop layers at the end
	layersWithAlwaysTopConstraint.forEach((l) => {
		sorted.push(sorted.splice(sorted.indexOf(l), 1)[0]);
	});
	//and reindex
	return index(sorted);
};

/**
 * Creates a {@link Layer} containing all required properties (bound to default values)
 * including `id` and `geoResourceId`.
 * @param {string} id The id of the layer
 * @param {string} [geoResourceId] Optionally the geoResourceId of the layer. Will be the id if not set.
 * @returns a layer with default properties
 */
export const createDefaultLayer = (id, geoResourceId = id) => {
	return { id: id, geoResourceId: geoResourceId, ...createDefaultLayerProperties() };
};

/**
 * Creates an object containing all layer specific default constraint properties.
 * @returns Constraints
 */
export const createDefaultLayersConstraints = () => {
	return {
		alwaysTop: false,
		hidden: false,
		cloneable: true,
		metaData: true,
		filter: null,
		swipeAlignment: SwipeAlignment.NOT_SET,
		updateInterval: null
	};
};

/**
 * Creates an object containing all layer properties (bound to default values)
 * except for `id` and `geoResourceId`.
 */
export const createDefaultLayerProperties = () => ({
	visible: true,
	zIndex: -1,
	opacity: 1,
	timestamp: null,
	state: LayerState.OK,
	props: {},
	style: null,
	constraints: createDefaultLayersConstraints(),
	grChangedFlag: null,
	activeFilterUI: null,
	activeSettingsUI: null
});

const addLayer = (state, payload) => {
	const { id, properties } = payload;

	if (state.active.findIndex((layer) => layer.id === id) !== -1) {
		//do nothing when id already present
		return {
			...state
		};
	}

	const layer = {
		...createDefaultLayerProperties(),
		geoResourceId: id,
		...properties,
		constraints: { ...createDefaultLayersConstraints(), ...(properties.constraints ?? {}) },
		id: id
	};

	const {
		constraints: { alwaysTop }
	} = layer;
	//when index is given we insert at that value, otherwise we append the layer
	const insertIndex = properties.zIndex >= 0 && !alwaysTop ? properties.zIndex : state.active.length;
	const active = [...state.active];
	active.splice(insertIndex, 0, layer);
	return {
		...state,
		active: sort(index(active)),
		added: new EventLike([id])
	};
};

const removeLayer = (state, payload) => {
	const active = index(state.active.filter((layer) => layer.id !== payload));
	return {
		...state,
		active,
		removed: state.active.length !== active.length ? new EventLike([payload]) : state.removed
	};
};

const atomicallyRemoveAndSet = (state, payload) => {
	const { layerOptions, restoreHiddenLayers } = payload;
	/**
	 * Ensure that the `active` property does not change unless one ore more layers are really different (based on their properties).
	 * Therefore we also have to copy the `grChangedFlag` event property of a layer if appropriate.
	 */
	const layers = layerOptions.map((atomicallyAddedLayer, index) => ({
		...createDefaultLayerProperties(),
		geoResourceId: atomicallyAddedLayer.id,
		...atomicallyAddedLayer,
		zIndex: index,
		constraints: { ...createDefaultLayersConstraints(), ...atomicallyAddedLayer.constraints },
		grChangedFlag: state.active[index]?.id === atomicallyAddedLayer.id ? state.active[index].grChangedFlag : null
	}));

	if (restoreHiddenLayers) {
		const hiddenLayerIndices = state.active.map((l, index) => (l.constraints.hidden ? index : -1)).filter((i) => i > -1);
		hiddenLayerIndices.forEach((i) => {
			const hiddenLayer = state.active[i];
			hiddenLayer.zIndex = layers.length;
			layers.splice(layers.length, 0, hiddenLayer);
		});
	}

	return {
		...state,
		active: layers,
		removed:
			state.active.length > 0
				? new EventLike([...state.active.filter((l) => (restoreHiddenLayers ? !l.constraints.hidden : true)).map((l) => l.id)])
				: state.removed,
		added: layerOptions.length > 0 ? new EventLike(layerOptions.map((l) => l.id)) : state.added
	};
};

const setReady = (state, payload) => {
	return {
		...state,
		ready: payload
	};
};
const updateFilterUi = (state, payload) => {
	return {
		...state,
		activeFilterUI: payload
	};
};
const updateSettingsUi = (state, payload) => {
	return {
		...state,
		activeSettingsUI: payload
	};
};

const modifyLayer = (state, payload) => {
	const { id, properties, constraints } = payload;

	const layer = state.active.find((layer) => layer.id === id);
	if (layer) {
		const active = [...state.active];

		const currentIndex = active.indexOf(layer);
		//remove current layer
		active.splice(currentIndex, 1);

		const updatedLayer = {
			...layer,
			...properties,
			constraints: { ...layer.constraints, ...constraints }
		};

		//add updated layer
		active.splice(updatedLayer.zIndex, 0, updatedLayer);

		return {
			...state,
			active: sort(index(active))
		};
	}
	return {
		...state
	};
};

const modifyLayerProps = (state, payload) => {
	const { id, props, replace } = payload;

	const layer = state.active.find((layer) => layer.id === id);
	if (layer) {
		const active = [...state.active];

		const currentIndex = active.indexOf(layer);
		// remove current layer
		active.splice(currentIndex, 1);

		const updatedLayer = {
			...layer,
			props: replace ? { ...props } : { ...layer.props, ...props }
		};

		// add updated layer
		active.splice(updatedLayer.zIndex, 0, updatedLayer);

		return {
			...state,
			active: sort(index(active))
		};
	}
	return {
		...state
	};
};

const updateGrChangedFlags = (state, payload /* the geoResourceId*/) => {
	return {
		...state,
		active: state.active.map((layer) => ({
			...layer,
			grChangedFlag: layer.geoResourceId === payload ? new EventLike(payload) : layer.grChangedFlag
		}))
	};
};

const applyActionSpecificUpdate = (state, action) => {
	const { type, payload } = action;
	switch (type) {
		case LAYER_ADDED: {
			return addLayer(state, payload);
		}
		case LAYER_REMOVED: {
			return removeLayer(state, payload);
		}
		case LAYER_REMOVE_AND_SET: {
			return atomicallyRemoveAndSet(state, payload);
		}
		case LAYER_MODIFIED: {
			return modifyLayer(state, payload);
		}
		case LAYER_PROPS_MODIFIED: {
			return modifyLayerProps(state, payload);
		}
		case LAYER_GEORESOURCE_CHANGED: {
			return updateGrChangedFlags(state, payload);
		}
		case LAYER_RESOURCES_READY: {
			return setReady(state, payload);
		}
		case LAYER_UI_FILTER: {
			return updateFilterUi(state, payload);
		}
		case LAYER_UI_SETTINGS: {
			return updateSettingsUi(state, payload);
		}
	}
	return state;
};

/**
 * Workaround for complex mutation of this s-o-s that are difficult to handle in common test cases.
 * An alternative approach would be using redux-thunk.
 */
const applyProductionOnlyUpdate = (state, action) => {
	if ([LAYER_ADDED, LAYER_REMOVED, LAYER_REMOVE_AND_SET, LAYER_MODIFIED].includes(action.type)) {
		return {
			// determine timestamp property
			...state,
			active: state.active.map((layer) => ({
				...layer,
				timestamp: getTimestamp(layer),
				style: getStyle(layer)
			}))
		};
	}
	return state;
};

/**
 * Determines the resulting timestamp of a layer.
 * Requires a registered {@link GeoResourceService} for injection.
 * @function
 * @param {module:store/layers/layers_action~Layer} layer
 * @returns the timestamp or null
 */
export const getTimestamp = (layer) => {
	const { GeoResourceService: geoResourceService } = $injector.inject('GeoResourceService');

	const geoResource = geoResourceService.byId(layer.geoResourceId);
	return geoResource?.hasTimestamps() ? (layer.timestamp ?? geoResource.timestamps[0]) : layer.timestamp;
};

export const _DefaultColors = Object.freeze(['#ff0000', '#ffa500', '#0000ff', '#00ffff', '#00ff00', '#800080', '#008000']);

const nextColor = (id) => {
	return _DefaultColors[Math.abs(hashCode(id)) % _DefaultColors.length];
};

/**
 * Determines the resulting style of a layer.
 * Requires a registered {@link GeoResourceService} for injection.
 * @function
 * @param {module:store/layers/layers_action~Layer} layer
 * @returns the `Style` or `null`
 */
export const getStyle = (layer) => {
	const { GeoResourceService: geoResourceService } = $injector.inject('GeoResourceService');

	/**
	 * The resulting style is determined in the following order
	 * 1. return null if the layers is not stylable
	 * 2. return existing style of the layer
	 * 3. return the style of the referenced GeoResource
	 * 4. return a random style
	 */
	const geoResource = geoResourceService.byId(layer.geoResourceId);
	if (!layer.style && geoResource?.isStylable()) {
		if (geoResource instanceof AbstractVectorGeoResource) {
			return geoResource?.hasStyle() ? geoResource.style : { baseColor: nextColor(layer.geoResourceId) };
		}
	}
	return layer.style;
};

/**
 * Use this reducer for tests.
 */
export const layersReducer = (state = initialState, action) => {
	return applyActionSpecificUpdate(state, action);
};

/**
 * Use this reducer for production.
 */
export const extendedLayersReducer = (state = initialState, action) => {
	return applyProductionOnlyUpdate(applyActionSpecificUpdate(state, action), action);
};
