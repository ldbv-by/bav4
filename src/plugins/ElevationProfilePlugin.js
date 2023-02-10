import { html } from 'lit-html';
import { closeBottomSheet, openBottomSheet } from '../store/bottomSheet/bottomSheet.action';
import { closeProfile } from '../store/elevationProfile/elevationProfile.action';
import { observe } from '../utils/storeUtils';
import { BaPlugin } from './BaPlugin';

/**
 * This plugin observes the 'active' property of the elevationProfile slice-of-state and shows/hides
 * the BottomSheet component containing the current elevation profile.
 * @class
 * @author taulinger
 */
export class ElevationProfilePlugin extends BaPlugin {

	constructor() {
		super();
		this._bottomSheetUnsubscribeFn = null;
	}

	/**
	 * @override
	 * @param {Store} store
	 */
	async register(store) {

		// we also want to close the ElevationProfile when the BottomSheet was closed
		const onBottomSheetActiveStateChanged = active => {
			if (!active) {
				closeProfile();
			}
		};

		const onProfileActiveStateChanged = active => {
			if (active) {
				this._bottomSheetUnsubscribeFn = observe(store, state => state.bottomSheet.active, onBottomSheetActiveStateChanged);
				openBottomSheet(html`<ba-elevation-profile></ba-elevation-profile>`);
			}
			else {
				closeBottomSheet();
				this._bottomSheetUnsubscribeFn?.();
			}
		};

		observe(store, state => state.elevationProfile.active, onProfileActiveStateChanged, false);
	}
}
