import { html } from 'lit-html';
import { closeBottomSheet, openBottomSheet } from '../store/bottomSheet/bottomSheet.action';
import { observe } from '../utils/storeUtils';
import { BaPlugin } from './BaPlugin';

/**
 * This plugin observes the 'active' property of the elevationProfile slice-of-state and shows/hides
 * the BottomSheet component containing the current elevation profile.
 * @class
 * @author taulinger
 */
export class ElevationProfilePlugin extends BaPlugin {

	/**
	 * @override
	 * @param {Store} store
	 */
	async register(store) {

		const onChange = active => {
			if (active) {
				openBottomSheet(html`<ba-elevation-profile></ba-elevation-profile>`);
			}
			else {
				closeBottomSheet();
			}
		};

		observe(store, state => state.altitudeProfile.active, onChange);
	}
}
