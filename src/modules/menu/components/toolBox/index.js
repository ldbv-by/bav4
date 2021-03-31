import { ToolBox } from './ToolBox';
if (!window.customElements.get(ToolBox.tag)) {
	window.customElements.define(ToolBox.tag, ToolBox);
}