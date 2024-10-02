/**
 * @module plugins/TimeTravelPlugin
 */
import { observe } from '../utils/storeUtils';
import { modifyLayer } from '../store/layers/layers.action';
import { BaPlugin } from './BaPlugin';
import { closeBottomSheet, openBottomSheet } from '../store/bottomSheet/bottomSheet.action';
import { html } from 'lit-html';
import { closeSlider, openSlider } from '../store/timeTravel/timeTravel.action';
import { $injector } from '../injection/index';

/**
 * This plugin does the following time travel related things:
 *
 * - detect if the time travel slider should be visible
 *
 * - update the timestamp property of all suitable layers the timestamp property of the timeTravel s-o-s changes
 *
 *
 * Note: This plugin must be registered **before** the `LayersPlugin`
 * @class
 * @author taulinger
 */
export class TimeTravelPlugin extends BaPlugin {
	#currentSuitableGeoResourceId = null;
	#environmentService;

	constructor() {
		super();
		const { EnvironmentService: environmentService } = $injector.inject('EnvironmentService');
		this.#environmentService = environmentService;
	}

	/**
	 * @override
	 */
	async register(store) {
		const findSuitableLayers = (layers) => {
			return layers.filter((l) => l.visible).filter((l) => l.timestamp);
		};

		const onLayersChanged = (activeLayers) => {
			if (!this.#environmentService.isEmbedded()) {
				/**
				 * Check if we have one or more layers referencing the same timestamp
				 * and check if they reference all the same GeoResource.
				 * Only in that case we show the time travel component.
				 */
				const timestampSet = new Set(findSuitableLayers(activeLayers).map((l) => l.timestamp));
				const geoResourceSet = new Set(findSuitableLayers(activeLayers).map((l) => l.geoResourceId));

				if (timestampSet.size === 1 && geoResourceSet.size === 1) {
					this.#currentSuitableGeoResourceId = [...geoResourceSet][0];
					openSlider([...timestampSet][0]);
				} else {
					this.#currentSuitableGeoResourceId = null;
					closeSlider();
				}
			}
		};

		/**
		 *  Update the timestamp property of each suitable layer
		 */
		const onTimestampChanged = (timestamp, state) => {
			if (this.#currentSuitableGeoResourceId) {
				findSuitableLayers(state.layers.active)
					.filter((l) => l.geoResourceId === this.#currentSuitableGeoResourceId)
					.forEach((l) => modifyLayer(l.id, { timestamp }));
			}
		};
		/**
		 * Open or close the BottomSheet
		 */
		const onActiveChanged = (active, state) => {
			if (active && this.#currentSuitableGeoResourceId) {
				openBottomSheet(
					html`<ba-time-travel-slider
						.timestamp=${state.timeTravel.timestamp}
						.geoResourceId=${this.#currentSuitableGeoResourceId}
					></ba-time-travel-slider>`,
					TIME_TRAVEL_BOTTOM_SHEET_ID
				);
			} else {
				closeBottomSheet(TIME_TRAVEL_BOTTOM_SHEET_ID);
			}
		};

		observe(
			store,
			(state) => state.layers.active,
			(active) => onLayersChanged(active)
		);
		observe(
			store,
			(state) => state.timeTravel.timestamp,
			(timestamp, state) => onTimestampChanged(timestamp, state)
		);
		observe(
			store,
			(state) => state.timeTravel.active,
			(active, state) => onActiveChanged(active, state)
		);
	}
}

export const TIME_TRAVEL_BOTTOM_SHEET_ID = 'timeTravel';
