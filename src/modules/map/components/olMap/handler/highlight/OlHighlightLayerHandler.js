import { OlLayerHandler } from '../OlLayerHandler';
import { $injector } from '../../../../../../injection';
import { observe } from '../../../../../../utils/storeUtils';
import { HIGHLIGHT_LAYER_ID } from '../../../../../../store/highlight/HighlightPlugin';
import { highlightStyleFunction } from './StyleUtils';
import { Vector as VectorSource } from 'ol/source';
import { Vector as VectorLayer } from 'ol/layer';


/**
 * Handler for displaying highlighted features
 */
export class OlHighlightLayerHandler extends OlLayerHandler {

	constructor() {
		super(HIGHLIGHT_LAYER_ID);
		const { StoreService } = $injector.inject('StoreService');
		this._storeService = StoreService;
		this._highlightLayer = null;
		this._feature = null;
		this._temporaryFeature = null;
		this._map = null;
		this._unregister = () => { };
	}


	/**
         * Activates the Handler.
         * @override
         */
	onActivate(olMap) {
		if (this._highlightLayer === null) {
			const source = new VectorSource({ wrapX: false });
			this._highlightLayer = new VectorLayer({
				source: source
			});

		}
		this._map = olMap;

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

	_setFeature(feature) {
		if (feature !== this._feature) {

			if (this._feature) {
				this._highlightLayer.getSource().removeFeature(this._feature);
			}
			this._feature = feature;
			this._feature.setStyle(highlightStyleFunction);
			this._highlightLayer.getSource().addFeature(this._feature);
		}
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
				this._setFeature(changedState.feature);

				this._map.renderSync();
			}
			this._setFeature(null);

		};

		return observe(store, extract, onChange);
	}

}