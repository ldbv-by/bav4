import { ZoomButtons } from './ZoomButtons';
import { ZoomToExtentButton } from './ZoomToExtentButton'; 
if (!window.customElements.get(ZoomButtons.tag)) {
	window.customElements.define(ZoomButtons.tag, ZoomButtons);
}
if (!window.customElements.get(ZoomToExtentButton.tag)) {
	window.customElements.define(ZoomToExtentButton.tag, ZoomToExtentButton);
}
