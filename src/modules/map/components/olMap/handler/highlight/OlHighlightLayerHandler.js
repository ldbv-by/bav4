import { OlLayerHandler } from '../OlLayerHandler';
import { $injector } from '../../../../../../injection';
import { observe } from '../../../../../../utils/storeUtils';
import { HIGHLIGHT_LAYER_ID } from '../../../../../../store/highlight/HighlightPlugin';
import Feature from 'ol/Feature';
import { highlightCircleStyleFunction, highlightTemporaryCircleStyleFunction } from './StyleUtils';
import { Vector as VectorSource } from 'ol/source';
import { Vector as VectorLayer } from 'ol/layer';
import { Point } from 'ol/geom';
import { nullStyleFunction } from '../highlight/StyleUtils';


/**
 * Handler for displaying highlighted features
 */
export class OlHighlightLayerHandler extends OlLayerHandler {

	constructor() {
		super(HIGHLIGHT_LAYER_ID);
		const { StoreService } = $injector.inject('StoreService');
		this._storeService = StoreService;
		this._highlightLayer = null;
		this._feature = new Feature();
		this._temporaryFeature = new Feature();
		this._map = null;
		this._unregister = () => { };
	}


	/**
		 * Activates the Handler.
		 * @override
		 */
	onActivate(olMap) {
		this._highlightLayer = this._createLayer();
		this._map = olMap;


		const { highlight } = this._storeService.getStore().getState();

		if (highlight.feature) {
			const featureCoords = highlight.feature.data;
			this._feature.setStyle(highlightCircleStyleFunction);
			this._feature.setGeometry(new Point(featureCoords));
		}

		if (highlight.temporaryFeature) {
			const temporaryFeatureCoords = highlight.temporaryFeature.data;
			this._temporaryFeature.setStyle(highlightTemporaryCircleStyleFunction);
			this._temporaryFeature.setGeometry(new Point(temporaryFeatureCoords));
		}
		this._map.renderSync();

		this._unregister = this._register(this._storeService.getStore());

		return this._highlightLayer;
	}

	/**
		 *  @override
		 *  @param {Map} olMap
		 */
	onDeactivate(/*eslint-disable no-unused-vars */olMap) {
		this._map = null;
		this._highlightLayer = null;
		this._unregister();
	}

	_createLayer() {
		const source = new VectorSource({ wrapX: false, features: [this._feature, this._temporaryFeature] });
		return new VectorLayer({
			source: source
		});
	}

	_register(store) {
		const extract = (state) => {
			return state.highlight;
		};

		const isValidHighlight = (highlight) => {
			if (!highlight.active) {
				return false;
			}

			return highlight.feature || highlight.temporaryFeature;
		};

		const onChange = (changedState, stateSnapshot) => {
			if (isValidHighlight(changedState)) {

				if (changedState.feature) {
					const coord = changedState.feature.data;
					this._feature.setStyle(highlightCircleStyleFunction);
					this._feature.setGeometry(new Point(coord));
				}
				else {
					this._feature.setStyle(nullStyleFunction);
				}
				if (changedState.temporaryFeature) {
					const coord = changedState.temporaryFeature.data;
					this._temporaryFeature.setStyle(highlightTemporaryCircleStyleFunction);
					this._temporaryFeature.setGeometry(new Point(coord));
				}
				else {
					this._temporaryFeature.setStyle(nullStyleFunction);
				}
				this._map.renderSync();
			}
			else {
				this._feature.setStyle(nullStyleFunction);
				this._temporaryFeature.setStyle(nullStyleFunction);
			}
		};

		return observe(store, extract, onChange);
	}

}