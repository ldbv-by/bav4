import { ImportWmsDialogContent } from './ImportWmsDialogContent';

if (!window.customElements.get(ImportWmsDialogContent.tag)) {
	window.customElements.define(ImportWmsDialogContent.tag, ImportWmsDialogContent);
}
