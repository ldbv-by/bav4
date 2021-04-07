import { ToolContainer } from './ToolContainer';
import { DrawToolContent } from './DrawToolContent';
if (!window.customElements.get(ToolContainer.tag)) {
	window.customElements.define(ToolContainer.tag, ToolContainer);
}
if (!window.customElements.get(DrawToolContent.tag)) {
	window.customElements.define(DrawToolContent.tag, DrawToolContent);
}