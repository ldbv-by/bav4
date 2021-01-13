import { Button } from './Button';
if (!window.customElements.get(Button.tag)) {
	window.customElements.define(Button.tag, Button);
}
