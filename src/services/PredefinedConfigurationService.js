/**
 * @module services/PredefinedConfigurationService
 */
import { $injector } from '../injection/index';
import { addLayer, addLayerIfNotPresent, modifyLayer, SwipeAlignment } from '../store/layers/layers.action';
import { openSlider } from '../store/timeTravel/timeTravel.action';
import { openModal } from '../store/modal/modal.action';
import { html } from 'lit-html';
import { Tools } from '../domain/tools';
import { createUniqueId } from '../utils/numberUtils';
import { observe } from '@src/utils/storeUtils';

/**
 * Service that can be called to put the application in a specific and customized configuration e.g. display certain GeoResources, open a specific component.
 *
 * Note: It's important not to misuse this service as a replacement for a {@link BaPlugin}.
 * @author taulinger
 * @interface PredefinedConfigurationService
 */

/**
 * Executes a specific task to achieve a certain configuration.
 * @function
 * @name PredefinedConfigurationService#apply
 * @param {PredefinedConfiguration} action
 */

/**
 * Enum of all available predefined configurations.
 * @readonly
 * @enum {String}
 */
export const PredefinedConfiguration = Object.freeze({
	DISPLAY_TIME_TRAVEL: 'display_time_travel',
	ADD_SECOND_LAYER_DIALOG: 'add_second_layer_dialog'
});

/**
 * BVV implementation of{@link PredefinedConfigurationService}
 * @class
 * @implements {module:services/PredefinedConfigurationService~PredefinedConfigurationService}
 */
export class BvvPredefinedConfigurationService {
	#storeService;
	#translationService;
	#topicsService;
	constructor() {
		const {
			StoreService: storeService,
			TopicsService: topicsService,
			TranslationService: translationService
		} = $injector.inject('StoreService', 'TopicsService', 'TranslationService');
		this.#storeService = storeService;
		this.#translationService = translationService;
		this.#topicsService = topicsService;
	}
	apply(task) {
		switch (task) {
			case PredefinedConfiguration.DISPLAY_TIME_TRAVEL:
				this._displayTimeTravel();
				break;
			case PredefinedConfiguration.ADD_SECOND_LAYER_DIALOG:
				this._addSecondLayerOpenModal();
				break;
		}
	}

	_displayTimeTravel() {
		const timeTravelGeoResourceId = 'zeitreihe_tk';
		addLayerIfNotPresent(timeTravelGeoResourceId);
		this.#storeService
			.getStore()
			.getState()
			.layers.active.forEach((l) => {
				if (l.geoResourceId === timeTravelGeoResourceId) {
					modifyLayer(l.id, { visible: true });
				}
			});
		openSlider();
	}

	_addSecondLayerOpenModal() {
		const translate = (key) => this.#translationService.translate(key);

		const activeLayerCount = this.#storeService.getStore().getState().layers.active.length;
		const currentTool = this.#storeService.getStore().getState().tools.current;
		if (activeLayerCount === 1 && currentTool !== Tools.COMPARE) {
			const allBaseGeoResourceIds = Array.from(new Set(Object.values(this.#topicsService.default().baseGeoRs).flat()));
			const initialLayer0 = this.#storeService.getStore().getState().layers.active[0];

			/**
			 * We want the layer selected via the modal to always be positioned above the existing layer (initialLayer0) and displayed on the LEFT side.
			 * Therefore we wait until the modal window is closed.
			 */
			const onModalClosed = () => {
				// initialLayer0 is a base layer
				if (allBaseGeoResourceIds.includes(initialLayer0.geoResourceId)) {
					addLayer(`${initialLayer0.geoResourceId}_${createUniqueId()}`, {
						zIndex: 0,
						geoResourceId: initialLayer0.geoResourceId
					});
					modifyLayer(this.#storeService.getStore().getState().layers.active[1].id, { swipeAlignment: SwipeAlignment.LEFT });
				}
				// initialLayer0 is NOT a base layer
				else {
					// check if a layer was added
					if (this.#storeService.getStore().getState().layers.active[1]) {
						modifyLayer(this.#storeService.getStore().getState().layers.active[1].id, { swipeAlignment: SwipeAlignment.NOT_SET });
						modifyLayer(this.#storeService.getStore().getState().layers.active[0].id, { zIndex: 1, swipeAlignment: SwipeAlignment.LEFT });
					}
				}
				unsubscribe();
			};

			openModal(translate('map_layerSwipeSlider_modal_title'), html`<ba-layer-swipe-modal></ba-layer-swipe-modal>`);

			const unsubscribe = observe(
				this.#storeService.getStore(),
				(state) => state.modal,
				() => onModalClosed()
			);
		}
	}
}
