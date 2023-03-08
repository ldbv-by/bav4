import './i18n';
import { ChipsContainer } from './components/chipsContainer/ChipsContainer';
import { ElevationProfileChip } from './components/assistChips/ElevationProfileChip';
import { ViewLargeMapChip } from './components/assistChips/ViewLargeMapChip';
if (!window.customElements.get(ChipsContainer.tag)) {
	window.customElements.define(ChipsContainer.tag, ChipsContainer);
}
if (!window.customElements.get(ElevationProfileChip.tag)) {
	window.customElements.define(ElevationProfileChip.tag, ElevationProfileChip);
}
if (!window.customElements.get(ViewLargeMapChip.tag)) {
	window.customElements.define(ViewLargeMapChip.tag, ViewLargeMapChip);
}
