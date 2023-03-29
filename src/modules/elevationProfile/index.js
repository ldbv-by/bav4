import './i18n';
import { ElevationProfile } from './components/panel/ElevationProfile';
import { ElevationProfileChip } from './components/assistChip/ElevationProfileChip';

if (!window.customElements.get(ElevationProfile.tag)) {
	window.customElements.define(ElevationProfile.tag, ElevationProfile);
}
if (!window.customElements.get(ElevationProfileChip.tag)) {
	window.customElements.define(ElevationProfileChip.tag, ElevationProfileChip);
}
