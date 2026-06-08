import { CsMap } from './CsMap';

if (!window.customElements.get(CsMap.tag)) {
	window.customElements.define(CsMap.tag, CsMap);
}
