import './i18n';
import './components';
import { BaOverlay } from './BaOverlay';
if (!window.customElements.get(BaOverlay.tag)) {
	window.customElements.define(BaOverlay.tag, BaOverlay);
}
