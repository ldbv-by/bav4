import { ToolContainer as ToolContainer } from './ToolContainer';
if (!window.customElements.get(ToolContainer.tag)) {
	window.customElements.define(ToolContainer.tag, ToolContainer);
}