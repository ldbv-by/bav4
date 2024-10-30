/**
 * @module plugins/TimeTravelPlugin
 */
import { observe } from '../utils/storeUtils';
import { modifyLayer } from '../store/layers/layers.action';
import { BaPlugin } from './BaPlugin';
import { closeBottomSheet, openBottomSheet } from '../store/bottomSheet/bottomSheet.action';
import { html } from 'lit-html';
import { closeSlider, openSlider, setCurrentTimestamp } from '../store/timeTravel/timeTravel.action';
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
	#timeoutId = null;

	constructor() {
		super();
		const { EnvironmentService: environmentService } = $injector.inject('EnvironmentService');
		this.#environmentService = environmentService;
		this._bottomSheetUnsubscribeFn = null;
	}

	/**
	 * @override
	 */
	async register(store) {
		if (!this.#environmentService.isEmbedded()) {
			const findSuitableLayers = (layers) => {
				return layers.filter((l) => l.visible).filter((l) => l.timestamp);
			};

			const onLayersChanged = (activeLayers) => {
				/**
				 * Check if we have one or more layers referencing the same timestamp
				 * and check if they reference all the same GeoResource.
				 * Only in that case we show the time travel component.
				 */
				const timestampSet = new Set(findSuitableLayers(activeLayers).map((l) => l.timestamp));
				const geoResourceSet = new Set(findSuitableLayers(activeLayers).map((l) => l.geoResourceId));

				if (timestampSet.size === 1 && geoResourceSet.size === 1) {
					this.#currentSuitableGeoResourceId = [...geoResourceSet][0];
					clearTimeout(this.#timeoutId);
					openSlider([...timestampSet][0]);
				} else {
					this.#timeoutId = setTimeout(() => {
						this.#currentSuitableGeoResourceId = null;
						closeSlider();
					}, TimeTravelPlugin.SLIDER_CLOSE_DELAY_MS);
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
					this._bottomSheetUnsubscribeFn = observe(
						store,
						(state) => state.bottomSheet.active,
						(active) => {
							/**
							 * When the time travel bottom sheet is closed, we also want to mark the slider as closed
							 */
							if (!active.includes(TIME_TRAVEL_BOTTOM_SHEET_ID)) {
								closeSlider();
								this._bottomSheetUnsubscribeFn();
							}
						}
					);
				} else {
					closeBottomSheet(TIME_TRAVEL_BOTTOM_SHEET_ID);
					/**
					 * If the slider is set to active but the bottom sheet was not opened we mark the slider as closed
					 */
					closeSlider();
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
	static get SLIDER_CLOSE_DELAY_MS() {
		return 200;
	}
}

export const TIME_TRAVEL_BOTTOM_SHEET_ID = 'timeTravel';
