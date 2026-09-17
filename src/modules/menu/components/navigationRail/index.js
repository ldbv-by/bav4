import { NavigationRail } from './NavigationRail';
if (!window.customElements.get(NavigationRail.tag)) {
	window.customElements.define(NavigationRail.tag, NavigationRail);
}
import { FullscreenProvider } from './FullscreenProvider';
if (!window.customElements.get(FullscreenProvider.tag)) {
	window.customElements.define(FullscreenProvider.tag, FullscreenProvider);
}
