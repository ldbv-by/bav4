import { ElevationProfileChip } from './ElevationProfileChip';
import { ExportVectorDataChip } from './ExportVectorDataChip';
import { MapFeedbackChip } from './MapFeedbackChip';
import { RoutingChip } from './RoutingChip';
import { ShareDataChip } from './ShareDataChip';
import { SharePositionChip } from './SharePositionChip';

if (!window.customElements.get(ElevationProfileChip.tag)) {
	window.customElements.define(ElevationProfileChip.tag, ElevationProfileChip);
}

if (!window.customElements.get(ExportVectorDataChip.tag)) {
	window.customElements.define(ExportVectorDataChip.tag, ExportVectorDataChip);
}

if (!window.customElements.get(MapFeedbackChip.tag)) {
	window.customElements.define(MapFeedbackChip.tag, MapFeedbackChip);
}

if (!window.customElements.get(RoutingChip.tag)) {
	window.customElements.define(RoutingChip.tag, RoutingChip);
}

if (!window.customElements.get(ShareDataChip.tag)) {
	window.customElements.define(ShareDataChip.tag, ShareDataChip);
}

if (!window.customElements.get(SharePositionChip.tag)) {
	window.customElements.define(SharePositionChip.tag, SharePositionChip);
}
