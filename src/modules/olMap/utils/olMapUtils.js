/**
 * @module modules/olMap/utils/olMapUtils
 */
import LayerGroup from '../../../../node_modules/ol/layer/Group';

/**
 * @module modules/olMap/utils/olMapUtils
 */
export const updateOlLayer = (olLayer, layer) => {
	olLayer.setVisible(layer.visible);
	olLayer.setOpacity(layer.opacity);
	olLayer.set('timestamp', layer.timestamp);
	olLayer.set('filter', layer.constraints.filter);
	olLayer.set('style', layer.style);
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
export const registerLongPressListener = (map, longPressCallback, shortPressCallback = () => {}, delay = 300) => {
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
 * @param {OlMap} map olMap
 * @param {string} id id of the desired layer
 * @returns olLayer or `null`
 */
export const getLayerById = (map, id) => {
	if (map && id) {
		return (
			map
				.getLayers()
				.getArray()
				.find((olLayer) => olLayer.get('id') === id) ?? null
		);
	}
	return null;
};

/**
 * Finds the (first) corresponding layer group for an ol layer.
 * Returns `null` if there's no corresponding layer group.
 * @param {OlMap} map olMap
 * @param {OlLayer} olLayer the olLayer which group should be found
 * @returns olLayer or `null`
 */
export const getLayerGroup = (map, olLayer) => {
	if (map && olLayer) {
		return (
			map
				.getLayers()
				.getArray()
				.filter((olLayer) => olLayer instanceof LayerGroup)
				.filter((groupOlLayer) =>
					groupOlLayer
						.getLayers()
						.getArray()
						.flat()
						.find((ol) => ol === olLayer)
				)[0] ?? null
		);
	}
	return null;
};

/**
 * Finds the layer an ol feature is attached to.
 * It always returns the 'real' layer even if the layer is part of a LayerGroup.
 * Returns `null` if there's no corresponding layer.
 * @param {OlMap} map olMap
 * @param {OlLayer} olFeature the olFeature which layer should be found
 * @returns olLayer or `null`
 */
export const getLayerByFeature = (map, olFeature) => {
	if (map && olFeature) {
		return map.getAllLayers().filter((l) => (l.getSource().hasFeature ? l.getSource().hasFeature(olFeature) : false))[0] ?? null;
	}
	return null;
};
