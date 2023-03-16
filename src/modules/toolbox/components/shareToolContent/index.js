import { ShareToolContent } from './ShareToolContent';

if (!window.customElements.get(ShareToolContent.tag)) {
	window.customElements.define(ShareToolContent.tag, ShareToolContent);
}
