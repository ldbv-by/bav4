import { MapContextMenu } from './MapContextMenu';
import { MapContextMenuContent } from './MapContextMenuContent';
if (!window.customElements.get(MapContextMenu.tag)) {
	window.customElements.define(MapContextMenu.tag, MapContextMenu);
}
if (!window.customElements.get(MapContextMenuContent.tag)) {
	window.customElements.define(MapContextMenuContent.tag, MapContextMenuContent);
}