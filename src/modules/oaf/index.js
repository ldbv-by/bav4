import './i18n';
import { OafFilter } from './components/OafFilter';
import { OafFilterGroup } from './components/OafFilterGroup';
import { OafMask } from './components/OafMask';

if (!window.customElements.get(OafFilter.tag)) {
	window.customElements.define(OafFilter.tag, OafFilter);
}

if (!window.customElements.get(OafFilterGroup.tag)) {
	window.customElements.define(OafFilterGroup.tag, OafFilterGroup);
}

if (!window.customElements.get(OafMask.tag)) {
	window.customElements.define(OafMask.tag, OafMask);
}
