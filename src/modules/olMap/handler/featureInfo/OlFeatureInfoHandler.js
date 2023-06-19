/**
 * @module modules/olMap/handler/featureInfo/OlFeatureInfoHandler
 */
import { $injector } from '../../../../injection';
import { addFeatureInfoItems, registerQuery, resolveQuery } from '../../../../store/featureInfo/featureInfo.action';
import { observe } from '../../../../utils/storeUtils';
import { getLayerById } from '../../utils/olMapUtils';
import { OlMapHandler } from '../OlMapHandler';
import { getBvvFeatureInfo } from './featureInfoItem.provider';
import {
	addHighlightFeatures,
	HighlightFeatureType,
	HighlightGeometryType,
	removeHighlightFeaturesById
} from '../../../../store/highlight/highlight.action';
import { QUERY_RUNNING_HIGHLIGHT_FEATURE_ID } from '../../../../plugins/HighlightPlugin';
import { createUniqueId } from '../../../../utils/numberUtils';

/**
 * Amount of time (in ms) query resolution should be delayed.
 */
export const OlFeatureInfoHandler_Query_Resolution_Delay_Ms = 300;
/**
 * Hit-detection tolerance in css pixels.
 */
export const OlFeatureInfoHandler_Hit_Tolerance_Px = 10;
/**
 * MapHandler that publishes FeatureInfo and HighlightFeature items from ol vector sources.
 * @class
 * @author taulinger
 */
export class OlFeatureInfoHandler extends OlMapHandler {
	constructor(featureInfoProvider = getBvvFeatureInfo) {
		super('Feature_Info_Handler');

		const { StoreService: storeService, TranslationService: translationService } = $injector.inject('StoreService', 'TranslationService');
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
			return (
				map.forEachFeatureAtPixel(
					pixel,
					(feature) => {
						// clustered features
						if (feature.get('features')) {
							return feature.get('features').length === 1 ? feature.get('features')[0] : null;
						}
						// un-clustered features
						return feature;
					},
					{
						layerFilter: (l) => l === olLayer,
						hitTolerance: OlFeatureInfoHandler_Hit_Tolerance_Px
					}
				) ?? null
			);
		};

		//use only visible and unhidden layers
		const layerFilter = (layerProperties) => layerProperties.visible;

		observe(
			this._storeService.getStore(),
			(state) => state.featureInfo.coordinate,
			(coordinate, state) => {
				//remove previous HighlightFeature items
				removeHighlightFeaturesById(QUERY_RUNNING_HIGHLIGHT_FEATURE_ID);
				registerQuery(queryId);

				const featureInfoItems = [...state.layers.active]
					.filter(layerFilter)
					//map layerProperties to olLayer (wrapper)
					.map((layerProperties) => {
						return { olLayer: getLayerById(map, layerProperties.id), layerProperties: layerProperties };
					})
					//map olLayer to olFeature (wrapper)
					.map((olLayerContainer) => {
						const { layerProperties, olLayer } = olLayerContainer;
						return { olFeature: findOlFeature(map, map.getPixelFromCoordinate(coordinate.payload), olLayer), layerProperties: layerProperties };
					})
					.filter((olFeatureContainer) => !!olFeatureContainer.olFeature)
					.filter((olFeatureContainer) => {
						const { layerProperties, olFeature } = olFeatureContainer;
						//only features containing a name are allowed to be selected for hidden layers!
						if (layerProperties.constraints.hidden) {
							return !!olFeature.get('name');
						}
						return olFeature;
					})
					//map olFeature to FeatureInfo item
					.map((olFeatureContainer) => this._featureInfoProvider(olFeatureContainer.olFeature, olFeatureContainer.layerProperties))
					// .filter(featureInfo => !!featureInfo)
					.map((featureInfo) => (featureInfo ? featureInfo : { title: translate('global_featureInfo_not_available'), content: '' }))
					//display FeatureInfo items in the same order as layers
					.reverse();

				//publish FeatureInfo items
				addFeatureInfoItems(featureInfoItems);

				const highlightFeatures = featureInfoItems
					.filter((featureInfo) => featureInfo.geometry)
					.map((featureInfo) => ({
						id: QUERY_RUNNING_HIGHLIGHT_FEATURE_ID,
						type: HighlightFeatureType.DEFAULT,
						data: { geometry: featureInfo.geometry.data, geometryType: HighlightGeometryType.GEOJSON }
					}));

				const unsubscribe = observe(
					this._storeService.getStore(),
					(state) => state.featureInfo.querying,
					(querying) => {
						//untestable else path cause function is self-removing
						/* istanbul ignore else */
						if (!querying) {
							//publish current HighlightFeature items when all pending queries are resolved
							addHighlightFeatures(highlightFeatures);
							unsubscribe();
						}
					}
				);
				/**
				 * let's delay this call and put it in the callback queue,
				 * so we always run the HighlightFeature animation at least for this amount of time
				 */
				setTimeout(() => {
					resolveQuery(queryId);
				}, OlFeatureInfoHandler_Query_Resolution_Delay_Ms);
			}
		);
	}
}
