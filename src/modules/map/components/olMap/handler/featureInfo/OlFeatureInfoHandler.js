import { $injector } from '../../../../../../injection';
import { addFeatureInfoItems } from '../../../../../../store/featureInfo/featureInfo.action';
import { observe } from '../../../../../../utils/storeUtils';
import { getLayerById } from '../../olMapUtils';
import { OlMapHandler } from '../OlMapHandler';
import { getBvvFeatureInfo } from './featureInfoItem.provider';
import GeoJSON from 'ol/format/GeoJSON';
import { addHighlightFeatures, HighlightFeatureTypes, HighlightGeometryTypes, removeHighlightFeaturesById } from '../../../../../../store/highlight/highlight.action';
import { FEATURE_INFO_HIGHLIGHT_FEATURE_ID } from '../../../../../../plugins/HighlightPlugin';

/**
 * MapHandler that publishes FeatureInfo items from ol vector sources.
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

		const translate = (key) => this._translationService.translate(key);
		//find ONE closest feature per layer
		const findOlFeature = (map, pixel, layer) => {
			return map.forEachFeatureAtPixel(pixel, feature => feature, { layerFilter: l => l === layer }) || null;
		};

		//use only visible and unhidden layers
		const layerFilter = layer => layer.visible && !layer.constraints.hidden;

		observe(this._storeService.getStore(), state => state.featureInfo.coordinate, (coordinate, state) => {

			//remove previous HighlightFeature items
			removeHighlightFeaturesById(FEATURE_INFO_HIGHLIGHT_FEATURE_ID);

			const olFeatureContainers = [...state.layers.active]
				.filter(layerFilter)
				//map layer to olLayer (wrapper)
				.map(layer => {
					return { olLayer: getLayerById(map, layer.geoResourceId), layer: layer };
				})
				//map olLayer to olFeature (wrapper)
				.map(olLayerContainer => {
					const { layer, olLayer } = olLayerContainer;
					return { olFeature: findOlFeature(map, map.getPixelFromCoordinate(coordinate.payload), olLayer), layer: layer };
				})
				.filter(olFeatureContainer => !!olFeatureContainer.olFeature);

			const featureInfoItems = olFeatureContainers
				//map olFeature to FeatureInfo item
				.map(olFeatureContainer => this._featureInfoProvider(olFeatureContainer.olFeature, olFeatureContainer.layer))
				// .filter(featureInfo => !!featureInfo)
				.map(featureInfo => featureInfo ? featureInfo : { title: translate('map_olMap_handler_featureInfo_not_available'), content: '' })
				//display FeatureInfo items in the same order as layers
				.reverse();

			//publish FeatureInfo items
			addFeatureInfoItems(featureInfoItems);

			const highlightFeatures = olFeatureContainers
				.map(olFeatureContainer => ({
					id: FEATURE_INFO_HIGHLIGHT_FEATURE_ID,
					type: HighlightFeatureTypes.DEFAULT,
					data: { geometry: new GeoJSON().writeGeometry(olFeatureContainer.olFeature.getGeometry()), geometryType: HighlightGeometryTypes.GEOJSON }
				}));

			//publish current HighlightFeature items
			addHighlightFeatures(highlightFeatures);
		});
	}
}
