import { MapBrowserEvent, MapEvent } from 'ol';
import Event from 'ol/events/Event';


export const simulateMapBrowserEvent = (map, type, x, y, dragging = false, preventDefaultFunction = () => { }) => {
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

export const simulateMapEvent = (map, type) => {
	const mapEvent = new MapEvent(type, map, map.frameState);

	map.dispatchEvent(mapEvent);
};
