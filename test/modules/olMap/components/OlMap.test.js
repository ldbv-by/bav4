import { OlMap } from '@src/modules/olMap/components/OlMap';
import { fromLonLat } from 'ol/proj';
import { TestUtils } from '@test/test-utils';
import { positionReducer } from '@src/store/position/position.reducer';
import MapBrowserEventType from 'ol/MapBrowserEventType';
import MapEventType from 'ol/MapEventType';
import { $injector } from '@src/injection';
import { layersReducer } from '@src/store/layers/layers.reducer';
import { GeoResourceFuture, VectorGeoResource, VectorSourceType, WmsGeoResource } from '@src/domain/geoResources';
import { addLayer, modifyLayer, removeLayer } from '@src/store/layers/layers.action';
import { changeRotation, changeZoomAndCenter, fit as fitMap, fitLayer, changeCenter, changeZoom } from '@src/store/position/position.action';
import { simulateMapEvent, simulateMapBrowserEvent } from '@test/modules/olMap/mapTestUtils';
import VectorLayer from 'ol/layer/Vector';
import { pointerReducer } from '@src/store/pointer/pointer.reducer';
import { mapReducer } from '@src/store/map/map.reducer';
import VectorSource from 'ol/source/Vector';
import Event from 'ol/events/Event';
import { Group as LayerGroup, Layer } from 'ol/layer';
import { measurementReducer } from '@src/store/measurement/measurement.reducer';
import { getDefaultLayerOptions } from '@src/modules/olMap/handler/OlLayerHandler';
import { TEST_ID_ATTRIBUTE_NAME } from '@src/utils/markup';
import { networkReducer } from '@src/store/network/network.reducer';
import { createNoInitialStateMediaReducer } from '@src/store/media/media.reducer';
import { setIsPortrait } from '@src/store/media/media.action';
import ImageLayer from 'ol/layer/Image';
import { ImageWMS } from 'ol/source';

window.customElements.define(OlMap.tag, OlMap);

describe('OlMap', () => {
	const initialCenter = fromLonLat([11.57245, 48.14021]);
	const initialZoomLevel = 10;
	const initialRotationValue = 0.5;
	const longPressDelay = 300;
	const minZoomLevel = 5;
	const maxZoomLevel = 21;
	const id0 = 'id0';
	const id1 = 'id1';
	const geoResourceId0 = 'geoResourceId0';
	const geoResourceId1 = 'geoResourceId1';

	const mapServiceStub = {
		getMinimalRotation() {
			return 0.05;
		},
		getMinZoomLevel() {
			return minZoomLevel;
		},
		getMaxZoomLevel() {
			return maxZoomLevel;
		},
		getScaleLineContainer() {},
		getVisibleViewport() {}
	};

	const geoResourceServiceStub = {
		byId(id) {
			switch (id) {
				case 'geoResourceId0':
					return new WmsGeoResource(id, 'Label0', 'https://something0.url', 'layer0', 'image/png');
				case 'geoResourceId1':
					return new WmsGeoResource(id, 'Label1', 'https://something1.url', 'layer1', 'image/png');
			}
			return null;
		},
		addOrReplace() {}
	};

	const layerServiceMock = {
		toOlLayer() {}
	};

	const environmentServiceMock = {
		isTouch() {},
		isEmbedded() {}
	};

	const measurementLayerHandlerMock = {
		activate() {},
		deactivate() {},
		get id() {
			return 'measurementLayerHandlerMockId';
		},
		get active() {
			return false;
		},
		get options() {
			return getDefaultLayerOptions();
		}
	};
	const drawLayerHandlerMock = {
		activate() {},
		deactivate() {},
		get id() {
			return 'drawLayerHandlerMockId';
		},
		get options() {
			return getDefaultLayerOptions();
		}
	};
	const geolocationLayerHandlerMock = {
		activate() {},
		deactivate() {},
		get id() {
			return 'geolocationLayerHandlerMockId';
		},
		get options() {
			return getDefaultLayerOptions();
		}
	};
	const highlightLayerHandlerMock = {
		deactivate() {},
		get id() {
			return 'highlightLayerHandlerMockId';
		},
		get active() {
			return false;
		},
		get options() {
			return getDefaultLayerOptions();
		}
	};
	const featureInfoHandlerMock = {
		register() {},
		get id() {
			return 'featureInfoHandlerMockId';
		}
	};
	const olElevationProfileHandlerMock = {
		register() {},
		get id() {
			return 'olElevationProfileHandlerMockId';
		}
	};
	const olSelectableFeatureHandlerMock = {
		register() {},
		get id() {
			return 'olSelectableFeatureHandlerMockId';
		}
	};
	const olLayerSwipeHandlerMock = {
		register() {},
		get id() {
			return 'olLayerSwipeHandlerMockId';
		}
	};

	const olOverlayMapHandlerMock = {
		register() {},
		get id() {
			return 'olOverlayMapHandlerMockId';
		}
	};

	const mfpHandlerMock = {
		activate() {},
		deactivate() {},
		get id() {
			return 'mfpLayerHandlerMockId';
		},
		get options() {
			return getDefaultLayerOptions();
		}
	};
	const routingHandlerMock = {
		activate() {},
		deactivate() {},
		get id() {
			return 'routingLayerHandlerMockId';
		},
		get options() {
			return getDefaultLayerOptions();
		}
	};

	const vectorLayerServiceMock = {};

	let store;

	const setup = (state) => {
		const defaultState = {
			position: {
				zoom: initialZoomLevel,
				center: initialCenter,
				rotation: initialRotationValue,
				fitRequest: null,
				fitLayerRequest: null
			},
			media: {
				portrait: false,
				observeResponsiveParameter: true
			}
		};
		const combinedState = {
			...defaultState,
			...state
		};

		store = TestUtils.setupStoreAndDi(combinedState, {
			map: mapReducer,
			pointer: pointerReducer,
			position: positionReducer,
			layers: layersReducer,
			measurement: measurementReducer,
			network: networkReducer,
			media: createNoInitialStateMediaReducer()
		});

		$injector
			.registerSingleton('MapService', mapServiceStub)
			.registerSingleton('GeoResourceService', geoResourceServiceStub)
			.registerSingleton('EnvironmentService', environmentServiceMock)
			.registerSingleton('OlMeasurementHandler', measurementLayerHandlerMock)
			.registerSingleton('OlDrawHandler', drawLayerHandlerMock)
			.registerSingleton('OlGeolocationHandler', geolocationLayerHandlerMock)
			.registerSingleton('OlHighlightLayerHandler', highlightLayerHandlerMock)
			.registerSingleton('OlFeatureInfoHandler', featureInfoHandlerMock)
			.registerSingleton('OlElevationProfileHandler', olElevationProfileHandlerMock)
			.registerSingleton('OlOverlayMapHandler', olOverlayMapHandlerMock)
			.registerSingleton('OlSelectableFeatureHandler', olSelectableFeatureHandlerMock)
			.registerSingleton('OlLayerSwipeHandler', olLayerSwipeHandlerMock)
			.registerSingleton('OlMfpHandler', mfpHandlerMock)
			.registerSingleton('OlRoutingHandler', routingHandlerMock)
			.registerSingleton('VectorLayerService', vectorLayerServiceMock)
			.registerSingleton('LayerService', layerServiceMock)
			.registerSingleton('TranslationService', { translate: (key) => key });

		return TestUtils.render(OlMap.tag);
	};

	describe('class', () => {
		it('exposes static constants', async () => {
			expect(OlMap.DEFAULT_PADDING_PX).toEqual([10, 10, 10, 10]);
			expect(OlMap.ANIMATION_DURATION_MS).toBe(200);
		});
	});

	describe('when instantiated', () => {
		it('contains a model with default values', async () => {
			await setup();
			const model = new OlMap().getModel();

			expect(model).toEqual({
				zoom: null,
				center: null,
				rotation: null,
				fitRequest: null,
				fitLayerRequest: null,
				layers: []
			});
		});
	});

	describe('when initialized', () => {
		it('configures the map and adds a div which contains the ol-map', async () => {
			const mapServiceSpy = vi.spyOn(mapServiceStub, 'getScaleLineContainer');

			const element = await setup();

			expect(element._view.getZoom()).toBe(initialZoomLevel);
			expect(element._view.getCenter()).toEqual(initialCenter);
			expect(element._view.getRotation()).toBe(initialRotationValue);
			expect(element._view.getMinZoom()).toBe(minZoomLevel);
			expect(element._view.getMaxZoom()).toBe(maxZoomLevel);
			expect(element._view.get('constrainRotation')).toBe(false);
			expect(element._view.get('constrainResolution')).toBe(true);
			expect(element.shadowRoot.querySelectorAll('#ol-map')).toHaveLength(1);
			expect(element.shadowRoot.querySelector('#ol-map').getAttribute('tabindex')).toBe('0');
			expect(element.shadowRoot.querySelector('#ol-map').getAttribute('aria-label')).toBe('olMap_map');
			expect(element.shadowRoot.querySelector('#ol-map').getAttribute('aria-roledescription')).toBe('olMap_map');
			expect(element.shadowRoot.querySelector('#ol-map').classList.contains('is-embedded')).toBe(false);
			//all default controls are removed, ScaleLine control added
			expect(element._map.getControls().getLength()).toBe(1);
			//all interactions are present
			expect(element._map.getInteractions().getLength()).toBe(9);
			expect(element._map.moveTolerance_).toBe(1);
			expect(mapServiceSpy).toHaveBeenCalled();
		});

		describe('on touch device', () => {
			it('configures the map and adds a div which contains the ol-map', async () => {
				vi.spyOn(environmentServiceMock, 'isTouch').mockReturnValue(true);
				const element = await setup();

				expect(element._map.moveTolerance_).toBe(3);
				expect(element._view.get('constrainResolution')).toBe(false);
			});
		});

		describe('in embedded mode', () => {
			it('configures the map and adds a div which contains the ol-map', async () => {
				vi.spyOn(environmentServiceMock, 'isEmbedded').mockReturnValue(true);
				const element = await setup();

				expect(element.shadowRoot.querySelector('#ol-map').classList.contains('is-embedded')).toBe(true);
			});
		});

		it('contains test-id attributes', async () => {
			const element = await setup();

			expect(element.shadowRoot.querySelectorAll(`[${TEST_ID_ATTRIBUTE_NAME}]`)).toHaveLength(1);
			expect(element.shadowRoot.querySelector('#ol-map').hasAttribute(TEST_ID_ATTRIBUTE_NAME)).toBe(true);
		});
	});

	describe('when disconnected', () => {
		it('removes all observers and resets the map', async () => {
			const element = await setup();
			const spy = vi.spyOn(element._map, 'setTarget');

			element.onDisconnect(); // we call onDisconnect manually

			expect(element._map).toBeNull();
			expect(element._view).toBeNull();
			expect(spy).toHaveBeenCalledWith(null);
		});
	});

	describe('when orientation changes', () => {
		it('updates the map size', async () => {
			const element = await setup();
			const map = element._map;
			const spy = vi.spyOn(map, 'updateSize');

			setIsPortrait(true);

			expect(spy).toHaveBeenCalled();
		});
	});

	describe('view events', () => {
		describe('rotation:change', () => {
			it('updates the liveRotation property of the position state', async () => {
				const rotationValue = 0.5678;
				const element = await setup();
				const view = element._view;
				const event = new Event('change:rotation');
				event.target = { getRotation: () => rotationValue };

				view.dispatchEvent(event);

				expect(store.getState().position.liveRotation).toBe(rotationValue);
			});
		});

		describe('change:center', () => {
			it('updates the liveCenter property of the position state', async () => {
				const center = [21, 42];
				const element = await setup();
				const view = element._view;
				const event = new Event('change:center');
				event.target = { getCenter: () => center };

				view.dispatchEvent(event);

				expect(store.getState().position.liveCenter).toEqual(center);
			});
		});

		describe('change:resolution', () => {
			it('updates the liveZoom property of the position state', async () => {
				const zoom = 5.55;
				const element = await setup();
				const view = element._view;
				const event = new Event('change:resolution');
				event.target = { getZoom: () => zoom };

				view.dispatchEvent(event);

				expect(store.getState().position.liveZoom).toBe(zoom);
			});
		});
	});

	describe('map move events', () => {
		describe('movestart', () => {
			it("updates the 'movestart' property in map store", async () => {
				const element = await setup();

				simulateMapEvent(element._map, MapEventType.MOVESTART);

				expect(store.getState().map.moveStart.payload).toBe('movestart');
			});

			it("updates the 'beingMoved' property in pointer store", async () => {
				const element = await setup();

				simulateMapEvent(element._map, MapEventType.MOVESTART);

				expect(store.getState().map.beingMoved).toBe(true);

				simulateMapEvent(element._map, MapEventType.MOVEEND);

				expect(store.getState().map.beingMoved).toBe(false);
			});
		});

		describe('moveend', () => {
			it("updates the 'moveend' property in map store", async () => {
				const element = await setup();

				simulateMapEvent(element._map, MapEventType.MOVEEND);

				expect(store.getState().map.moveEnd.payload).toBe('moveend');
			});

			it('updates the position state properties', async () => {
				const element = await setup();
				const view = element._view;
				vi.spyOn(view, 'getZoom').mockReturnValue(5);
				vi.spyOn(view, 'getCenter').mockReturnValue([21, 42]);
				vi.spyOn(view, 'getRotation').mockReturnValue(0.5);

				simulateMapEvent(element._map, MapEventType.MOVEEND);

				expect(store.getState().position.zoom).toBe(5);
				expect(store.getState().position.center).toEqual([21, 42]);
				expect(store.getState().position.rotation).toBe(0.5);
			});
		});
	});

	describe('pointer events', () => {
		describe('when pointer move', () => {
			it("updates the 'pointer' property in pointer store", async () => {
				const element = await setup();
				const map = element._map;
				const coordinate = [38, 75];
				const screenCoordinate = [21, 42];
				vi.spyOn(map, 'getEventCoordinate').mockReturnValue(coordinate);

				simulateMapBrowserEvent(element._map, MapBrowserEventType.POINTERMOVE, ...screenCoordinate);

				expect(store.getState().pointer.move.payload.coordinate).toEqual(coordinate);
				expect(store.getState().pointer.move.payload.screenCoordinate).toEqual(screenCoordinate);
			});
		});

		describe('when pointer drag', () => {
			it("does NOT update the 'pointer' property in pointer store", async () => {
				const element = await setup();
				const map = element._map;
				const coordinate = [38, 75];
				const screenCoordinate = [21, 42];
				vi.spyOn(map, 'getEventCoordinate').mockReturnValue(coordinate);

				simulateMapBrowserEvent(element._map, MapBrowserEventType.POINTERMOVE, ...screenCoordinate, true);

				expect(store.getState().pointer.move).toBeNull();
			});

			it("updates the 'beingDragged' property in pointer store", async () => {
				const element = await setup();
				const map = element._map;
				const coordinate = [38, 75];
				const screenCoordinate = [21, 42];
				vi.spyOn(map, 'getEventCoordinate').mockReturnValue(coordinate);

				simulateMapBrowserEvent(element._map, MapBrowserEventType.POINTERDRAG, ...screenCoordinate, true);

				expect(store.getState().pointer.beingDragged).toBe(true);

				simulateMapEvent(element._map, MapEventType.MOVEEND);

				expect(store.getState().pointer.beingDragged).toBe(false);
			});
		});
	});

	describe('single-click / short-press event', () => {
		describe('on non touch device', () => {
			it("updates the 'click' property in pointer store", async () => {
				vi.spyOn(environmentServiceMock, 'isTouch').mockReturnValue(false);
				const element = await setup();
				const map = element._map;
				const coordinate = [38, 75];
				const screenCoordinate = [21, 42];
				vi.spyOn(map, 'getEventCoordinate').mockReturnValue(coordinate);
				const preventDefault = vi.fn();

				simulateMapBrowserEvent(map, MapBrowserEventType.SINGLECLICK, ...screenCoordinate, false, preventDefault);

				expect(store.getState().pointer.click.payload.coordinate).toEqual(coordinate);
				expect(store.getState().pointer.click.payload.screenCoordinate).toEqual(screenCoordinate);
				expect(preventDefault).toHaveBeenCalled();
			});

			it("updates the 'click' property when layer handler is active but allows default click handling", async () => {
				vi.spyOn(environmentServiceMock, 'isTouch').mockReturnValue(false);
				//we set the highlightLayerHandlerMock active which allows click handling
				vi.spyOn(highlightLayerHandlerMock, 'active', 'get').mockReturnValue(true);
				vi.spyOn(highlightLayerHandlerMock, 'options', 'get').mockReturnValue({
					preventDefaultClickHandling: false,
					preventDefaultContextClickHandling: true
				});
				const element = await setup();
				const map = element._map;
				const coordinate = [38, 75];
				const screenCoordinate = [21, 42];
				vi.spyOn(map, 'getEventCoordinate').mockReturnValue(coordinate);
				const preventDefault = vi.fn();

				simulateMapBrowserEvent(map, MapBrowserEventType.SINGLECLICK, ...screenCoordinate, false, preventDefault);

				expect(store.getState().pointer.click.payload.coordinate).toEqual(coordinate);
				expect(store.getState().pointer.click.payload.screenCoordinate).toEqual(screenCoordinate);
				expect(preventDefault).toHaveBeenCalled();
			});

			it('does nothing when layer handler is active', async () => {
				vi.spyOn(environmentServiceMock, 'isTouch').mockReturnValue(false);
				const element = await setup();
				const map = element._map;
				const coordinate = [38, 75];
				const screenCoordinate = [21, 42];
				vi.spyOn(map, 'getEventCoordinate').mockReturnValue(coordinate);
				//we set one handler active
				vi.spyOn(measurementLayerHandlerMock, 'active', 'get').mockReturnValue(true);
				const preventDefault = vi.fn();

				simulateMapBrowserEvent(map, MapBrowserEventType.SINGLECLICK, ...screenCoordinate, false, preventDefault);

				expect(preventDefault).not.toHaveBeenCalled();
			});
		});

		describe('on touch device', () => {
			beforeEach(() => {
				vi.useFakeTimers();
			});

			afterEach(() => {
				vi.useRealTimers();
			});

			it("updates the 'click' property in pointer store", async () => {
				vi.spyOn(environmentServiceMock, 'isTouch').mockReturnValue(true);
				const element = await setup();
				const map = element._map;
				const coordinate = [38, 75];
				const screenCoordinate = [21, 42];
				vi.spyOn(map, 'getEventCoordinate').mockReturnValue(coordinate);
				const preventDefault = vi.fn();

				//we simulate a "short-press" event
				simulateMapBrowserEvent(map, MapBrowserEventType.POINTERDOWN);
				vi.advanceTimersByTime(longPressDelay - 100);
				simulateMapBrowserEvent(map, MapBrowserEventType.POINTERUP, ...screenCoordinate, false, preventDefault);

				expect(store.getState().pointer.click.payload.coordinate).toEqual(coordinate);
				expect(store.getState().pointer.click.payload.screenCoordinate).toEqual(screenCoordinate);
				expect(preventDefault).toHaveBeenCalled();
			});

			it("updates the 'click' property when layer handler is active but allows default click handling", async () => {
				vi.spyOn(environmentServiceMock, 'isTouch').mockReturnValue(true);
				//we set the highlightLayerHandlerMock active which allows click handling
				vi.spyOn(highlightLayerHandlerMock, 'active', 'get').mockReturnValue(true);
				vi.spyOn(highlightLayerHandlerMock, 'options', 'get').mockReturnValue({
					preventDefaultClickHandling: false,
					preventDefaultContextClickHandling: true
				});
				const element = await setup();
				const map = element._map;
				const coordinate = [38, 75];
				const screenCoordinate = [21, 42];
				vi.spyOn(map, 'getEventCoordinate').mockReturnValue(coordinate);
				const preventDefault = vi.fn();

				//we simulate a "short-press" event
				simulateMapBrowserEvent(map, MapBrowserEventType.POINTERDOWN);
				vi.advanceTimersByTime(longPressDelay - 100);
				simulateMapBrowserEvent(map, MapBrowserEventType.POINTERUP, ...screenCoordinate, false, preventDefault);

				expect(store.getState().pointer.click.payload.coordinate).toEqual(coordinate);
				expect(store.getState().pointer.click.payload.screenCoordinate).toEqual(screenCoordinate);
				expect(preventDefault).toHaveBeenCalled();
			});

			it('does nothing when layer handler is active', async () => {
				vi.spyOn(environmentServiceMock, 'isTouch').mockReturnValue(true);
				const element = await setup();
				const map = element._map;
				const coordinate = [38, 75];
				const screenCoordinate = [21, 42];
				vi.spyOn(map, 'getEventCoordinate').mockReturnValue(coordinate);
				//we set one handler active
				vi.spyOn(measurementLayerHandlerMock, 'active', 'get').mockReturnValue(true);
				const preventDefault = vi.fn();

				//we simulate a "short-press" event
				simulateMapBrowserEvent(map, MapBrowserEventType.POINTERDOWN);
				vi.advanceTimersByTime(longPressDelay - 100);
				simulateMapBrowserEvent(map, MapBrowserEventType.POINTERUP, ...screenCoordinate, false, preventDefault);

				expect(preventDefault).not.toHaveBeenCalled();
			});
		});
	});

	describe('context-click / long-press event', () => {
		describe('contextmenu event handling', () => {
			describe('on non touch device', () => {
				it("updates the 'contextclick' property in pointer store", async () => {
					vi.spyOn(environmentServiceMock, 'isTouch').mockReturnValue(false);
					const element = await setup();
					const map = element._map;
					const coordinate = [38, 75];
					const screenCoordinate = [21, 42];
					vi.spyOn(map, 'getEventCoordinate').mockReturnValue(coordinate);
					const preventDefault = vi.fn();

					simulateMapBrowserEvent(map, 'pointerdown', ...screenCoordinate, false, preventDefault);
					simulateMapBrowserEvent(map, 'contextmenu', ...screenCoordinate, false, preventDefault);

					expect(store.getState().pointer.contextClick.payload.coordinate).toEqual(coordinate);
					expect(store.getState().pointer.contextClick.payload.screenCoordinate).toEqual(screenCoordinate);
					expect(preventDefault).toHaveBeenCalled();
				});

				it("updates the 'contextclick' when layer handler is active but allows default context click handling", async () => {
					vi.spyOn(environmentServiceMock, 'isTouch').mockReturnValue(false);
					//we set the highlightLayerHandlerMock active which allows context click handling
					vi.spyOn(highlightLayerHandlerMock, 'active', 'get').mockReturnValue(true);
					vi.spyOn(highlightLayerHandlerMock, 'options', 'get').mockReturnValue({
						preventDefaultClickHandling: true,
						preventDefaultContextClickHandling: false
					});
					const element = await setup();
					const map = element._map;
					const coordinate = [38, 75];
					const screenCoordinate = [21, 42];
					vi.spyOn(map, 'getEventCoordinate').mockReturnValue(coordinate);
					const preventDefault = vi.fn();

					simulateMapBrowserEvent(map, 'pointerdown', ...screenCoordinate, false, preventDefault);
					simulateMapBrowserEvent(map, 'contextmenu', ...screenCoordinate, false, preventDefault);

					expect(store.getState().pointer.contextClick.payload.coordinate).toEqual(coordinate);
					expect(store.getState().pointer.contextClick.payload.screenCoordinate).toEqual(screenCoordinate);
					expect(preventDefault).toHaveBeenCalled();
				});

				it('does nothing when layer handler is active', async () => {
					vi.spyOn(environmentServiceMock, 'isTouch').mockReturnValue(false);
					//we set one handler active
					vi.spyOn(measurementLayerHandlerMock, 'active', 'get').mockReturnValue(true);
					const element = await setup();
					const map = element._map;
					const coordinate = [38, 75];
					const screenCoordinate = [21, 42];
					vi.spyOn(map, 'getEventCoordinate').mockReturnValue(coordinate);
					const preventDefault = vi.fn();

					simulateMapBrowserEvent(map, 'contextmenu', ...screenCoordinate, false, preventDefault);

					expect(preventDefault).not.toHaveBeenCalled();
				});
			});

			describe('on touch device', () => {
				beforeEach(() => {
					vi.useFakeTimers();
				});

				afterEach(() => {
					vi.useRealTimers();
				});

				it("updates the 'contextclick' property in pointer store", async () => {
					vi.spyOn(environmentServiceMock, 'isTouch').mockReturnValue(true);
					const element = await setup();
					const map = element._map;
					const coordinate = [38, 75];
					const screenCoordinate = [21, 42];
					vi.spyOn(map, 'getEventCoordinate').mockReturnValue(coordinate);
					const preventDefault = vi.fn();

					//we simulate a "long-press" event
					simulateMapBrowserEvent(map, MapBrowserEventType.POINTERDOWN, ...screenCoordinate, false, preventDefault);
					vi.advanceTimersByTime(longPressDelay + 100);
					simulateMapBrowserEvent(map, MapBrowserEventType.POINTERUP);

					expect(store.getState().pointer.contextClick.payload.coordinate).toEqual(coordinate);
					expect(store.getState().pointer.contextClick.payload.screenCoordinate).toEqual(screenCoordinate);
					expect(preventDefault).toHaveBeenCalled();
				});

				it("updates the 'contextclick' when layer handler is active but allows default context click handling", async () => {
					vi.spyOn(environmentServiceMock, 'isTouch').mockReturnValue(true);
					//we set one handler active
					vi.spyOn(highlightLayerHandlerMock, 'active', 'get').mockReturnValue(true);
					vi.spyOn(highlightLayerHandlerMock, 'options', 'get').mockReturnValue({
						preventDefaultClickHandling: true,
						preventDefaultContextClickHandling: false
					});
					const element = await setup();
					const map = element._map;
					const coordinate = [38, 75];
					const screenCoordinate = [21, 42];
					vi.spyOn(map, 'getEventCoordinate').mockReturnValue(coordinate);
					const preventDefault = vi.fn();

					//we simulate a "long-press" event
					simulateMapBrowserEvent(map, MapBrowserEventType.POINTERDOWN, ...screenCoordinate, false, preventDefault);
					vi.advanceTimersByTime(longPressDelay + 100);
					simulateMapBrowserEvent(map, MapBrowserEventType.POINTERUP);

					expect(store.getState().pointer.contextClick.payload.coordinate).toEqual(coordinate);
					expect(store.getState().pointer.contextClick.payload.screenCoordinate).toEqual(screenCoordinate);
					expect(preventDefault).toHaveBeenCalled();
				});

				it('does nothing when layer handler is active', async () => {
					vi.spyOn(environmentServiceMock, 'isTouch').mockReturnValue(true);
					//we set one handler active
					vi.spyOn(measurementLayerHandlerMock, 'active', 'get').mockReturnValue(true);
					const element = await setup();
					const map = element._map;
					const coordinate = [38, 75];
					const screenCoordinate = [21, 42];
					vi.spyOn(map, 'getEventCoordinate').mockReturnValue(coordinate);
					const preventDefault = vi.fn();

					//we simulate a "long-press" event
					simulateMapBrowserEvent(map, MapBrowserEventType.POINTERDOWN, ...screenCoordinate, false, preventDefault);
					vi.advanceTimersByTime(longPressDelay + 100);
					simulateMapBrowserEvent(map, MapBrowserEventType.POINTERUP);

					expect(preventDefault).not.toHaveBeenCalled();
				});
			});
		});
	});

	describe('olView management', () => {
		beforeEach(() => {
			vi.spyOn(OlMap, 'ANIMATION_DURATION_MS', 'get').mockReturnValue(0);
		});

		describe('position', () => {
			it('updates zoom and center', async () => {
				const element = await setup();
				const view = element._map.getView();
				const viewSpy = vi.spyOn(view, 'animate');

				changeZoomAndCenter({ zoom: 5, center: [21, 42] });

				expect(viewSpy).toHaveBeenCalledWith({
					zoom: 5,
					center: [21, 42],
					rotation: initialRotationValue,
					duration: OlMap.ANIMATION_DURATION_MS
				});
			});

			it('updates rotation', async () => {
				const element = await setup();
				const view = element._map.getView();
				const viewSpy = vi.spyOn(view, 'animate');

				changeRotation(1);

				expect(viewSpy).toHaveBeenCalledWith({
					zoom: initialZoomLevel,
					center: initialCenter,
					rotation: 1,
					duration: OlMap.ANIMATION_DURATION_MS
				});
			});

			it('does nothing when view already in place', async () => {
				const element = await setup();
				const view = element._map.getView();
				const viewSpy = vi.spyOn(view, 'animate');

				changeCenter(initialCenter);
				changeZoom(initialZoomLevel);
				changeRotation(initialRotationValue);

				expect(viewSpy).not.toHaveBeenCalled();
			});
		});

		it('fits to an extent', async () => {
			const element = await setup();
			const map = element._map;
			const view = element._map.getView();
			const viewSpy = vi.spyOn(view, 'fit');
			const spy = vi.spyOn(element, '_syncStore');
			const extent = [38, 57, 39, 58];
			const mapServiceSpy = vi.spyOn(mapServiceStub, 'getVisibleViewport').mockReturnValue({ top: 10, right: 20, bottom: 30, left: 40 });

			fitMap(extent);

			expect(store.getState().position.fitRequest).not.toBeNull();
			expect(viewSpy).toHaveBeenCalledExactlyOnceWith(extent, {
				maxZoom: view.getMaxZoom(),
				callback: expect.anything(),
				padding: [
					10 + OlMap.DEFAULT_PADDING_PX[0],
					20 + OlMap.DEFAULT_PADDING_PX[1],
					30 + OlMap.DEFAULT_PADDING_PX[2],
					40 + OlMap.DEFAULT_PADDING_PX[3]
				],
				duration: OlMap.ANIMATION_DURATION_MS
			});

			await TestUtils.timeout();
			// store is in sync with view
			expect(spy).toHaveBeenCalled();
			expect(mapServiceSpy).toHaveBeenCalledWith(map.getTarget());
		});

		it('fits to an extent with custom maxZoom option', async () => {
			const element = await setup();
			const map = element._map;
			const view = element._map.getView();
			const viewSpy = vi.spyOn(view, 'fit');
			const spy = vi.spyOn(element, '_syncStore');
			const extent = [38, 57, 39, 58];
			const maxZoom = 10;
			const mapServiceSpy = vi.spyOn(mapServiceStub, 'getVisibleViewport').mockReturnValue({ top: 10, right: 20, bottom: 30, left: 40 });

			fitMap(extent, { maxZoom: maxZoom });

			expect(store.getState().position.fitRequest).not.toBeNull();
			expect(viewSpy).toHaveBeenCalledExactlyOnceWith(extent, {
				maxZoom: maxZoom,
				callback: expect.anything(),
				padding: [
					10 + OlMap.DEFAULT_PADDING_PX[0],
					20 + OlMap.DEFAULT_PADDING_PX[1],
					30 + OlMap.DEFAULT_PADDING_PX[2],
					40 + OlMap.DEFAULT_PADDING_PX[3]
				],
				duration: OlMap.ANIMATION_DURATION_MS
			});
			await TestUtils.timeout();
			// store is in sync with view
			expect(spy).toHaveBeenCalled();
			expect(mapServiceSpy).toHaveBeenCalledWith(map.getTarget());
		});

		it('fits to an extent with custom useVisibleViewport option', async () => {
			const element = await setup();
			const view = element._map.getView();
			const viewSpy = vi.spyOn(view, 'fit');
			const spy = vi.spyOn(element, '_syncStore');
			const extent = [38, 57, 39, 58];

			fitMap(extent, { useVisibleViewport: false });

			expect(store.getState().position.fitRequest).not.toBeNull();
			expect(viewSpy).toHaveBeenCalledExactlyOnceWith(extent, {
				maxZoom: view.getMaxZoom(),
				callback: expect.anything(),
				padding: OlMap.DEFAULT_PADDING_PX,
				duration: OlMap.ANIMATION_DURATION_MS
			});
			await TestUtils.timeout();
			// store is in sync with view
			expect(spy).toHaveBeenCalled();
		});

		it('fits to a vector layers extent', async () => {
			const element = await setup();
			const map = element._map;
			const view = map.getView();
			const viewSpy = vi.spyOn(view, 'fit');
			const spy = vi.spyOn(element, '_syncStore');
			const extent = [38, 57, 39, 58];
			const olVectorSource = new VectorSource();
			vi.spyOn(olVectorSource, 'getExtent').mockReturnValue(extent);
			const layerServiceSpy = vi.spyOn(layerServiceMock, 'toOlLayer').mockImplementation((id) => new VectorLayer({ id: id, source: olVectorSource }));
			const mapServiceSpy = vi.spyOn(mapServiceStub, 'getVisibleViewport').mockReturnValue({ top: 10, right: 20, bottom: 30, left: 40 });
			addLayer(id0, { geoResourceId: geoResourceId0 });

			fitLayer(id0);

			expect(store.getState().position.fitLayerRequest.payload).not.toBeNull();
			expect(viewSpy).toHaveBeenCalledExactlyOnceWith(extent, {
				maxZoom: view.getMaxZoom(),
				callback: expect.anything(),
				padding: [
					10 + OlMap.DEFAULT_PADDING_PX[0],
					20 + OlMap.DEFAULT_PADDING_PX[1],
					30 + OlMap.DEFAULT_PADDING_PX[2],
					40 + OlMap.DEFAULT_PADDING_PX[3]
				],
				duration: OlMap.ANIMATION_DURATION_MS
			});

			await TestUtils.timeout();
			// store is in sync with view
			expect(spy).toHaveBeenCalled();
			expect(mapServiceSpy).toHaveBeenCalledWith(map.getTarget());
			expect(layerServiceSpy).toHaveBeenCalledWith(id0, expect.anything(), map);
		});

		it('fits to a vector layers extent with custom maxZoom option', async () => {
			const element = await setup();
			const map = element._map;
			const view = map.getView();
			const viewSpy = vi.spyOn(view, 'fit');
			const spy = vi.spyOn(element, '_syncStore');
			const extent = [38, 57, 39, 58];
			const olVectorSource = new VectorSource();
			const maxZoom = 10;
			vi.spyOn(olVectorSource, 'getExtent').mockReturnValue(extent);
			const layerServiceSpy = vi.spyOn(layerServiceMock, 'toOlLayer').mockImplementation((id) => new VectorLayer({ id: id, source: olVectorSource }));
			const mapServiceSpy = vi.spyOn(mapServiceStub, 'getVisibleViewport').mockReturnValue({ top: 10, right: 20, bottom: 30, left: 40 });
			addLayer(id0, { geoResourceId: geoResourceId0 });

			fitLayer(id0, { maxZoom: maxZoom });

			expect(store.getState().position.fitLayerRequest.payload).not.toBeNull();
			expect(viewSpy).toHaveBeenCalledExactlyOnceWith(extent, {
				maxZoom: maxZoom,
				callback: expect.anything(),
				padding: [
					10 + OlMap.DEFAULT_PADDING_PX[0],
					20 + OlMap.DEFAULT_PADDING_PX[1],
					30 + OlMap.DEFAULT_PADDING_PX[2],
					40 + OlMap.DEFAULT_PADDING_PX[3]
				],
				duration: OlMap.ANIMATION_DURATION_MS
			});

			await TestUtils.timeout();
			// store is in sync with view
			expect(spy).toHaveBeenCalled();
			expect(mapServiceSpy).toHaveBeenCalledWith(map.getTarget());
			expect(layerServiceSpy).toHaveBeenCalledWith(id0, expect.anything(), map);
		});

		it('fits to vector layers extent with custom useVisibleViewport option', async () => {
			const element = await setup();
			const map = element._map;
			const view = map.getView();
			const viewSpy = vi.spyOn(view, 'fit');
			const spy = vi.spyOn(element, '_syncStore');
			const extent = [38, 57, 39, 58];
			const olVectorSource = new VectorSource();
			vi.spyOn(olVectorSource, 'getExtent').mockReturnValue(extent);
			const layerServiceSpy = vi.spyOn(layerServiceMock, 'toOlLayer').mockImplementation((id) => new VectorLayer({ id: id, source: olVectorSource }));
			addLayer(id0, { geoResourceId: geoResourceId0 });

			fitLayer(id0, { useVisibleViewport: false });

			expect(store.getState().position.fitLayerRequest.payload).not.toBeNull();
			expect(viewSpy).toHaveBeenCalledExactlyOnceWith(extent, {
				maxZoom: view.getMaxZoom(),
				callback: expect.anything(),
				padding: OlMap.DEFAULT_PADDING_PX,
				duration: OlMap.ANIMATION_DURATION_MS
			});

			await TestUtils.timeout();
			// store is in sync with view
			expect(spy).toHaveBeenCalled();
			expect(layerServiceSpy).toHaveBeenCalledWith(id0, expect.anything(), map);
		});

		it('does nothing when layer has no source', async () => {
			const element = await setup();
			const map = element._map;
			const view = map.getView();
			const viewSpy = vi.spyOn(view, 'fit');
			const layerServiceSpy = vi.spyOn(layerServiceMock, 'toOlLayer').mockImplementation((id) => new LayerGroup({ id }));
			addLayer(id0, { geoResourceId: geoResourceId0 });

			fitLayer(id0);

			expect(store.getState().position.fitLayerRequest.payload).not.toBeNull();
			expect(viewSpy).not.toHaveBeenCalled();
			expect(layerServiceSpy).toHaveBeenCalledWith(id0, expect.anything(), map);
		});

		it('does nothing when layer return NULL as source', async () => {
			const element = await setup();
			const map = element._map;
			const view = map.getView();
			const viewSpy = vi.spyOn(view, 'fit');
			const layerServiceSpy = vi.spyOn(layerServiceMock, 'toOlLayer').mockImplementation((id) => new Layer({ id: id, render: () => {} }));
			addLayer(id0, { geoResourceId: geoResourceId0 });

			fitLayer(id0);

			expect(store.getState().position.fitLayerRequest.payload).not.toBeNull();
			expect(viewSpy).not.toHaveBeenCalled();
			expect(layerServiceSpy).toHaveBeenCalledWith(id0, expect.anything(), map);
		});

		it('does nothing when layers source is not a vector source', async () => {
			const element = await setup();
			const map = element._map;
			const view = map.getView();
			const viewSpy = vi.spyOn(view, 'fit');
			const layerServiceSpy = vi.spyOn(layerServiceMock, 'toOlLayer').mockImplementation((id) => new ImageLayer({ id, source: new ImageWMS() }));
			addLayer(id0, { geoResourceId: geoResourceId0 });

			fitLayer(id0);

			expect(store.getState().position.fitLayerRequest.payload).not.toBeNull();
			expect(viewSpy).not.toHaveBeenCalled();
			expect(layerServiceSpy).toHaveBeenCalledWith(id0, expect.anything(), map);
		});

		it("does nothing when source can't provide an extent", async () => {
			const element = await setup();
			const map = element._map;
			const view = map.getView();
			const viewSpy = vi.spyOn(view, 'fit');
			const olVectorSource = new VectorSource();
			vi.spyOn(olVectorSource, 'getExtent').mockReturnValue(undefined);
			const layerServiceSpy = vi.spyOn(layerServiceMock, 'toOlLayer').mockImplementation((id) => new VectorLayer({ id: id, source: olVectorSource }));
			addLayer(id0, { geoResourceId: geoResourceId0 });

			fitLayer(id0);

			expect(store.getState().position.fitLayerRequest.payload).not.toBeNull();
			expect(viewSpy).not.toHaveBeenCalled();
			expect(layerServiceSpy).toHaveBeenCalledWith(id0, expect.anything(), map);
		});

		it('does nothing when source provides an empty extent', async () => {
			const element = await setup();
			const map = element._map;
			const view = map.getView();
			const viewSpy = vi.spyOn(view, 'fit');
			const extent = [Infinity, Infinity, -Infinity, -Infinity];
			const olVectorSource = new VectorSource();
			vi.spyOn(olVectorSource, 'getExtent').mockReturnValue(extent);
			const layerServiceSpy = vi.spyOn(layerServiceMock, 'toOlLayer').mockImplementation((id) => new VectorLayer({ id: id, source: olVectorSource }));
			addLayer(id0, { geoResourceId: geoResourceId0 });

			fitLayer(id0);

			expect(store.getState().position.fitLayerRequest.payload).not.toBeNull();
			expect(viewSpy).not.toHaveBeenCalled();
			expect(layerServiceSpy).toHaveBeenCalledWith(id0, expect.anything(), map);
		});

		it('adds an olLayer resolving a GeoResourceFuture', async () => {
			const element = await setup();
			const map = element._map;
			const view = map.getView();
			const extent = [38, 57, 39, 58];
			const viewSpy = vi.spyOn(view, 'fit');
			const spy = vi.spyOn(element, '_syncStore');
			const olVectorSource = new VectorSource();
			const geoResource = new VectorGeoResource(geoResourceId0, 'label', VectorSourceType.GEOJSON);
			const olPlaceHolderLayer = new Layer({ id: id0, render: () => {} });
			const olRealLayer = new VectorLayer({ id: id0, source: olVectorSource });
			const future = new GeoResourceFuture(geoResourceId0, async () => geoResource);
			const layerServiceSpy = vi.spyOn(layerServiceMock, 'toOlLayer').mockImplementation((id, geoResource) => {
				if (geoResource instanceof GeoResourceFuture) {
					return olPlaceHolderLayer;
				}
				return olRealLayer;
			});
			vi.spyOn(olVectorSource, 'getExtent').mockReturnValue(extent);
			const geoResourceServiceSpy = vi.spyOn(geoResourceServiceStub, 'byId').mockReturnValue(future);
			const mapServiceSpy = vi.spyOn(mapServiceStub, 'getVisibleViewport').mockReturnValue({ top: 10, right: 20, bottom: 30, left: 40 });

			addLayer(id0, { geoResourceId: geoResourceId0 });
			fitLayer(id0);

			await TestUtils.timeout(); // resolve GeoResource
			await TestUtils.timeout(); // internal calling of #fit is wrapped within a timeout fn

			expect(store.getState().position.fitLayerRequest.payload).not.toBeNull();
			expect(viewSpy).toHaveBeenCalledExactlyOnceWith(extent, {
				maxZoom: view.getMaxZoom(),
				callback: expect.anything(),
				padding: [
					10 + OlMap.DEFAULT_PADDING_PX[0],
					20 + OlMap.DEFAULT_PADDING_PX[1],
					30 + OlMap.DEFAULT_PADDING_PX[2],
					40 + OlMap.DEFAULT_PADDING_PX[3]
				],
				duration: OlMap.ANIMATION_DURATION_MS
			});

			await TestUtils.timeout();
			// store is in sync with view
			expect(spy).toHaveBeenCalled();
			expect(layerServiceSpy).toHaveBeenCalledWith(id0, expect.anything(), map);
			expect(geoResourceServiceSpy).toHaveBeenCalledWith(geoResourceId0);
			expect(mapServiceSpy).toHaveBeenCalledWith(map.getTarget());
		});
	});

	describe('olLayer management', () => {
		it('initially has no olLayer', async () => {
			const element = await setup();
			const map = element._map;

			expect(map.getLayers().getLength()).toBe(0);
		});

		it('adds an olLayer with custom settings', async () => {
			const element = await setup();
			const map = element._map;
			const id = 'id0';
			const geoResourceId0 = 'geoResourceId0';
			const layerServiceSpy = vi.spyOn(layerServiceMock, 'toOlLayer').mockImplementation((id) => new VectorLayer({ id: id }));

			addLayer(id0, { visible: false, opacity: 0.5, geoResourceId: geoResourceId0 });

			expect(map.getLayers().getLength()).toBe(1);

			const layer = map.getLayers().item(0);
			expect(layer.get('id')).toBe(id);
			expect(layer.getOpacity()).toBe(0.5);
			expect(layer.getVisible()).toBe(false);
			expect(layerServiceSpy).toHaveBeenCalledWith(id0, expect.anything(), map);
		});

		it('adds an olLayer with custom index', async () => {
			const element = await setup();
			const map = element._map;
			const layerServiceSpy = vi.spyOn(layerServiceMock, 'toOlLayer').mockImplementation((id) => new VectorLayer({ id: id }));

			addLayer(id0, { geoResourceId: geoResourceId0 });
			addLayer(id1, { zIndex: 0, geoResourceId: geoResourceId1 });
			expect(map.getLayers().getLength()).toBe(2);
			const layer0 = map.getLayers().item(0);
			expect(layer0.get('id')).toBe(id0);
			expect(layer0.getZIndex()).toBe(1);
			const layer1 = map.getLayers().item(1);
			expect(layer1.get('id')).toBe(id1);
			expect(layer1.getZIndex()).toBe(0);
			expect(layerServiceSpy).toHaveBeenCalledWith(id0, expect.anything(), map);
		});

		it('adds an olLayer resolving a GeoResourceFuture', async () => {
			const element = await setup();
			const map = element._map;
			const geoResource = new WmsGeoResource(geoResourceId0, 'Label2', 'https://something0.url', 'layer2', 'image/png');
			const olPlaceHolderLayer = new Layer({ id: id0, render: () => {} });
			const olRealLayer = new VectorLayer({ id: id0 });
			const future = new GeoResourceFuture(geoResourceId0, async () => geoResource);
			const layerServiceSpy = vi.spyOn(layerServiceMock, 'toOlLayer').mockImplementation((id, geoResource) => {
				if (geoResource instanceof GeoResourceFuture) {
					return olPlaceHolderLayer;
				}
				return olRealLayer;
			});
			const geoResourceServiceSpy = vi.spyOn(geoResourceServiceStub, 'byId').mockReturnValue(future);
			vi.spyOn(geoResourceServiceStub, 'addOrReplace').mockImplementation((gr) => gr);

			addLayer(id0, { geoResourceId: geoResourceId0 });

			expect(map.getLayers().getLength()).toBe(1);
			let layer = map.getLayers().item(0);
			expect(layer.get('id')).toBe(id0);
			expect(layer).toEqual(olPlaceHolderLayer);

			await TestUtils.timeout();
			layer = map.getLayers().item(0);
			expect(layer.get('id')).toBe(id0);
			expect(map.getLayers().getLength()).toBe(1);
			expect(layer).toEqual(olRealLayer);
			expect(layerServiceSpy).toHaveBeenCalledWith(id0, expect.anything(), map);
			expect(geoResourceServiceSpy).toHaveBeenCalledWith(geoResourceId0);
		});

		it('adds an olLayer resolving a GeoResourceFuture with custom settings', async () => {
			const element = await setup();
			const map = element._map;
			const geoResource = new VectorGeoResource(geoResourceId0, 'label', VectorSourceType.GEOJSON);
			const olPlaceHolderLayer = new Layer({ id: id0, render: () => {} });
			const olRealLayer = new VectorLayer({ id: id0 });
			const future = new GeoResourceFuture(geoResourceId0, async () => geoResource);
			const layerServiceSpy = vi.spyOn(layerServiceMock, 'toOlLayer').mockImplementation((id, geoResource) => {
				if (geoResource instanceof GeoResourceFuture) {
					return olPlaceHolderLayer;
				}
				return olRealLayer;
			});
			const geoResourceServiceSp = vi.spyOn(geoResourceServiceStub, 'byId').mockReturnValue(future);
			vi.spyOn(geoResourceServiceStub, 'addOrReplace').mockImplementation((gr) => gr);

			addLayer(id0, { visible: false, opacity: 0.5, geoResourceId: geoResourceId0 });
			// We immediately change a property before the GeoResourceFuture is resolved to test whether the property is still transferred correctly
			modifyLayer(id0, { opacity: 0.6 });

			await TestUtils.timeout();
			const layer = map.getLayers().item(0);
			expect(map.getLayers().getLength()).toBe(1);
			expect(layer).toEqual(olRealLayer);
			expect(layer.get('id')).toBe(id0);
			expect(layer.getOpacity()).toBe(0.6);
			expect(layer.getVisible()).toBe(false);
			expect(layerServiceSpy).toHaveBeenCalledWith(id0, expect.anything(), map);
			expect(geoResourceServiceSp).toHaveBeenCalledWith(geoResourceId0);
		});

		it('does nothing for a GeoResourceFuture when the layer was removed in the meantime', async () => {
			const element = await setup();
			const map = element._map;
			const geoResource = new VectorGeoResource(geoResourceId0, 'label', VectorSourceType.GEOJSON);
			const olPlaceHolderLayer = new Layer({ id: id0, render: () => {} });
			const olRealLayer = new VectorLayer({ id: id0 });
			const future = new GeoResourceFuture(geoResourceId0, async () => geoResource);
			const layerServiceSpy = vi.spyOn(layerServiceMock, 'toOlLayer').mockImplementation((id, geoResource) => {
				if (geoResource instanceof GeoResourceFuture) {
					return olPlaceHolderLayer;
				}
				return olRealLayer;
			});
			const geoResourceServiceSpy = vi.spyOn(geoResourceServiceStub, 'byId').mockReturnValue(future);
			vi.spyOn(geoResourceServiceStub, 'addOrReplace').mockImplementation((gr) => gr);

			addLayer(id0, { visible: false, opacity: 0.5, geoResourceId: geoResourceId0 });
			// we immediately remove the layer before the GeoResourceFuture is resolved
			removeLayer(id0);

			await TestUtils.timeout();
			expect(map.getLayers().getLength()).toBe(0);
			expect(layerServiceSpy).toHaveBeenCalledWith(id0, expect.anything(), map);
			expect(geoResourceServiceSpy).toHaveBeenCalledWith(geoResourceId0);
		});

		it('adds an olLayer resolving a GeoResourceFuture with custom index', async () => {
			// for this test layer.id === geoResource.id
			const element = await setup();
			const map = element._map;
			const underTestLayerId = 'id';
			const nonAsyncLayerId = 'non-async-id';
			const geoResource = new VectorGeoResource(underTestLayerId, 'label', VectorSourceType.GEOJSON);
			const olPlaceHolderLayer = new Layer({ id: underTestLayerId, render: () => {} });
			const olRealLayer = new VectorLayer({ id: underTestLayerId });
			const future = new GeoResourceFuture(underTestLayerId, async () => geoResource);
			const nonAsyncOlLayer = new VectorLayer({ id: nonAsyncLayerId });
			const nonAsyncGeoResource = new VectorGeoResource(nonAsyncLayerId, 'label', VectorSourceType.GEOJSON);
			const layerServiceSpy = vi.spyOn(layerServiceMock, 'toOlLayer').mockImplementation((id, geoResource) => {
				if (id === underTestLayerId) {
					if (geoResource instanceof GeoResourceFuture) {
						return olPlaceHolderLayer;
					}
					return olRealLayer;
				}
				return nonAsyncOlLayer;
			});
			const geoResourceServiceSpy = vi.spyOn(geoResourceServiceStub, 'byId').mockImplementation((id) => {
				if (id === underTestLayerId) {
					return future;
				}
				return nonAsyncGeoResource;
			});
			vi.spyOn(geoResourceServiceStub, 'addOrReplace').mockImplementation((gr) => gr);

			addLayer(nonAsyncLayerId);
			addLayer(underTestLayerId, { zIndex: 0 });

			await TestUtils.timeout();
			expect(map.getLayers().getLength()).toBe(2);
			expect(map.getLayers().item(0)).toEqual(nonAsyncOlLayer);
			expect(map.getLayers().item(0).getZIndex()).toBe(1);
			expect(map.getLayers().item(1)).toEqual(olRealLayer);
			expect(map.getLayers().item(1).getZIndex()).toBe(0);
			expect(layerServiceSpy).toHaveBeenCalledWith(expect.anything(), expect.anything(), map);
			expect(geoResourceServiceSpy).toHaveBeenCalledWith(expect.anything());
		});

		it('removes the layer from the layers s-o-s when olLayer not available', async () => {
			const element = await setup();
			const map = element._map;
			const layerServiceSpy = vi.spyOn(layerServiceMock, 'toOlLayer').mockImplementation((id) => new VectorLayer({ id: id }));
			const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
			expect(store.getState().layers.active.length).toBe(0);

			addLayer(id0, { geoResourceId: geoResourceId0 });
			expect(map.getLayers().getLength()).toBe(1);
			expect(store.getState().layers.active.length).toBe(1);

			addLayer('unknown');
			expect(map.getLayers().getLength()).toBe(1);
			expect(store.getState().layers.active.length).toBe(1);
			expect(warnSpy).toHaveBeenCalledWith("Could not add an olLayer for id 'unknown'");
			expect(layerServiceSpy);
		});

		it('removes an olLayer', async () => {
			const element = await setup();
			const map = element._map;
			const layerServiceSpy = vi.spyOn(layerServiceMock, 'toOlLayer').mockImplementation((id) => new VectorLayer({ id: id }));

			addLayer(id0, { geoResourceId: geoResourceId0 });
			expect(map.getLayers().getLength()).toBe(1);

			removeLayer(id0);

			expect(map.getLayers().getLength()).toBe(0);
			expect(layerServiceSpy).toHaveBeenCalledWith(id0, expect.anything(), map);
		});

		it('calls #clear on a vector source when layer is removed', async () => {
			const element = await setup();
			const map = element._map;
			const olVectorSource = new VectorSource();
			const vectorSourceSpy = vi.spyOn(olVectorSource, 'clear');
			const layerServiceSpy = vi.spyOn(layerServiceMock, 'toOlLayer').mockImplementation((id) => new VectorLayer({ id: id, source: olVectorSource }));

			addLayer(id0, { geoResourceId: geoResourceId0 });

			removeLayer(id0);

			expect(vectorSourceSpy).toHaveBeenCalled();
			expect(layerServiceSpy).toHaveBeenCalledWith(id0, expect.anything(), map);
		});

		it('calls #clear on a vector source when layer group is removed', async () => {
			const element = await setup();
			const map = element._map;
			const olVectorSource = new VectorSource();
			const vectorSourceSpy = vi.spyOn(olVectorSource, 'clear');
			const layerServiceSpy = vi.spyOn(layerServiceMock, 'toOlLayer').mockImplementation(
				(id) =>
					new LayerGroup({
						id: id,
						layers: [new VectorLayer({ id: 'sub_' + id, source: olVectorSource })]
					})
			);

			addLayer(id0, { geoResourceId: geoResourceId0 });

			removeLayer(id0);

			expect(vectorSourceSpy).toHaveBeenCalled();
			expect(layerServiceSpy).toHaveBeenCalledWith(id0, expect.anything(), map);
		});

		it('modifies the visibility of an olLayer', async () => {
			const element = await setup();
			const map = element._map;
			const layerServiceSpy = vi.spyOn(layerServiceMock, 'toOlLayer').mockImplementation((id) => new VectorLayer({ id: id }));

			addLayer(id0, { geoResourceId: geoResourceId0 });
			addLayer(id1, { geoResourceId: geoResourceId1 });
			expect(map.getLayers().getLength()).toBe(2);

			modifyLayer('id0', { visible: false, opacity: 0.5 });

			const layer0 = map.getLayers().item(0);
			expect(layer0.get('id')).toBe('id0');
			expect(layer0.getVisible()).toBe(false);
			expect(layer0.getOpacity()).toBe(0.5);

			const layer1 = map.getLayers().item(1);
			expect(layer1.get('id')).toBe('id1');
			expect(layer1.getVisible()).toBe(true);
			expect(layer1.getOpacity()).toBe(1);
			expect(layerServiceSpy).toHaveBeenCalledWith('id1', expect.anything(), map);
		});

		it('modifies the z-index of an olLayer', async () => {
			const element = await setup();
			const map = element._map;
			const layerServiceSpy = vi.spyOn(layerServiceMock, 'toOlLayer').mockImplementation((id) => new VectorLayer({ id: id }));

			addLayer(id0, { geoResourceId: geoResourceId0 });
			addLayer(id1, { geoResourceId: geoResourceId1 });
			expect(map.getLayers().getLength()).toBe(2);

			modifyLayer('id0', { zIndex: 2 });

			const layer0 = map.getLayers().item(0);
			expect(layer0.get('id')).toBe('id0');
			expect(layer0.getZIndex()).toBe(1);

			const layer1 = map.getLayers().item(1);
			expect(layer1.get('id')).toBe('id1');
			expect(layer1.getZIndex()).toBe(0);
			expect(layerServiceSpy).toHaveBeenCalledWith('id0', expect.anything(), map);
		});
	});

	describe('measurement handler', () => {
		it('registers the handler', async () => {
			const element = await setup();

			expect(element._layerHandler.get('measurementLayerHandlerMockId')).toEqual(measurementLayerHandlerMock);
		});

		it('activates and deactivates the handler', async () => {
			const olLayer = new VectorLayer({});
			const activateSpy = vi.spyOn(measurementLayerHandlerMock, 'activate').mockReturnValue(olLayer);
			const deactivateSpy = vi.spyOn(measurementLayerHandlerMock, 'deactivate').mockReturnValue(olLayer);
			const element = await setup();
			const map = element._map;

			addLayer(measurementLayerHandlerMock.id);

			expect(activateSpy).toHaveBeenCalledWith(map);
			activateSpy.mockReset();
			expect(deactivateSpy).not.toHaveBeenCalledWith(map);

			removeLayer(measurementLayerHandlerMock.id);
			expect(activateSpy).not.toHaveBeenCalledWith(map);
			expect(deactivateSpy).toHaveBeenCalledWith(map);
		});
	});

	describe('draw handler', () => {
		it('registers the handler', async () => {
			const element = await setup();

			expect(element._layerHandler.get('drawLayerHandlerMockId')).toEqual(drawLayerHandlerMock);
		});

		it('activates and deactivates the handler', async () => {
			const olLayer = new VectorLayer({});
			const activateSpy = vi.spyOn(drawLayerHandlerMock, 'activate').mockReturnValue(olLayer);
			const deactivateSpy = vi.spyOn(drawLayerHandlerMock, 'deactivate').mockReturnValue(olLayer);
			const element = await setup();
			const map = element._map;

			addLayer(drawLayerHandlerMock.id);

			expect(activateSpy).toHaveBeenCalledWith(map);
			activateSpy.mockReset();
			expect(deactivateSpy).not.toHaveBeenCalledWith(map);

			removeLayer(drawLayerHandlerMock.id);
			expect(activateSpy).not.toHaveBeenCalledWith(map);
			expect(deactivateSpy).toHaveBeenCalledWith(map);
		});
	});

	describe('geolocation handler', () => {
		it('registers the handler', async () => {
			const element = await setup();

			expect(element._layerHandler.get('geolocationLayerHandlerMockId')).toEqual(geolocationLayerHandlerMock);
		});

		it('activates and deactivates the handler', async () => {
			const olLayer = new VectorLayer({});
			const activateSpy = vi.spyOn(geolocationLayerHandlerMock, 'activate').mockReturnValue(olLayer);
			const deactivateSpy = vi.spyOn(geolocationLayerHandlerMock, 'deactivate').mockReturnValue(olLayer);
			const element = await setup();
			const map = element._map;

			addLayer(geolocationLayerHandlerMock.id);

			expect(activateSpy).toHaveBeenCalledWith(map);
			activateSpy.mockReset();
			expect(deactivateSpy).not.toHaveBeenCalledWith(map);

			removeLayer(geolocationLayerHandlerMock.id);
			expect(activateSpy).not.toHaveBeenCalledWith(map);
			expect(deactivateSpy).toHaveBeenCalledWith(map);
		});
	});

	describe('mfp handler', () => {
		it('registers the handler', async () => {
			const element = await setup();

			expect(element._layerHandler.get('mfpLayerHandlerMockId')).toEqual(mfpHandlerMock);
		});

		it('activates and deactivates the handler', async () => {
			const olLayer = new VectorLayer({});
			const activateSpy = vi.spyOn(mfpHandlerMock, 'activate').mockReturnValue(olLayer);
			const deactivateSpy = vi.spyOn(mfpHandlerMock, 'deactivate').mockReturnValue(olLayer);
			const element = await setup();
			const map = element._map;

			addLayer(mfpHandlerMock.id);

			expect(activateSpy).toHaveBeenCalledWith(map);
			activateSpy.mockReset();
			expect(deactivateSpy).not.toHaveBeenCalledWith(map);

			removeLayer(mfpHandlerMock.id);
			expect(activateSpy).not.toHaveBeenCalledWith(map);
			expect(deactivateSpy).toHaveBeenCalledWith(map);
		});
	});

	describe('routing handler', () => {
		it('registers the handler', async () => {
			const element = await setup();

			expect(element._layerHandler.get('routingLayerHandlerMockId')).toEqual(routingHandlerMock);
		});

		it('activates and deactivates the handler', async () => {
			const olLayer = new VectorLayer({});
			const activateSpy = vi.spyOn(routingHandlerMock, 'activate').mockReturnValue(olLayer);
			const deactivateSpy = vi.spyOn(routingHandlerMock, 'deactivate').mockReturnValue(olLayer);
			const element = await setup();
			const map = element._map;

			addLayer(routingHandlerMock.id);

			expect(activateSpy).toHaveBeenCalledWith(map);
			activateSpy.mockReset();
			expect(deactivateSpy).not.toHaveBeenCalledWith(map);

			removeLayer(routingHandlerMock.id);
			expect(activateSpy).not.toHaveBeenCalledWith(map);
			expect(deactivateSpy).toHaveBeenCalledWith(map);
		});
	});

	describe('featureInfo handler', () => {
		it('registers the handler', async () => {
			const element = await setup();

			expect(element._mapHandler.get('featureInfoHandlerMockId')).toEqual(featureInfoHandlerMock);
		});
	});

	describe('elevationProfile handler', () => {
		it('registers the handler', async () => {
			const element = await setup();

			expect(element._mapHandler.get('olElevationProfileHandlerMockId')).toEqual(olElevationProfileHandlerMock);
		});
	});

	describe('selectableFeature handler', () => {
		it('registers the handler', async () => {
			const element = await setup();

			expect(element._mapHandler.get('olSelectableFeatureHandlerMockId')).toEqual(olSelectableFeatureHandlerMock);
		});
	});

	describe('layerSwipe handler', () => {
		it('registers the handler', async () => {
			const element = await setup();

			expect(element._mapHandler.get('olLayerSwipeHandlerMockId')).toEqual(olLayerSwipeHandlerMock);
		});
	});
});
