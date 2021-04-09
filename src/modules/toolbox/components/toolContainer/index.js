import { ToolContainer } from './ToolContainer';
import { DrawToolContent } from './DrawToolContent';
import { MeasureToolContent } from './MeasureToolContent';
if (!window.customElements.get(ToolContainer.tag)) {
	window.customElements.define(ToolContainer.tag, ToolContainer);
}
if (!window.customElements.get(DrawToolContent.tag)) {
	window.customElements.define(DrawToolContent.tag, DrawToolContent);
}
if (!window.customElements.get(MeasureToolContent.tag)) {
	window.customElements.define(MeasureToolContent.tag, MeasureToolContent);
}