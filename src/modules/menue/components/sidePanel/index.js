import { SidePanel } from './SidePanel';
if (!window.customElements.get(SidePanel.tag)) {
	window.customElements.define(SidePanel.tag, SidePanel);
}