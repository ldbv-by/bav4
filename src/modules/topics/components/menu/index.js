import { TopicsContentPanel } from './TopicsContentPanel';
if (!window.customElements.get(TopicsContentPanel.tag)) {
	window.customElements.define(TopicsContentPanel.tag, TopicsContentPanel);
}