import { MapContextMenu } from './MapContextMenu';
if (!window.customElements.get(MapContextMenu.tag)) {
	window.customElements.define(MapContextMenu.tag, MapContextMenu);
}