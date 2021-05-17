import { TopicsContentPanel } from './menu/TopicsContentPanel';
if (!window.customElements.get(TopicsContentPanel.tag)) {
	window.customElements.define(TopicsContentPanel.tag, TopicsContentPanel);
}