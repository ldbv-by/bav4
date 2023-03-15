import { ShareButton } from './ShareButton';

if (!window.customElements.get(ShareButton.tag)) {
	window.customElements.define(ShareButton.tag, ShareButton);
}
