import { ShareDialogContent } from './ShareDialogContent';
import { ShareButton } from './ShareButton';

if (!window.customElements.get(ShareButton.tag)) {
	window.customElements.define(ShareButton.tag, ShareButton);
}

if (!window.customElements.get(ShareDialogContent.tag)) {
	window.customElements.define(ShareDialogContent.tag, ShareDialogContent);
}
