import { IconButton } from './IconButton';
if (!window.customElements.get(IconButton.tag)) {
	window.customElements.define(IconButton.tag, IconButton);
}