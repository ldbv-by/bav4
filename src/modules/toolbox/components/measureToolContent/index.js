import { MeasureToolContent } from './MeasureToolContent';

if (!window.customElements.get(MeasureToolContent.tag)) {
	window.customElements.define(MeasureToolContent.tag, MeasureToolContent);
}
