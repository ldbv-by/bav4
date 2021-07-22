import { MediaQueryPanel } from './MediaQueryPanel';
if (!window.customElements.get(MediaQueryPanel.tag)) {
	window.customElements.define(MediaQueryPanel.tag, MediaQueryPanel);
}
