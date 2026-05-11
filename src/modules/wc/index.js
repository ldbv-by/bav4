import { PublicWebComponent } from './components/PublicWebComponent';

if (!window.customElements.get(PublicWebComponent.tag)) {
	window.customElements.define(PublicWebComponent.tag, PublicWebComponent);
}
