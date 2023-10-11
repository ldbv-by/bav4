import { MapBrowserEvent, MapEvent } from 'ol';
import Event from 'ol/events/Event';

/**
 * Fires a `MapBrowserEvent` by calling `dispatchEvent()` on the ol map.
 * @param {Map} the ol map
 * @param {String} type type of BrowserEvent
 * @param {number} x the x-coordinate (relative to the viewport)
 * @param {number} y the y-coordinate (relative to the viewport)
 * @param {boolean} [dragging]  Is the map currently being dragged
 * @param {Function} [preventDefaultFunction] preventDefault function
 */
export const simulateMapBrowserEvent = (map, type, x, y, dragging = false, preventDefaultFunction = () => {}) => {
	const eventType = type;

	const event = new Event(eventType);
	event.target = map.getViewport().firstChild;
	event.clientX = x;
	event.clientY = y;
	event.pageX = x;
	event.pageY = y;
	event.shiftKey = false;
	event.preventDefault = preventDefaultFunction;

	const mapEvent = new MapBrowserEvent(eventType, map, event);
	mapEvent.coordinate = [x, y];
	mapEvent.dragging = dragging;
	map.dispatchEvent(mapEvent);
};

/**
 * Fires a `MapEvent` by calling `dispatchEvent()` on the ol map.
 * @param {Map} the ol map
 * @param {String} type type of BrowserEvent
 */
export const simulateMapEvent = (map, type) => {
	const mapEvent = new MapEvent(type, map, map.frameState);

	map.dispatchEvent(mapEvent);
};
