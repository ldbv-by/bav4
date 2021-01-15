import { Popup } from './Popup';
if (!window.customElements.get(Popup.tag)) {
	window.customElements.define(Popup.tag, Popup);
}
