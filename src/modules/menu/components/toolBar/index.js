import { ToolBar } from './ToolBar';
if (!window.customElements.get(ToolBar.tag)) {
	window.customElements.define(ToolBar.tag, ToolBar);
}
