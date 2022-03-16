import './i18n';
import { InitialHints } from './components/InitialHints';
if (!window.customElements.get(InitialHints.tag)) {
	window.customElements.define(InitialHints.tag, InitialHints);
}
