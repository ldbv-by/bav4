import VectorSource from 'ol/source/Vector';
import { $injector } from '../../../../../../injection';
import { add } from '../../../../../../store/featureInfo/featureInfo.action';
import { observe } from '../../../../../../utils/storeUtils';
import { OlMapEventHandler } from '../OlMapEventHandler';

export class OlFeatureInfoHandler extends OlMapEventHandler {

	constructor() {
		super('Feature_Info_Handler');
		const { StoreService: storeService }
			= $injector.inject('StoreService');

		this._map = null;

		observe(storeService.getStore(), state => state.featureInfo.coordinate, coordinate => {

			//detect vector source features
			if (coordinate?.payload) {

				const featureInfo = this._findVectorFeature(this._map, this._map.getPixelFromCoordinate(coordinate.payload))
					.filter(feature => feature.get('name') || feature.get('description'))
					.map(feature => ({ title: feature.get('name') || null, content: feature.get('description') || null }));
				add(featureInfo);
			}

		});
	}

	// Find the closest feature from pixel in a vector layer
	_findVectorFeature(map, pixel) {
		const feature = map.forEachFeatureAtPixel(pixel, feature => {
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
