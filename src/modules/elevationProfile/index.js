import './i18n';
import { ElevationProfile } from './components/ElevationProfile';

if (!window.customElements.get(ElevationProfile.tag)) {
	window.customElements.define(ElevationProfile.tag, ElevationProfile);
}
