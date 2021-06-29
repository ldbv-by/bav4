import { OlLayerHandler } from '../OlLayerHandler';
import { $injector } from '../../../../../../injection';
import { observe } from '../../../../../../utils/storeUtils';
import { HIGHLIGHT_LAYER_ID } from '../../../../../../store/highlight/HighlightPlugin';
import Feature from 'ol/Feature';
import { highlightStyleFunction } from './StyleUtils';
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
		if (this._highlightLayer === null) {
			const source = new VectorSource({ wrapX: false, features: [this._feature, this._temporaryFeature] });
			this._highlightLayer = new VectorLayer({
				source: source
			});

		}
		this._map = olMap;

		this._temporaryFeature.setStyle(highlightStyleFunction);
		const { highlight } = this._storeService.getStore().getState();

		if (highlight.feature) {
			const featureCoords = highlight.feature.data;
			if (featureCoords) {
				this._feature.setStyle(highlightStyleFunction);
				this._feature.setGeometry(new Point(featureCoords));
			}
		}

		if (highlight.temporaryFeature) {
			const temporaryFeatureCoords = highlight.temporaryFeature.data;
			if (temporaryFeatureCoords) {
				this._temporaryFeature.setGeometry(new Point(temporaryFeatureCoords));
			}
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
		this._highlightLayer = null;
		this._map = null;
		this._unregister();
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
					this._feature.setStyle(highlightStyleFunction);
					this._feature.setGeometry(new Point(coord));
				}
				else {
					this._feature.setStyle(nullStyleFunction);
				}
				if (changedState.temporaryFeature) {
					const coord = changedState.temporaryFeature.data;
					this._temporaryFeature.setStyle(highlightStyleFunction);
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