import { LegendContent } from './LegendContent';
if (!window.customElements.get(LegendContent.tag)) {
	window.customElements.define(LegendContent.tag, LegendContent);
}
