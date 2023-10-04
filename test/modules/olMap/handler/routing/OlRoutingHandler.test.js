import { TestUtils } from '../../../../test-utils';
import { routingReducer, initialState as initialRoutingSoS } from '../../../../../src/store/routing/routing.reducer';
import Map from 'ol/Map';
import View from 'ol/View';
import {
	OlRoutingHandler,
	ROUTING_CATEGORY,
	ROUTING_FEATURE_INDEX,
	ROUTING_FEATURE_TYPE,
	ROUTING_SEGMENT_INDEX,
	RoutingFeatureTypes,
	RoutingLayerIds
} from '../../../../../src/modules/olMap/handler/routing/OlRoutingHandler';
import { $injector } from '../../../../../src/injection';
import { PromiseQueue } from '../../../../../src/utils/PromiseQueue';
import { Vector } from 'ol/layer';
import { Modify, Translate } from 'ol/interaction';
import { setCategory, setWaypoints } from '../../../../../src/store/routing/routing.action';
import MapBrowserEventType from 'ol/MapBrowserEventType';
import { Feature, MapBrowserEvent } from 'ol';
import Event from 'ol/events/Event';
import { LineString, Point } from 'ol/geom';
import { ModifyEvent } from 'ol/interaction/Modify';
import Collection from 'ol/Collection.js';
import { TranslateEvent } from 'ol/interaction/Translate';
import { notificationReducer } from '../../../../../src/store/notifications/notifications.reducer';
import { LevelTypes } from '../../../../../src/store/notifications/notifications.action';
import { getRoutingStyleFunction } from '../../../../../src/modules/olMap/handler/routing/styleUtils';

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
		async calculate() {},
		getAlternativeCategoryIds() {}
	};
	const mapServiceMock = {};
	const environmentServiceMock = {
		isTouch() {}
	};

	const setup = (state) => {
		const initialState = {
			routing: {
				...initialRoutingSoS,
				...state
			}
		};
		const store = TestUtils.setupStoreAndDi(initialState, { routing: routingReducer, notifications: notificationReducer });

		$injector
			.registerSingleton('RoutingService', routingServiceMock)
			.registerSingleton('MapService', mapServiceMock)
			.registerSingleton('EnvironmentService', environmentServiceMock)
			.registerSingleton('TranslationService', { translate: (key) => key });

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

		expect(instanceUnderTest._registeredObservers).toEqual([]);
		expect(instanceUnderTest._activeInteraction).toBeFalse();
		expect(instanceUnderTest._catId).toBeNull();
		expect(instanceUnderTest._promiseQueue).toBeInstanceOf(PromiseQueue);
	});

	describe('lifecycle', () => {
		describe('when handler is activated', () => {
			describe('in a non-touch environment', () => {
				it('fully initializes the handler', () => {
					const map = setupMap();
					setup();
					const instanceUnderTest = new OlRoutingHandler();

					const olLayer = instanceUnderTest.activate(map);

					expect(instanceUnderTest._map).toEqual(map);
					// layer
					expect(instanceUnderTest._routingLayerGroup).toEqual(olLayer);
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
					expect(olLayer.getLayers().getArray()).toEqual([
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

					expect(instanceUnderTest._registeredObservers).toHaveSize(2);
				});
			});

			describe('in a touch environment', () => {
				it('fully initializes the handler (without modify interaction)', () => {
					const map = setupMap();
					setup();
					const instanceUnderTest = new OlRoutingHandler();
					spyOn(environmentServiceMock, 'isTouch').and.returnValue(true);

					const olLayer = instanceUnderTest.activate(map);

					expect(instanceUnderTest._map).toEqual(map);
					// layer
					expect(instanceUnderTest._routingLayerGroup).toEqual(olLayer);
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
					expect(olLayer.getLayers().getArray()).toEqual([
						instanceUnderTest._alternativeRouteLayer,
						instanceUnderTest._routeLayer,
						instanceUnderTest._routeLayerCopy,
						instanceUnderTest._highlightLayer,
						instanceUnderTest._interactionLayer
					]);
					// interactions
					expect(instanceUnderTest._translateInteraction).toBeInstanceOf(Translate);
					expect(instanceUnderTest._map.getInteractions().getArray()).toContain(instanceUnderTest._translateInteraction);
					expect(instanceUnderTest._modifyInteraction).toBeNull();
					expect(instanceUnderTest._map.getInteractions().getArray()).not.toContain(instanceUnderTest._modifyInteraction);

					expect(instanceUnderTest._registeredObservers).toHaveSize(2);
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
					waypoints: coordinates
				});
				const instanceUnderTest = new OlRoutingHandler();
				const requestRouteFromCoordinatesSpy = spyOn(instanceUnderTest, '_requestRouteFromCoordinates');

				instanceUnderTest.activate(map);

				await TestUtils.timeout();
				expect(instanceUnderTest._catId).toBe(catId);
				expect(requestRouteFromCoordinatesSpy).toHaveBeenCalledWith(coordinates);
			});
		});

		describe('when handler is deactivated', () => {
			it('updates olLayer and olMap fields', () => {
				const map = setupMap();
				setup();
				const instanceUnderTest = new OlRoutingHandler();
				instanceUnderTest.activate(map);

				instanceUnderTest.deactivate(map);

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

				expect(instanceUnderTest._catId).toBeNull();
				expect(instanceUnderTest._promiseQueue).toBeInstanceOf(PromiseQueue);
				expect(instanceUnderTest._registeredObservers).toEqual([]);
			});
		});
	});

	describe('events', () => {
		describe('when observed slices-of-state change', () => {
			it('updates updates the category and calculates a route', async () => {
				const map = setupMap();
				const coordinates = [
					[22, 33],
					[44, 55]
				];
				const catId = 'catId';
				setup();
				const instanceUnderTest = new OlRoutingHandler();
				const requestRouteFromCoordinatesSpy = spyOn(instanceUnderTest, '_requestRouteFromCoordinates');

				instanceUnderTest.activate(map);

				setCategory(catId);
				await TestUtils.timeout();
				expect(instanceUnderTest._catId).toBe(catId);
				expect(requestRouteFromCoordinatesSpy).toHaveBeenCalledWith([]);

				requestRouteFromCoordinatesSpy.calls.reset();

				setWaypoints(coordinates);
				await TestUtils.timeout();
				expect(instanceUnderTest._catId).toBe(catId);
				expect(requestRouteFromCoordinatesSpy).toHaveBeenCalledWith(coordinates);
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
			it('handles the CSS class and calls the correct methods', async () => {
				setup();
				const map = setupMap();
				const instanceUnderTest = new OlRoutingHandler();
				const requestRouteFromInteractionLayerSpy = spyOn(instanceUnderTest, '_requestRouteFromInteractionLayer');

				const layer = instanceUnderTest.activate(map);
				map.addLayer(layer);
				instanceUnderTest._setInteractionsActive(true);

				const feature = new Feature({
					geometry: new Point([0, 0])
				});

				instanceUnderTest._translateInteraction.dispatchEvent(
					new TranslateEvent('translatestart', new Collection([feature]), [0, 0], [0, 0], new Event(MapBrowserEventType.POINTERDOWN))
				);
				expect(map.getTarget().classList.contains('grabbing')).toBeFalse();

				instanceUnderTest._translateInteraction.dispatchEvent(
					new TranslateEvent('translating', new Collection([feature]), [10, 20], [0, 0], new Event(MapBrowserEventType.POINTERDRAG))
				);
				expect(map.getTarget().classList.contains('grabbing')).toBeTrue();

				instanceUnderTest._translateInteraction.dispatchEvent(
					new TranslateEvent('translateend', new Collection([feature]), [21, 42], [0, 0], new Event(MapBrowserEventType.POINTERUP))
				);
				expect(map.getTarget().classList.contains('grabbing')).toBeFalse();
				expect(requestRouteFromInteractionLayerSpy).toHaveBeenCalledTimes(1);
			});
		});

		describe('modify', () => {
			it('handles the CSS class and calls the correct methods', () => {
				setup();
				const map = setupMap();
				const instanceUnderTest = new OlRoutingHandler();
				const requestRouteFromInteractionLayerSpy = spyOn(instanceUnderTest, '_requestRouteFromInteractionLayer');
				const incrementIndexSpy = spyOn(instanceUnderTest, '_incrementIndex');
				const addIntermediateInteractionFeatureSpy = spyOn(instanceUnderTest, '_addIntermediateInteractionFeature');
				const layer = instanceUnderTest.activate(map);
				map.addLayer(layer);
				instanceUnderTest._setInteractionsActive(true);
				const mockSegmentFeature = new Feature({
					geometry: new LineString([
						[0, -6757423],
						[0, 6757423]
					])
				});
				const mockCoordinate = [21, 42];
				mockSegmentFeature.set(ROUTING_SEGMENT_INDEX, 42);
				instanceUnderTest._routeLayerCopy.getSource().addFeature(mockSegmentFeature);

				instanceUnderTest._modifyInteraction.dispatchEvent(
					new ModifyEvent('modifystart', null, new MapBrowserEvent(MapBrowserEventType.SINGLECLICK))
				);
				expect(map.getTarget().classList.contains('grabbing')).toBeFalse();

				instanceUnderTest._modifyInteraction.dispatchEvent(new ModifyEvent('modifystart', null, new Event(MapBrowserEventType.POINTERDOWN)));
				expect(map.getTarget().classList.contains('grabbing')).toBeTrue();

				instanceUnderTest._modifyInteraction.dispatchEvent(
					new ModifyEvent(
						'modifyend',
						new Collection([mockSegmentFeature]),
						newMapBrowserEventForCoordinate(MapBrowserEventType.POINTERUP, map, mockCoordinate)
					)
				);
				expect(map.getTarget().classList.contains('grabbing')).toBeFalse();
				expect(incrementIndexSpy).toHaveBeenCalledOnceWith(43);
				expect(addIntermediateInteractionFeatureSpy).toHaveBeenCalledWith(mockCoordinate, 43);
				expect(requestRouteFromInteractionLayerSpy).toHaveBeenCalledTimes(1);
			});
		});
	});

	describe('methods', () => {
		describe('_requestRoute', () => {
			describe('an no intermediate features are available', () => {
				it('calls the routing service with correct arguments', async () => {
					setup();
					const map = setupMap();
					const defaultCategoryId = 'defaultCategoryId';
					const alternativeCategoryIds = ['alternativeCategoryId0', 'alternativeCategoryId1'];
					const coordinates3857 = [
						[11, 22],
						[33, 44]
					];
					const mockRouteResult = { defaultCategoryId: {} };
					spyOn(routingServiceMock, 'calculate')
						.withArgs([defaultCategoryId, ...alternativeCategoryIds], coordinates3857)
						.and.resolveTo(mockRouteResult);
					const instanceUnderTest = new OlRoutingHandler();
					const displayCurrentRoutingGeometrySpy = spyOn(instanceUnderTest, '_displayCurrentRoutingGeometry');
					const displayAlternativeRoutingGeometrySpy = spyOn(instanceUnderTest, '_displayAlternativeRoutingGeometry');
					instanceUnderTest.activate(map);

					await expectAsync(instanceUnderTest._requestRoute(defaultCategoryId, alternativeCategoryIds, coordinates3857)).toBeResolved(
						mockRouteResult
					);
					expect(displayCurrentRoutingGeometrySpy).toHaveBeenCalledWith(mockRouteResult.defaultCategoryId);
					// expect(displayAlternativeRoutingGeometrySpy.calls.allArgs()).toEqual(alternativeCategoryIds);
					expect(displayAlternativeRoutingGeometrySpy).toHaveBeenCalledTimes(2);
					expect(instanceUnderTest._activeInteraction).toBeTrue();
				});
			});

			describe('and one ore more intermediate features are available', () => {
				it('calls the routing service with correct arguments', async () => {
					setup();
					const map = setupMap();
					const defaultCategoryId = 'defaultCategoryId';
					const alternativeCategoryIds = ['alternativeCategoryId0', 'alternativeCategoryId1'];
					const coordinates3857 = [
						[11, 22],
						[33, 44]
					];
					const mockRouteResult = { defaultCategoryId: {} };
					spyOn(routingServiceMock, 'calculate').withArgs([defaultCategoryId], coordinates3857).and.resolveTo(mockRouteResult);
					const instanceUnderTest = new OlRoutingHandler();
					const displayCurrentRoutingGeometrySpy = spyOn(instanceUnderTest, '_displayCurrentRoutingGeometry');
					const displayAlternativeRoutingGeometrySpy = spyOn(instanceUnderTest, '_displayAlternativeRoutingGeometry');
					instanceUnderTest.activate(map);
					instanceUnderTest._addIntermediateInteractionFeature(15, 15, 1);

					await expectAsync(instanceUnderTest._requestRoute(defaultCategoryId, alternativeCategoryIds, coordinates3857)).toBeResolved();
					expect(displayCurrentRoutingGeometrySpy).toHaveBeenCalledWith(mockRouteResult.defaultCategoryId);
					expect(displayAlternativeRoutingGeometrySpy).not.toHaveBeenCalled();
					expect(instanceUnderTest._activeInteraction).toBeTrue();
				});
			});

			describe('and the routing service throws', () => {
				it('informs the user and logs the error', async () => {
					const store = setup();
					const map = setupMap();
					const message = 'something got wrong';
					const defaultCategoryId = 'defaultCategoryId';
					const alternativeCategoryIds = ['alternativeCategoryId0', 'alternativeCategoryId1'];
					const coordinates3857 = [
						[11, 22],
						[33, 44]
					];
					const instanceUnderTest = new OlRoutingHandler();
					spyOn(routingServiceMock, 'calculate').and.rejectWith(message);
					const errorSpy = spyOn(console, 'error');
					instanceUnderTest.activate(map);

					await expectAsync(instanceUnderTest._requestRoute(defaultCategoryId, alternativeCategoryIds, coordinates3857)).toBeRejected();
					expect(errorSpy).toHaveBeenCalledWith(message);
					expect(instanceUnderTest._activeInteraction).toBeTrue();
					expect(store.getState().notifications.latest.payload.content).toBe('global_routingService_exception');
					expect(store.getState().notifications.latest.payload.level).toBe(LevelTypes.ERROR);
				});
			});
		});
		describe('_requestRouteFromInteractionLayer', () => {
			describe('more than one interaction feature is available', () => {
				it('call _requestRoute with with correct arguments', async () => {
					const catId = 'catId';
					setup({
						categoryId: catId
					});
					const map = setupMap();
					const instanceUnderTest = new OlRoutingHandler();
					const feature0 = new Feature({
						geometry: new Point([0, 0])
					});
					const feature1 = new Feature({
						geometry: new Point([5, 5])
					});
					const alternativeCategoryId0 = 'alternativeCategoryId0';
					const setInteractionsActiveSpy = spyOn(instanceUnderTest, '_setInteractionsActive');
					const clearRouteFeatureSpy = spyOn(instanceUnderTest, '_clearRouteFeatures');
					const requestRouteSpy = spyOn(instanceUnderTest, '_requestRoute').and.resolveTo();
					spyOn(instanceUnderTest, '_getInteractionFeatures').and.returnValue([feature0, feature1]);
					spyOn(routingServiceMock, 'getAlternativeCategoryIds').withArgs(catId).and.returnValue([alternativeCategoryId0]);
					instanceUnderTest.activate(map);
					await TestUtils.timeout();
					instanceUnderTest._interactionLayer.getSource().addFeatures([feature0, feature1]);

					await expectAsync(instanceUnderTest._requestRouteFromInteractionLayer());

					expect(setInteractionsActiveSpy).toHaveBeenCalledWith(false);
					expect(clearRouteFeatureSpy).toHaveBeenCalled();
					expect(requestRouteSpy).toHaveBeenCalledWith(
						catId,
						[alternativeCategoryId0],
						[
							[0, 0],
							[5, 5]
						]
					);
				});
			});

			describe('less then two interaction features are available', () => {
				it('does nothing', async () => {
					const catId = 'catId';
					setup({
						categoryId: catId
					});
					const map = setupMap();
					const instanceUnderTest = new OlRoutingHandler();
					const feature0 = new Feature({
						geometry: new Point([0, 0])
					});
					const requestRouteSpy = spyOn(instanceUnderTest, '_requestRoute').and.resolveTo();
					const setInteractionsActiveSpy = spyOn(instanceUnderTest, '_setInteractionsActive');
					const clearRouteFeatureSpy = spyOn(instanceUnderTest, '_clearRouteFeatures');
					instanceUnderTest.activate(map);
					await TestUtils.timeout();
					instanceUnderTest._interactionLayer.getSource().addFeatures([feature0]);

					await expectAsync(instanceUnderTest._requestRouteFromInteractionLayer());

					expect(setInteractionsActiveSpy).not.toHaveBeenCalled();
					expect(clearRouteFeatureSpy).not.toHaveBeenCalled();
					expect(requestRouteSpy).not.toHaveBeenCalled();
				});
			});
		});

		describe('_requestRouteFromCoordinates', () => {
			describe('more than one coordinate is available', () => {
				it('call _requestRoute with with correct arguments', async () => {
					const catId = 'catId';
					setup({
						categoryId: catId
					});
					const map = setupMap();
					const instanceUnderTest = new OlRoutingHandler();
					const coordinate0 = [0, 0];
					const coordinate1 = [5, 5];
					const coordinate2 = [10, 10];
					const alternativeCategoryId0 = 'alternativeCategoryId0';
					const setInteractionsActiveSpy = spyOn(instanceUnderTest, '_setInteractionsActive');
					const clearAllFeaturesSpy = spyOn(instanceUnderTest, '_clearAllFeatures');
					const addStartInteractionFeatureSpy = spyOn(instanceUnderTest, '_addStartInteractionFeature');
					const addIntermediateInteractionFeatureSpy = spyOn(instanceUnderTest, '_addIntermediateInteractionFeature');
					const addDestinationInteractionFeatureSpy = spyOn(instanceUnderTest, '_addDestinationInteractionFeature');
					const requestRouteSpy = spyOn(instanceUnderTest, '_requestRoute').and.resolveTo();
					spyOn(routingServiceMock, 'getAlternativeCategoryIds').withArgs(catId).and.returnValue([alternativeCategoryId0]);
					instanceUnderTest.activate(map);
					await TestUtils.timeout();

					await expectAsync(instanceUnderTest._requestRouteFromCoordinates([coordinate0, coordinate1, coordinate2]));

					expect(setInteractionsActiveSpy).toHaveBeenCalledWith(false);
					expect(clearAllFeaturesSpy).toHaveBeenCalled();
					expect(requestRouteSpy).toHaveBeenCalledWith(catId, [alternativeCategoryId0], [coordinate0, coordinate1, coordinate2]);
					expect(addStartInteractionFeatureSpy).toHaveBeenCalledWith(coordinate0);
					expect(addIntermediateInteractionFeatureSpy).toHaveBeenCalledWith(coordinate1, 1);
					expect(addDestinationInteractionFeatureSpy).toHaveBeenCalledWith(coordinate2, 2);
				});
			});

			describe('less then two coordinates features are available', () => {
				it('does nothing', async () => {
					const catId = 'catId';
					setup({
						categoryId: catId
					});
					const map = setupMap();
					const instanceUnderTest = new OlRoutingHandler();
					const coordinate0 = [0, 0];
					const setInteractionsActiveSpy = spyOn(instanceUnderTest, '_setInteractionsActive');
					const clearAllFeaturesSpy = spyOn(instanceUnderTest, '_clearAllFeatures');
					const requestRouteSpy = spyOn(instanceUnderTest, '_requestRoute').and.resolveTo();
					instanceUnderTest.activate(map);
					await TestUtils.timeout();

					await expectAsync(instanceUnderTest._requestRouteFromCoordinates([coordinate0]));

					expect(setInteractionsActiveSpy).not.toHaveBeenCalled();
					expect(clearAllFeaturesSpy).not.toHaveBeenCalled();
					expect(requestRouteSpy).not.toHaveBeenCalled();
				});
			});
		});

		describe('_clearRouteFeatures', () => {
			it('removes the correct features', async () => {
				setup();
				const map = setupMap();
				const instanceUnderTest = new OlRoutingHandler();
				instanceUnderTest.activate(map);
				await TestUtils.timeout();
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
				setup();
				const map = setupMap();
				const instanceUnderTest = new OlRoutingHandler();
				instanceUnderTest.activate(map);
				await TestUtils.timeout();
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

		describe('_clearIntermediateInteractionFeatures', () => {
			it('removes the correct features', async () => {
				setup();
				const map = setupMap();
				const instanceUnderTest = new OlRoutingHandler();
				instanceUnderTest.activate(map);
				await TestUtils.timeout();
				const feature0 = new Feature({
					geometry: new Point([0, 0])
				});
				feature0.set(ROUTING_FEATURE_TYPE, RoutingFeatureTypes.INTERMEDIATE);
				instanceUnderTest._routeLayer.getSource().addFeature(feature0);
				instanceUnderTest._routeLayerCopy.getSource().addFeature(feature0);
				instanceUnderTest._alternativeRouteLayer.getSource().addFeature(feature0);
				instanceUnderTest._highlightLayer.getSource().addFeature(feature0);
				instanceUnderTest._interactionLayer.getSource().addFeature(feature0);

				instanceUnderTest._clearIntermediateInteractionFeatures();

				expect(instanceUnderTest._routeLayer.getSource().getFeatures()).not.toHaveSize(0);
				expect(instanceUnderTest._routeLayerCopy.getSource().getFeatures()).not.toHaveSize(0);
				expect(instanceUnderTest._alternativeRouteLayer.getSource().getFeatures()).not.toHaveSize(0);
				expect(instanceUnderTest._highlightLayer.getSource().getFeatures()).not.toHaveSize(0);
				expect(instanceUnderTest._interactionLayer.getSource().getFeatures()).toHaveSize(0);
			});
		});

		describe('_addStartInteractionFeature', () => {
			it('adds a correctly configured feature', async () => {
				setup();
				const map = setupMap();
				const instanceUnderTest = new OlRoutingHandler();
				instanceUnderTest.activate(map);
				await TestUtils.timeout();
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
				setup();
				const map = setupMap();
				const instanceUnderTest = new OlRoutingHandler();
				instanceUnderTest.activate(map);
				await TestUtils.timeout();
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
				setup();
				const map = setupMap();
				const instanceUnderTest = new OlRoutingHandler();
				instanceUnderTest.activate(map);
				await TestUtils.timeout();
				const coordinate = [21, 42];

				instanceUnderTest._addIntermediateInteractionFeature(coordinate, 42);

				const feature = instanceUnderTest._interactionLayer.getSource().getFeatures()[0];
				expect(feature.get(ROUTING_FEATURE_TYPE)).toBe(RoutingFeatureTypes.INTERMEDIATE);
				expect(feature.get(ROUTING_FEATURE_INDEX)).toBe(42);
				expect(feature.getGeometry()).toBeInstanceOf(Point);
				expect(feature.getGeometry().getFirstCoordinate()).toEqual(coordinate);
				expect(feature.getStyle()(feature)).toEqual(getRoutingStyleFunction()(feature));
			});
		});
	});
});

// describe('_appendStyle', () => {
// 	it('sets the correct style features containing a HighlightCoordinate', () => {
// 		setup();
// 		const animatedFeature = new Feature(new Point([22, 44]));
// 		const handler = new OlHighlightLayerHandler();
// 		const animatePointFeatureSyp = spyOn(handler, '_animatePointFeature');
// 		const highlightCoordinateFeature0 = { data: { coordinate: [1, 0] }, type: HighlightFeatureType.DEFAULT };
// 		const highlightCoordinateFeature1 = { data: { coordinate: [1, 0] }, type: HighlightFeatureType.TEMPORARY };
// 		const highlightCoordinateFeature2 = { data: { coordinate: [1, 0] }, type: HighlightFeatureType.QUERY_RUNNING };
// 		const highlightCoordinateFeature3 = { data: { coordinate: [1, 0] }, type: HighlightFeatureType.QUERY_SUCCESS };

// 		const styledFeature0 = handler._appendStyle(highlightCoordinateFeature0, new Feature(new Point([5, 10])));
// 		const styledFeature1 = handler._appendStyle(highlightCoordinateFeature1, new Feature(new Point([5, 10])));
// 		handler._appendStyle(highlightCoordinateFeature2, animatedFeature);
// 		const styledFeature3 = handler._appendStyle(highlightCoordinateFeature3, new Feature(new Point([5, 10])));

// 		expect(styledFeature0.getStyle()()).toEqual(highlightCoordinateFeatureStyleFunction());
// 		expect(styledFeature1.getStyle()()).toEqual(highlightTemporaryCoordinateFeatureStyleFunction());
// 		expect(animatePointFeatureSyp).toHaveBeenCalledWith(animatedFeature);
// 		expect(styledFeature3.getStyle()()).toEqual(highlightAnimatedCoordinateFeatureStyleFunction());
// 	});

// 	it('sets the correct style features containing a HighlightGeometry', () => {
// 		const olPoint = new Point([5, 10]);
// 		setup();
// 		const handler = new OlHighlightLayerHandler();
// 		const highlightGeometryGeoJsonFeature0 = {
// 			data: { geometry: new GeoJSON().writeGeometry(olPoint), geometryType: HighlightGeometryType.GEOJSON },
// 			type: HighlightFeatureType.DEFAULT
// 		};
// 		const highlightGeometryGeoJsonFeature1 = {
// 			data: { geometry: new GeoJSON().writeGeometry(olPoint), geometryType: HighlightGeometryType.GEOJSON },
// 			type: HighlightFeatureType.TEMPORARY
// 		};

// 		const styledFeature0 = handler._appendStyle(highlightGeometryGeoJsonFeature0, new Feature(olPoint));
// 		const styledFeature1 = handler._appendStyle(highlightGeometryGeoJsonFeature1, new Feature(olPoint));

// 		expect(styledFeature0.getStyle()()).toEqual(highlightGeometryFeatureStyleFunction());
// 		expect(styledFeature1.getStyle()()).toEqual(highlightTemporaryGeometryFeatureStyleFunction());
// 	});

// 	it('sets NO style when feature type is missing', () => {
// 		setup();
// 		const handler = new OlHighlightLayerHandler();
// 		const highlightCoordinateFeature0 = { data: { coordinate: [1, 0] } };

// 		const styledFeature0 = handler._appendStyle(highlightCoordinateFeature0, new Feature(new Point([5, 10])));

// 		expect(styledFeature0.getStyle()).toBeNull();
// 	});
// });
