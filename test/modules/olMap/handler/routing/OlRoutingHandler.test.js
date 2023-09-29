import { TestUtils } from '../../../../test-utils';
import { routingReducer, initialState as initialRoutingSoS } from '../../../../../src/store/routing/routing.reducer';
import Map from 'ol/Map';
import { fromLonLat } from 'ol/proj';
import View from 'ol/View';
import {
	OlRoutingHandler,
	ROUTING_CATEGORY,
	ROUTING_FEATURE_INDEX,
	ROUTING_FEATURE_TYPE,
	RoutingFeatureTypes,
	RoutingLayerIds
} from '../../../../../src/modules/olMap/handler/routing/OlRoutingHandler';
import { $injector } from '../../../../../src/injection';
import { PromiseQueue } from '../../../../../src/utils/PromiseQueue';
import { Vector } from 'ol/layer';
import { Modify, Translate } from 'ol/interaction';

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
	});
});

describe('OlRoutingHandler', () => {
	const initialCenter = fromLonLat([11.57245, 48.14021]);

	const routingServiceMock = {};
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
		const store = TestUtils.setupStoreAndDi(initialState, { routing: routingReducer });

		$injector
			.registerSingleton('RoutingService', routingServiceMock)
			.registerSingleton('MapService', mapServiceMock)
			.registerSingleton('EnvironmentService', environmentServiceMock);

		return store;
	};

	const setupMap = () => {
		const container = document.createElement('div');
		return new Map({
			layers: [],
			target: container,
			view: new View({
				center: initialCenter,
				zoom: 1
			})
		});
	};

	it('instantiates the handler', () => {
		setup();
		const handler = new OlRoutingHandler();

		expect(handler.id).toBe('routing_layer');
		expect(handler._storeService.getStore()).toBeDefined();
		expect(handler._routingService).toBeDefined();
		expect(handler._mapService).toBeDefined();
		expect(handler._environmentService).toBeDefined();

		expect(handler._map).toBeNull();
		expect(handler._routingLayerGroup).toBeNull();
		expect(handler._alternativeRouteLayer).toBeNull();
		expect(handler._routeLayer).toBeNull();
		expect(handler._routeLayerCopy).toBeNull();
		expect(handler._highlightLayer).toBeNull();
		expect(handler._interactionLayer).toBeNull();

		expect(handler._modifyInteraction).toBeNull();
		expect(handler._translateInteraction).toBeNull();

		expect(handler._registeredObservers).toEqual([]);
		expect(handler._activeInteraction).toBeFalse();
		expect(handler._defaultCategoryId).toBeNull();
		expect(handler._promiseQueue).toBeInstanceOf(PromiseQueue);
	});

	describe('when handler is activated', () => {
		describe('in a non-touch environment', () => {
			it('fully initializes the handler', () => {
				const map = setupMap();
				setup();
				const handler = new OlRoutingHandler();
				spyOn(environmentServiceMock, 'isTouch').and.returnValue(false);

				const olLayer = handler.activate(map);

				expect(handler._map).toEqual(map);
				// layer
				expect(handler._routingLayerGroup).toEqual(olLayer);
				expect(handler._alternativeRouteLayer).toBeInstanceOf(Vector);
				expect(handler._alternativeRouteLayer.get('id')).toBe(RoutingLayerIds.ROUTE_ALTERNATIVE);
				expect(handler._routeLayer).toBeInstanceOf(Vector);
				expect(handler._routeLayer.get('id')).toBe(RoutingLayerIds.ROUTE);
				expect(handler._routeLayerCopy).toBeInstanceOf(Vector);
				expect(handler._routeLayerCopy.get('id')).toBe(RoutingLayerIds.ROUTE_COPY);
				expect(handler._highlightLayer).toBeInstanceOf(Vector);
				expect(handler._highlightLayer.get('id')).toBe(RoutingLayerIds.HIGHLIGHT);
				expect(handler._interactionLayer).toBeInstanceOf(Vector);
				expect(handler._interactionLayer.get('id')).toBe(RoutingLayerIds.INTERACTION);
				expect(olLayer.getLayers().getArray()).toEqual([
					handler._alternativeRouteLayer,
					handler._routeLayer,
					handler._routeLayerCopy,
					handler._highlightLayer,
					handler._interactionLayer
				]);
				// interactions
				expect(handler._translateInteraction).toBeInstanceOf(Translate);
				expect(handler._map.getInteractions().getArray()).toContain(handler._translateInteraction);
				expect(handler._modifyInteraction).toBeInstanceOf(Modify);
				expect(handler._map.getInteractions().getArray()).toContain(handler._modifyInteraction);

				expect(handler._registeredObservers).toHaveSize(2);
			});
		});

		describe('in a touch environment', () => {
			it('fully initializes the handler', () => {
				const map = setupMap();
				setup();
				const handler = new OlRoutingHandler();
				spyOn(environmentServiceMock, 'isTouch').and.returnValue(true);

				const olLayer = handler.activate(map);

				expect(handler._map).toEqual(map);
				// layer
				expect(handler._routingLayerGroup).toEqual(olLayer);
				expect(handler._alternativeRouteLayer).toBeInstanceOf(Vector);
				expect(handler._alternativeRouteLayer.get('id')).toBe(RoutingLayerIds.ROUTE_ALTERNATIVE);
				expect(handler._routeLayer).toBeInstanceOf(Vector);
				expect(handler._routeLayer.get('id')).toBe(RoutingLayerIds.ROUTE);
				expect(handler._routeLayerCopy).toBeInstanceOf(Vector);
				expect(handler._routeLayerCopy.get('id')).toBe(RoutingLayerIds.ROUTE_COPY);
				expect(handler._highlightLayer).toBeInstanceOf(Vector);
				expect(handler._highlightLayer.get('id')).toBe(RoutingLayerIds.HIGHLIGHT);
				expect(handler._interactionLayer).toBeInstanceOf(Vector);
				expect(handler._interactionLayer.get('id')).toBe(RoutingLayerIds.INTERACTION);
				expect(olLayer.getLayers().getArray()).toEqual([
					handler._alternativeRouteLayer,
					handler._routeLayer,
					handler._routeLayerCopy,
					handler._highlightLayer,
					handler._interactionLayer
				]);
				// interactions
				expect(handler._translateInteraction).toBeInstanceOf(Translate);
				expect(handler._map.getInteractions().getArray()).toContain(handler._translateInteraction);
				expect(handler._modifyInteraction).toBeNull();
				expect(handler._map.getInteractions().getArray()).not.toContain(handler._modifyInteraction);

				expect(handler._registeredObservers).toHaveSize(2);
			});
		});

		// describe('and NO highlight features are available', () => {
		// 	it('adds NO ol features', () => {
		// 		const map = setupMap();
		// 		setup();
		// 		const handler = new OlHighlightLayerHandler();

		// 		const olLayer = handler.activate(map);

		// 		const olFeatures = olLayer.getSource().getFeatures();
		// 		expect(olFeatures).toHaveSize(0);
		// 	});
		// });

		// describe('and highlight features are available', () => {
		// 	it('adds ol features', () => {
		// 		const highlightFeatures = [
		// 			{ type: HighlightFeatureType.DEFAULT, data: { coordinate: [1, 0] } },
		// 			{ type: HighlightFeatureType.DEFAULT, data: { coordinate: [2, 1] } }
		// 		];
		// 		const temporaryFeatures = [{ type: HighlightFeatureType.TEMPORARY, data: { coordinate: [3, 4] } }];
		// 		const animatedFeatures = [{ type: HighlightFeatureType.QUERY_RUNNING, data: { coordinate: [5, 55] } }];
		// 		const state = { ...initialState, active: true, features: [...highlightFeatures, ...temporaryFeatures, ...animatedFeatures] };
		// 		const map = setupMap();
		// 		setup(state);
		// 		const handler = new OlHighlightLayerHandler();

		// 		const olLayer = handler.activate(map);

		// 		const olFeatures = olLayer.getSource().getFeatures();
		// 		expect(olFeatures).toHaveSize(4);
		// 		expect(handler._animationListenerKeys).toHaveSize(1);
		// 	});
		// });
	});

	describe('when handler is deactivated', () => {
		it('updates olLayer and olMap fields', () => {
			const map = setupMap();
			setup();
			const handler = new OlRoutingHandler();
			spyOn(environmentServiceMock, 'isTouch').and.returnValue(false);
			handler.activate(map);

			handler.deactivate(map);

			expect(handler._map).toBeNull();

			expect(handler._routingLayerGroup).toBeNull();
			expect(handler._alternativeRouteLayer).toBeNull();
			expect(handler._routeLayer).toBeNull();
			expect(handler._routeLayerCopy).toBeNull();
			expect(handler._highlightLayer).toBeNull();
			expect(handler._interactionLayer).toBeNull();
			expect(handler._activeInteraction).toBeFalse();

			expect(handler._modifyInteraction).toBeNull();
			expect(handler._translateInteraction).toBeNull();

			expect(handler._defaultCategoryId).toBeNull();
			expect(handler._promiseQueue).toBeInstanceOf(PromiseQueue);
			expect(handler._registeredObservers).toEqual([]);
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
});
