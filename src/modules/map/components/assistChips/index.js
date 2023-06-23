import { SharePositionChip } from './SharePositionChip';
import { MapFeedbackChip } from './MapFeedbackChip';
if (!window.customElements.get(SharePositionChip.tag)) {
	window.customElements.define(SharePositionChip.tag, SharePositionChip);
}
if (!window.customElements.get(MapFeedbackChip.tag)) {
	window.customElements.define(MapFeedbackChip.tag, MapFeedbackChip);
}
