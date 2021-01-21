import { LayerManager } from './LayerManager';
if (!window.customElements.get(LayerManager.tag)) {
	window.customElements.define(LayerManager.tag, LayerManager);
}