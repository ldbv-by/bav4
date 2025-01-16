/**
 * @module modules/olMap/handler/layerSwipe/OlLayerSwipeHandler
 */
import LayerGroup from '../../../../../node_modules/ol/layer/Group';
import { unByKey } from '../../../../../node_modules/ol/Observable';
import { getRenderPixel } from '../../../../../node_modules/ol/render';
import { $injector } from '../../../../injection/index';
import { SwipeAlignment } from '../../../../store/layers/layers.action';
import { observe } from '../../../../utils/storeUtils';
import { getLayerGroup } from '../../utils/olMapUtils';
import { OlMapHandler } from '../OlMapHandler';

const olLayerSwipeHandlerKey = 'layerSwipeHandler_layer';
const olLayerSwipeHandlerPreRenderListenerKey = 'layerSwipeHandler_preRenderListenerKey';
const olLayerSwipeHandlerPostRenderListenerKey = 'layerSwipeHandler_postRenderListenerKey';
/**
 * {@link OlMapHandler} that realizes a layer swipe feature
 * @class
 * @author taulinger
 */
export class OlLayerSwipeHandler extends OlMapHandler {
	#storeService;
	#handledOlLayers = [];
	#map;
	_currentRatio;
	constructor() {
		super('Layer_Swipe_Handler');
		const { StoreService } = $injector.inject('StoreService');
		this.#storeService = StoreService;
	}

	_resetOlLayers() {
		this.#handledOlLayers = this.#handledOlLayers.filter((olLayer) => {
			if (olLayer.mapLibreMap) {
				olLayer.mapLibreMap.getContainer().style.clipPath = 'none';
			} else {
				unByKey(olLayer.get(olLayerSwipeHandlerPreRenderListenerKey));
				unByKey(olLayer.get(olLayerSwipeHandlerPostRenderListenerKey));
				olLayer.unset(olLayerSwipeHandlerPreRenderListenerKey);
				olLayer.unset(olLayerSwipeHandlerPostRenderListenerKey);
			}
			olLayer.unset(olLayerSwipeHandlerKey);
			return false;
		});
	}

	_getAlignment(olLayer) {
		const resolvedOlLayerId = getLayerGroup(this.#map, olLayer)?.get('id') ?? olLayer.get('id');
		return (
			this.#storeService
				.getStore()
				.getState()
				.layers.active.filter((l) => l.id === resolvedOlLayerId)[0]?.constraints.swipeAlignment ?? SwipeAlignment.NOT_SET
		);
	}

	_getPreRenderFn() {
		return (event) => {
			const alignment = this._getAlignment(event.target);

			if (alignment === SwipeAlignment.NOT_SET) {
				return;
			}

			const ctx = event.context;
			const mapSize = this.#map.getSize();
			const width = mapSize[0] * (this._currentRatio / 100);

			let tl;
			let tr;
			let bl;
			let br;
			switch (alignment) {
				case SwipeAlignment.LEFT:
					{
						tl = getRenderPixel(event, [0, mapSize[1]]);
						tr = getRenderPixel(event, [width, mapSize[1]]);
						bl = getRenderPixel(event, [0, 0]);
						br = getRenderPixel(event, [width, 0]);
					}

					break;
				case SwipeAlignment.RIGHT: {
					tl = getRenderPixel(event, [width, 0]);
					tr = getRenderPixel(event, [mapSize[0], 0]);
					bl = getRenderPixel(event, [width, mapSize[1]]);
					br = getRenderPixel(event, mapSize);
					break;
				}
			}
			ctx.save();
			ctx.beginPath();
			ctx.moveTo(tl[0], tl[1]);
			ctx.lineTo(bl[0], bl[1]);
			ctx.lineTo(br[0], br[1]);
			ctx.lineTo(tr[0], tr[1]);
			ctx.closePath();
			ctx.clip();
		};
	}

	_getPostRenderFn() {
		return (event) => {
			const ctx = event.context;
			ctx.restore();
		};
	}

	_updateOlLayers(map) {
		const prepareOlLayer = (olLayer) => {
			// https://github.com/maplibre/maplibre-gl-compare/blob/main/index.js
			// https://developer.mozilla.org/en-US/docs/Web/CSS/clip-path
			if (olLayer.mapLibreMap) {
				const alignment = this._getAlignment(olLayer);
				switch (alignment) {
					case SwipeAlignment.LEFT:
						olLayer.mapLibreMap.getContainer().style.clipPath = `polygon(0% 0%, ${this._currentRatio}% 0%, ${this._currentRatio}% 100%, 0% 100%)`;
						break;
					case SwipeAlignment.RIGHT: {
						olLayer.mapLibreMap.getContainer().style.clipPath = `polygon(${this._currentRatio}% 0%, 100% 0%, 100% 100%, ${this._currentRatio}% 100%)`;
						break;
					}
				}

				if (!olLayer.get(olLayerSwipeHandlerKey)) {
					olLayer.set(olLayerSwipeHandlerKey, true);
					this.#handledOlLayers.push(olLayer);
				}
			} else {
				if (!olLayer.get(olLayerSwipeHandlerKey)) {
					olLayer.set(olLayerSwipeHandlerPreRenderListenerKey, olLayer.on('prerender', this._getPreRenderFn()));
					olLayer.set(olLayerSwipeHandlerPostRenderListenerKey, olLayer.on('postrender', this._getPostRenderFn()));
					olLayer.set(olLayerSwipeHandlerKey, true);
					this.#handledOlLayers.push(olLayer);
				}
			}
		};

		map.getLayers().forEach((olLayer) => {
			if (olLayer instanceof LayerGroup) {
				olLayer.getLayers().forEach((olLayer) => {
					prepareOlLayer(olLayer);
				});
			} else {
				prepareOlLayer(olLayer);
			}
		});

		map.render();
	}

	register(map) {
		this.#map = map;

		/**
		 * GeoResourceFutures are resolved asynchronously by replacing a placeholder olLayer by the "real" olLayer after the data are loaded.
		 * Therefore we have to trigger a re-render for the newly added layer in that case
		 */
		map.getLayers().on('add', () => {
			// triggered when layer added or removed
			this._updateOlLayers(map);
		});

		observe(
			this.#storeService.getStore(),
			(state) => state.layers.active,
			(_, state) => {
				if (state.layerSwipe.active) {
					this._resetOlLayers();
					this._updateOlLayers(map);
				}
			}
		);
		observe(
			this.#storeService.getStore(),
			(state) => state.layerSwipe.active,
			(active, state) => {
				if (active) {
					this._currentRatio = state.layerSwipe.ratio;
					this._updateOlLayers(map);
				} else {
					this._resetOlLayers();
				}
			}
		);
		observe(
			this.#storeService.getStore(),
			(state) => state.layerSwipe.ratio,
			(ratio, state) => {
				if (state.layerSwipe.active) {
					this._currentRatio = ratio;
					this._updateOlLayers(map);
				}
			}
		);
	}
}
