/**
 * @module modules/olMap/handler/featureInfo/OlFeatureInfoHandler
 */
import { $injector } from '../../../../injection';
import { addFeatureInfoItems, registerQuery, resolveQuery } from '../../../../store/featureInfo/featureInfo.action';
import { observe } from '../../../../utils/storeUtils';
import { getLayerById } from '../../utils/olMapUtils';
import { OlMapHandler } from '../OlMapHandler';
import { bvvFeatureInfoProvider } from './featureInfoItem.provider';
import { removeHighlightFeaturesById } from '../../../../store/highlight/highlight.action';
import { QUERY_RUNNING_HIGHLIGHT_FEATURE_ID } from '../../../../plugins/HighlightPlugin';
import { createUniqueId } from '../../../../utils/numberUtils';
import LayerGroup from '../../../../../node_modules/ol/layer/Group';
import { hashCode } from '../../../../utils/hashCode';

/**
 * A function that returns a `FeatureInfo` for an `ol.Feature`
 * @typedef {Function} featureInfoProvider
 * @param {ol.Feature} olFeature ol feature
 * @param {module:store/layers/layers_action~LayerProperties} layerProperties layerProperties
 * @returns {module:domain/featureInfo~FeatureInfo} featureInfo
 */
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
	#storeService;
	#translationService;
	#geoResourceService;
	/**
	 *
	 * @param {module:modules/olMap/handler/featureInfo/OlFeatureInfoHandler~featureInfoProvider} featureInfoProvider
	 */
	constructor(featureInfoProvider = bvvFeatureInfoProvider) {
		super('Feature_Info_Handler');

		const {
			StoreService: storeService,
			TranslationService: translationService,
			GeoResourceService: geoResourceService
		} = $injector.inject('StoreService', 'TranslationService', 'GeoResourceService');
		this._featureInfoProvider = featureInfoProvider;
		this.#storeService = storeService;
		this.#translationService = translationService;
		this.#geoResourceService = geoResourceService;
	}

	/**
	 *
	 * @override
	 */
	register(map) {
		const queryId = `${createUniqueId()}`;
		const translate = (key) => this.#translationService.translate(key);

		/**
		 * Ensure an ol feature owns unique ID. This is needed for further processing, e.g. the managing the feature collection
		 */
		const generateFeatureIdIfMissing = (map, olFeature) => {
			if (!olFeature.getId()) {
				olFeature.setId(`${hashCode(olFeature)}`);
			}
			return olFeature;
		};

		//find ONE closest feature per layer
		const findOlFeature = (map, pixel, olLayer) => {
			return (
				map.forEachFeatureAtPixel(
					pixel,
					(feature) => {
						// clustered features
						if (feature.get('features')) {
							return feature.get('features').length === 1 ? generateFeatureIdIfMissing(map, feature.get('features')[0]) : null;
						}
						// un-clustered features
						return generateFeatureIdIfMissing(map, feature);
					},
					{
						layerFilter: (l) =>
							(this.#geoResourceService.byId(l.get('geoResourceId'))?.queryable ??
								true) /** < make layer without underlying a GeoResource queryable (e.g. the highlight layer) */ &&
							(olLayer instanceof LayerGroup ? olLayer.getLayers().getArray().includes(l) : l === olLayer),
						hitTolerance: OlFeatureInfoHandler_Hit_Tolerance_Px
					}
				) ?? null
			);
		};

		//use only visible and unhidden layers
		const layerFilter = (layerProperties) => layerProperties.visible;

		observe(
			this.#storeService.getStore(),
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
