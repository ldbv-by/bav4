import { ShareDialogContent } from './shareDialogContent/ShareDialogContent';

if (!window.customElements.get(ShareDialogContent.tag)) {
	window.customElements.define(ShareDialogContent.tag, ShareDialogContent);
}
