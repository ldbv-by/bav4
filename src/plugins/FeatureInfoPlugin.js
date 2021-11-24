import { observe } from '../utils/storeUtils';
import { BaPlugin } from '../plugins/BaPlugin';
import { addFeatureInfoItems, registerQueryFor, unregisterQueryFor, startRequest } from '../store/featureInfo/featureInfo.action';
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
			// clearFeatureInfoItems();
			startRequest(coordinate);
			const resolution = this._mapService.calcResolution(state.position.zoom, coordinate);
			//use only visible and unhidden layers
			const layerFilter = layerProperties => layerProperties.visible && !layerProperties.constraints.hidden;

			// call FeatureInfoService
			[...state.layers.active]
				.filter(layerFilter)
				.forEach(async layerProperties => {
					const geoResourceId = layerProperties.geoResourceId;
					try {
						registerQueryFor(geoResourceId);
						const featureInfoResult = await this._featureInfoService.get(geoResourceId, coordinate, resolution);
						if (featureInfoResult) {
							const title = featureInfoResult.title || layerProperties.label;
							addFeatureInfoItems({ title: title, content: featureInfoResult.content });
						}
					}
					catch (error) {
						console.warn(error);
						emitNotification(`${layerProperties.label}: ${this._translationService.translate('featureInfoPlugin_featureInfoService_exception')}`, LevelTypes.WARN);
					}
					finally {
						unregisterQueryFor(geoResourceId);
					}
				});
		};


		observe(store, state => state.pointer.click, onPointerClick);
	}
}
