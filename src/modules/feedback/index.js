import { FeedbackPanel } from './components/panel/FeedbackPanel';

if (!window.customElements.get(FeedbackPanel.tag)) {
	window.customElements.define(FeedbackPanel.tag, FeedbackPanel);
}
