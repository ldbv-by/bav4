import { OlLayerHandler } from '../OlLayerHandler';
import { $injector } from '../../../../../../injection';
import { observe } from '../../../../../../utils/storeUtils';
import { HIGHLIGHT_LAYER_ID } from '../../../../../../plugins/HighlightPlugin';
import Feature from 'ol/Feature';
import { highlightFeatureStyleFunction, highlightTemporaryFeatureStyleFunction } from './StyleUtils';
import { Vector as VectorSource } from 'ol/source';
import { Vector as VectorLayer } from 'ol/layer';
import { Point } from 'ol/geom';


/**
 * Handler for displaying highlighted features
 * @author thiloSchlemmer
 * @author taulinger
 */
export class OlHighlightLayerHandler extends OlLayerHandler {

	constructor() {
		super(HIGHLIGHT_LAYER_ID);
		const { StoreService } = $injector.inject('StoreService');
		this._storeService = StoreService;
		this._unregister = () => { };
	}


	/**
		 * Activates the Handler.
		 * @override
		 */
	onActivate(/*eslint-disable no-unused-vars */olMap) {
		const olLayer = this._createLayer();
		this._unregister = this._register(this._storeService.getStore(), olLayer.getSource());
		return olLayer;
	}

	/**
		 *  @override
		 *  @param {Map} olMap
		 */
	onDeactivate(/*eslint-disable no-unused-vars */olMap) {
		this._unregister();
	}

	_createLayer() {
		return new VectorLayer({
			source: new VectorSource()
		});
	}

	_register(store, olSource) {

		const onChange = (highlight) => {

			const { features, temporaryFeatures } = highlight;

			olSource.clear();

			if (features.length) {
				const coord = features[0].data.coordinate;
				const olFeature = new Feature(new Point(coord));
				olFeature.setStyle(highlightFeatureStyleFunction);
				olSource.addFeature(olFeature);
			}
			if (temporaryFeatures.length) {
				const coord = temporaryFeatures[0].data.coordinate;
				const olTempFeature = new Feature(new Point(coord));
				olTempFeature.setStyle(highlightTemporaryFeatureStyleFunction);
				olSource.addFeature(olTempFeature);
			}
		};

		return observe(store, state => state.highlight, onChange, false);
	}
}
