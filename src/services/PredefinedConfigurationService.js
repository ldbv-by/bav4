/**
 * @module services/PredefinedConfigurationService
 */
import { $injector } from '../injection/index';
import { addLayerIfNotPresent, modifyLayer, SwipeAlignment } from '../store/layers/layers.action';
import { openSlider } from '../store/timeTravel/timeTravel.action';
import { cloneAndAddLayer } from '../store/layers/layers.action';
import { openModal } from '../store/modal/modal.action';
import { html } from 'lit-html';
import { Tools } from '../domain/tools';
import { createUniqueId } from '../utils/numberUtils';

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
	constructor() {
		const { StoreService: storeService, TranslationService: translationService } = $injector.inject(
			'StoreService',
			'TopicsService',
			'TranslationService'
		);
		this.#storeService = storeService;
		this.#translationService = translationService;
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
		const {
			tools: { current }
		} = this.#storeService.getStore().getState();
		if (activeLayerCount === 1 && current !== Tools.COMPARE) {
			const layer = this.#storeService.getStore().getState().layers.active[0];
			modifyLayer(layer.id, { swipeAlignment: SwipeAlignment.NOT_SET });
			cloneAndAddLayer(layer.id, `${layer.geoResourceId}_${createUniqueId()}`, { zIndex: layer.zIndex + 1 });
			openModal(translate('map_layerSwipeSlider_modal_title'), html`<ba-layer-swipe-modal></ba-layer-swipe-modal>`);
		}
	}
}
