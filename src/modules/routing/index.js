import './i18n';
import { RoutingPanel } from './components/routingPanel/RoutingPanel';
import { CategoryBar } from './components/categoryBar/CategoryBar';
import { FeedbackBanner } from './components/feedbackBanner/FeedbackBanner';
if (!window.customElements.get(RoutingPanel.tag)) {
	window.customElements.define(RoutingPanel.tag, RoutingPanel);
}
if (!window.customElements.get(CategoryBar.tag)) {
	window.customElements.define(CategoryBar.tag, CategoryBar);
}
if (!window.customElements.get(FeedbackBanner.tag)) {
	window.customElements.define(FeedbackBanner.tag, FeedbackBanner);
}
