import { $injector } from '../../../../../../injection';
import { add } from '../../../../../../store/featureInfo/featureInfo.action';
import { observe } from '../../../../../../utils/storeUtils';
import { getLayerById } from '../../olMapUtils';
import { OlMapHandler } from '../OlMapHandler';

/**
 * @class
 * @author taulinger
 */
export class OlFeatureInfoHandler extends OlMapHandler {

	constructor() {
		super('Feature_Info_Handler');
		const { StoreService: storeService }
			= $injector.inject('StoreService');

		this._map = null;

		observe(storeService.getStore(), state => state.featureInfo.coordinate, (coordinate, state) => {

			const featureInfoItems = [...state.layers.active]
				.reverse()
				.filter(this._getLayerFilter())
				.map(layer => getLayerById(this._map, layer.geoResourceId))
				.map(olLayer => this._findOlFeature(this._map, this._map.getPixelFromCoordinate(coordinate.payload), olLayer))
				.filter(olFeature => !!olFeature)
				.map(olFeature => ({ title: olFeature.get('name') || null, content: olFeature.get('description') || null }));
			add(featureInfoItems);
		});
	}

	_getLayerFilter() {
		return layer => layer.visible && !layer.constraints.hidden;
	}

	/**
	 * Find the closest feature from pixel in a vector layer
	 */
	_findOlFeature(map, pixel, layer) {
		const feature = map.forEachFeatureAtPixel(pixel, feature => {
			//we stop detection by returning first suitable feature
			if (feature.get('name') || feature.get('description')) {
				return feature;
			}

		}, { layerFilter: l => l === layer });
		return feature || null;
	}

	/**
	 *
	 * @override
	 */
	register(map) {
		this._map = map;
	}
}
