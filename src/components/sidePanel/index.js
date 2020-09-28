import { SidePanelElement } from './SidePanelElement';
if (!window.customElements.get(SidePanelElement.tag)) {
	window.customElements.define(SidePanelElement.tag, SidePanelElement);
}