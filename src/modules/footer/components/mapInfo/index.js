import { MapInfo } from './MapInfo';
if (!window.customElements.get(MapInfo.tag)) {
	window.customElements.define(MapInfo.tag, MapInfo);
}
