import './i18n';
import './components/iframeGenerator';
import { NonEmbeddedHint } from './components/NonEmbeddedHint';
import { ViewLargerMapChip } from './components/viewLargerMapChip/ViewLargerMapChip';
if (!window.customElements.get(NonEmbeddedHint.tag)) {
	window.customElements.define(NonEmbeddedHint.tag, NonEmbeddedHint);
}
if (!window.customElements.get(ViewLargerMapChip.tag)) {
	window.customElements.define(ViewLargerMapChip.tag, ViewLargerMapChip);
}
