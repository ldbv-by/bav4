/**
 * @module modules/olMap/handler/routing/OlRoutingHandler
 */
import { $injector } from '../../../../injection';
import { OlLayerHandler } from '../OlLayerHandler';
import { ROUTING_LAYER_ID } from '../../../../plugins/RoutingPlugin';
import LayerGroup from 'ol/layer/Group';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import Feature from 'ol/Feature';
import { Point } from 'ol/geom';
import Translate from 'ol/interaction/Translate.js';
import Modify from 'ol/interaction/Modify.js';
import Polyline from 'ol/format/Polyline.js';
import { distance } from 'ol/coordinate';
import LineString from 'ol/geom/LineString.js';
import { getModifyInteractionStyle, getRoutingStyleFunction } from './styleUtils';
import { observe } from '../../../../utils/storeUtils';
import { PromiseQueue } from '../../../../utils/PromiseQueue';
import { LevelTypes, emitNotification } from '../../../../store/notifications/notifications.action';
import MapBrowserEventType from 'ol/MapBrowserEventType';
import { unByKey } from 'ol/Observable';

export const RoutingFeatureTypes = Object.freeze({
	START: 'start',
	DESTINATION: 'destination',
	INTERMEDIATE: 'intermediate',
	ROUTE: 'route',
	ROUTE_ALTERNATIVE: 'route_alternative',
	ROUTE_SEGMENT: 'route_segment',
	ROUTE_HIGHLIGHT: 'route_highlight',
	ROUTE_COPY: 'route_copy'
});
export const RoutingLayerIds = Object.freeze({
	ROUTE_ALTERNATIVE: 'rt_alternativeRouteLayer',
	ROUTE: 'rt_routeLayer',
	ROUTE_COPY: 'rt_routeCopyLayer',
	INTERACTION: 'rt_interactionLayer',
	HIGHLIGHT: 'rt_highlightLayer'
});
export const ROUTING_CATEGORY = 'Routing_Cat';
export const ROUTING_FEATURE_TYPE = 'Routing_Feature_Type';
export const ROUTING_FEATURE_INDEX = 'Routing_Feature_Index';
export const ROUTING_SEGMENT_INDEX = 'Routing_Segment_Index';

/**
 * LayerHandler for routing specific tasks.
 * @class
 * @author taulinger
 */
export class OlRoutingHandler extends OlLayerHandler {
	constructor() {
		super(ROUTING_LAYER_ID);
		const { StoreService, RoutingService, MapService, EnvironmentService, TranslationService } = $injector.inject(
			'StoreService',
			'RoutingService',
			'MapService',
			'EnvironmentService',
			'TranslationService'
		);
		this._storeService = StoreService;
		this._routingService = RoutingService;
		this._mapService = MapService;
		this._environmentService = EnvironmentService;
		this._translationService = TranslationService;
		// map
		this._map = null;
		//layer
		this._routingLayerGroup = null;
		this._alternativeRouteLayer = null;
		this._routeLayer = null;
		this._routeLayerCopy = null;
		this._highlightLayer = null;
		this._interactionLayer = null;
		this._activeInteraction = false;
		// interactions
		this._modifyInteraction = null;
		this._translateInteraction = null;
		// other
		this._catId = null;
		this._promiseQueue = new PromiseQueue();
		this._registeredObservers = [];
		this._mapListeners = [];
	}

	/**
	 * Activates the Handler.
	 * @override
	 */
	onActivate(olMap) {
		this._map = olMap;

		this._alternativeRouteLayer = this._createLayer(RoutingLayerIds.ROUTE_ALTERNATIVE);
		this._routeLayer = this._createLayer(RoutingLayerIds.ROUTE);
		this._routeLayerCopy = this._createLayer(RoutingLayerIds.ROUTE_COPY);
		this._highlightLayer = this._createLayer(RoutingLayerIds.HIGHLIGHT);
		this._interactionLayer = this._createLayer(RoutingLayerIds.INTERACTION);

		this._routingLayerGroup = new LayerGroup({
			layers: [this._alternativeRouteLayer, this._routeLayer, this._routeLayerCopy, this._highlightLayer, this._interactionLayer]
		});

		this._translateInteraction = this._createTranslate(this._interactionLayer);
		this._map.addInteraction(this._translateInteraction);

		if (!this._environmentService.isTouch()) {
			this._modifyInteraction = this._createModify();
			this._map.addInteraction(this._modifyInteraction);
		}

		this._registeredObservers = this._register(this._storeService.getStore());
		this._mapListeners.push(
			olMap.on(
				MapBrowserEventType.POINTERMOVE,
				this._newPointerMoveHandler(olMap, this._interactionLayer, this._alternativeRouteLayer, this._routeLayerCopy)
			)
		);
		return this._routingLayerGroup;
	}

	_newPointerMoveHandler(map, interactionLayer, alternativeRouteLayer, routeLayerCopy) {
		return (event) => {
			if (!event?.dragging) {
				// $(element).popover('destroy');

				const pixel = map.getEventPixel(event.originalEvent);
				const hit = map.getFeaturesAtPixel(pixel, {
					layerFilter: (layer) => [interactionLayer, alternativeRouteLayer, routeLayerCopy].includes(layer),
					hitTolerance: 5
				});

				const handleFeature = (feature) => {
					switch (feature.get(ROUTING_FEATURE_TYPE)) {
						case RoutingFeatureTypes.ROUTE_ALTERNATIVE: {
							const cat = hit[0].get(ROUTING_CATEGORY);
							return "Klicken, um alternative Route '" + cat.description + "' zu wählen";
						}
						case RoutingFeatureTypes.ROUTE_SEGMENT: {
							this._setModifyActive(true);
							return 'Zum Ändern der Route ziehen';
						}
						case RoutingFeatureTypes.START: {
							this._setModifyActive(false);
							return 'Zum Ändern des Startpunktes ziehen';
						}
						case RoutingFeatureTypes.DESTINATION: {
							this._setModifyActive(false);
							return 'Zum Ändern des Zielpunktes ziehen';
						}
						case RoutingFeatureTypes.INTERMEDIATE: {
							this._setModifyActive(false);
							return 'Zum Ändern des Zwischenpunktes ziehen';
						}
						default:
							this._setModifyActive(false);
					}
				};

				if (hit.length > 0) {
					map.getTarget().style.cursor = 'pointer';
					const text = handleFeature(hit[0]);
					if (text) {
						this._updateHelpTooltip(text, event.coordinate);
						return;
					}
				}

				this._hideHelpTooltip();
			}
		};
	}

	_updateHelpTooltip(text) {
		// eslint-disable-next-line no-console
		console.debug(text);
	}
	_hideHelpTooltip() {}

	_createLayer(id) {
		return new VectorLayer({
			source: new VectorSource(),
			properties: { id: id }
		});
	}

	_createTranslate(interactionLayer) {
		let startCoordinate;
		const translate = new Translate({
			layers: [interactionLayer],
			pixelTolerance: 50
		});
		translate.on('translatestart', (evt) => {
			startCoordinate = evt.coordinate;
		});
		translate.on('translating', () => {
			// this._map.getTarget().classList.add('grabbing');
			// managePopup();
		});
		translate.on('translateend', (evt) => {
			// this._map.getTarget().classList.remove('grabbing');
			if (evt.coordinate[0] !== startCoordinate[0] || evt.coordinate[1] !== startCoordinate[1]) {
				this._requestRouteFromInteractionLayer();
			}
		});
		return translate;
	}

	_createModify() {
		const modify = new Modify({
			style: getModifyInteractionStyle(),
			source: this._routeLayerCopy.getSource(),
			pixelTolerance: 5,
			deleteCondition: () => false
		});
		modify.on('modifystart', (evt) => {
			if (evt.mapBrowserEvent.type !== 'singleclick') {
				// this._map.getTarget().classList.add('grabbing');
				// managePopup();
			}
		});
		modify.on('modifyend', (evt) => {
			if (evt.mapBrowserEvent.type === 'pointerup') {
				// this._map.getTarget().classList.remove('grabbing');

				// find the feature which was modified
				// be careful with the revision number -> setting the style or properties on a feature also increments it
				// in our case, the modified feature is the feature which holds the highest revision number
				const modifiedSegmentFeature = evt.features.getArray().reduce((acc, curr) => {
					return acc.getRevision() >= curr.getRevision() ? acc : curr;
				});
				const segmentIndex = modifiedSegmentFeature.get(ROUTING_SEGMENT_INDEX);
				this._incrementIndex(segmentIndex + 1);
				this._addIntermediateInteractionFeature(evt.mapBrowserEvent.coordinate, segmentIndex + 1);

				this._requestRouteFromInteractionLayer();
			}
		});
		return modify;
	}

	_incrementIndex(startIndex) {
		const features = this._getInteractionFeatures();
		for (let i = startIndex; i < features.length; i++) {
			features[i].set(ROUTING_FEATURE_INDEX, features[i].get(ROUTING_FEATURE_INDEX) + 1);
		}
	}

	_addIntermediateInteractionFeature(coordinate, index) {
		const iconFeature = new Feature({
			geometry: new Point(coordinate)
		});
		iconFeature.set(ROUTING_FEATURE_TYPE, RoutingFeatureTypes.INTERMEDIATE);

		iconFeature.set(ROUTING_FEATURE_INDEX, index);
		iconFeature.setStyle(getRoutingStyleFunction());

		this._interactionLayer.getSource().addFeature(iconFeature);
	}

	_getInteractionFeatures(optionalRoutingFeatureType) {
		return this._interactionLayer
			.getSource()
			.getFeatures()
			.sort((f0, f1) => {
				return f0.get(ROUTING_FEATURE_INDEX) - f1.get(ROUTING_FEATURE_INDEX);
			})
			.filter((f) => {
				if (optionalRoutingFeatureType) {
					return f.get(ROUTING_FEATURE_TYPE) === optionalRoutingFeatureType;
				}
				return true;
			});
	}

	_getIntermediateFeatures() {
		return this._getInteractionFeatures().filter((f) => {
			return f.get(ROUTING_FEATURE_TYPE) === RoutingFeatureTypes.INTERMEDIATE;
		});
	}

	_polylineToGeometry(polyline) {
		const polylineFormat = new Polyline();
		return polylineFormat.readGeometry(polyline, { featureProjection: 'EPSG:' + this._mapService.getSrid() });
	}

	/**
	 *
	 * @param {object} routeGeometry
	 * @returns features
	 */
	_splitRouteByIntermediatePoints(routeGeometry) {
		const determineClosestCoordinate = (coords, closest) => {
			let dist = Number.MAX_VALUE;
			let index = -1;
			for (let i = 0; i < coords.length; i++) {
				// Note: we're calculating the planar distance although we are having coordinates, but it should be precisely enough in this case
				const d = distance(coords[i], closest);
				if (d < dist) {
					dist = d;
					index = i;
				}
			}
			return index;
		};

		const segments = [];
		const intermediatePoints = this._getIntermediateFeatures();

		if (intermediatePoints.length > 0) {
			const routeCoordinates = routeGeometry.getCoordinates();
			let startIndex = 0;

			for (let i = 0; i <= intermediatePoints.length; i++) {
				let endIndex;
				if (i < intermediatePoints.length) {
					endIndex = determineClosestCoordinate(routeGeometry.getCoordinates(), intermediatePoints[i].getGeometry().getFirstCoordinate());
				} else {
					endIndex = routeCoordinates.length - 1;
				}
				const segmentCoordinates = routeCoordinates.slice(startIndex, endIndex + 1);

				const segment = new LineString(segmentCoordinates);
				segments.push(segment);
				startIndex = endIndex;
			}
		} else {
			segments.push(routeGeometry);
		}
		return segments;
	}

	_displayCurrentRoutingGeometry(categoryResponse) {
		const polyline = categoryResponse.paths[0].points;
		const geometry = this._polylineToGeometry(polyline);
		const routeFeature = new Feature({
			geometry: geometry
		});
		routeFeature.set(ROUTING_FEATURE_TYPE, RoutingFeatureTypes.ROUTE);
		routeFeature.set(ROUTING_CATEGORY, this._routingService.getCategoryById(categoryResponse.vehicle));
		routeFeature.setStyle(getRoutingStyleFunction());
		this._routeLayer.getSource().addFeature(routeFeature);

		// copy route for modify interaction / split copy route into segments so we know which segment is modified later
		const routeGeometryCopy = this._polylineToGeometry(polyline);
		const segments = this._splitRouteByIntermediatePoints(routeGeometryCopy);
		for (let i = 0; i < segments.length; i++) {
			const segmentFeature = new Feature({
				geometry: segments[i]
			});

			segmentFeature.set(ROUTING_FEATURE_TYPE, RoutingFeatureTypes.ROUTE_SEGMENT);
			segmentFeature.set(ROUTING_CATEGORY, this._routingService.getCategoryById(categoryResponse.vehicle));
			segmentFeature.set(ROUTING_SEGMENT_INDEX, i);
			segmentFeature.setStyle(getRoutingStyleFunction());
			this._routeLayerCopy.getSource().addFeature(segmentFeature);
		}

		// TODO: Calculate and publish stats and route
		// publish route object
		// const gpx = new GPX().writeFeatures([this._polylineTo4326Feature(polyline)]);
		// const index = this._getInteractionFeatures(interactionLayer).map(function (feature) {
		// 	return feature.getGeometry().getCoordinates();
		// });

		// const route = {
		// 	gpx: gpx,
		// 	index: index
		// };
		// // window.postMessage({ type: 'ROUTING_STATE_CHANGED', payload: { route: route } }, '*');
		// const graphopperStats = {};
		// // update graphhopper stats
		// graphopperStats.time = categoryResponse.paths[0].time;

		// const surfaceDetails = baRouting.aggregateDetailData(categoryResponse.paths[0].details.surface, geometry.getCoordinates());
		// // var roadClassDetails = baRouting.aggregateDetailData(categoryResponse.paths[0].details.road_class, geometry.getCoordinates());
		// const mergedRoadClassTrackTypeRawData = baRouting.mergeRoadClassAndTrackTypeData(
		// 	categoryResponse.paths[0].details.road_class,
		// 	categoryResponse.paths[0].details.track_type
		// );
		// const roadClassTrackTypeDetails = baRouting.aggregateDetailData(mergedRoadClassTrackTypeRawData, geometry.getCoordinates());
		// graphopperStats.details = {
		// 	surface: surfaceDetails,
		// 	road_class: roadClassTrackTypeDetails
		// };

		// graphopperStats.warnings = baRouting.createRouteWarnings(
		// 	categoryResponse.vehicle,
		// 	mergedRoadClassTrackTypeRawData,
		// 	categoryResponse.paths[0].details.surface
		// );

		// // show/update profile
		// $rootScope.$broadcast('gaProfileActive', routeFeature, undefined, undefined, false);
	}

	_displayAlternativeRoutingGeometry(categoryResponse) {
		const polyline = categoryResponse.paths[0].points;
		const geometry = this._polylineToGeometry(polyline);
		const routeFeature = new Feature({
			geometry: geometry
		});
		routeFeature.set(ROUTING_FEATURE_TYPE, RoutingFeatureTypes.ROUTE_ALTERNATIVE);
		routeFeature.set(ROUTING_CATEGORY, this._routingService.getCategoryById(categoryResponse.vehicle));
		routeFeature.setStyle(getRoutingStyleFunction());
		this._alternativeRouteLayer.getSource().addFeature(routeFeature);
	}

	_setInteractionsActive(active) {
		// Select interaction must be excluded from disabling/enabling
		// select.setActive(active);
		this._translateInteraction.setActive(active);
		this._setModifyActive(active);
		this._activeInteraction = active;
	}

	_setModifyActive(active) {
		this._modifyInteraction.setActive(active);
	}

	_clearRouteFeatures() {
		this._routeLayer.getSource().clear();
		this._routeLayerCopy.getSource().clear();
		this._alternativeRouteLayer.getSource().clear();
		this._highlightLayer.getSource().clear();
		// Reset gpx in vuex-store
		// window.postMessage({ type: 'ROUTING_STATE_CHANGED', payload: {gpx: 'undefined'} }, '*');
	}

	_clearAllFeatures() {
		this._routeLayer.getSource().clear();
		this._routeLayerCopy.getSource().clear();
		this._alternativeRouteLayer.getSource().clear();
		this._highlightLayer.getSource().clear();
		this._interactionLayer.getSource().clear();
	}

	_clearIntermediateInteractionFeatures() {
		this._getIntermediateFeatures().forEach((f) => {
			this._interactionLayer.getSource().removeFeature(f);
		});
	}

	_addStartInteractionFeature(coordinate3857) {
		const iconFeature = new Feature({
			geometry: new Point(coordinate3857)
		});
		iconFeature.setStyle(getRoutingStyleFunction());
		iconFeature.set(ROUTING_FEATURE_TYPE, RoutingFeatureTypes.START);
		iconFeature.set(ROUTING_FEATURE_INDEX, 0);

		this._interactionLayer.getSource().addFeature(iconFeature);
	}

	_addDestinationInteractionFeature(coordinate3857, index = 1) {
		const iconFeature = new Feature({
			geometry: new Point(coordinate3857)
		});

		iconFeature.set(ROUTING_FEATURE_TYPE, RoutingFeatureTypes.DESTINATION);
		iconFeature.set(ROUTING_FEATURE_INDEX, index);
		iconFeature.setStyle(getRoutingStyleFunction());

		this._interactionLayer.getSource().addFeature(iconFeature);
	}

	async _requestRouteFromCoordinates(coordinates3857) {
		if (coordinates3857.length > 1) {
			this._setInteractionsActive(false);
			this._clearAllFeatures();

			// add interaction features
			const coords = [...coordinates3857];
			this._addStartInteractionFeature(coords.shift());
			this._addDestinationInteractionFeature(coords.pop(), coordinates3857.length - 1);
			coords.forEach((c, index) => {
				this._addIntermediateInteractionFeature(c, index + 1);
			});

			// request route
			const alternativeCategoryIds = this._routingService.getAlternativeCategoryIds(this._catId);
			await this._requestRoute(this._catId, alternativeCategoryIds, coordinates3857);
		}
	}

	async _requestRouteFromInteractionLayer() {
		const features = this._interactionLayer.getSource().getFeatures();
		if (features.length > 1) {
			this._setInteractionsActive(false);
			this._clearRouteFeatures();

			const coordinates3857 = this._getInteractionFeatures().map((feature) => {
				return feature.getGeometry().getCoordinates();
			});

			const alternativeCategoryIds = this._routingService.getAlternativeCategoryIds(this._catId);

			await this._requestRoute(this._catId, alternativeCategoryIds, coordinates3857);
		}
	}

	async _requestRoute(defaultCategoryId, alternativeCategoryIds, coordinates3857) {
		const categories = this._getIntermediateFeatures().length === 0 ? [defaultCategoryId].concat(alternativeCategoryIds) : [defaultCategoryId];

		try {
			const routingResult = await this._routingService.calculate(categories, coordinates3857);

			this._displayCurrentRoutingGeometry(routingResult[defaultCategoryId]);

			if (this._getIntermediateFeatures().length === 0) {
				alternativeCategoryIds.forEach((id) => {
					this._displayAlternativeRoutingGeometry(routingResult[id]);
				});
			}

			this._setInteractionsActive(true);
			return routingResult;
		} catch (error) {
			console.error(error);
			// enable interaction also if request failed
			this._setInteractionsActive(true);
			emitNotification(`${this._translationService.translate('global_routingService_exception')}`, LevelTypes.ERROR);
			throw error;
		}
	}

	_register(store) {
		const updateCategoryAndRequestRoute = (coordinates3857, catId) => {
			// let's ensure each request is executed one after each other
			this._promiseQueue.add(async () => {
				this._catId = catId;
				await this._requestRouteFromCoordinates(coordinates3857);
			});
		};
		return [
			observe(
				store,
				(state) => state.routing.waypoints,
				(waypoints, state) => updateCategoryAndRequestRoute(waypoints, state.routing.categoryId),
				false
			),
			observe(
				store,
				(state) => state.routing.categoryId,
				(categoryId, state) => updateCategoryAndRequestRoute(state.routing.waypoints, categoryId)
			)
		];
	}

	/**
	 *  @override
	 */
	onDeactivate() {
		this._map = null;
		this._routingLayerGroup = null;
		this._alternativeRouteLayer = null;
		this._routeLayer = null;
		this._routeLayerCopy = null;
		this._highlightLayer = null;
		this._interactionLayer = null;
		this._activeInteraction = false;
		this._modifyInteraction = null;
		this._translateInteraction = null;
		this._catId = null;
		this._unsubscribe(this._registeredObservers);
		this._unregisterMapListener(this._mapListeners);
	}
	_unsubscribe(observers) {
		observers.forEach((unsubscribe) => unsubscribe());
		observers.splice(0, observe.length);
	}

	_unregisterMapListener(listeners) {
		listeners.forEach((listener) => unByKey(listener));
		listeners.splice(0, observe.length);
	}
}
