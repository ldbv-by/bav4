import { ViewContainer } from './ViewContainer';
if (!window.customElements.get(ViewContainer.tag)) {
	window.customElements.define(ViewContainer.tag, ViewContainer);
}
