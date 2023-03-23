import './i18n';
import { IframeGenerator } from './components/generator/IframeGenerator';
import { NonEmbeddedHint } from './components/hint/NonEmbeddedHint';
import { ActivateMapButton } from './components/activateMapButton/ActivateMapButton';
import { ViewLargerMapChip } from './components/viewLargerMapChip/ViewLargerMapChip';
if (!window.customElements.get(IframeGenerator.tag)) {
	window.customElements.define(IframeGenerator.tag, IframeGenerator);
}
if (!window.customElements.get(NonEmbeddedHint.tag)) {
	window.customElements.define(NonEmbeddedHint.tag, NonEmbeddedHint);
}
if (!window.customElements.get(ActivateMapButton.tag)) {
	window.customElements.define(ActivateMapButton.tag, ActivateMapButton);
}
if (!window.customElements.get(ViewLargerMapChip.tag)) {
	window.customElements.define(ViewLargerMapChip.tag, ViewLargerMapChip);
}
