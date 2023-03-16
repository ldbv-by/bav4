import { ShareDialogContent } from './dialog/ShareDialogContent';
import { ShareStoredDataChip } from './assistChip/ShareStoredDataChip';

if (!window.customElements.get(ShareDialogContent.tag)) {
	window.customElements.define(ShareDialogContent.tag, ShareDialogContent);
}

if (!window.customElements.get(ShareStoredDataChip.tag)) {
	window.customElements.define(ShareStoredDataChip.tag, ShareStoredDataChip);
}
