import { NavigationRail } from './NavigationRail';
if (!window.customElements.get(NavigationRail.tag)) {
	window.customElements.define(NavigationRail.tag, NavigationRail);
}
