import { ZoomButtons } from './ZoomButtons';
if (!window.customElements.get(ZoomButtons.tag)) {
	window.customElements.define(ZoomButtons.tag, ZoomButtons);
}
