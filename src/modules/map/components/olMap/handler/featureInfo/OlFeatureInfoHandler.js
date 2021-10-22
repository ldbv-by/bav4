import VectorSource from 'ol/source/Vector';
import { $injector } from '../../../../../../injection';
import { add } from '../../../../../../store/featureInfo/featureInfo.action';
import { observe } from '../../../../../../utils/storeUtils';
import { OlMapEventHandler } from '../OlMapEventHandler';

/**
 * @class
 * @author taulinger
 */
export class OlFeatureInfoHandler extends OlMapEventHandler {

	constructor() {
		super('Feature_Info_Handler');
		const { StoreService: storeService }
			= $injector.inject('StoreService');

		this._map = null;

		observe(storeService.getStore(), state => state.featureInfo.coordinate, coordinate => {

			//contains always one FeatureInfo currently
			const featureInfos = this._findVectorFeature(this._map, this._map.getPixelFromCoordinate(coordinate.payload))
				.map(feature => ({ title: feature.get('name') || null, content: feature.get('description') || null }));
			add(featureInfos);
		});
	}

	/**
	 * Find the closest feature from pixel in a vector layer
	 */
	_findVectorFeature(map, pixel) {
		const feature = map.forEachFeatureAtPixel(pixel, feature => {
			//we stop detection by returning first suitable feature
			if (feature.get('name') || feature.get('description')) {
				return feature;
			}

		}, { layerFilter: layer => layer.getSource() instanceof VectorSource });
		return feature ? [feature] : [];
	}

	/**
	 *
	 * @override
	 */
	register(map) {
		this._map = map;
	}
}
