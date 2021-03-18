import { MapBrowserEvent, MapEvent } from 'ol';
import Event from 'ol/events/Event';


export const simulateMouseEvent = (map, type, x, y, dragging) => {
	const eventType = type;

	const event = new Event(eventType);
	event.target = map.getViewport().firstChild;
	event.clientX = x;
	event.clientY = y;
	event.pageX = x;
	event.pageY = y;
	event.shiftKey = false;
	event.preventDefault = function () { };


	const mapEvent = new MapBrowserEvent(eventType, map, event);
	mapEvent.dragging = dragging ? dragging : false;
	map.dispatchEvent(mapEvent);
};

export const simulateMapEvent = (map, type) => {
	const mapEvent = new MapEvent(type, map, map.frameState);

	map.dispatchEvent(mapEvent);
};