import { ExtendButton } from './ExtendButton';
if (!window.customElements.get(ExtendButton.tag)) {
	window.customElements.define(ExtendButton.tag, ExtendButton);
}