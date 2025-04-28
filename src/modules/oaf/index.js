import { OafMask } from './components/OafMask';
import { OafRow } from './components/OafRow';

if (!window.customElements.get(OafRow.tag)) {
	window.customElements.define(OafRow.tag, OafRow);
}

if (!window.customElements.get(OafMask.tag)) {
	window.customElements.define(OafMask.tag, OafMask);
}
