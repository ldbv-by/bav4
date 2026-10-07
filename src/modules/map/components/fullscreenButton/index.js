import { FullScreenButton } from './FullScreenButton';
if (!window.customElements.get(FullScreenButton.tag)) {
	window.customElements.define(FullScreenButton.tag, FullScreenButton);
}
