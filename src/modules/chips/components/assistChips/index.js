import { ElevationProfileChip } from './ElevationProfileChip';
import { ExportVectorDataChip } from './ExportVectorDataChip';
import { MapFeedbackChip } from './MapFeedbackChip';

if (!window.customElements.get(ElevationProfileChip.tag)) {
	window.customElements.define(ElevationProfileChip.tag, ElevationProfileChip);
}

if (!window.customElements.get(ExportVectorDataChip.tag)) {
	window.customElements.define(ExportVectorDataChip.tag, ExportVectorDataChip);
}

if (!window.customElements.get(MapFeedbackChip.tag)) {
	window.customElements.define(MapFeedbackChip.tag, MapFeedbackChip);
}
