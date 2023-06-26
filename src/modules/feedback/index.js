import './i18n';
import { MapFeedbackPanel } from './components/mapFeedback/MapFeedbackPanel';
import { ToggleFeedbackPanel } from './components/toggleFeedback/ToggleFeedbackPanel';
import { GeneralFeedbackPanel } from './components/generalFeedback/GeneralFeedbackPanel';
import { LikertItemRatingPanel } from './components/rating/LikertItemRatingPanel';
import { MapFeedbackChip } from './components/assistChip/MapFeedbackChip';

if (!window.customElements.get(MapFeedbackPanel.tag)) {
	window.customElements.define(MapFeedbackPanel.tag, MapFeedbackPanel);
}

if (!window.customElements.get(ToggleFeedbackPanel.tag)) {
	window.customElements.define(ToggleFeedbackPanel.tag, ToggleFeedbackPanel);
}

if (!window.customElements.get(GeneralFeedbackPanel.tag)) {
	window.customElements.define(GeneralFeedbackPanel.tag, GeneralFeedbackPanel);
}

if (!window.customElements.get(LikertItemRatingPanel.tag)) {
	window.customElements.define(LikertItemRatingPanel.tag, LikertItemRatingPanel);
}

if (!window.customElements.get(MapFeedbackChip.tag)) {
	window.customElements.define(MapFeedbackChip.tag, MapFeedbackChip);
}
