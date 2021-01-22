export const LAYER_ADDED = 'layer/added';
export const LAYER_REMOVED = 'layer/removed';
export const LAYER_MODIFIED = 'layer/modified';
export const BACKGROUND_CHANGED = 'background/changed';


export const initialState = {
	active: [],
	background: null
};


export const index = (list) => {
	list.forEach((element, index) => {
		element.zIndex = index;
	});
	return list;
};

export const sort = (list) => {
	return list.sort((a, b) => a.zIndex - b.zIndex);
};

export const defaultLayerProperties = {
	label: '',
	visible: true,
	zIndex: -1,
	opacity: 1
};

export const layersReducer = (state = initialState, action) => {

	const { type, payload } = action;
	switch (type) {

		case LAYER_ADDED: {
			const { id, properties } = payload;

			if (state.active.findIndex(layer => layer.id === id) !== -1) {
				//do nothing when id already present
				return {
					...state
				};
			}

			const layer = {
				...defaultLayerProperties,
				...properties,
				id: id
			};

			//when index is given we insert at that value, otherwise we append the layer
			const insertIndex = (properties.zIndex >= 0) ? properties.zIndex : state.active.length;
			const active = [...state.active];
			active.splice(insertIndex, 0, layer);

			return {
				...state,
				active: index(active)
			};
		}
		case LAYER_REMOVED: {

			return {
				...state,
				active: index(state.active.filter(layer => layer.id !== payload))
			};
		}
		case LAYER_MODIFIED: {
			const { id, properties } = payload;

			const layer = state.active.find(layer => layer.id === id);
			if (layer) {
				let active = [...state.active];
				if (layer.zIndex !== properties.zIndex) {
					//zIndex was changed
					active.forEach((layer, index) => {
						if (index <= properties.zIndex) {
							layer.zIndex = layer.zIndex - 1;
						}
					});
				}
				active = active.filter(layer => layer.id !== id);
				const updatedLayer = {
					...layer,
					...properties
				};
				active.push(updatedLayer);

				return {
					...state,
					active: sort(active)
				};
			}
			return {
				...state
			};

		}
		case BACKGROUND_CHANGED: {

			return {
				...state,
				background: payload
			};
		}

	}

	return state;
};