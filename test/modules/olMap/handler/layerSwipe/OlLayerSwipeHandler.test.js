import { Map, View } from 'ol';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { OlLayerSwipeHandler } from '../../../../../src/modules/olMap/handler/layerSwipe/OlLayerSwipeHandler';
import { TestUtils } from '../../../../test-utils';
import LayerGroup from 'ol/layer/Group';
import { createDefaultLayer, createDefaultLayersConstraints, layersReducer } from '../../../../../src/store/layers/layers.reducer';
import { initialState, layerSwipeReducer } from '../../../../../src/store/layerSwipe/layerSwipe.reducer';
import { activate, deactivate, updateRatio } from '../../../../../src/store/layerSwipe/layerSwipe.action';
import { addLayer, SwipeAlignment } from '../../../../../src/store/layers/layers.action';
import { MapLibreLayer } from '@geoblocks/ol-maplibre-layer';

describe('OlLayerSwipeHandler', () => {
	const setup = (state = {}) => {
		TestUtils.setupStoreAndDi(state, { layers: layersReducer, layerSwipe: layerSwipeReducer });
		return new OlLayerSwipeHandler();
	};

	const setupMap = () => {
		const container = document.createElement('div');
		container.style.height = '100px';
		container.style.width = '100px';
		container.style.position = 'absolute';
		container.style.left = '0';
		container.style.top = '0';
		document.body.appendChild(container);

		return new Map({
			target: container,
			view: new View({
				zoom: 1
			})
		});
	};

	it('instantiates the handler', () => {
		setup();
		const handler = setup();

		expect(handler.id).toBe('Layer_Swipe_Handler');
		expect(handler.register).toBeDefined();
	});

	describe('when layers s-o-s changes', () => {
		describe('layersSwipe is NOT active', () => {
			it('does nothing', () => {
				const map = setupMap();
				const handler = setup();
				handler.register(map);
				const resetOlLayersSpy = spyOn(handler, '_resetOlLayers');
				const updateOlLayersSpy = spyOn(handler, '_updateOlLayers');

				addLayer('id0');
				expect(resetOlLayersSpy).not.toHaveBeenCalled();
				expect(updateOlLayersSpy).not.toHaveBeenCalled();
			});
		});
		describe('layersSwipe is  active', () => {
			it('calls the correct methods', () => {
				const map = setupMap();
				const handler = setup({
					layerSwipe: {
						active: true
					}
				});
				handler.register(map);
				const resetOlLayersSpy = spyOn(handler, '_resetOlLayers');
				const updateOlLayersSpy = spyOn(handler, '_updateOlLayers');

				addLayer('id0');

				expect(resetOlLayersSpy).toHaveBeenCalledTimes(1);
				expect(updateOlLayersSpy).toHaveBeenCalledOnceWith(map);
			});
		});
	});

	describe('when layersSwipe `active` property changes', () => {
		it('calls the correct methods', () => {
			const map = setupMap();
			const handler = setup();
			handler.register(map);
			const resetOlLayersSpy = spyOn(handler, '_resetOlLayers');
			const updateOlLayersSpy = spyOn(handler, '_updateOlLayers');

			activate();

			expect(resetOlLayersSpy).not.toHaveBeenCalled();
			expect(updateOlLayersSpy).toHaveBeenCalledOnceWith(map);
			expect(handler._currentRatio).toBe(initialState.ratio);

			deactivate();

			expect(resetOlLayersSpy).toHaveBeenCalledTimes(1);
			expect(updateOlLayersSpy).toHaveBeenCalledOnceWith(map);
		});
	});

	describe('when layersSwipe `ratio` property changes', () => {
		describe('layersSwipe is NOT active', () => {
			it('does nothing', () => {
				const map = setupMap();
				const handler = setup();
				handler.register(map);
				const updateOlLayersSpy = spyOn(handler, '_updateOlLayers');

				updateRatio(75);
				expect(updateOlLayersSpy).not.toHaveBeenCalled();
			});

			describe('layersSwipe is  active', () => {
				it('calls the correct methods', () => {
					const map = setupMap();
					const handler = setup({
						layerSwipe: {
							active: true
						}
					});
					handler.register(map);
					const updateOlLayersSpy = spyOn(handler, '_updateOlLayers');

					updateRatio(75);
					expect(updateOlLayersSpy).toHaveBeenCalledOnceWith(map);
					expect(handler._currentRatio).toBe(75);
				});
			});
		});

		it('calls the correct methods', () => {
			const map = setupMap();
			const handler = setup();
			handler.register(map);
			const resetOlLayersSpy = spyOn(handler, '_resetOlLayers');
			const updateOlLayersSpy = spyOn(handler, '_updateOlLayers');

			activate();

			expect(resetOlLayersSpy).not.toHaveBeenCalled();
			expect(updateOlLayersSpy).toHaveBeenCalledOnceWith(map);

			deactivate();

			expect(resetOlLayersSpy).toHaveBeenCalledTimes(1);
			expect(updateOlLayersSpy).toHaveBeenCalledOnceWith(map);
		});
	});

	describe('when a oLayer is added to the olMap', () => {
		it('calls the correct methods', () => {
			const map = setupMap();
			const handler = setup({
				layerSwipe: {
					active: true
				}
			});
			handler.register(map);
			const resetOlLayersSpy = spyOn(handler, '_resetOlLayers');
			const updateOlLayersSpy = spyOn(handler, '_updateOlLayers');

			map.getLayers().push(new VectorLayer());

			expect(resetOlLayersSpy).not.toHaveBeenCalled();
			expect(updateOlLayersSpy).toHaveBeenCalledOnceWith(map);
		});
	});

	describe('_updateOlLayers() and _resetOlLayers()', () => {
		describe('default ol layer', () => {
			it('registers and un-registers a prerender and postrender fn for each real layer once', () => {
				const map = setupMap();
				const handler = setup();
				const olLayer0 = new VectorLayer({ source: new VectorSource() });
				const olLayer1 = new VectorLayer({ source: new VectorSource() });
				const olGroupLayer0 = new LayerGroup({ layers: [olLayer0] });
				map.addLayer(olGroupLayer0);
				map.addLayer(olLayer1);
				handler.register(map);
				const getPreRenderFnSpy = spyOn(handler, '_getPreRenderFn');
				const getPostRenderFnSpy = spyOn(handler, '_getPostRenderFn');

				handler._updateOlLayers(map);
				//Check registration ist done once
				handler._updateOlLayers(map);
				handler._updateOlLayers(map);
				handler._updateOlLayers(map);

				expect(getPreRenderFnSpy).toHaveBeenCalledTimes(2);
				expect(getPostRenderFnSpy).toHaveBeenCalledTimes(2);
				expect(olLayer0.get('layerSwipeHandler_preRenderListenerKey')).not.toBeUndefined();
				expect(olLayer0.get('layerSwipeHandler_postRenderListenerKey')).not.toBeUndefined();
				expect(olLayer1.get('layerSwipeHandler_preRenderListenerKey')).not.toBeUndefined();
				expect(olLayer1.get('layerSwipeHandler_postRenderListenerKey')).not.toBeUndefined();
				expect(olGroupLayer0.get('layerSwipeHandler_preRenderListenerKey')).toBeUndefined();
				expect(olGroupLayer0.get('layerSwipeHandler_postRenderListenerKey')).toBeUndefined();

				handler._resetOlLayers();

				expect(olLayer0.get('layerSwipeHandler_preRenderListenerKey')).toBeUndefined();
				expect(olLayer0.get('layerSwipeHandler_postRenderListenerKey')).toBeUndefined();
				expect(olLayer1.get('layerSwipeHandler_preRenderListenerKey')).toBeUndefined();
				expect(olLayer1.get('layerSwipeHandler_postRenderListenerKey')).toBeUndefined();
			});
		});

		describe('maplibre layer', () => {
			it('sets the style clipPath for the containing the maplibre map', () => {
				const map = setupMap();
				const id0 = 'id0';
				const id1 = 'id1';
				const id2 = 'id2';
				const handler = setup({
					layers: {
						active: [
							{ ...createDefaultLayer(id0), ...{ constraints: { ...createDefaultLayersConstraints, swipeAlignment: SwipeAlignment.NOT_SET } } },
							{ ...createDefaultLayer(id1), ...{ constraints: { ...createDefaultLayersConstraints, swipeAlignment: SwipeAlignment.LEFT } } },
							{ ...createDefaultLayer(id2), ...{ constraints: { ...createDefaultLayersConstraints, swipeAlignment: SwipeAlignment.RIGHT } } }
						]
					}
				});
				handler.register(map);
				handler._currentRatio = 25;
				const mapLibreLayer0 = new MapLibreLayer({ id: id0 });
				const mapLibreLayer1 = new MapLibreLayer({ id: id1 });
				const mapLibreLayer2 = new MapLibreLayer({ id: id2 });
				map.addLayer(mapLibreLayer0);
				map.addLayer(mapLibreLayer1);
				map.addLayer(mapLibreLayer2);

				handler._updateOlLayers(map);
				handler._updateOlLayers(map);

				expect(mapLibreLayer0.mapLibreMap.getContainer().style.clipPath).toBe('');
				expect(mapLibreLayer1.mapLibreMap.getContainer().style.clipPath).toBe('polygon(0% 0%, 25% 0%, 25% 100%, 0% 100%)');
				expect(mapLibreLayer2.mapLibreMap.getContainer().style.clipPath).toBe('polygon(25% 0%, 100% 0%, 100% 100%, 25% 100%)');

				handler._resetOlLayers();

				expect(mapLibreLayer0.mapLibreMap.getContainer().style.clipPath).toBe('none');
				expect(mapLibreLayer1.mapLibreMap.getContainer().style.clipPath).toBe('none');
				expect(mapLibreLayer2.mapLibreMap.getContainer().style.clipPath).toBe('none');
			});
		});
	});

	describe('_getPreRenderFn', () => {
		const get2dContext = () => {
			const canvas = document.createElement('canvas');
			return canvas.getContext('2d');
		};

		it('returns a preRender function', () => {
			const map = setupMap();
			const id0 = 'id0';
			const id1 = 'id1';
			const id2 = 'id2';
			const handler = setup({
				layers: {
					active: [
						{ ...createDefaultLayer(id0), ...{ constraints: { ...createDefaultLayersConstraints, swipeAlignment: SwipeAlignment.NOT_SET } } },
						{ ...createDefaultLayer(id1), ...{ constraints: { ...createDefaultLayersConstraints, swipeAlignment: SwipeAlignment.LEFT } } },
						{ ...createDefaultLayer(id2), ...{ constraints: { ...createDefaultLayersConstraints, swipeAlignment: SwipeAlignment.RIGHT } } }
					]
				}
			});
			handler.register(map);
			handler._currentRatio = 25;
			const inversePixelTransform = [1, 0, 0, 1, 0, 0];

			const olLayer0 = new VectorLayer({ id: id0, source: new VectorSource() });
			const olLayer1 = new VectorLayer({ id: id1, source: new VectorSource() });
			const olLayer2 = new VectorLayer({ id: id2, source: new VectorSource() });
			map.addLayer(olLayer0);
			map.addLayer(olLayer1);
			map.addLayer(olLayer2);

			const preRenderFn = handler._getPreRenderFn();

			// SwipeAlignment.NOT_SET
			const context0 = get2dContext();
			const moveToSpy0 = spyOn(context0, 'moveTo').and.callThrough();
			preRenderFn({ context: context0, target: olLayer0, inversePixelTransform });
			expect(moveToSpy0).not.toHaveBeenCalled();

			// SwipeAlignment.LEFT
			const context1 = get2dContext();
			const moveToSpy1 = spyOn(context1, 'moveTo').and.callThrough();
			preRenderFn({ context: context1, target: olLayer1, inversePixelTransform });
			expect(moveToSpy1).toHaveBeenCalledWith(0, 100);

			// SwipeAlignment.RIGHT
			const context2 = get2dContext();
			const moveToSpy2 = spyOn(context2, 'moveTo').and.callThrough();
			preRenderFn({ context: context2, target: olLayer2, inversePixelTransform });
			expect(moveToSpy2).toHaveBeenCalledWith(25, 0);
		});
	});

	describe('_getPostRenderFn', () => {
		const get2dContext = () => {
			const canvas = document.createElement('canvas');
			return canvas.getContext('2d');
		};

		it('returns a preRender function', () => {
			const map = setupMap();
			const handler = setup();
			handler.register(map);
			const postRenderFn = handler._getPostRenderFn();
			const context = get2dContext();
			const restoreSpy = spyOn(context, 'restore').and.callThrough();

			postRenderFn({ context });

			expect(restoreSpy).toHaveBeenCalled();
		});
	});
});
