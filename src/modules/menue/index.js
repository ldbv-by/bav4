import { SidePanel } from './components/sidePanel/SidePanel';
if (!window.customElements.get(SidePanel.tag)) {
	window.customElements.define(SidePanel.tag, SidePanel);
}