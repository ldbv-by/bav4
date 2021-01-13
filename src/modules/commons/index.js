import { Button } from './components/button/Button';
if (!window.customElements.get(Button.tag)) {
	window.customElements.define(Button.tag, Button);
}
import { Popup } from './components/popup/Popup';
if (!window.customElements.get(Popup.tag)) {
	window.customElements.define(Popup.tag, Popup);
}
