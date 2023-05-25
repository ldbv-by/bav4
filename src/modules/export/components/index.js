import { ExportDialogContent } from './dialog/ExportDialogContent';

if (!window.customElements.get(ExportDialogContent.tag)) {
	window.customElements.define(ExportDialogContent.tag, ExportDialogContent);
}
