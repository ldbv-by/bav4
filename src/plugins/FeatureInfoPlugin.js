/**
 * @module plugins/FeatureInfoPlugin
 */
import { observe } from '../utils/storeUtils';
import { BaPlugin } from '../plugins/BaPlugin';
import { abortOrReset, addFeatureInfoItems, registerQuery, resolveQuery, startRequest } from '../store/featureInfo/featureInfo.action';
import { $injector } from '../injection';
import { emitNotification, LevelTypes } from '../store/notifications/notifications.action';
import { createUniqueId } from '../utils/numberUtils';

/**
 * Causes a server-side FeatureInfo detection for Raster sources.
 * Detection for vector sources is done within a mapping framework-specific handler.
 * @class
 * @author taulinger
 */
export class FeatureInfoPlugin extends BaPlugin {
	constructor() {
		super();
		const {
			FeatureInfoService: featureInfoService,
			MapService: mapService,
			TranslationService: translationService,
			GeoResourceService: geoResourceService
		} = $injector.inject('FeatureInfoService', 'MapService', 'TranslationService', 'GeoResourceService');
		this._featureInfoService = featureInfoService;
		this._mapService = mapService;
		this._translationService = translationService;
		this._geoResourceService = geoResourceService;
	}

	/**
	 * @override
	 * @param {Store} store
	 */
	async register(store) {
		const onPointerClick = async (evt, state) => {
			if (!state.featureInfo.querying) {
				const {
					payload: { coordinate }
				} = evt;
				startRequest(coordinate);
				const resolution = this._mapService.calcResolution(state.position.zoom, coordinate);
				//use only visible and unhidden layers
				const layerFilter = (layerProperties) => layerProperties.visible && !layerProperties.constraints.hidden;

				// call FeatureInfoService
				[...state.layers.active].filter(layerFilter).forEach(async (layerProperties) => {
					const geoRes = this._geoResourceService.byId(layerProperties.geoResourceId);
					const queryId = createUniqueId();
					try {
						registerQuery(queryId);
						const featureInfoResult = await this._featureInfoService.get(layerProperties.geoResourceId, coordinate, resolution);
						if (featureInfoResult) {
							const title = featureInfoResult.title || geoRes.label;
							addFeatureInfoItems({ title: title, content: featureInfoResult.content });
						}
					} catch (error) {
						console.error(error);
						emitNotification(`${geoRes.label}: ${this._translationService.translate('global_featureInfoService_exception')}`, LevelTypes.ERROR);
					} finally {
						resolveQuery(queryId);
					}
				});
			}
		};

		const onToolChange = (toolId) => {
			if (toolId) {
				abortOrReset();
			}
		};
		observe(store, (state) => state.pointer.click, onPointerClick);
		observe(store, (state) => state.tools.current, onToolChange);
	}
}
