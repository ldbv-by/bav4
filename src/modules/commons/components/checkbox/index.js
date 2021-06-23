import { Checkbox } from './Checkbox';
if (!window.customElements.get(Checkbox.tag)) {
	window.customElements.define(Checkbox.tag, Checkbox);
}