import { ScaleLine } from './ScaleLine';
if (!window.customElements.get(ScaleLine.tag)) {
	window.customElements.define(ScaleLine.tag, ScaleLine);
}