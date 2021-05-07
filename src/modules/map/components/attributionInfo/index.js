import { AttributionInfo } from './AttributionInfo';
if (!window.customElements.get(AttributionInfo.tag)) {
	window.customElements.define(AttributionInfo.tag, AttributionInfo);
}
