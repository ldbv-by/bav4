import './i18n';
import { NonEmbeddedHint } from './components/NonEmbeddedHint';
if (!window.customElements.get(NonEmbeddedHint.tag)) {
	window.customElements.define(NonEmbeddedHint.tag, NonEmbeddedHint);
}
