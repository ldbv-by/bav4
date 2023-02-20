import './i18n';
import { NonEmbeddedHint } from './components/NonEmbeddedHint';
import './components/iframeGenerator';
if (!window.customElements.get(NonEmbeddedHint.tag)) {
	window.customElements.define(NonEmbeddedHint.tag, NonEmbeddedHint);
}
