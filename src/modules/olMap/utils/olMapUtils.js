export const updateOlLayer = (olLayer, layer) => {

	olLayer.setVisible(layer.visible);
	olLayer.setOpacity(layer.opacity);
	return olLayer;
};


export const toOlLayerFromHandler = (id, handler, map) => {

	const olLayer = handler.activate(map);

	if (olLayer) {
		olLayer.set('id', id);
	}
	return olLayer;
};

/**
 * Registers a listener on long-press events.
 * A listener for "short-press" events can be registered optionally.
 * @param {OlMap} map
 * @param {function(MapBrowserEvent)} longPressCallback callback with a MapBrowserEvent as argument
 * @param {function(MapBrowserEvent)} [shortPressCallback] optionally callback with a MapBrowserEvent as argument.
 *  Will be called wenn the pointerup event occurs before the amount of time has passed to handle it as a long-press event.
 * @param {number} [delay] amount of time in ms after which a long-press event will be fired (default=300)
 */
export const registerLongPressListener = (map, longPressCallback, shortPressCallback = () => { }, delay = 300) => {

	let timeoutID;
	const reset = () => {
		window.clearTimeout(timeoutID);
		timeoutID = null;
	};

	map.on('pointerdown', (evt) => {
		if (timeoutID) {
			reset();
		}
		timeoutID = window.setTimeout(() => {
			timeoutID = null;
			longPressCallback(evt);
		}, delay);
	});
	map.on('pointerup', (evt) => {
		if (timeoutID) {
			shortPressCallback(evt);
		}
		reset();
	});
	map.on('pointermove', (event) => {
		if (event.dragging) {
			reset();
		}
	});
};

/**
 *
 * @param {*} map olMap
 * @param {string} id id of the desired layer
 * @returns olLayer or `undefined`
 */
export const getLayerById = (map, id) => {
	return map.getLayers().getArray().find(olLayer => olLayer.get('id') === id);
};
