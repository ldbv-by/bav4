import './i18n';
import { NonEmbeddedHint } from './components/NonEmbeddedHint';
import { ActivateMapButton } from './components/activateMapButton/ActivateMapButton';
if (!window.customElements.get(NonEmbeddedHint.tag)) {
	window.customElements.define(NonEmbeddedHint.tag, NonEmbeddedHint);
}
if (!window.customElements.get(ActivateMapButton.tag)) {
	window.customElements.define(ActivateMapButton.tag, ActivateMapButton);
}
