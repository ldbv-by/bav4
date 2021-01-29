import { LayerManager } from './LayerManager';
import { LayerItem } from './LayerItem';
if (!window.customElements.get(LayerItem.tag)) {
	window.customElements.define(LayerItem.tag, LayerItem);
}
if (!window.customElements.get(LayerManager.tag)) {
	window.customElements.define(LayerManager.tag, LayerManager);
}