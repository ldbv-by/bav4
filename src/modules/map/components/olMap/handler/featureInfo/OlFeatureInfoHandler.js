import { $injector } from '../../../../../../injection';
import { addFeatureInfoItems } from '../../../../../../store/featureInfo/featureInfo.action';
import { observe } from '../../../../../../utils/storeUtils';
import { getLayerById } from '../../olMapUtils';
import { OlMapHandler } from '../OlMapHandler';
import { getBvvFeatureInfo } from './featureInfoItem.provider';

/**
 * MapHandler that publishes FeatureInfo items from ol vector sources.
 * @class
 * @author taulinger
 */
export class OlFeatureInfoHandler extends OlMapHandler {

	constructor(featureInfoProvider = getBvvFeatureInfo) {
		super('Feature_Info_Handler');

		const { StoreService: storeService }
			= $injector.inject('StoreService');
		this._featureInfoProvider = featureInfoProvider;
		this._storeService = storeService;
	}

	/**
	 *
	 * @override
	 */
	register(map) {

		//find ONE closest feature per layer
		const findOlFeature = (map, pixel, layer) => {
			return map.forEachFeatureAtPixel(pixel, feature => feature, { layerFilter: l => l === layer }) || null;
		};

		//use only visible and unhidden layers
		const layerFilter = layer => layer.visible && !layer.constraints.hidden;

		observe(this._storeService.getStore(), state => state.featureInfo.coordinate, (coordinate, state) => {

			const featureInfoItems = [...state.layers.active]
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
				.filter(olFeatureContainer => !!olFeatureContainer.olFeature)
				//map olFeature to FeatureInfo item
				.map(olFeatureContainer => this._featureInfoProvider(olFeatureContainer.olFeature, olFeatureContainer.layer))
				.filter(featureInfo => !!featureInfo)
				//display FeatureInfo items in the same order as layers
				.reverse();

			//Publish FeatureInfo items
			addFeatureInfoItems(featureInfoItems);
		});
	}
}
