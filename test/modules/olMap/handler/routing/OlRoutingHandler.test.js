import { TestUtils } from '../../../../test-utils';
import { routingReducer, initialState as initialRoutingSoS } from '../../../../../src/store/routing/routing.reducer';
import Map from 'ol/Map';
import View from 'ol/View';
import {
	OlRoutingHandler,
	REMOVE_HIGHLIGHTED_SEGMENTS_TIMEOUT_MS,
	ROUTING_CATEGORY,
	ROUTING_FEATURE_INDEX,
	ROUTING_FEATURE_TYPE,
	ROUTING_SEGMENT_INDEX,
	RoutingFeatureTypes,
	RoutingLayerIds
} from '../../../../../src/modules/olMap/handler/routing/OlRoutingHandler';
import { provide as messageProvideFn } from '../../../../../src/modules/olMap/handler/routing/tooltipMessage.provider';
import { $injector } from '../../../../../src/injection';
import { PromiseQueue } from '../../../../../src/utils/PromiseQueue';
import { Vector } from 'ol/layer';
import { Modify, Select, Translate } from 'ol/interaction';
import { setCategory, setHighlightedSegments, setIntermediate, setWaypoints } from '../../../../../src/store/routing/routing.action';
import MapBrowserEventType from 'ol/MapBrowserEventType';
import { Feature, MapBrowserEvent } from 'ol';
import Event from 'ol/events/Event';
import { LineString, Point } from 'ol/geom';
import { ModifyEvent } from 'ol/interaction/Modify';
import Collection from 'ol/Collection.js';
import { TranslateEvent } from 'ol/interaction/Translate';
import { notificationReducer } from '../../../../../src/store/notifications/notifications.reducer';
import { LevelTypes } from '../../../../../src/store/notifications/notifications.action';
import { getModifyInteractionStyle, getRoutingStyleFunction } from '../../../../../src/modules/olMap/handler/routing/styleUtils';
import { HelpTooltip } from '../../../../../src/modules/olMap/tooltip/HelpTooltip';
import { SelectEvent } from 'ol/interaction/Select';
import { CoordinateProposalType, RouteCalculationErrors, RoutingStatusCodes } from '../../../../../src/domain/routing';
import { positionReducer } from '../../../../../src/store/position/position.reducer';
import { elevationProfileReducer } from '../../../../../src/store/elevationProfile/elevationProfile.reducer';
import { SourceTypeName } from '../../../../../src/domain/sourceType';
import { bvvRouteStatsProvider } from '../../../../../src/modules/olMap/handler/routing/routeStats.provider';
import { bottomSheetReducer } from '../../../../../src/store/bottomSheet/bottomSheet.reducer';
import { highlightReducer } from '../../../../../src/store/highlight/highlight.reducer';
import {
	getAttributionForLocallyImportedOrCreatedGeoResource,
	getBvvAttributionForRoutingResult
} from '../../../../../src/services/provider/attribution.provider';
import { layersReducer } from '../../../../../src/store/layers/layers.reducer';
import { VectorGeoResource, VectorSourceType } from '../../../../../src/domain/geoResources';
import { PERMANENT_ROUTE_LAYER_ID, PERMANENT_WP_LAYER_ID } from '../../../../../src/plugins/RoutingPlugin';
import { StyleTypes } from '../../../../../src/modules/olMap/services/StyleService';

describe('constants and enums', () => {
	it('provides an enum of all valid RoutingFeatureTypes', () => {
		expect(Object.keys(RoutingFeatureTypes).length).toBe(8);
		expect(Object.isFrozen(RoutingFeatureTypes)).toBeTrue();

		expect(RoutingFeatureTypes.START).toBe('start');
		expect(RoutingFeatureTypes.DESTINATION).toBe('destination');
		expect(RoutingFeatureTypes.INTERMEDIATE).toBe('intermediate');
		expect(RoutingFeatureTypes.ROUTE).toBe('route');
		expect(RoutingFeatureTypes.ROUTE_ALTERNATIVE).toBe('route_alternative');
		expect(RoutingFeatureTypes.ROUTE_SEGMENT).toBe('route_segment');
		expect(RoutingFeatureTypes.ROUTE_HIGHLIGHT).toBe('route_highlight');
		expect(RoutingFeatureTypes.ROUTE_COPY).toBe('route_copy');
	});

	it('provides an enum of all valid RoutingLayerIds', () => {
		expect(Object.keys(RoutingLayerIds).length).toBe(5);
		expect(Object.isFrozen(RoutingLayerIds)).toBeTrue();

		expect(RoutingLayerIds.ROUTE).toBe('rt_routeLayer');
		expect(RoutingLayerIds.ROUTE_COPY).toBe('rt_routeCopyLayer');
		expect(RoutingLayerIds.ROUTE_ALTERNATIVE).toBe('rt_alternativeRouteLayer');
		expect(RoutingLayerIds.INTERACTION).toBe('rt_interactionLayer');
		expect(RoutingLayerIds.HIGHLIGHT).toBe('rt_highlightLayer');
	});

	it('exports constant values', () => {
		expect(ROUTING_CATEGORY).toBe('Routing_Cat');
		expect(ROUTING_FEATURE_TYPE).toBe('Routing_Feature_Type');
		expect(ROUTING_FEATURE_INDEX).toBe('Routing_Feature_Index');
		expect(ROUTING_SEGMENT_INDEX).toBe('Routing_Segment_Index');
	});
});

describe('OlRoutingHandler', () => {
	const routingServiceMock = {
		async calculateRoute() {},
		getAlternativeCategoryIds() {},
		getCategoryById() {}
	};
	const mapServiceMock = {
		getSrid() {}
	};
	const environmentServiceMock = {
		isTouch() {}
	};
	const elevationServiceMock = {
		getProfile() {}
	};
	const geoResourceServiceMock = {
		byId() {},
		addOrReplace() {}
	};
	const iconServiceMock = {
		getIconResult: (idOrBase64) => {
			return { id: idOrBase64, base64: 'data:image/svg+xml;base64,foo' };
		}
	};

	const setup = (state = {}) => {
		const initialState = {
			routing: {
				...initialRoutingSoS,
				...state
			}
		};
		const store = TestUtils.setupStoreAndDi(initialState, {
			routing: routingReducer,
			notifications: notificationReducer,
			position: positionReducer,
			elevationProfile: elevationProfileReducer,
			bottomSheet: bottomSheetReducer,
			highlight: highlightReducer,
			layers: layersReducer
		});

		$injector
			.registerSingleton('RoutingService', routingServiceMock)
			.registerSingleton('MapService', mapServiceMock)
			.registerSingleton('EnvironmentService', environmentServiceMock)
			.registerSingleton('ElevationService', elevationServiceMock)
			.registerSingleton('TranslationService', { translate: (key) => key })
			.registerSingleton('GeoResourceService', geoResourceServiceMock)
			// implicitly required by getRoutingStyleFunction()
			.registerSingleton('IconService', iconServiceMock);

		return store;
	};

	const mapWidth = 100;
	const mapHeight = 100;

	const setupMap = (center = [0, 0], zoom = 0) => {
		const containerId = 'mapContainer';
		document.getElementById(containerId)?.remove(); //remove existing map container
		document.body.style.margin = '0';
		document.body.style.padding = '0';

		const container = document.createElement('div');
		container.id = containerId;
		container.style.height = mapHeight + 'px';
		container.style.width = mapWidth + 'px';
		document.body.appendChild(container);

		const map = new Map({
			layers: [],
			target: container,
			view: new View({
				center: center,
				zoom: zoom
			})
		});
		return map;
	};

	const newTestInstance = async (state, routeStatsProvider = bvvRouteStatsProvider, attributionProvider = getBvvAttributionForRoutingResult) => {
		const store = setup(state);
		const map = setupMap();
		const instanceUnderTest = new OlRoutingHandler(routeStatsProvider, attributionProvider);
		const getSelectOptionsSpy = spyOn(instanceUnderTest, '_getSelectOptions').and.callThrough();
		const getModifyOptionsSpy = spyOn(instanceUnderTest, '_getModifyOptions').and.callThrough();
		const layer = instanceUnderTest.activate(map);
		await TestUtils.timeout();
		return { map, instanceUnderTest, store, layer, getSelectOptionsSpy, getModifyOptionsSpy };
	};

	describe('constructor', () => {
		it('initializes the service with custom provider', async () => {
			setup();
			const customRouteStatsProvider = async () => {};
			const customAttributionProvider = async () => {};
			const instanceUnderTest = new OlRoutingHandler(customRouteStatsProvider, customAttributionProvider);
			expect(instanceUnderTest._routeStatsProvider).toEqual(customRouteStatsProvider);
			expect(instanceUnderTest._attributionProvider).toEqual(customAttributionProvider);
		});

		it('initializes the service with default provider', async () => {
			setup();
			const instanceUnderTest = new OlRoutingHandler();
			expect(instanceUnderTest._routeStatsProvider).toEqual(bvvRouteStatsProvider);
			expect(instanceUnderTest._attributionProvider).toEqual(getBvvAttributionForRoutingResult);
		});
	});

	it('instantiates the handler', () => {
		setup();
		const instanceUnderTest = new OlRoutingHandler();

		expect(instanceUnderTest.id).toBe('routing_layer');
		expect(instanceUnderTest._storeService.getStore()).toBeDefined();
		expect(instanceUnderTest._routingService).toBeDefined();
		expect(instanceUnderTest._mapService).toBeDefined();
		expect(instanceUnderTest._environmentService).toBeDefined();

		expect(instanceUnderTest._map).toBeNull();
		expect(instanceUnderTest._routingLayerGroup).toBeNull();
		expect(instanceUnderTest._alternativeRouteLayer).toBeNull();
		expect(instanceUnderTest._routeLayer).toBeNull();
		expect(instanceUnderTest._routeLayerCopy).toBeNull();
		expect(instanceUnderTest._highlightLayer).toBeNull();
		expect(instanceUnderTest._interactionLayer).toBeNull();

		expect(instanceUnderTest._modifyInteraction).toBeNull();
		expect(instanceUnderTest._translateInteraction).toBeNull();
		expect(instanceUnderTest._selectInteraction).toBeNull();

		expect(instanceUnderTest._registeredObservers).toEqual([]);
		expect(instanceUnderTest._mapListeners).toEqual([]);
		expect(instanceUnderTest._activeInteraction).toBeFalse();
		expect(instanceUnderTest._catId).toBeNull();
		expect(instanceUnderTest._currentRoutingResponse).toBeNull();
		expect(instanceUnderTest._promiseQueue).toBeInstanceOf(PromiseQueue);
		expect(instanceUnderTest._helpTooltip).toBeInstanceOf(HelpTooltip);
		expect(instanceUnderTest._helpTooltip.messageProvideFunction).toEqual(messageProvideFn);
	});

	describe('lifecycle', () => {
		describe('when handler is activated', () => {
			describe('in a non-touch environment', () => {
				it('fully initializes the handler', async () => {
					const { instanceUnderTest, map, layer } = await newTestInstance();

					expect(instanceUnderTest._map).toEqual(map);
					// layer
					expect(instanceUnderTest._routingLayerGroup).toEqual(layer);
					expect(instanceUnderTest._alternativeRouteLayer).toBeInstanceOf(Vector);
					expect(instanceUnderTest._alternativeRouteLayer.get('id')).toBe(RoutingLayerIds.ROUTE_ALTERNATIVE);
					expect(instanceUnderTest._routeLayer).toBeInstanceOf(Vector);
					expect(instanceUnderTest._routeLayer.get('id')).toBe(RoutingLayerIds.ROUTE);
					expect(instanceUnderTest._routeLayerCopy).toBeInstanceOf(Vector);
					expect(instanceUnderTest._routeLayerCopy.get('id')).toBe(RoutingLayerIds.ROUTE_COPY);
					expect(instanceUnderTest._highlightLayer).toBeInstanceOf(Vector);
					expect(instanceUnderTest._highlightLayer.get('id')).toBe(RoutingLayerIds.HIGHLIGHT);
					expect(instanceUnderTest._interactionLayer).toBeInstanceOf(Vector);
					expect(instanceUnderTest._interactionLayer.get('id')).toBe(RoutingLayerIds.INTERACTION);
					expect(layer.getLayers().getArray()).toEqual([
						instanceUnderTest._alternativeRouteLayer,
						instanceUnderTest._routeLayer,
						instanceUnderTest._routeLayerCopy,
						instanceUnderTest._highlightLayer,
						instanceUnderTest._interactionLayer
					]);
					// interactions
					expect(instanceUnderTest._translateInteraction).toBeInstanceOf(Translate);
					expect(instanceUnderTest._map.getInteractions().getArray()).toContain(instanceUnderTest._translateInteraction);
					expect(instanceUnderTest._modifyInteraction).toBeInstanceOf(Modify);
					expect(instanceUnderTest._map.getInteractions().getArray()).toContain(instanceUnderTest._modifyInteraction);
					expect(instanceUnderTest._selectInteraction).toBeInstanceOf(Select);
					expect(instanceUnderTest._map.getInteractions().getArray()).toContain(instanceUnderTest._selectInteraction);
					//map listeners
					expect(instanceUnderTest._mapListeners).toHaveSize(2);

					expect(instanceUnderTest._registeredObservers).toHaveSize(4);
				});
			});

			describe('in a touch environment', () => {
				it('fully initializes the handler (without modify interaction)', async () => {
					spyOn(environmentServiceMock, 'isTouch').and.returnValue(true);
					const { instanceUnderTest, map, layer } = await newTestInstance();

					expect(instanceUnderTest._map).toEqual(map);
					// layer
					expect(instanceUnderTest._routingLayerGroup).toEqual(layer);
					expect(instanceUnderTest._alternativeRouteLayer).toBeInstanceOf(Vector);
					expect(instanceUnderTest._alternativeRouteLayer.get('id')).toBe(RoutingLayerIds.ROUTE_ALTERNATIVE);
					expect(instanceUnderTest._routeLayer).toBeInstanceOf(Vector);
					expect(instanceUnderTest._routeLayer.get('id')).toBe(RoutingLayerIds.ROUTE);
					expect(instanceUnderTest._routeLayerCopy).toBeInstanceOf(Vector);
					expect(instanceUnderTest._routeLayerCopy.get('id')).toBe(RoutingLayerIds.ROUTE_COPY);
					expect(instanceUnderTest._highlightLayer).toBeInstanceOf(Vector);
					expect(instanceUnderTest._highlightLayer.get('id')).toBe(RoutingLayerIds.HIGHLIGHT);
					expect(instanceUnderTest._interactionLayer).toBeInstanceOf(Vector);
					expect(instanceUnderTest._interactionLayer.get('id')).toBe(RoutingLayerIds.INTERACTION);
					expect(layer.getLayers().getArray()).toEqual([
						instanceUnderTest._alternativeRouteLayer,
						instanceUnderTest._routeLayer,
						instanceUnderTest._routeLayerCopy,
						instanceUnderTest._highlightLayer,
						instanceUnderTest._interactionLayer
					]);
					// interactions
					expect(instanceUnderTest._translateInteraction).toBeInstanceOf(Translate);
					expect(instanceUnderTest._map.getInteractions().getArray()).toContain(instanceUnderTest._translateInteraction);
					expect(instanceUnderTest._selectInteraction).toBeInstanceOf(Select);
					expect(instanceUnderTest._map.getInteractions().getArray()).toContain(instanceUnderTest._selectInteraction);
					expect(instanceUnderTest._modifyInteraction).toBeNull();
					expect(instanceUnderTest._map.getInteractions().getArray()).not.toContain(instanceUnderTest._modifyInteraction);

					expect(instanceUnderTest._registeredObservers).toHaveSize(4);
				});
			});

			it('initially observes the waypoint property of the routing s-o-s and calculates a route', async () => {
				const map = setupMap();
				const coordinates = [
					[22, 33],
					[44, 55]
				];
				const catId = 'catId';
				setup({
					categoryId: catId,
					waypoints: coordinates,
					status: RoutingStatusCodes.Ok
				});
				const instanceUnderTest = new OlRoutingHandler();
				const requestRouteFromCoordinatesSpy = spyOn(instanceUnderTest, '_requestRouteFromCoordinates');

				instanceUnderTest.activate(map);

				await TestUtils.timeout();
				expect(instanceUnderTest._catId).toBe(catId);
				expect(requestRouteFromCoordinatesSpy).toHaveBeenCalledWith(coordinates, RoutingStatusCodes.Ok);
			});
		});

		describe('when handler is deactivated', () => {
			it('updates olLayer and olMap fields', async () => {
				const { instanceUnderTest, map } = await newTestInstance();
				const helpTooltipSpy = spyOn(instanceUnderTest._helpTooltip, 'deactivate');
				const convertToPermanentLayerSpy = spyOn(instanceUnderTest, '_convertToPermanentLayer');

				instanceUnderTest.deactivate(map);

				expect(convertToPermanentLayerSpy).toHaveBeenCalled();
				expect(instanceUnderTest._map).toBeNull();

				expect(instanceUnderTest._routingLayerGroup).toBeNull();
				expect(instanceUnderTest._alternativeRouteLayer).toBeNull();
				expect(instanceUnderTest._routeLayer).toBeNull();
				expect(instanceUnderTest._routeLayerCopy).toBeNull();
				expect(instanceUnderTest._highlightLayer).toBeNull();
				expect(instanceUnderTest._interactionLayer).toBeNull();
				expect(instanceUnderTest._activeInteraction).toBeFalse();

				expect(instanceUnderTest._modifyInteraction).toBeNull();
				expect(instanceUnderTest._translateInteraction).toBeNull();
				expect(instanceUnderTest._selectInteraction).toBeNull();

				expect(instanceUnderTest._catId).toBeNull();
				expect(instanceUnderTest._currentRoutingResponse).toBeNull();
				expect(instanceUnderTest._promiseQueue).toBeInstanceOf(PromiseQueue);
				expect(instanceUnderTest._registeredObservers).toEqual([]);
				expect(instanceUnderTest._mapListeners).toEqual([]);
				expect(helpTooltipSpy).toHaveBeenCalled();
			});
		});
	});

	describe('events', () => {
		describe('when observed "waypoints" and "categoryId" changes', () => {
			it('updates the category and calculates a route', async () => {
				const coordinates = [
					[22, 33],
					[44, 55]
				];
				const catId = 'catId';
				const { instanceUnderTest } = await newTestInstance();
				const requestRouteFromCoordinatesSpy = spyOn(instanceUnderTest, '_requestRouteFromCoordinates');

				setCategory(catId);
				await TestUtils.timeout();
				expect(instanceUnderTest._catId).toBe(catId);
				expect(requestRouteFromCoordinatesSpy).toHaveBeenCalledWith([], RoutingStatusCodes.Start_Destination_Missing);

				requestRouteFromCoordinatesSpy.calls.reset();

				setWaypoints(coordinates);
				await TestUtils.timeout();
				expect(instanceUnderTest._catId).toBe(catId);
				expect(requestRouteFromCoordinatesSpy).toHaveBeenCalledWith(coordinates, RoutingStatusCodes.Ok);
			});
		});

		describe('when observed "highlightedSegments" changes', () => {
			it('adds or removes the highlight features', async () => {
				const segments = [
					[22, 33],
					[44, 55]
				];
				const { instanceUnderTest } = await newTestInstance();
				const highlightSegmentsSpy = spyOn(instanceUnderTest, '_highlightSegments');

				setHighlightedSegments({ segments });

				expect(highlightSegmentsSpy).toHaveBeenCalledWith(
					{ segments, zoomToExtent: false },
					instanceUnderTest._highlightLayer,
					instanceUnderTest._routeLayer
				);
			});
		});

		describe('when observed "intermediate" changes', () => {
			it('updates the waypoints and calculates a route', async () => {
				const coordinates = [
					[11, 44],
					[22, 55],
					[33, 66]
				];
				const { instanceUnderTest } = await newTestInstance({
					status: RoutingStatusCodes.Ok
				});
				const addIntermediateSpy = spyOn(instanceUnderTest, '_addIntermediate').and.returnValue(coordinates);
				const requestRouteFromCoordinatesSpy = spyOn(instanceUnderTest, '_requestRouteFromCoordinates');

				setIntermediate([22, 55]);
				await TestUtils.timeout();
				expect(addIntermediateSpy).toHaveBeenCalledWith([22, 55], instanceUnderTest._routeLayerCopy);
				expect(requestRouteFromCoordinatesSpy).toHaveBeenCalledWith(coordinates, RoutingStatusCodes.Ok);
			});
		});
	});

	describe('interactions', () => {
		const newMapBrowserEventForCoordinate = (eventType, map, coordinate) => {
			const event = new Event(eventType);
			const mapEvent = new MapBrowserEvent(eventType, map, event);
			mapEvent.coordinate = [...coordinate];
			return mapEvent;
		};

		describe('translate', () => {
			it('calls the correct methods', async () => {
				const { instanceUnderTest, map, layer } = await newTestInstance();
				const requestRouteFromInteractionLayerSpy = spyOn(instanceUnderTest, '_requestRouteFromInteractionLayer');
				map.addLayer(layer);

				const feature = new Feature({
					geometry: new Point([0, 0])
				});

				instanceUnderTest._translateInteraction.dispatchEvent(
					new TranslateEvent('translatestart', new Collection([feature]), [0, 0], [0, 0], new Event(MapBrowserEventType.POINTERDOWN))
				);

				instanceUnderTest._translateInteraction.dispatchEvent(
					new TranslateEvent('translating', new Collection([feature]), [10, 20], [0, 0], new Event(MapBrowserEventType.POINTERDRAG))
				);

				instanceUnderTest._translateInteraction.dispatchEvent(
					new TranslateEvent('translateend', new Collection([feature]), [21, 42], [0, 0], new Event(MapBrowserEventType.POINTERUP))
				);
				expect(requestRouteFromInteractionLayerSpy).toHaveBeenCalledTimes(1);
			});

			it('updates the store', async () => {
				const { instanceUnderTest, map, layer, store } = await newTestInstance({
					bottomSheet: { active: true },
					highlight: {
						features: [{ id: 'foo', data: { coordinate: [11, 22] } }]
					}
				});

				spyOn(instanceUnderTest, '_requestRouteFromInteractionLayer');
				map.addLayer(layer);

				const feature = new Feature({
					geometry: new Point([0, 0])
				});

				instanceUnderTest._translateInteraction.dispatchEvent(
					new TranslateEvent('translatestart', new Collection([feature]), [0, 0], [0, 0], new Event(MapBrowserEventType.POINTERDOWN))
				);

				expect(store.getState().bottomSheet.active).toBeFalse();
				expect(store.getState().highlight.features).toHaveSize(0);
			});

			it('does nothing when feature was not translated', async () => {
				const { instanceUnderTest, map, layer } = await newTestInstance();
				const requestRouteFromInteractionLayerSpy = spyOn(instanceUnderTest, '_requestRouteFromInteractionLayer');
				map.addLayer(layer);

				const feature = new Feature({
					geometry: new Point([0, 0])
				});

				instanceUnderTest._translateInteraction.dispatchEvent(
					new TranslateEvent('translatestart', new Collection([feature]), [0, 0], [0, 0], new Event(MapBrowserEventType.POINTERDOWN))
				);

				instanceUnderTest._translateInteraction.dispatchEvent(
					new TranslateEvent('translating', new Collection([feature]), [0, 0], [0, 0], new Event(MapBrowserEventType.POINTERDRAG))
				);

				instanceUnderTest._translateInteraction.dispatchEvent(
					new TranslateEvent('translateend', new Collection([feature]), [0, 0], [0, 0], new Event(MapBrowserEventType.POINTERUP))
				);

				expect(requestRouteFromInteractionLayerSpy).toHaveBeenCalledTimes(0);
			});
		});

		describe('select', () => {
			it('is properly configured', async () => {
				setup();
				const instanceUnderTest = new OlRoutingHandler();
				const interactionLayerMock = { id: '0' };
				const alternativeRouteLayerMock = { id: '1' };

				expect(instanceUnderTest._getSelectOptions(interactionLayerMock, alternativeRouteLayerMock)).toEqual({
					layers: [interactionLayerMock, alternativeRouteLayerMock],
					hitTolerance: 5
				});
			});

			it('switches to an alternative route', async () => {
				const { instanceUnderTest, map, layer, getSelectOptionsSpy, store } = await newTestInstance();
				const switchToAlternativeRouteSpy = spyOn(instanceUnderTest, '_switchToAlternativeRoute');

				map.addLayer(layer);
				const feature = new Feature({
					geometry: new Point([0, 0])
				});
				const category = { id: 'someCatId' };
				feature.set(ROUTING_CATEGORY, category);
				const mockRoutingResponse = { route: 'foo' };
				instanceUnderTest._currentRoutingResponse = mockRoutingResponse;
				const helpTooltipDeactivateSpy = spyOn(instanceUnderTest._helpTooltip, 'deactivate');

				instanceUnderTest._selectInteraction.dispatchEvent(new SelectEvent('select', [feature], [], new Event(MapBrowserEventType.POINTERDOWN)));

				expect(switchToAlternativeRouteSpy).toHaveBeenCalledWith(mockRoutingResponse);
				expect(instanceUnderTest._catId).toBe(category.id);
				expect(store.getState().routing.categoryId).toBe(category.id);
				expect(getSelectOptionsSpy).toHaveBeenCalledWith(instanceUnderTest._interactionLayer, instanceUnderTest._alternativeRouteLayer);
				expect(helpTooltipDeactivateSpy).toHaveBeenCalled();
			});

			it('does NOT switch to an alternative route when category is not available', async () => {
				const { instanceUnderTest, map, layer, getSelectOptionsSpy } = await newTestInstance();
				spyOn(instanceUnderTest, '_switchToAlternativeRoute');

				map.addLayer(layer);
				const feature = new Feature({
					geometry: new Point([0, 0])
				});
				const mockRoutingResponse = { route: 'foo' };
				instanceUnderTest._currentRoutingResponse = mockRoutingResponse;
				const helpTooltipDeactivateSpy = spyOn(instanceUnderTest._helpTooltip, 'deactivate');

				instanceUnderTest._selectInteraction.dispatchEvent(new SelectEvent('select', [feature], [], new Event(MapBrowserEventType.POINTERDOWN)));

				expect(getSelectOptionsSpy).toHaveBeenCalledWith(instanceUnderTest._interactionLayer, instanceUnderTest._alternativeRouteLayer);
				expect(helpTooltipDeactivateSpy).toHaveBeenCalled();
			});
		});

		describe('modify', () => {
			it('is properly configured', async () => {
				setup();
				const instanceUnderTest = new OlRoutingHandler();
				const routeLayerCopyMock = {
					getSource: () => {}
				};

				expect(instanceUnderTest._getModifyOptions(routeLayerCopyMock)).toEqual({
					style: getModifyInteractionStyle(),
					source: routeLayerCopyMock.getSource(),
					pixelTolerance: 5,
					deleteCondition: jasmine.any(Function)
				});
				expect(instanceUnderTest._getModifyOptions(routeLayerCopyMock).deleteCondition()).toBeFalse();
			});

			describe('"modifyend" event', () => {
				it('calls the correct methods', async () => {
					const { instanceUnderTest, map, layer, getModifyOptionsSpy } = await newTestInstance();
					const requestRouteFromInteractionLayerSpy = spyOn(instanceUnderTest, '_requestRouteFromInteractionLayer');
					const incrementIndexSpy = spyOn(instanceUnderTest, '_incrementIndex');
					const addIntermediateInteractionFeatureSpy = spyOn(instanceUnderTest, '_addIntermediateInteractionFeature');
					map.addLayer(layer);
					const mockSegmentFeature0 = new Feature({
						geometry: new LineString([
							[0, -6757423],
							[0, 6757423]
						])
					});
					mockSegmentFeature0.changed(); // increase revision
					mockSegmentFeature0.changed(); // increase revision
					mockSegmentFeature0.set(ROUTING_SEGMENT_INDEX, 42);
					const mockSegmentFeature1 = new Feature({
						geometry: new LineString([
							[0, -6757423],
							[0, 6757423]
						])
					});
					mockSegmentFeature1.set(ROUTING_SEGMENT_INDEX, 20);
					mockSegmentFeature1.changed();
					const mockSegmentFeature2 = new Feature({
						geometry: new LineString([
							[0, -6757423],
							[0, 6757423]
						])
					});
					mockSegmentFeature2.set(ROUTING_SEGMENT_INDEX, 10);
					mockSegmentFeature2.changed(); // increase revision
					const mockCoordinate = [21, 42];

					instanceUnderTest._modifyInteraction.dispatchEvent(
						new ModifyEvent(
							'modifyend',
							new Collection([mockSegmentFeature2, mockSegmentFeature1, mockSegmentFeature0]),
							newMapBrowserEventForCoordinate(MapBrowserEventType.POINTERUP, map, mockCoordinate)
						)
					);
					expect(incrementIndexSpy).toHaveBeenCalledOnceWith(43);
					expect(addIntermediateInteractionFeatureSpy).toHaveBeenCalledWith(mockCoordinate, 43);
					expect(requestRouteFromInteractionLayerSpy).toHaveBeenCalledTimes(1);
					expect(getModifyOptionsSpy).toHaveBeenCalledWith(instanceUnderTest._routeLayerCopy);
				});

				it("does nothing when it's not the correct pointer event", async () => {
					const { instanceUnderTest, map, layer } = await newTestInstance();
					const requestRouteFromInteractionLayerSpy = spyOn(instanceUnderTest, '_requestRouteFromInteractionLayer');
					map.addLayer(layer);
					const mockCoordinate = [21, 42];

					instanceUnderTest._modifyInteraction.dispatchEvent(
						new ModifyEvent('modifyend', new Collection([]), newMapBrowserEventForCoordinate(MapBrowserEventType.POINTERMOVE, map, mockCoordinate))
					);
					expect(requestRouteFromInteractionLayerSpy).not.toHaveBeenCalled();
				});
			});
		});
	});

	describe('methods', () => {
		describe('_requestAndDisplayRoute', () => {
			describe('and no intermediate features are available', () => {
				it('calls the routing service with correct arguments', async () => {
					const { instanceUnderTest } = await newTestInstance();
					const defaultCategoryId = 'defaultCategoryId';
					const alternativeCategoryIds = ['alternativeCategoryId0', 'alternativeCategoryId1'];
					const coordinates3857 = [
						[11, 22],
						[33, 44]
					];
					const mockRouteResult = { defaultCategoryId: {} };
					spyOn(routingServiceMock, 'calculateRoute')
						.withArgs([defaultCategoryId, ...alternativeCategoryIds], coordinates3857)
						.and.resolveTo(mockRouteResult);
					const displayCurrentRoutingGeometrySpy = spyOn(instanceUnderTest, '_displayCurrentRoutingGeometry');
					const displayAlternativeRoutingGeometrySpy = spyOn(instanceUnderTest, '_displayAlternativeRoutingGeometry');

					await expectAsync(instanceUnderTest._requestAndDisplayRoute(defaultCategoryId, alternativeCategoryIds, coordinates3857)).toBeResolvedTo(
						mockRouteResult
					);
					expect(displayCurrentRoutingGeometrySpy).toHaveBeenCalledWith(mockRouteResult.defaultCategoryId);
					expect(displayAlternativeRoutingGeometrySpy).toHaveBeenCalledTimes(2);
				});
			});

			describe('and one ore more intermediate features are available', () => {
				it('calls the routing service with correct arguments', async () => {
					setup();
					const { instanceUnderTest } = await newTestInstance();
					const defaultCategoryId = 'defaultCategoryId';
					const alternativeCategoryIds = ['alternativeCategoryId0', 'alternativeCategoryId1'];
					const coordinates3857 = [
						[11, 22],
						[33, 44]
					];
					const mockRouteResult = { defaultCategoryId: {} };
					spyOn(routingServiceMock, 'calculateRoute').withArgs([defaultCategoryId], coordinates3857).and.resolveTo(mockRouteResult);
					const displayCurrentRoutingGeometrySpy = spyOn(instanceUnderTest, '_displayCurrentRoutingGeometry');
					const displayAlternativeRoutingGeometrySpy = spyOn(instanceUnderTest, '_displayAlternativeRoutingGeometry');
					instanceUnderTest._addIntermediateInteractionFeature(15, 15, 1);

					await expectAsync(instanceUnderTest._requestAndDisplayRoute(defaultCategoryId, alternativeCategoryIds, coordinates3857)).toBeResolved();
					expect(displayCurrentRoutingGeometrySpy).toHaveBeenCalledWith(mockRouteResult.defaultCategoryId);
					expect(displayAlternativeRoutingGeometrySpy).not.toHaveBeenCalled();
				});
			});
		});
		describe('_requestRouteFromInteractionLayer', () => {
			describe('more than one interaction feature is available', () => {
				it('call _requestRoute with with correct arguments', async () => {
					const catId = 'catId';
					const { instanceUnderTest, store } = await newTestInstance({
						categoryId: catId
					});
					const feature0 = new Feature({
						geometry: new Point([0, 0])
					});
					const feature1 = new Feature({
						geometry: new Point([5, 5])
					});
					instanceUnderTest._interactionLayer.getSource().addFeatures([feature0, feature1]);
					const clearRouteFeatureSpy = spyOn(instanceUnderTest, '_clearRouteFeatures');
					spyOn(instanceUnderTest, '_requestRouteFromCoordinates'); //prevent call of real method due to state change
					spyOn(instanceUnderTest, '_getInteractionFeatures').and.returnValue([feature0, feature1]);

					instanceUnderTest._requestRouteFromInteractionLayer();

					expect(clearRouteFeatureSpy).toHaveBeenCalled();
					expect(store.getState().routing.waypoints).toEqual([
						[0, 0],
						[5, 5]
					]);
				});
			});

			describe('less then two interaction features are available', () => {
				it('does nothing', async () => {
					const catId = 'catId';
					const { instanceUnderTest } = await newTestInstance({
						categoryId: catId
					});
					const feature0 = new Feature({
						geometry: new Point([0, 0])
					});
					const mockResponse = { foo: 'bar' };
					const requestRouteSpy = spyOn(instanceUnderTest, '_requestAndDisplayRoute').and.resolveTo(mockResponse);
					const setInteractionsActiveSpy = spyOn(instanceUnderTest, '_setInteractionsActive');
					const clearRouteFeatureSpy = spyOn(instanceUnderTest, '_clearRouteFeatures');
					instanceUnderTest._interactionLayer.getSource().addFeatures([feature0]);

					await instanceUnderTest._requestRouteFromInteractionLayer();

					expect(setInteractionsActiveSpy).not.toHaveBeenCalled();
					expect(clearRouteFeatureSpy).not.toHaveBeenCalled();
					expect(requestRouteSpy).not.toHaveBeenCalled();
					expect(instanceUnderTest._currentRoutingResponse).toBeNull();
				});
			});
		});

		describe('_updateStore', () => {
			it('updates different slices-of-state', async () => {
				const mockProfile = { stats: { linearDistance: 42 } };
				const mockStats = { stats: 'stats' };
				const mockGhRoute = {
					vehicle: 'foo',
					paths: [
						{
							points:
								'gxfiHu~fgAYRaBvBMH[J{ATq@R_@T}BlBwAr@}@t@[LU?wMeBsBm@e@Ua@Yc@VgAb@wBn@iBR_C?eLYiC?{_@VeMBkCTiBDsIK_A@i@Jq@Xk@`@]Zi@p@g@~@[`AWjAg@lEi@pC]tA{A`Fa@|As@jD]l@WXc@Ve@JAsBAe@W}@SrAa@lBk@Am@zBg@z@sAxC'
						}
					]
				};
				const mockRouteStatsProvider = jasmine.createSpy().withArgs(mockGhRoute, mockProfile.stats).and.returnValue(mockStats);
				const { instanceUnderTest, store } = await newTestInstance({}, mockRouteStatsProvider);
				const mapServiceSpy = spyOn(mapServiceMock, 'getSrid').and.returnValue(3857);
				spyOn(elevationServiceMock, 'getProfile').withArgs(jasmine.any(Array)).and.resolveTo(mockProfile);

				await instanceUnderTest._updateStore(mockGhRoute);

				expect(store.getState().routing.stats).toEqual(mockStats);
				expect(store.getState().elevationProfile.coordinates.length).toBe(57);
				expect(store.getState().routing.route.type.name).toBe(SourceTypeName.GEOJSON);
				expect(store.getState().routing.route.data).toContain('LineString');
				expect(mapServiceSpy).toHaveBeenCalled();
			});

			describe('and the ElevationService throws an error', () => {
				it('informs the user, logs the error, removes the route and updates the s-o-s', async () => {
					const message = 'something got wrong';
					const mockStats = { stats: 'stats' };
					const mockGhRoute = {
						vehicle: 'foo',
						paths: [
							{
								points:
									'gxfiHu~fgAYRaBvBMH[J{ATq@R_@T}BlBwAr@}@t@[LU?wMeBsBm@e@Ua@Yc@VgAb@wBn@iBR_C?eLYiC?{_@VeMBkCTiBDsIK_A@i@Jq@Xk@`@]Zi@p@g@~@[`AWjAg@lEi@pC]tA{A`Fa@|As@jD]l@WXc@Ve@JAsBAe@W}@SrAa@lBk@Am@zBg@z@sAxC'
							}
						]
					};
					const mockRouteStatsProvider = jasmine.createSpy().and.returnValue(mockStats);
					const { instanceUnderTest, store } = await newTestInstance(
						{
							route: {},
							stats: {}
						},
						mockRouteStatsProvider
					);

					const clearRouteFeaturesSpy = spyOn(instanceUnderTest, '_clearRouteFeatures');
					spyOn(elevationServiceMock, 'getProfile').withArgs(jasmine.any(Array)).and.rejectWith(message);
					const errorSpy = spyOn(console, 'error');

					await instanceUnderTest._updateStore(mockGhRoute);

					expect(errorSpy).toHaveBeenCalledWith(message);
					expect(clearRouteFeaturesSpy).toHaveBeenCalled();
					expect(store.getState().notifications.latest.payload.content).toBe('olMap_handler_routing_routingService_exception');
					expect(store.getState().notifications.latest.payload.level).toBe(LevelTypes.ERROR);
					expect(store.getState().routing.route).toBeNull();
					expect(store.getState().routing.stats).toBeNull();
				});
			});
		});

		describe('_requestRouteFromCoordinates', () => {
			describe('no coordinate is available', () => {
				it('removes all features and updates (resets) the store', async () => {
					const catId = 'catId';
					const { instanceUnderTest, store } = await newTestInstance({
						categoryId: catId,
						route: {},
						stats: {}
					});
					const setInteractionsActiveSpy = spyOn(instanceUnderTest, '_setInteractionsActive');
					const clearAllFeaturesSpy = spyOn(instanceUnderTest, '_clearAllFeatures');
					const addStartInteractionFeatureSpy = spyOn(instanceUnderTest, '_addStartInteractionFeature');
					const addIntermediateInteractionFeatureSpy = spyOn(instanceUnderTest, '_addIntermediateInteractionFeature');
					const addDestinationInteractionFeatureSpy = spyOn(instanceUnderTest, '_addDestinationInteractionFeature');
					const requestRouteSpy = spyOn(instanceUnderTest, '_requestAndDisplayRoute');

					await instanceUnderTest._requestRouteFromCoordinates([], RoutingStatusCodes.Start_Destination_Missing);

					expect(setInteractionsActiveSpy).not.toHaveBeenCalled();
					expect(clearAllFeaturesSpy).toHaveBeenCalled();
					expect(requestRouteSpy).not.toHaveBeenCalled();
					expect(addStartInteractionFeatureSpy).not.toHaveBeenCalled();
					expect(addIntermediateInteractionFeatureSpy).not.toHaveBeenCalled();
					expect(addDestinationInteractionFeatureSpy).not.toHaveBeenCalled();
					expect(store.getState().routing.route).toBeNull();
					expect(store.getState().routing.stats).toBeNull();
				});
			});

			describe('more than one coordinate is available', () => {
				it('call _requestRoute with with correct arguments', async () => {
					const catId = 'catId';
					const { instanceUnderTest } = await newTestInstance({
						categoryId: catId
					});
					const coordinate0 = [0, 0];
					const coordinate1 = [5, 5];
					const coordinate2 = [10, 10];
					const alternativeCategoryId0 = 'alternativeCategoryId0';
					const setInteractionsActiveSpy = spyOn(instanceUnderTest, '_setInteractionsActive');
					const clearAllFeaturesSpy = spyOn(instanceUnderTest, '_clearAllFeatures');
					const addStartInteractionFeatureSpy = spyOn(instanceUnderTest, '_addStartInteractionFeature');
					const addIntermediateInteractionFeatureSpy = spyOn(instanceUnderTest, '_addIntermediateInteractionFeature');
					const addDestinationInteractionFeatureSpy = spyOn(instanceUnderTest, '_addDestinationInteractionFeature');
					const mockResponse = { catId: { foo: 'bar' } };
					const requestRouteSpy = spyOn(instanceUnderTest, '_requestAndDisplayRoute').and.resolveTo(mockResponse);
					spyOn(routingServiceMock, 'getAlternativeCategoryIds').withArgs(catId).and.returnValue([alternativeCategoryId0]);

					await instanceUnderTest._requestRouteFromCoordinates([coordinate0, coordinate1, coordinate2], RoutingStatusCodes.Ok);

					expect(setInteractionsActiveSpy).toHaveBeenCalledWith(false);
					expect(clearAllFeaturesSpy).toHaveBeenCalled();
					expect(requestRouteSpy).toHaveBeenCalledWith(catId, [alternativeCategoryId0], [coordinate0, coordinate1, coordinate2]);
					expect(addStartInteractionFeatureSpy).toHaveBeenCalledWith(coordinate0);
					expect(addIntermediateInteractionFeatureSpy).toHaveBeenCalledWith(coordinate1, 1);
					expect(addDestinationInteractionFeatureSpy).toHaveBeenCalledWith(coordinate2, 2);
					expect(instanceUnderTest._currentRoutingResponse).toEqual(mockResponse);
				});
			});

			describe('one coordinate is available', () => {
				describe('which is the start waypoint', () => {
					it('call _requestRoute with with correct arguments', async () => {
						const catId = 'catId';
						const { instanceUnderTest } = await newTestInstance({
							categoryId: catId
						});
						const coordinate0 = [0, 0];
						const setInteractionsActiveSpy = spyOn(instanceUnderTest, '_setInteractionsActive');
						const clearAllFeaturesSpy = spyOn(instanceUnderTest, '_clearAllFeatures');
						const addStartInteractionFeatureSpy = spyOn(instanceUnderTest, '_addStartInteractionFeature');
						const addIntermediateInteractionFeatureSpy = spyOn(instanceUnderTest, '_addIntermediateInteractionFeature');
						const addDestinationInteractionFeatureSpy = spyOn(instanceUnderTest, '_addDestinationInteractionFeature');
						const requestRouteSpy = spyOn(instanceUnderTest, '_requestAndDisplayRoute');

						await instanceUnderTest._requestRouteFromCoordinates([coordinate0], RoutingStatusCodes.Destination_Missing);

						expect(setInteractionsActiveSpy).toHaveBeenCalledWith(false);
						expect(clearAllFeaturesSpy).toHaveBeenCalled();
						expect(requestRouteSpy).not.toHaveBeenCalled();
						expect(addStartInteractionFeatureSpy).toHaveBeenCalledWith(coordinate0);
						expect(addIntermediateInteractionFeatureSpy).not.toHaveBeenCalled();
						expect(addDestinationInteractionFeatureSpy).not.toHaveBeenCalled();
						expect(instanceUnderTest._currentRoutingResponse).toBeNull();
					});
				});

				describe('which is the destination waypoint', () => {
					it('call _requestRoute with with correct arguments', async () => {
						const catId = 'catId';
						const { instanceUnderTest } = await newTestInstance({
							categoryId: catId
						});
						const coordinate0 = [0, 0];
						const setInteractionsActiveSpy = spyOn(instanceUnderTest, '_setInteractionsActive');
						const clearAllFeaturesSpy = spyOn(instanceUnderTest, '_clearAllFeatures');
						const addStartInteractionFeatureSpy = spyOn(instanceUnderTest, '_addStartInteractionFeature');
						const addIntermediateInteractionFeatureSpy = spyOn(instanceUnderTest, '_addIntermediateInteractionFeature');
						const addDestinationInteractionFeatureSpy = spyOn(instanceUnderTest, '_addDestinationInteractionFeature');
						const requestRouteSpy = spyOn(instanceUnderTest, '_requestAndDisplayRoute');

						await instanceUnderTest._requestRouteFromCoordinates([coordinate0], RoutingStatusCodes.Start_Missing);

						expect(setInteractionsActiveSpy).toHaveBeenCalledWith(false);
						expect(clearAllFeaturesSpy).toHaveBeenCalled();
						expect(requestRouteSpy).not.toHaveBeenCalled();
						expect(addStartInteractionFeatureSpy).not.toHaveBeenCalled();
						expect(addIntermediateInteractionFeatureSpy).not.toHaveBeenCalled();
						expect(addDestinationInteractionFeatureSpy).toHaveBeenCalledWith(coordinate0, 0);
						expect(instanceUnderTest._currentRoutingResponse).toBeNull();
					});
				});
			});

			describe('and "_requestRoute()" throws', () => {
				describe('due to improper waypoints', () => {
					it('informs the user', async () => {
						const catId = 'catId';
						const { instanceUnderTest, store } = await newTestInstance({
							categoryId: catId,
							route: {}
						});
						const coordinate0 = [0, 0];
						const coordinate1 = [5, 5];
						const error = new Error('something got wrong', { cause: RouteCalculationErrors.Improper_Waypoints });
						spyOn(instanceUnderTest, '_requestAndDisplayRoute').and.rejectWith(error);
						const errorSpy = spyOn(console, 'error');

						await instanceUnderTest._requestRouteFromCoordinates([coordinate0, coordinate1], RoutingStatusCodes.Destination_Missing);

						expect(errorSpy).not.toHaveBeenCalled();
						expect(store.getState().notifications.latest.payload.content).toBe('olMap_handler_routing_routingService_improper_waypoints');
						expect(store.getState().notifications.latest.payload.level).toBe(LevelTypes.WARN);
					});
				});

				describe('due to any other reason', () => {
					it('informs the user and logs the error', async () => {
						const catId = 'catId';
						const { instanceUnderTest, store } = await newTestInstance({
							categoryId: catId,
							route: {}
						});
						const coordinate0 = [0, 0];
						const coordinate1 = [5, 5];
						const message = 'something got wrong';
						spyOn(instanceUnderTest, '_requestAndDisplayRoute').and.rejectWith(message);
						const errorSpy = spyOn(console, 'error');

						await instanceUnderTest._requestRouteFromCoordinates([coordinate0, coordinate1], RoutingStatusCodes.Destination_Missing);

						expect(errorSpy).toHaveBeenCalledWith(message);
						expect(store.getState().notifications.latest.payload.content).toBe('olMap_handler_routing_routingService_exception');
						expect(store.getState().notifications.latest.payload.level).toBe(LevelTypes.ERROR);
					});
				});
			});
		});

		describe('_clearRouteFeatures', () => {
			it('removes the correct features', async () => {
				const { instanceUnderTest } = await newTestInstance();
				const feature0 = new Feature({
					geometry: new Point([0, 0])
				});
				instanceUnderTest._routeLayer.getSource().addFeature(feature0);
				instanceUnderTest._routeLayerCopy.getSource().addFeature(feature0);
				instanceUnderTest._alternativeRouteLayer.getSource().addFeature(feature0);
				instanceUnderTest._highlightLayer.getSource().addFeature(feature0);
				instanceUnderTest._interactionLayer.getSource().addFeature(feature0);

				instanceUnderTest._clearRouteFeatures();

				expect(instanceUnderTest._routeLayer.getSource().getFeatures()).toHaveSize(0);
				expect(instanceUnderTest._routeLayerCopy.getSource().getFeatures()).toHaveSize(0);
				expect(instanceUnderTest._alternativeRouteLayer.getSource().getFeatures()).toHaveSize(0);
				expect(instanceUnderTest._highlightLayer.getSource().getFeatures()).toHaveSize(0);
				expect(instanceUnderTest._interactionLayer.getSource().getFeatures()).not.toHaveSize(0);
			});
		});

		describe('_clearAllFeatures', () => {
			it('removes the correct features', async () => {
				const { instanceUnderTest } = await newTestInstance();
				const feature0 = new Feature({
					geometry: new Point([0, 0])
				});
				instanceUnderTest._routeLayer.getSource().addFeature(feature0);
				instanceUnderTest._routeLayerCopy.getSource().addFeature(feature0);
				instanceUnderTest._alternativeRouteLayer.getSource().addFeature(feature0);
				instanceUnderTest._highlightLayer.getSource().addFeature(feature0);
				instanceUnderTest._interactionLayer.getSource().addFeature(feature0);

				instanceUnderTest._clearAllFeatures();

				expect(instanceUnderTest._routeLayer.getSource().getFeatures()).toHaveSize(0);
				expect(instanceUnderTest._routeLayerCopy.getSource().getFeatures()).toHaveSize(0);
				expect(instanceUnderTest._alternativeRouteLayer.getSource().getFeatures()).toHaveSize(0);
				expect(instanceUnderTest._highlightLayer.getSource().getFeatures()).toHaveSize(0);
				expect(instanceUnderTest._interactionLayer.getSource().getFeatures()).toHaveSize(0);
			});
		});

		describe('_setInteractionsActive', () => {
			describe('in a non-touch environment', () => {
				it('enables or disables all interactions', async () => {
					spyOn(environmentServiceMock, 'isTouch').and.returnValue(false);
					const { instanceUnderTest } = await newTestInstance();

					instanceUnderTest._setInteractionsActive(true);

					expect(instanceUnderTest._selectInteraction.getActive()).toBeTrue();
					expect(instanceUnderTest._translateInteraction.getActive()).toBeTrue();
					expect(instanceUnderTest._modifyInteraction.getActive()).toBeTrue();
					expect(instanceUnderTest._activeInteraction).toBeTrue();

					instanceUnderTest._setInteractionsActive(false);

					expect(instanceUnderTest._selectInteraction.getActive()).toBeFalse();
					expect(instanceUnderTest._translateInteraction.getActive()).toBeFalse();
					expect(instanceUnderTest._modifyInteraction.getActive()).toBeFalse();
					expect(instanceUnderTest._activeInteraction).toBeFalse();
				});
			});

			describe('in a touch environment', () => {
				it('enables or disables all interactions', async () => {
					spyOn(environmentServiceMock, 'isTouch').and.returnValue(true);
					const { instanceUnderTest } = await newTestInstance();

					instanceUnderTest._setInteractionsActive(true);

					expect(instanceUnderTest._selectInteraction.getActive()).toBeTrue();
					expect(instanceUnderTest._translateInteraction.getActive()).toBeTrue();
					expect(instanceUnderTest._modifyInteraction).toBeNull();
					expect(instanceUnderTest._activeInteraction).toBeTrue();

					instanceUnderTest._setInteractionsActive(false);

					expect(instanceUnderTest._selectInteraction.getActive()).toBeFalse();
					expect(instanceUnderTest._translateInteraction.getActive()).toBeFalse();
					expect(instanceUnderTest._modifyInteraction).toBeNull();
					expect(instanceUnderTest._activeInteraction).toBeFalse();
				});
			});
		});

		describe('_switchToAlternativeRoute', () => {
			it('displays an alternative route', async () => {
				const { instanceUnderTest } = await newTestInstance();
				const clearRouteFeaturesSpy = spyOn(instanceUnderTest, '_clearRouteFeatures');
				const displayCurrentRoutingGeometrySpy = spyOn(instanceUnderTest, '_displayCurrentRoutingGeometry');
				const displayAlternativeRoutingGeometry = spyOn(instanceUnderTest, '_displayAlternativeRoutingGeometry');
				const catId = 'catId';
				const alternativeCatId = 'alternativeCatId';
				instanceUnderTest._catId = catId;
				const mockGhRoutingResult = { catId: { route: 'route0' }, alternativeCatId: { route: 'route1' } };
				spyOn(routingServiceMock, 'getAlternativeCategoryIds').withArgs(catId).and.returnValue([alternativeCatId]);

				instanceUnderTest._switchToAlternativeRoute(mockGhRoutingResult);

				expect(clearRouteFeaturesSpy).toHaveBeenCalled();
				expect(displayCurrentRoutingGeometrySpy).toHaveBeenCalledWith(mockGhRoutingResult.catId);
				expect(displayAlternativeRoutingGeometry).toHaveBeenCalledOnceWith(mockGhRoutingResult.alternativeCatId);
			});
		});

		describe('_addStartInteractionFeature', () => {
			it('adds a correctly configured feature', async () => {
				const { instanceUnderTest } = await newTestInstance();
				const coordinate = [21, 42];

				instanceUnderTest._addStartInteractionFeature(coordinate);

				const feature = instanceUnderTest._interactionLayer.getSource().getFeatures()[0];
				expect(feature.get(ROUTING_FEATURE_TYPE)).toBe(RoutingFeatureTypes.START);
				expect(feature.get(ROUTING_FEATURE_INDEX)).toBe(0);
				expect(feature.getGeometry()).toBeInstanceOf(Point);
				expect(feature.getGeometry().getFirstCoordinate()).toEqual(coordinate);
				expect(feature.getStyle()(feature)).toEqual(getRoutingStyleFunction()(feature));
			});
		});

		describe('_addDestinationInteractionFeature', () => {
			it('adds a correctly configured feature', async () => {
				const { instanceUnderTest } = await newTestInstance();
				const coordinate = [21, 42];

				instanceUnderTest._addDestinationInteractionFeature(coordinate, 42);

				const feature0 = instanceUnderTest._interactionLayer.getSource().getFeatures()[0];
				expect(feature0.get(ROUTING_FEATURE_TYPE)).toBe(RoutingFeatureTypes.DESTINATION);
				expect(feature0.get(ROUTING_FEATURE_INDEX)).toBe(42);
				expect(feature0.getGeometry()).toBeInstanceOf(Point);
				expect(feature0.getGeometry().getFirstCoordinate()).toEqual(coordinate);
				expect(feature0.getStyle()(feature0)).toEqual(getRoutingStyleFunction()(feature0));

				instanceUnderTest._addDestinationInteractionFeature(coordinate);
				const feature1 = instanceUnderTest._interactionLayer.getSource().getFeatures()[0];
				expect(feature1.get(ROUTING_FEATURE_INDEX)).toBe(42);
			});
		});

		describe('_addIntermediateInteractionFeature', () => {
			it('adds a correctly configured feature', async () => {
				const { instanceUnderTest } = await newTestInstance();
				const coordinate = [21, 42];

				instanceUnderTest._addIntermediateInteractionFeature(coordinate, 42);

				const feature = instanceUnderTest._interactionLayer.getSource().getFeatures()[0];
				expect(feature.get(ROUTING_FEATURE_TYPE)).toBe(RoutingFeatureTypes.INTERMEDIATE);
				expect(feature.get(ROUTING_FEATURE_INDEX)).toBe(42);
				expect(feature.getId().startsWith(`${StyleTypes.ROUTING}_`)).toBeTrue();
				expect(feature.getGeometry()).toBeInstanceOf(Point);
				expect(feature.getGeometry().getFirstCoordinate()).toEqual(coordinate);
				expect(feature.getStyle()(feature)).toEqual(getRoutingStyleFunction()(feature));
			});
		});

		describe('_displayAlternativeRoutingGeometry', () => {
			it('adds a correctly configured feature', async () => {
				const { instanceUnderTest } = await newTestInstance();
				const category = { id: 'hike', style: {} };
				const ghRoute = {
					vehicle: 'foo',
					paths: [
						{
							points:
								'gxfiHu~fgAYRaBvBMH[J{ATq@R_@T}BlBwAr@}@t@[LU?wMeBsBm@e@Ua@Yc@VgAb@wBn@iBR_C?eLYiC?{_@VeMBkCTiBDsIK_A@i@Jq@Xk@`@]Zi@p@g@~@[`AWjAg@lEi@pC]tA{A`Fa@|As@jD]l@WXc@Ve@JAsBAe@W}@SrAa@lBk@Am@zBg@z@sAxC'
						}
					]
				};
				const coordinates = [
					[21, 42],
					[5, 55]
				];
				const geometry = new LineString(coordinates);
				spyOn(instanceUnderTest, '_polylineToGeometry').withArgs(ghRoute.paths[0].points).and.returnValue(geometry);
				spyOn(routingServiceMock, 'getCategoryById').withArgs(ghRoute.vehicle).and.returnValue(category);

				instanceUnderTest._displayAlternativeRoutingGeometry(ghRoute);

				const feature = instanceUnderTest._alternativeRouteLayer.getSource().getFeatures()[0];
				expect(feature.get(ROUTING_FEATURE_TYPE)).toBe(RoutingFeatureTypes.ROUTE_ALTERNATIVE);
				expect(feature.get(ROUTING_CATEGORY)).toBe(category);
				expect(feature.getGeometry()).toBeInstanceOf(LineString);
				expect(feature.getGeometry().getCoordinates()).toEqual(coordinates);
				expect(feature.getStyle()(feature)).toEqual(getRoutingStyleFunction()(feature));
			});
		});

		describe('_displayCurrentRoutingGeometry', () => {
			it('adds a correctly configured feature', async () => {
				const { instanceUnderTest } = await newTestInstance();
				const category = { id: 'hike', style: {} };
				const ghRoute = {
					vehicle: 'foo',
					paths: [
						{
							points:
								'gxfiHu~fgAYRaBvBMH[J{ATq@R_@T}BlBwAr@}@t@[LU?wMeBsBm@e@Ua@Yc@VgAb@wBn@iBR_C?eLYiC?{_@VeMBkCTiBDsIK_A@i@Jq@Xk@`@]Zi@p@g@~@[`AWjAg@lEi@pC]tA{A`Fa@|As@jD]l@WXc@Ve@JAsBAe@W}@SrAa@lBk@Am@zBg@z@sAxC'
						}
					]
				};
				const coordinates = [
					[21, 42],
					[5, 55]
				];
				const geometry = new LineString(coordinates);
				spyOn(instanceUnderTest, '_polylineToGeometry').withArgs(ghRoute.paths[0].points).and.returnValue(geometry);
				const segmentGeometries = [new LineString(coordinates), new LineString(coordinates)];
				spyOn(instanceUnderTest, '_splitRouteByIntermediatePoints').withArgs(geometry).and.returnValue(segmentGeometries);
				spyOn(routingServiceMock, 'getCategoryById').withArgs(ghRoute.vehicle).and.returnValue(category);
				const updateStoreSpy = spyOn(instanceUnderTest, '_updateStore');

				instanceUnderTest._displayCurrentRoutingGeometry(ghRoute);

				const feature = instanceUnderTest._routeLayer.getSource().getFeatures()[0];
				expect(feature.get(ROUTING_FEATURE_TYPE)).toBe(RoutingFeatureTypes.ROUTE);
				expect(feature.get(ROUTING_CATEGORY)).toBe(category);
				expect(feature.getGeometry()).toBeInstanceOf(LineString);
				expect(feature.getGeometry().getCoordinates()).toEqual(coordinates);
				expect(feature.getStyle()(feature)).toEqual(getRoutingStyleFunction()(feature));

				const segmentFeature0 = instanceUnderTest._routeLayerCopy.getSource().getFeatures()[0];
				expect(segmentFeature0.get(ROUTING_FEATURE_TYPE)).toBe(RoutingFeatureTypes.ROUTE_SEGMENT);
				expect(segmentFeature0.get(ROUTING_CATEGORY)).toBe(category);
				expect(segmentFeature0.get(ROUTING_SEGMENT_INDEX)).toBe(0);
				expect(segmentFeature0.getGeometry()).toBeInstanceOf(LineString);
				expect(segmentFeature0.getGeometry().getCoordinates()).toEqual(coordinates);
				expect(segmentFeature0.getStyle()(feature)).toEqual(getRoutingStyleFunction()(feature));

				const segmentFeature1 = instanceUnderTest._routeLayerCopy.getSource().getFeatures()[1];
				expect(segmentFeature1.get(ROUTING_FEATURE_TYPE)).toBe(RoutingFeatureTypes.ROUTE_SEGMENT);
				expect(segmentFeature1.get(ROUTING_CATEGORY)).toBe(category);
				expect(segmentFeature1.get(ROUTING_SEGMENT_INDEX)).toBe(1);
				expect(segmentFeature1.getGeometry()).toBeInstanceOf(LineString);
				expect(segmentFeature1.getGeometry().getCoordinates()).toEqual(coordinates);
				expect(segmentFeature1.getStyle()(feature)).toEqual(getRoutingStyleFunction()(feature));

				expect(updateStoreSpy).toHaveBeenCalledWith(ghRoute);
			});
		});

		describe('_splitRouteByIntermediatePoints', () => {
			describe('having one or more intermediate points', () => {
				it('returns an array of segments (geometries)', async () => {
					const { instanceUnderTest } = await newTestInstance();
					const intermediateFeatures = [new Feature(new Point([7.5, 7.5]))];
					spyOn(instanceUnderTest, '_getIntermediateFeatures').and.returnValue(intermediateFeatures);
					const coordinates = [
						[0, 0],
						[10, 10],
						[20, 20]
					];
					const routeGeometry = new LineString(coordinates);

					const result = instanceUnderTest._splitRouteByIntermediatePoints(routeGeometry);

					expect(result).toHaveSize(2);
					expect(result[0].getCoordinates()).toEqual([
						[0, 0],
						[10, 10]
					]);
					expect(result[1].getCoordinates()).toEqual([
						[10, 10],
						[20, 20]
					]);
				});
			});
			describe('having NO intermediate points', () => {
				it('returns an array of segments (geometries)', async () => {
					const { instanceUnderTest } = await newTestInstance();
					spyOn(instanceUnderTest, '_getIntermediateFeatures').and.returnValue([]);
					const coordinates = [
						[0, 0],
						[10, 10],
						[20, 20]
					];
					const routeGeometry = new LineString(coordinates);

					const result = instanceUnderTest._splitRouteByIntermediatePoints(routeGeometry);

					expect(result).toHaveSize(1);
					expect(result[0].getCoordinates()).toEqual(coordinates);
				});
			});
		});

		describe('_polylineToGeometry', () => {
			it('returns a geometry', async () => {
				const { instanceUnderTest } = await newTestInstance();
				const mapServiceSpy = spyOn(mapServiceMock, 'getSrid').and.returnValue(3857);

				const result = instanceUnderTest._polylineToGeometry(
					'gxfiHu~fgAYRaBvBMH[J{ATq@R_@T}BlBwAr@}@t@[LU?wMeBsBm@e@Ua@Yc@VgAb@wBn@iBR_C?eLYiC?{_@VeMBkCTiBDsIK_A@i@Jq@Xk@`@]Zi@p@g@~@[`AWjAg@lEi@pC]tA{A`Fa@|As@jD]l@WXc@Ve@JAsBAe@W}@SrAa@lBk@Am@zBg@z@sAxC'
				);

				expect(mapServiceSpy).toHaveBeenCalled();
				expect(result.getCoordinates()).toHaveSize(57);
			});
		});

		describe('_getInteractionFeatures', () => {
			it('returns an sorted (and filtered) array of features', async () => {
				const { instanceUnderTest } = await newTestInstance();
				const feature0 = new Feature({
					geometry: new Point([0, 0])
				});
				feature0.set(ROUTING_FEATURE_INDEX, 0);
				feature0.set(ROUTING_FEATURE_TYPE, RoutingFeatureTypes.START);
				const feature1 = new Feature({
					geometry: new Point([21, 42])
				});
				feature1.set(ROUTING_FEATURE_INDEX, 1);
				feature1.set(ROUTING_FEATURE_TYPE, RoutingFeatureTypes.DESTINATION);
				const features = [feature1, feature0];
				instanceUnderTest._interactionLayer.getSource().addFeatures(features);

				expect(instanceUnderTest._getInteractionFeatures()).toEqual([feature0, feature1]);
				expect(instanceUnderTest._getInteractionFeatures(RoutingFeatureTypes.START)).toEqual([feature0]);
				expect(instanceUnderTest._getInteractionFeatures(RoutingFeatureTypes.DESTINATION)).toEqual([feature1]);
			});
		});

		describe('_incrementIndex', () => {
			it('updates the ROUTING_FEATURE_INDEX property of an interaction feature', async () => {
				const { instanceUnderTest } = await newTestInstance();
				const feature0 = new Feature({
					geometry: new Point([0, 0])
				});
				feature0.set(ROUTING_FEATURE_INDEX, 0);
				const feature1 = new Feature({
					geometry: new Point([21, 42])
				});
				feature1.set(ROUTING_FEATURE_INDEX, 20);
				const features = [feature0, feature1];
				spyOn(instanceUnderTest, '_getInteractionFeatures').and.returnValue(features);

				instanceUnderTest._incrementIndex(0);

				expect(feature0.get(ROUTING_FEATURE_INDEX)).toBe(1);
				expect(feature1.get(ROUTING_FEATURE_INDEX)).toBe(21);

				instanceUnderTest._incrementIndex(1);

				expect(feature0.get(ROUTING_FEATURE_INDEX)).toBe(1);
				expect(feature1.get(ROUTING_FEATURE_INDEX)).toBe(22);
			});
		});

		describe('_highlightSegments', () => {
			it('adds and removes highlight features', async () => {
				const coordinates = [
					[0, 0],
					[10, 10],
					[20, 20]
				];
				const feature0 = new Feature({
					geometry: new LineString(coordinates)
				});
				feature0.set(ROUTING_FEATURE_TYPE, RoutingFeatureTypes.ROUTE);
				const { instanceUnderTest } = await newTestInstance();
				const highlightLayer = instanceUnderTest._highlightLayer;
				const routeLayer = instanceUnderTest._routeLayer;
				routeLayer.getSource().addFeature(feature0);

				instanceUnderTest._highlightSegments({ segments: [[0, 1]], zoomToExtent: false }, highlightLayer, routeLayer);

				expect(instanceUnderTest._highlightLayer.getSource().getFeatures()).toHaveSize(1);
				const feature = instanceUnderTest._highlightLayer.getSource().getFeatures()[0];
				expect(feature.getGeometry().getCoordinates()).toEqual([coordinates[0], coordinates[1]]);
				expect(feature.getStyle()(feature)).toEqual(getRoutingStyleFunction()(feature));

				instanceUnderTest._highlightSegments(null, highlightLayer, routeLayer);

				expect(instanceUnderTest._highlightLayer.getSource().getFeatures()).toHaveSize(0);
			});

			describe('and "zoomToExtent" property is "true"', () => {
				afterEach(() => {
					jasmine.clock().uninstall();
				});

				it('additionally places a fit request and automatically removes the highlight feature', async () => {
					const coordinates = [
						[0, 0],
						[10, 10],
						[20, 20]
					];
					const feature0 = new Feature({
						geometry: new LineString(coordinates)
					});
					feature0.set(ROUTING_FEATURE_TYPE, RoutingFeatureTypes.ROUTE);
					const { instanceUnderTest, store } = await newTestInstance();
					jasmine.clock().install(); // newTestInstance uses an async operation, therefore we wait installing the clock until we are here
					const highlightLayer = instanceUnderTest._highlightLayer;
					const routeLayer = instanceUnderTest._routeLayer;
					routeLayer.getSource().addFeature(feature0);

					instanceUnderTest._highlightSegments({ segments: [[0, 1]], zoomToExtent: true }, highlightLayer, routeLayer);

					expect(instanceUnderTest._highlightLayer.getSource().getFeatures()).toHaveSize(1);
					expect(store.getState().position.fitRequest.payload.extent).toEqual([...coordinates[0], ...coordinates[1]]);

					jasmine.clock().tick(REMOVE_HIGHLIGHTED_SEGMENTS_TIMEOUT_MS + 100);

					expect(instanceUnderTest._highlightLayer.getSource().getFeatures()).toHaveSize(0);
				});
			});

			describe('and we are in a touch environment', () => {
				afterEach(() => {
					jasmine.clock().uninstall();
				});

				it('automatically remove the highlight feature', async () => {
					spyOn(environmentServiceMock, 'isTouch').and.returnValue(true);
					const coordinates = [
						[0, 0],
						[10, 10],
						[20, 20]
					];
					const feature0 = new Feature({
						geometry: new LineString(coordinates)
					});
					feature0.set(ROUTING_FEATURE_TYPE, RoutingFeatureTypes.ROUTE);
					const { instanceUnderTest } = await newTestInstance();
					jasmine.clock().install(); // newTestInstance uses an async operation, therefore we wait installing the clock until we are here
					const highlightLayer = instanceUnderTest._highlightLayer;
					const routeLayer = instanceUnderTest._routeLayer;
					routeLayer.getSource().addFeature(feature0);

					instanceUnderTest._highlightSegments({ segments: [[0, 1]], zoomToExtent: false }, highlightLayer, routeLayer);

					expect(instanceUnderTest._highlightLayer.getSource().getFeatures()).toHaveSize(1);

					jasmine.clock().tick(REMOVE_HIGHLIGHTED_SEGMENTS_TIMEOUT_MS + 100);

					expect(instanceUnderTest._highlightLayer.getSource().getFeatures()).toHaveSize(0);
				});
			});
		});

		describe('_addIntermediate', () => {
			it('calculates the index of a new intermediate coordinate and returns the coordinates', async () => {
				const intermediateCoord = [16, 16];
				const wpCoord0 = [0, 0];
				const wpCoord1 = [10, 10];
				const wpCoord2 = [20, 20];
				const wpCoord3 = [30, 30];

				const wp0 = new Feature({ geometry: new Point(wpCoord0) });
				wp0.set(ROUTING_FEATURE_INDEX, 0);
				const wp1 = new Feature({ geometry: new Point(wpCoord1) });
				wp1.set(ROUTING_FEATURE_INDEX, 1);
				const wp2 = new Feature({ geometry: new Point(wpCoord2) });
				wp2.set(ROUTING_FEATURE_INDEX, 2);
				const wp3 = new Feature({ geometry: new Point(wpCoord3) });
				wp3.set(ROUTING_FEATURE_INDEX, 3);

				const seg0 = new Feature({
					geometry: new LineString([wpCoord0, wpCoord1])
				});
				seg0.set(ROUTING_SEGMENT_INDEX, 0);
				const seg1 = new Feature({
					geometry: new LineString([wpCoord1, wpCoord2])
				});
				seg1.set(ROUTING_SEGMENT_INDEX, 1);
				const seg2 = new Feature({
					geometry: new LineString([wpCoord2, wpCoord3])
				});
				seg2.set(ROUTING_SEGMENT_INDEX, 1);
				const { instanceUnderTest } = await newTestInstance();
				const routeLayerCopy = instanceUnderTest._routeLayerCopy;
				routeLayerCopy.getSource().addFeatures([seg0, seg1, seg2]);
				spyOn(instanceUnderTest, '_getInteractionFeatures').and.returnValue([wp0, wp1, wp2, wp3]);

				const result = instanceUnderTest._addIntermediate(intermediateCoord, routeLayerCopy);

				expect(result).toEqual([wpCoord0, wpCoord1, intermediateCoord, wpCoord2, wpCoord3]);
			});

			it('just returns the coordinates when no segments are available', async () => {
				const intermediateCoord = [16, 16];
				const wpCoord0 = [0, 0];
				const wpCoord1 = [10, 10];
				const wp0 = new Feature({ geometry: new Point(wpCoord0) });
				wp0.set(ROUTING_FEATURE_INDEX, 0);
				const wp1 = new Feature({ geometry: new Point(wpCoord1) });
				wp1.set(ROUTING_FEATURE_INDEX, 1);
				const { instanceUnderTest } = await newTestInstance();
				const routeLayerCopy = instanceUnderTest._routeLayerCopy;
				spyOn(instanceUnderTest, '_getInteractionFeatures').and.returnValue([wp0, wp1]);

				const result = instanceUnderTest._addIntermediate(intermediateCoord, routeLayerCopy);

				expect(result).toEqual([wpCoord0, wpCoord1]);
			});
		});

		describe('_newClickHandler', () => {
			const eventCoordinate = [11, 22];
			const featureCoordinate = [10, 20];
			const pixel = [21, 42];
			const feature = new Feature({
				geometry: new Point(featureCoordinate)
			});
			const segmentFeatureMock = {};
			const callClickHandler = async (hitFeature = null, interactionFeatures = [], routeLayerCopyFeatures = []) => {
				const { instanceUnderTest, map, store } = await newTestInstance();
				spyOn(instanceUnderTest._routeLayerCopy, 'getSource').and.returnValue({ getFeatures: () => routeLayerCopyFeatures });

				const handler = instanceUnderTest._newClickHandler(
					map,
					instanceUnderTest._interactionLayer,
					instanceUnderTest._alternativeRouteLayer,
					instanceUnderTest._routeLayerCopy
				);
				const event = { originalEvent: {}, coordinate: eventCoordinate };
				const getFeaturesAtPixelOptionsForClickHandlerOptions = {
					layerFilter: () => true,
					hitTolerance: 42
				};
				spyOn(instanceUnderTest, '_getFeaturesAtPixelOptionsForClickHandler')
					.withArgs(instanceUnderTest._interactionLayer, instanceUnderTest._alternativeRouteLayer)
					.and.returnValue(getFeaturesAtPixelOptionsForClickHandlerOptions);
				spyOn(map, 'getEventPixel').withArgs(event.originalEvent).and.returnValue(pixel);
				spyOn(map, 'getEventCoordinate').withArgs(event.originalEvent).and.returnValue(eventCoordinate);
				spyOn(map, 'getFeaturesAtPixel')
					.withArgs(pixel, getFeaturesAtPixelOptionsForClickHandlerOptions)
					.and.returnValue(hitFeature ? [hitFeature] : []);
				spyOn(instanceUnderTest, '_getInteractionFeatures').and.returnValue(interactionFeatures);

				handler(event);
				return { map, store };
			};

			it('is properly configured', async () => {
				setup();
				const instanceUnderTest = new OlRoutingHandler();
				const interactionLayerMock = { id: '0' };
				const alternativeRouteLayerMock = { id: '1' };

				const options = instanceUnderTest._getFeaturesAtPixelOptionsForClickHandler(interactionLayerMock, alternativeRouteLayerMock);
				expect(options).toEqual({
					layerFilter: jasmine.any(Function),
					hitTolerance: 5
				});
				expect(options.layerFilter(interactionLayerMock)).toBeTrue();
				expect(options.layerFilter(alternativeRouteLayerMock)).toBeTrue();
				expect(options.layerFilter({})).toBeFalse();
			});

			it('updates the "proposal" property of the routing s-o-s', async () => {
				feature.set(ROUTING_FEATURE_TYPE, RoutingFeatureTypes.START);
				let store = (await callClickHandler(feature)).store;
				expect(store.getState().routing.proposal.payload).toEqual({
					coord: featureCoordinate,
					type: CoordinateProposalType.EXISTING_START_OR_DESTINATION
				});

				feature.set(ROUTING_FEATURE_TYPE, RoutingFeatureTypes.DESTINATION);
				store = (await callClickHandler(feature)).store;
				expect(store.getState().routing.proposal.payload).toEqual({
					coord: featureCoordinate,
					type: CoordinateProposalType.EXISTING_START_OR_DESTINATION
				});

				feature.set(ROUTING_FEATURE_TYPE, RoutingFeatureTypes.INTERMEDIATE);
				store = (await callClickHandler(feature)).store;
				expect(store.getState().routing.proposal.payload).toEqual({
					coord: featureCoordinate,
					type: CoordinateProposalType.EXISTING_INTERMEDIATE
				});
			});

			it('updates the "proposal" property of the routing s-o-s when a feature is NOT a hit', async () => {
				let store = (await callClickHandler()).store;
				expect(store.getState().routing.proposal.payload).toEqual({
					coord: eventCoordinate,
					type: CoordinateProposalType.START_OR_DESTINATION
				});

				feature.set(ROUTING_FEATURE_TYPE, RoutingFeatureTypes.START);
				store = (await callClickHandler(null, [feature])).store;
				expect(store.getState().routing.proposal.payload).toEqual({
					coord: eventCoordinate,
					type: CoordinateProposalType.DESTINATION
				});

				feature.set(ROUTING_FEATURE_TYPE, RoutingFeatureTypes.DESTINATION);
				store = (await callClickHandler(null, [feature])).store;
				expect(store.getState().routing.proposal.payload).toEqual({
					coord: eventCoordinate,
					type: CoordinateProposalType.START
				});

				feature.unset(ROUTING_FEATURE_TYPE);
				store = (await callClickHandler(null, [feature], [segmentFeatureMock])).store;
				expect(store.getState().routing.proposal.payload).toEqual({
					coord: eventCoordinate,
					type: CoordinateProposalType.INTERMEDIATE
				});
			});

			it('does NOT update the "proposal" property of type "INTERMEDIATE" when no segment is available', async () => {
				const store = (await callClickHandler(null, [feature], [])).store;
				expect(store.getState().routing.proposal.payload).toBeNull();
			});
		});

		describe('_newPointerMoveHandler', () => {
			const eventCoordinate = [11, 22];
			const featureCoordinate = [10, 20];
			const feature = new Feature({
				geometry: new Point(featureCoordinate)
			});
			const callPointerMoveHandler = async (feature, draggingEvent = false) => {
				const { instanceUnderTest, map } = await newTestInstance();

				const setModifyActiveSpy = spyOn(instanceUnderTest, '_setModifyActive');
				const helpTooltipActivateSpy = spyOn(instanceUnderTest._helpTooltip, 'activate');
				const helpTooltipDeactivateSpy = spyOn(instanceUnderTest._helpTooltip, 'deactivate');
				const helpTooltipNotifySpy = spyOn(instanceUnderTest._helpTooltip, 'notify');
				const handler = instanceUnderTest._newPointerMoveHandler(
					map,
					instanceUnderTest._interactionLayer,
					instanceUnderTest._alternativeRouteLayer,
					instanceUnderTest._routeLayerCopy
				);
				const event = { originalEvent: {}, coordinate: eventCoordinate, dragging: draggingEvent };
				const pointerMoveGetFeaturesAtPixelOptions = {
					layerFilter: () => true,
					hitTolerance: 42
				};
				spyOn(instanceUnderTest, '_getFeaturesAtPixelOptionsForPointerMove')
					.withArgs(instanceUnderTest._interactionLayer, instanceUnderTest._alternativeRouteLayer, instanceUnderTest._routeLayerCopy)
					.and.returnValue(pointerMoveGetFeaturesAtPixelOptions);
				spyOn(map, 'getEventPixel').withArgs(event.originalEvent).and.returnValue([21, 42]);
				spyOn(map, 'getFeaturesAtPixel')
					.withArgs([21, 42], pointerMoveGetFeaturesAtPixelOptions)
					.and.returnValue(feature ? [feature] : []);

				handler(event);
				return { setModifyActiveSpy, helpTooltipActivateSpy, helpTooltipNotifySpy, helpTooltipDeactivateSpy, map };
			};

			it('is properly configured', async () => {
				setup();
				const instanceUnderTest = new OlRoutingHandler();
				const interactionLayerMock = { id: '0' };
				const alternativeRouteLayerMock = { id: '1' };
				const routeLayerCopyMock = { id: '2' };

				const options = instanceUnderTest._getFeaturesAtPixelOptionsForPointerMove(
					interactionLayerMock,
					alternativeRouteLayerMock,
					routeLayerCopyMock
				);
				expect(options).toEqual({
					layerFilter: jasmine.any(Function),
					hitTolerance: 5
				});
				expect(options.layerFilter(interactionLayerMock)).toBeTrue();
				expect(options.layerFilter(alternativeRouteLayerMock)).toBeTrue();
				expect(options.layerFilter(routeLayerCopyMock)).toBeTrue();
				expect(options.layerFilter({})).toBeFalse();
			});

			it('handles a detected feature of type ROUTE_SEGMENT', async () => {
				feature.set(ROUTING_FEATURE_TYPE, RoutingFeatureTypes.ROUTE_SEGMENT);
				const { setModifyActiveSpy, helpTooltipActivateSpy, helpTooltipNotifySpy, helpTooltipDeactivateSpy, map } =
					await callPointerMoveHandler(feature);

				expect(setModifyActiveSpy).toHaveBeenCalledWith(true);
				expect(helpTooltipActivateSpy).toHaveBeenCalled();
				expect(helpTooltipNotifySpy).toHaveBeenCalledWith({
					coordinate: featureCoordinate,
					dragging: false,
					feature: feature
				});
				expect(helpTooltipDeactivateSpy).toHaveBeenCalled();
				expect(map.getTarget().style.cursor).toBe('grab');
			});

			it('handles a detected feature of other type', async () => {
				feature.set(ROUTING_FEATURE_TYPE, RoutingFeatureTypes.ROUTE_COPY);
				const { setModifyActiveSpy, helpTooltipActivateSpy, helpTooltipNotifySpy, helpTooltipDeactivateSpy, map } =
					await callPointerMoveHandler(feature);

				expect(setModifyActiveSpy).toHaveBeenCalledWith(false);
				expect(helpTooltipActivateSpy).toHaveBeenCalled();
				expect(helpTooltipNotifySpy).toHaveBeenCalledWith({
					coordinate: featureCoordinate,
					dragging: false,
					feature: feature
				});
				expect(helpTooltipDeactivateSpy).toHaveBeenCalled();
				expect(map.getTarget().style.cursor).toBe('pointer');
			});

			it('does nothing when no feature was detected', async () => {
				const { setModifyActiveSpy, helpTooltipActivateSpy, helpTooltipNotifySpy, helpTooltipDeactivateSpy, map } = await callPointerMoveHandler();

				expect(setModifyActiveSpy).not.toHaveBeenCalled();
				expect(helpTooltipNotifySpy).not.toHaveBeenCalled();
				expect(helpTooltipActivateSpy).not.toHaveBeenCalled();
				expect(helpTooltipDeactivateSpy).toHaveBeenCalled();
				expect(map.getTarget().style.cursor).toBe('');
			});

			it('does nothing when event is a dragging event', async () => {
				feature.set(ROUTING_FEATURE_TYPE, RoutingFeatureTypes.ROUTE_ALTERNATIVE);
				const { setModifyActiveSpy, helpTooltipActivateSpy, helpTooltipNotifySpy, helpTooltipDeactivateSpy, map } = await callPointerMoveHandler(
					feature,
					true
				);

				expect(setModifyActiveSpy).not.toHaveBeenCalled();
				expect(helpTooltipNotifySpy).not.toHaveBeenCalled();
				expect(helpTooltipActivateSpy).not.toHaveBeenCalled();
				expect(helpTooltipDeactivateSpy).toHaveBeenCalled();
				expect(map.getTarget().style.cursor).toBe('');
			});
		});

		describe('_convertToPermanentLayer', () => {
			it('creates two GeoResources and adds two layers', async () => {
				const geoResources = [];
				const featureRoute = new Feature({
					geometry: new Point([21, 21])
				});
				const featureWaypoint = new Feature({
					geometry: new Point([42, 42])
				});
				const { instanceUnderTest, map, store } = await newTestInstance();
				instanceUnderTest.activate(map);
				instanceUnderTest._routeLayerCopy.getSource().addFeature(featureRoute);
				instanceUnderTest._interactionLayer.getSource().addFeature(featureWaypoint);
				spyOn(geoResourceServiceMock, 'byId').and.returnValue(null);
				spyOn(geoResourceServiceMock, 'addOrReplace').and.callFake((gr) => geoResources.push(gr));
				const mapServiceSpy = spyOn(mapServiceMock, 'getSrid').and.returnValue(3857);

				instanceUnderTest._convertToPermanentLayer();

				expect(store.getState().layers.active).toHaveSize(2);
				expect(geoResources).toHaveSize(2);

				//first vgr and layer
				expect(store.getState().layers.active[0].id).toBe(PERMANENT_ROUTE_LAYER_ID);
				expect(geoResources[0].label).toBe('olMap_handler_routing_rt_layer_label');
				expect(geoResources[0].hidden).toBeTrue();
				expect(geoResources[0].attributionProvider).toEqual(getBvvAttributionForRoutingResult);
				expect(geoResources[0].sourceType).toBe(VectorSourceType.KML);
				expect(geoResources[0].srid).toEqual(4326);
				expect(geoResources[1].data).toContain('<Document><Placemark><Style/><Point><coordinates>');
				//second vgr and layer
				expect(store.getState().layers.active[1].id).toBe(PERMANENT_WP_LAYER_ID);
				expect(geoResources[1].label).toBe('olMap_handler_routing_wp_layer_label');
				expect(geoResources[1].hidden).toBeTrue();
				expect(geoResources[1].attributionProvider).toEqual(getAttributionForLocallyImportedOrCreatedGeoResource);
				expect(geoResources[1].sourceType).toBe(VectorSourceType.KML);
				expect(geoResources[1].srid).toEqual(4326);
				expect(geoResources[1].data).toContain('<Document><Placemark><Style/><Point><coordinates>');

				expect(geoResources[0].data).not.toBe(geoResources[1].data);
				expect(mapServiceSpy).toHaveBeenCalledTimes(2);
			});

			it('updates both existing GeoResources and adds two layers', async () => {
				const geoResources = [];
				const featureRoute = new Feature({
					geometry: new Point([21, 21])
				});
				const featureWaypoint = new Feature({
					geometry: new Point([42, 42])
				});
				const { instanceUnderTest, map, store } = await newTestInstance();
				instanceUnderTest.activate(map);
				instanceUnderTest._routeLayerCopy.getSource().addFeature(featureRoute);
				instanceUnderTest._interactionLayer.getSource().addFeature(featureWaypoint);
				spyOn(geoResourceServiceMock, 'byId').and.callFake((id) => {
					return new VectorGeoResource(id, 'any', VectorSourceType.KML);
				});
				spyOn(geoResourceServiceMock, 'addOrReplace').and.callFake((gr) => geoResources.push(gr));
				const mapServiceSpy = spyOn(mapServiceMock, 'getSrid').and.returnValue(3857);

				instanceUnderTest._convertToPermanentLayer();

				expect(store.getState().layers.active).toHaveSize(2);
				expect(geoResources).toHaveSize(2);

				//first vgr and layer
				expect(store.getState().layers.active[0].id).toBe(PERMANENT_ROUTE_LAYER_ID);
				expect(geoResources[1].data).toContain('<Document><Placemark><Style/><Point><coordinates>');
				//second vgr and layer
				expect(store.getState().layers.active[1].id).toBe(PERMANENT_WP_LAYER_ID);
				expect(geoResources[0].data).toContain('<Document><Placemark><Style/><Point><coordinates>');

				expect(geoResources[0].data).not.toBe(geoResources[1].data);
				expect(mapServiceSpy).toHaveBeenCalledTimes(2);
			});

			it('does nothing when no route is available', async () => {
				const { instanceUnderTest, map, store } = await newTestInstance();
				instanceUnderTest.activate(map);

				instanceUnderTest._convertToPermanentLayer();

				expect(store.getState().layers.active).toHaveSize(0);
			});
		});
	});
});
