import './i18n';
import { MapFeedbackPanel } from './components/mapFeedback/MapFeedbackPanel';
import { ToggleFeedbackPanel } from './components/toggleFeedback/ToggleFeedbackPanel';

if (!window.customElements.get(MapFeedbackPanel.tag)) {
	window.customElements.define(MapFeedbackPanel.tag, MapFeedbackPanel);
}

if (!window.customElements.get(ToggleFeedbackPanel.tag)) {
	window.customElements.define(ToggleFeedbackPanel.tag, ToggleFeedbackPanel);
}
