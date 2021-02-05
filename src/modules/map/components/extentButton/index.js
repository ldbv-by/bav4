import { ExtentButton } from './ExtentButton';
if (!window.customElements.get(ExtentButton.tag)) {
	window.customElements.define(ExtentButton.tag, ExtentButton);
}