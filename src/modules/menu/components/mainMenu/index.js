import { MainMenu } from './MainMenu';
import { MapsContentPanel } from './content/maps/MapsContentPanel';
import { BvvMiscContentPanel } from './content/misc/BvvMiscContentPanel';
import { RoutingPanel } from './content/routing/RoutingPanel';
if (!window.customElements.get(MainMenu.tag)) {
	window.customElements.define(MainMenu.tag, MainMenu);
}
if (!window.customElements.get(MapsContentPanel.tag)) {
	window.customElements.define(MapsContentPanel.tag, MapsContentPanel);
}
if (!window.customElements.get(BvvMiscContentPanel.tag)) {
	window.customElements.define(BvvMiscContentPanel.tag, BvvMiscContentPanel);
}
if (!window.customElements.get(RoutingPanel.tag)) {
	window.customElements.define(RoutingPanel.tag, RoutingPanel);
}
