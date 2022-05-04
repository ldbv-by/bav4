import { OlMap } from './OlMap';
import { BaOverlay } from './BaOverlay';
if (!window.customElements.get(OlMap.tag)) {
	window.customElements.define(OlMap.tag, OlMap);
}
if (!window.customElements.get(BaOverlay.tag)) {
	window.customElements.define(BaOverlay.tag, BaOverlay);
}

