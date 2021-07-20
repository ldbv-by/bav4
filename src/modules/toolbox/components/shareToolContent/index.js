import { ShareToolContent } from './ShareToolContent';
import { ShareToolDialog } from './ShareToolDialog'; 

if (!window.customElements.get(ShareToolContent.tag)) {
	window.customElements.define(ShareToolContent.tag, ShareToolContent);
}

if (!window.customElements.get(ShareToolDialog.tag)) {
	window.customElements.define(ShareToolDialog.tag, ShareToolDialog);
}