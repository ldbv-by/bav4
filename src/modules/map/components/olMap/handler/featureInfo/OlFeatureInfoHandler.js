import { $injector } from '../../../../../../injection';
import { addFeatureInfoItems, registerQuery, resolveQuery } from '../../../../../../store/featureInfo/featureInfo.action';
import { observe } from '../../../../../../utils/storeUtils';
import { getLayerById } from '../../olMapUtils';
import { OlMapHandler } from '../OlMapHandler';
import { getBvvFeatureInfo } from './featureInfoItem.provider';
import { addHighlightFeatures, HighlightFeatureTypes, HighlightGeometryTypes, removeHighlightFeaturesById } from '../../../../../../store/highlight/highlight.action';
import { FEATURE_INFO_HIGHLIGHT_FEATURE_ID } from '../../../../../../plugins/HighlightPlugin';
import { createUniqueId } from '../../../../../../utils/numberUtils';

/**
 * Amount of time (in ms) query resolution should be delayed.
 */
export const OlFeatureInfoHandler_Query_Resolution_Delay_Ms = 300;
/**
 * MapHandler that publishes FeatureInfo and HighlightFeature items from ol vector sources.
 * @class
 * @author taulinger
 */
export class OlFeatureInfoHandler extends OlMapHandler {

	constructor(featureInfoProvider = getBvvFeatureInfo) {
		super('Feature_Info_Handler');

		const { StoreService: storeService, TranslationService: translationService }
			= $injector.inject('StoreService', 'TranslationService');
		this._featureInfoProvider = featureInfoProvider;
		this._storeService = storeService;
		this._translationService = translationService;
	}

	/**
	 *
	 * @override
	 */
	register(map) {

		const queryId = createUniqueId();
		const translate = (key) => this._translationService.translate(key);
		//find ONE closest feature per layer
		const findOlFeature = (map, pixel, olLayer) => {
			return map.forEachFeatureAtPixel(pixel, feature => feature, { layerFilter: l => l === olLayer }) || null;
		};

		//use only visible and unhidden layers
		const layerFilter = layerProperties => layerProperties.visible && !layerProperties.constraints.hidden;

		observe(this._storeService.getStore(), state => state.featureInfo.coordinate, (coordinate, state) => {

			//remove previous HighlightFeature items
			removeHighlightFeaturesById(FEATURE_INFO_HIGHLIGHT_FEATURE_ID);
			registerQuery(queryId);

			const featureInfoItems = [...state.layers.active]
				.filter(layerFilter)
				//map layerProperties to olLayer (wrapper)
				.map(layerProperties => {
					return { olLayer: getLayerById(map, layerProperties.geoResourceId), layerProperties: layerProperties };
				})
				//map olLayer to olFeature (wrapper)
				.map(olLayerContainer => {
					const { layerProperties: layerProperties, olLayer } = olLayerContainer;
					return { olFeature: findOlFeature(map, map.getPixelFromCoordinate(coordinate.payload), olLayer), layerProperties: layerProperties };
				})
				.filter(olFeatureContainer => !!olFeatureContainer.olFeature)
				//map olFeature to FeatureInfo item
				.map(olFeatureContainer => this._featureInfoProvider(olFeatureContainer.olFeature, olFeatureContainer.layerProperties))
				// .filter(featureInfo => !!featureInfo)
				.map(featureInfo => featureInfo ? featureInfo : { title: translate('map_olMap_handler_featureInfo_not_available'), content: '' })
				//display FeatureInfo items in the same order as layers
				.reverse();

			//publish FeatureInfo items
			addFeatureInfoItems(featureInfoItems);

			const highlightFeatures = featureInfoItems
				.filter(featureInfo => featureInfo.geometry)
				.map(featureInfo => ({
					id: FEATURE_INFO_HIGHLIGHT_FEATURE_ID,
					type: HighlightFeatureTypes.DEFAULT,
					data: { geometry: featureInfo.geometry.data, geometryType: HighlightGeometryTypes.GEOJSON }
				}));

			const unsubscribe = observe(this._storeService.getStore(), state => state.featureInfo.querying, querying => {
				//untestable else path cause function is self-removing
				/* istanbul ignore else */
				if (!querying) {
					//publish current HighlightFeature items when all pending queries are resolved
					addHighlightFeatures(highlightFeatures);
					unsubscribe();
				}
			});
			/**
			 * let's delay this call and put it in the callback queue,
			 * so we always run the HighlightFeature animation at least for this amount of time
			 */
			setTimeout(() => {
				resolveQuery(queryId);
			}, OlFeatureInfoHandler_Query_Resolution_Delay_Ms);
		});
	}
}
