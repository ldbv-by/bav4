import { ElevationProfileChip } from './ElevationProfileChip';
import { ExportVectorDataChip } from './ExportVectorDataChip';
if (!window.customElements.get(ElevationProfileChip.tag)) {
	window.customElements.define(ElevationProfileChip.tag, ElevationProfileChip);
}

if (!window.customElements.get(ExportVectorDataChip.tag)) {
	window.customElements.define(ExportVectorDataChip.tag, ExportVectorDataChip);
}
