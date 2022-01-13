import { MainMenu } from './MainMenu';
import { MapsContentPanel } from './content/maps/MapsContentPanel';
import { MoreContentPanel } from './content/more/MoreContentPanel';
if (!window.customElements.get(MainMenu.tag)) {
	window.customElements.define(MainMenu.tag, MainMenu);
}
if (!window.customElements.get(MapsContentPanel.tag)) {
	window.customElements.define(MapsContentPanel.tag, MapsContentPanel);
}
if (!window.customElements.get(MoreContentPanel.tag)) {
	window.customElements.define(MoreContentPanel.tag, MoreContentPanel);
}
