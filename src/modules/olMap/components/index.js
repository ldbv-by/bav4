import { OlMap } from './OlMap';
import { BaOverlay } from './BaOverlay';
import { MeasurementOverlay } from './MeasurementOverlay';
if (!window.customElements.get(OlMap.tag)) {
	window.customElements.define(OlMap.tag, OlMap);
}
if (!window.customElements.get(BaOverlay.tag)) {
	window.customElements.define(BaOverlay.tag, BaOverlay);
}
if (!window.customElements.get(MeasurementOverlay.tag)) {
	window.customElements.define(MeasurementOverlay.tag, MeasurementOverlay);
}
