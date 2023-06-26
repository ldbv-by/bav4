import { SharePositionChip } from './assistChip/SharePositionChip';
import { ShareDialogContent } from './dialog/ShareDialogContent';
import { ShareDataChip } from './assistChip/ShareDataChip';

if (!window.customElements.get(SharePositionChip.tag)) {
	window.customElements.define(SharePositionChip.tag, SharePositionChip);
}

if (!window.customElements.get(ShareDialogContent.tag)) {
	window.customElements.define(ShareDialogContent.tag, ShareDialogContent);
}

if (!window.customElements.get(ShareDataChip.tag)) {
	window.customElements.define(ShareDataChip.tag, ShareDataChip);
}
