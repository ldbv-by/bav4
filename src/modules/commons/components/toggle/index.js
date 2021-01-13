import { Toggle } from './Toggle';
if (!window.customElements.get(Toggle.tag)) {
	window.customElements.define(Toggle.tag, Toggle);
}
