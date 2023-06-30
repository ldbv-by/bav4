import './i18n';
import { ElevationProfileChip } from './components/assistChip/ElevationProfileChip';
if (!window.customElements.get(ElevationProfileChip.tag)) {
	window.customElements.define(ElevationProfileChip.tag, ElevationProfileChip);
}
