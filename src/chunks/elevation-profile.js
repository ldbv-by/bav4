/**
 * This file just defines all dependencies for the chunk "elevation-profile"
 */
import { ElevationProfile } from '../modules/elevationProfile/components/panel/ElevationProfile';

if (!window.customElements.get(ElevationProfile.tag)) {
	window.customElements.define(ElevationProfile.tag, ElevationProfile);
}
