/**
 * @module plugins/TimeTravelPlugin
 */
import { observe } from '../utils/storeUtils';
import { modifyLayer } from '../store/layers/layers.action';
import { BaPlugin } from './BaPlugin';
import { closeBottomSheet, openBottomSheet } from '../store/bottomSheet/bottomSheet.action';
import { html } from 'lit-html';

/**
 * This plugin does the following time travel related things:
 *
 * - detect if the time travel slider should be visible
 *
 * - update the timestamp property of all suitable layers the timestamp property of the timeTravel s-o-s changes
 *
 * @class
 * @author taulinger
 */
export class TimeTravelPlugin extends BaPlugin {
	#currentGeoResourceId = null;

	/**
	 * @override
	 */
	async register(store) {
		const findSuitableLayers = (layers) => {
			return layers.filter((l) => l.visible).filter((l) => l.timestamp);
		};

		const onLayersChanged = (activeLayers) => {
			/**
			 * Check if we have one or more layers referencing the same timestamp
			 * and check if they reference all th same GeoResource.
			 * In that case we show the time travel component
			 */
			const timestampSet = new Set(findSuitableLayers(activeLayers).map((l) => l.timestamp));
			const geoResourceSet = new Set(findSuitableLayers(activeLayers).map((l) => l.geoResourceId));

			if (timestampSet.size === 1 && geoResourceSet.size === 1) {
				this.#currentGeoResourceId = [...geoResourceSet][0];
				// openBottomSheet('Zeitreisee ' + [...timestampSet][0] + ' ' + [...geoResourceSet][0]);
				openBottomSheet(
					html`<ba-time-travel-slider .timestamp=${[...timestampSet][0]} .geoResourceId=${this.#currentGeoResourceId}></ba-time-travel-slider>`
				);
			} else {
				this.#currentGeoResourceId = null;
				closeBottomSheet();
			}
		};

		/**
		 *  Update the timestamp property of each suitable layer
		 */
		const onTimestampChanged = (timestamp, state) => {
			if (this.#currentGeoResourceId) {
				findSuitableLayers(state.layers.active)
					.filter((l) => l.geoResourceId === this.#currentGeoResourceId)
					.forEach((l) => modifyLayer(l.id, { timestamp }));
			}
		};

		observe(
			store,
			(state) => state.layers.active,
			(active) => onLayersChanged(active)
		);
		observe(
			store,
			(state) => state.timeTravel.current,
			(current, state) => onTimestampChanged(current, state)
		);
	}
}
