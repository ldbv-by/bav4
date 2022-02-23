import { MainMenu } from './MainMenu';
import { MapsContentPanel } from './content/maps/MapsContentPanel';
import { MiscContentPanel } from './content/misc/MiscContentPanel';
if (!window.customElements.get(MainMenu.tag)) {
	window.customElements.define(MainMenu.tag, MainMenu);
}
if (!window.customElements.get(MapsContentPanel.tag)) {
	window.customElements.define(MapsContentPanel.tag, MapsContentPanel);
}
if (!window.customElements.get(MiscContentPanel.tag)) {
	window.customElements.define(MiscContentPanel.tag, MiscContentPanel);
}
