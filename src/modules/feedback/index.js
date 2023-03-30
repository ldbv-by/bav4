import { MapFeedbackPanel } from './components/mapFeedback/MapFeedbackPanel';

if (!window.customElements.get(MapFeedbackPanel.tag)) {
	window.customElements.define(MapFeedbackPanel.tag, MapFeedbackPanel);
}
