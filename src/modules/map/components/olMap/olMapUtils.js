import { simulateMouseEvent } from '../../../../../test/modules/map/components/olMap/mapTestUtils';
import MapBrowserEventType from 'ol/MapBrowserEventType';

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
 * Registers a listener on long touch/click events.
 * @param {OlMap} map
 * @param {function(MapBrowserEvent)} callback callback with a MapBrowserEvent as argument
 * @param {number} [delay] delay in ms (default=300)
 */
export const registerLongPressListener = (map, callback, delay = 300) => {

	let timeoutID;
	map.on('pointerdown', (evt) => {
		if (timeoutID) {
			window.clearTimeout(timeoutID);
		}
		timeoutID = window.setTimeout(() => callback(evt), delay);
	});
	map.on('pointerup', () => {
		window.clearTimeout(timeoutID);
	});
	map.on('pointermove', (event) => {
		if (event.dragging) {
			window.clearTimeout(timeoutID);
		}
	});
};


/**
 * Checks whether a layer contains features or not.
 * @param {Layer} layer
 * @returns {boolean}
 */
export const isEmptyLayer = (layer) => {
	if (layer) {
		return !layer.getSource().getFeatures().length > 0;
	}
	return true;
};


/**
 * Method to set the focus back on the current map without any further pointer
 * moves or clicks from real devices
 * @param {Map} map the map to focus on
 */
export const requestMapFocus = (map) => {
	const view = map.getView();
	if (map && view) {
		const x = view.getCenter()[0];
		const y = view.getCenter()[1];
		simulateMouseEvent(map, MapBrowserEventType.CLICK, x, y);
	}
};
