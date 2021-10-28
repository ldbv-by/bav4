import { LayerInfoPanel } from './components/LayerInfoPanel';
if (!window.customElements.get(LayerInfoPanel.tag)) {
	window.customElements.define(LayerInfoPanel.tag, LayerInfoPanel);
}
