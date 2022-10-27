import { Profile } from './components/Profile';
import { ElevationProfile } from './components/ElevationProfile';

if (!window.customElements.get(ElevationProfile.tag)) {
	window.customElements.define(ElevationProfile.tag, ElevationProfile);
}
if (!window.customElements.get(Profile.tag)) {
	window.customElements.define(Profile.tag, Profile);
}
