import { ExportDialogContent } from './dialog/ExportDialogContent';
import { ExportVectorDataChip } from './assistChip/ExportVectorDataChip';
import { ExportItem } from './dialog/ExportItem';

if (!window.customElements.get(ExportDialogContent.tag)) {
	window.customElements.define(ExportDialogContent.tag, ExportDialogContent);
}

if (!window.customElements.get(ExportVectorDataChip.tag)) {
	window.customElements.define(ExportVectorDataChip.tag, ExportVectorDataChip);
}

if (!window.customElements.get(ExportItem.tag)) {
	window.customElements.define(ExportItem.tag, ExportItem);
}
