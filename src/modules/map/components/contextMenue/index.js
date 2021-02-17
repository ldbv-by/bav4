import { MapContextMenue } from './MapContextMenue';
if (!window.customElements.get(MapContextMenue.tag)) {
	window.customElements.define(MapContextMenue.tag, MapContextMenue);
}