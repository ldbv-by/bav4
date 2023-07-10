import './i18n';
import { ElevationProfileChip } from './components/assistChip/ElevationProfileChip';
if (!window.customElements.get(ElevationProfileChip.tag)) {
	window.customElements.define(ElevationProfileChip.tag, ElevationProfileChip);
}
// Note: ElevationProfile is omitted here, because the component will be provided by its own chunk (see .src/chunks/elevation-profile.js)
