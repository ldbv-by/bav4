import { ContentPanel } from './ContentPanel';
if (!window.customElements.get(ContentPanel.tag)) {
	window.customElements.define(ContentPanel.tag, ContentPanel);
}