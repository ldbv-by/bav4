import { BaseLayerContainer } from './BaseLayerContainer';
if (!window.customElements.get(BaseLayerContainer.tag)) {
	window.customElements.define(BaseLayerContainer.tag, BaseLayerContainer);
}
