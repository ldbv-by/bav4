import './i18n';
import './components/iframeGenerator';
import { NonEmbeddedHint } from './components/NonEmbeddedHint';
import { ViewLargeMapChip } from './components/viewLargeMapChip/ViewLargeMapChip';
if (!window.customElements.get(NonEmbeddedHint.tag)) {
	window.customElements.define(NonEmbeddedHint.tag, NonEmbeddedHint);
}
if (!window.customElements.get(ViewLargeMapChip.tag)) {
	window.customElements.define(ViewLargeMapChip.tag, ViewLargeMapChip);
}
