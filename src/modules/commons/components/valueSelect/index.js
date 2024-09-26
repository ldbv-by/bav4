import { ValueSelect } from './ValueSelect';
if (!window.customElements.get(ValueSelect.tag)) {
	window.customElements.define(ValueSelect.tag, ValueSelect);
}
