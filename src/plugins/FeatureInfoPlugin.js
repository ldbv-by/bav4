import { observe } from '../utils/storeUtils';
import { BaPlugin } from '../plugins/BaPlugin';
import { addFeatureInfoItems, clearFeatureInfoItems, updateCoordinate } from '../store/featureInfo/featureInfo.action';
import { TabIndex } from '../store/mainMenu/mainMenu.action';
import { $injector } from '../injection';
import { emitNotification, LevelTypes } from '../store/notifications/notifications.action';
import { provide as provider } from './i18n/featureInfoPlugin.provider';

/**
 * @class
 * @author taulinger
 */
export class FeatureInfoPlugin extends BaPlugin {

	constructor() {
		super();
		const { FeatureInfoService: featureInfoService, MapService: mapService, TranslationService: translationService }
			= $injector.inject('FeatureInfoService', 'MapService', 'TranslationService');
		this._featureInfoService = featureInfoService;
		this._mapService = mapService;
		this._translationService = translationService;
		translationService.register('featureInfoPluginProvider', provider);
	}

	/**
	 * @override
	 * @param {Store} store
	 */
	async register(store) {

		const onPointerClick = async (evt, state) => {
			const { payload: { coordinate } } = evt;
			clearFeatureInfoItems();
			updateCoordinate(coordinate);
			const resolution = this._mapService.calcResolution(state.position.zoom, coordinate);

			// call FeatureInfoService
			[...state.layers.active]
				.forEach(async layerProperties => {
					try {
						const featureInfoResult = await this._featureInfoService.get(layerProperties.geoResourceId, coordinate, resolution);
						if (featureInfoResult) {
							const title = featureInfoResult.title || layerProperties.label;
							addFeatureInfoItems({ title: title, content: featureInfoResult.content });
						}
					}
					catch (error) {
						console.warn(error);
						emitNotification(`${layerProperties.label}: ${this._translationService.translate('featureInfoPlugin_featureInfoService_exception')}`, LevelTypes.WARN);
					}
				});
		};

		const onTabIndexChanged = (tabIndex) => {
			if (tabIndex !== TabIndex.FEATUREINFO) {
				clearFeatureInfoItems();
			}
		};

		observe(store, state => state.pointer.click, onPointerClick);
		observe(store, store => store.mainMenu.tabIndex, onTabIndexChanged, false);
	}
}
