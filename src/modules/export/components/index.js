import { ExportDialogContent } from './dialog/ExportDialogContent';
import { ExportItem } from './dialog/ExportItem';

if (!window.customElements.get(ExportDialogContent.tag)) {
	window.customElements.define(ExportDialogContent.tag, ExportDialogContent);
}

if (!window.customElements.get(ExportItem.tag)) {
	window.customElements.define(ExportItem.tag, ExportItem);
}
