import { BaseLayerSwitcher } from './BaseLayerSwitcher';
if (!window.customElements.get(BaseLayerSwitcher.tag)) {
	window.customElements.define(BaseLayerSwitcher.tag, BaseLayerSwitcher);
}