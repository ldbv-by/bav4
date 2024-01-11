/**
 * @module modules/olMap/handler/routing/OlRoutingHandler
 */
import { $injector } from '../../../../injection';
import { OlLayerHandler } from '../OlLayerHandler';
import { PERMANENT_ROUTE_LAYER_ID, PERMANENT_WP_LAYER_ID, ROUTING_LAYER_ID } from '../../../../plugins/RoutingPlugin';
import LayerGroup from 'ol/layer/Group';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import Feature from 'ol/Feature';
import { Point } from 'ol/geom';
import Translate from 'ol/interaction/Translate.js';
import Modify from 'ol/interaction/Modify.js';
import Select from 'ol/interaction/Select.js';
import Polyline from 'ol/format/Polyline.js';
import { distance } from 'ol/coordinate';
import LineString from 'ol/geom/LineString.js';
import { getModifyInteractionStyle, getRoutingStyleFunction } from './styleUtils';
import { observe } from '../../../../utils/storeUtils';
import { PromiseQueue } from '../../../../utils/PromiseQueue';
import { LevelTypes, emitNotification } from '../../../../store/notifications/notifications.action';
import MapBrowserEventType from 'ol/MapBrowserEventType';
import { unByKey } from 'ol/Observable';
import { HelpTooltip } from '../../tooltip/HelpTooltip';
import { provide as messageProvide } from './tooltipMessage.provider';
import { setCategory, setProposal, setRouteAndStats, setWaypoints } from '../../../../store/routing/routing.action';
import { CoordinateProposalType, RouteCalculationErrors, RoutingStatusCodes } from '../../../../domain/routing';
import { fit } from '../../../../store/position/position.action';
import { updateCoordinates } from '../../../../store/elevationProfile/elevationProfile.action';
import { equals } from '../../../../../node_modules/ol/coordinate';
import { GeoJSON as GeoJSONFormat } from 'ol/format';
import { SourceType, SourceTypeName } from '../../../../domain/sourceType';
import { bvvRouteStatsProvider } from './routeStats.provider';
import { clearHighlightFeatures } from '../../../../store/highlight/highlight.action';
import { closeBottomSheet } from '../../../../store/bottomSheet/bottomSheet.action';
import { addLayer } from '../../../../store/layers/layers.action';
import { VectorGeoResource, VectorSourceType } from '../../../../domain/geoResources';
import { create as createKML } from '../../formats/kml';
import {
	getBvvAttributionForRoutingResult,
	getAttributionForLocallyImportedOrCreatedGeoResource
} from '../../../../services/provider/attribution.provider';
import { StyleTypes } from '../../services/StyleService';
import { createUniqueId } from '../../../../utils/numberUtils';

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
export const REMOVE_HIGHLIGHTED_SEGMENTS_TIMEOUT_MS = 2500;

/**
 * LayerHandler for routing specific tasks.
 * @class
 * @author taulinger
 */
export class OlRoutingHandler extends OlLayerHandler {
	constructor(routeStatsProvider = bvvRouteStatsProvider, attributionProvider = getBvvAttributionForRoutingResult) {
		super(ROUTING_LAYER_ID);
		const { StoreService, RoutingService, MapService, EnvironmentService, TranslationService, ElevationService, GeoResourceService } =
			$injector.inject(
				'StoreService',
				'RoutingService',
				'MapService',
				'EnvironmentService',
				'TranslationService',
				'ElevationService',
				'GeoResourceService'
			);
		this._storeService = StoreService;
		this._routingService = RoutingService;
		this._mapService = MapService;
		this._environmentService = EnvironmentService;
		this._translationService = TranslationService;
		this._elevationService = ElevationService;
		this._geoResourceService = GeoResourceService;
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
		this._selectInteraction = null;
		// other
		this._catId = null;
		this._currentRoutingResponse = null;
		this._promiseQueue = new PromiseQueue();
		this._registeredObservers = [];
		this._mapListeners = [];
		this._helpTooltip = new HelpTooltip();
		this._helpTooltip.messageProvideFunction = messageProvide;
		this._routeStatsProvider = routeStatsProvider;
		this._attributionProvider = attributionProvider;
	}

	/**
	 * Activates the handler.
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
		this._selectInteraction = this._createSelect(this._interactionLayer, this._alternativeRouteLayer);
		this._map.addInteraction(this._selectInteraction);

		if (!this._environmentService.isTouch()) {
			this._modifyInteraction = this._createModify(this._routeLayerCopy);
			this._map.addInteraction(this._modifyInteraction);
		}

		this._registeredObservers = this._register(this._storeService.getStore());
		this._mapListeners.push(
			olMap.on(
				MapBrowserEventType.POINTERMOVE,
				this._newPointerMoveHandler(olMap, this._interactionLayer, this._alternativeRouteLayer, this._routeLayerCopy)
			),
			olMap.on(MapBrowserEventType.CLICK, this._newClickHandler(olMap, this._interactionLayer, this._alternativeRouteLayer, this._routeLayerCopy))
		);
		return this._routingLayerGroup;
	}

	_getFeaturesAtPixelOptionsForClickHandler(interactionLayer, alternativeRouteLayer) {
		return {
			layerFilter: (layer) => [interactionLayer, alternativeRouteLayer].includes(layer),
			hitTolerance: 5
		};
	}

	_newClickHandler(map, interactionLayer, alternativeRouteLayer, routeLayerCopy) {
		return (event) => {
			const coord = map.getEventCoordinate(event.originalEvent);
			const pixel = map.getEventPixel(event.originalEvent);
			const hit = map.getFeaturesAtPixel(pixel, this._getFeaturesAtPixelOptionsForClickHandler(interactionLayer, alternativeRouteLayer));

			if (hit.length > 0) {
				const feature = hit[0];

				switch (feature.get(ROUTING_FEATURE_TYPE)) {
					case RoutingFeatureTypes.START:
					case RoutingFeatureTypes.DESTINATION: {
						setProposal(feature.getGeometry().getFirstCoordinate(), CoordinateProposalType.EXISTING_START_OR_DESTINATION);
						break;
					}
					case RoutingFeatureTypes.INTERMEDIATE: {
						setProposal(feature.getGeometry().getFirstCoordinate(), CoordinateProposalType.EXISTING_INTERMEDIATE);
						break;
					}
				}
			} else {
				if (this._getInteractionFeatures().length === 0) {
					setProposal(coord, CoordinateProposalType.START_OR_DESTINATION);
				} else if (
					this._getInteractionFeatures().length === 1 &&
					this._getInteractionFeatures()[0].get(ROUTING_FEATURE_TYPE) === RoutingFeatureTypes.START
				) {
					setProposal(coord, CoordinateProposalType.DESTINATION);
				} else if (
					this._getInteractionFeatures().length === 1 &&
					this._getInteractionFeatures()[0].get(ROUTING_FEATURE_TYPE) === RoutingFeatureTypes.DESTINATION
				) {
					setProposal(coord, CoordinateProposalType.START);
				} else if (routeLayerCopy.getSource().getFeatures().length > 0) {
					setProposal(coord, CoordinateProposalType.INTERMEDIATE);
				}
			}
		};
	}

	_getFeaturesAtPixelOptionsForPointerMove(interactionLayer, alternativeRouteLayer, routeLayerCopy) {
		return {
			layerFilter: (layer) => [interactionLayer, alternativeRouteLayer, routeLayerCopy].includes(layer),
			hitTolerance: 5
		};
	}

	_newPointerMoveHandler(map, interactionLayer, alternativeRouteLayer, routeLayerCopy) {
		const updateModifyActivity = (feature) => {
			if (feature.get(ROUTING_FEATURE_TYPE) === RoutingFeatureTypes.ROUTE_SEGMENT) {
				this._setModifyActive(true);
			} else {
				this._setModifyActive(false);
			}
		};
		const updateCursor = (feature) => {
			if (feature.get(ROUTING_FEATURE_TYPE) === RoutingFeatureTypes.ROUTE_SEGMENT) {
				map.getTarget().style.cursor = 'grab';
			} else {
				map.getTarget().style.cursor = 'pointer';
			}
		};
		return (event) => {
			this._helpTooltip.deactivate();

			if (!event?.dragging) {
				// $(element).popover('destroy');

				const pixel = map.getEventPixel(event.originalEvent);
				const hit = map.getFeaturesAtPixel(
					pixel,
					this._getFeaturesAtPixelOptionsForPointerMove(interactionLayer, alternativeRouteLayer, routeLayerCopy)
				);

				if (hit.length > 0) {
					this._helpTooltip.activate(this._map);
					const feature = hit[0];
					const interactionState = {
						coordinate: feature.getGeometry().getClosestPoint(event.coordinate),
						dragging: false,
						feature
					};
					this._helpTooltip.notify(interactionState);

					updateModifyActivity(feature);
					updateCursor(feature);
				} else {
					map.getTarget().style.cursor = '';
				}
			}
		};
	}

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
			clearHighlightFeatures();
			closeBottomSheet();
		});
		translate.on('translateend', (evt) => {
			if (!equals(startCoordinate, evt.coordinate)) {
				this._requestRouteFromInteractionLayer();
			}
		});
		return translate;
	}

	_getSelectOptions(interactionLayer, alternativeRouteLayer) {
		return {
			layers: [interactionLayer, alternativeRouteLayer],
			hitTolerance: 5
		};
	}

	_createSelect(interactionLayer, alternativeRouteLayer) {
		const select = new Select(this._getSelectOptions(interactionLayer, alternativeRouteLayer));
		select.on('select', (evt) => {
			const feature = evt.selected[0];
			const category = feature.get(ROUTING_CATEGORY);
			if (category) {
				// change to alternative route
				this._catId = category.id;
				setCategory(category.id);
				this._switchToAlternativeRoute(this._currentRoutingResponse);
			}
			this._helpTooltip.deactivate();
			select.getFeatures().clear();
		});
		return select;
	}

	_getModifyOptions(routeLayerCopy) {
		return {
			style: getModifyInteractionStyle(),
			source: routeLayerCopy.getSource(),
			pixelTolerance: 5,
			deleteCondition: () => false
		};
	}

	_createModify(routeLayerCopy) {
		const modify = new Modify(this._getModifyOptions(routeLayerCopy));

		modify.on('modifyend', (evt) => {
			if (evt.mapBrowserEvent.type === 'pointerup') {
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

	_switchToAlternativeRoute(currentRoutingResponse) {
		this._clearRouteFeatures();
		this._displayCurrentRoutingGeometry(currentRoutingResponse[this._catId]);
		this._routingService.getAlternativeCategoryIds(this._catId).forEach((catId) => {
			this._displayAlternativeRoutingGeometry(currentRoutingResponse[catId]);
		});
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
		iconFeature.setId(`${StyleTypes.ROUTING}_${createUniqueId()}`);
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
		return polylineFormat.readGeometry(polyline, { featureProjection: `EPSG:${this._mapService.getSrid()}` });
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
				// Note: we're calculating the planar distance although we are having spherical coordinates, but it should be precisely enough in this case
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

	_displayCurrentRoutingGeometry(ghRoute) {
		const polyline = ghRoute.paths[0].points;
		const geometry = this._polylineToGeometry(polyline);
		const routeFeature = new Feature({
			geometry: geometry
		});
		routeFeature.set(ROUTING_FEATURE_TYPE, RoutingFeatureTypes.ROUTE);
		routeFeature.set(ROUTING_CATEGORY, this._routingService.getCategoryById(ghRoute.vehicle));
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
			segmentFeature.set(ROUTING_CATEGORY, this._routingService.getCategoryById(ghRoute.vehicle));
			segmentFeature.set(ROUTING_SEGMENT_INDEX, i);
			segmentFeature.setStyle(getRoutingStyleFunction());
			this._routeLayerCopy.getSource().addFeature(segmentFeature);
		}

		this._updateStore(ghRoute);
	}

	_displayAlternativeRoutingGeometry(ghRoute) {
		const polyline = ghRoute.paths[0].points;
		const geometry = this._polylineToGeometry(polyline);
		const routeFeature = new Feature({
			geometry: geometry
		});
		routeFeature.set(ROUTING_FEATURE_TYPE, RoutingFeatureTypes.ROUTE_ALTERNATIVE);
		routeFeature.set(ROUTING_CATEGORY, this._routingService.getCategoryById(ghRoute.vehicle));
		routeFeature.setStyle(getRoutingStyleFunction());
		this._alternativeRouteLayer.getSource().addFeature(routeFeature);
	}

	_setInteractionsActive(active) {
		// Select interaction must be excluded from disabling/enabling
		this._selectInteraction.setActive(active);
		this._translateInteraction.setActive(active);
		this._setModifyActive(active);
		this._activeInteraction = active;
	}

	_setModifyActive(active) {
		if (this._modifyInteraction) {
			this._modifyInteraction.setActive(active);
		}
	}

	_clearRouteFeatures() {
		this._routeLayer.getSource().clear();
		this._routeLayerCopy.getSource().clear();
		this._alternativeRouteLayer.getSource().clear();
		this._highlightLayer.getSource().clear();
	}

	_clearAllFeatures() {
		this._routeLayer.getSource().clear();
		this._routeLayerCopy.getSource().clear();
		this._alternativeRouteLayer.getSource().clear();
		this._highlightLayer.getSource().clear();
		this._interactionLayer.getSource().clear();
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

	async _requestRouteFromCoordinates(coordinates3857, status) {
		this._resetStore();
		this._clearAllFeatures();
		if (coordinates3857.length > 0) {
			this._setInteractionsActive(false);
			const coords = [...coordinates3857];
			if (coordinates3857.length === 1) {
				switch (status) {
					case RoutingStatusCodes.Destination_Missing:
						this._addStartInteractionFeature(coords[0]);
						break;
					case RoutingStatusCodes.Start_Missing:
						this._addDestinationInteractionFeature(coords[0], 0);
						break;
				}
			} else {
				// add interaction features
				this._addStartInteractionFeature(coords.shift());
				this._addDestinationInteractionFeature(coords.pop(), coordinates3857.length - 1);
				coords.forEach((c, index) => {
					this._addIntermediateInteractionFeature(c, index + 1);
				});

				// request route
				const alternativeCategoryIds = this._routingService.getAlternativeCategoryIds(this._catId);
				try {
					this._currentRoutingResponse = await this._requestAndDisplayRoute(this._catId, alternativeCategoryIds, coordinates3857);
				} catch (error) {
					switch (error.cause) {
						case RouteCalculationErrors.Improper_Waypoints:
							emitNotification(`${this._translationService.translate('olMap_handler_routing_routingService_improper_waypoints')}`, LevelTypes.WARN);
							break;
						default: {
							console.error(error);
							emitNotification(`${this._translationService.translate('olMap_handler_routing_routingService_exception')}`, LevelTypes.ERROR);
						}
					}
				}
			}
			// enable interaction also if request failed
			this._setInteractionsActive(true);
		}
	}

	async _updateStore(ghRoute) {
		const geom = this._polylineToGeometry(ghRoute.paths[0].points);
		const coordinates = geom.getCoordinates();

		try {
			const { stats: profileStats } = await this._elevationService.getProfile(coordinates);
			const routeStats = this._routeStatsProvider(ghRoute, profileStats);

			const route = {
				data: new GeoJSONFormat().writeGeometry(geom.clone().transform(`EPSG:${this._mapService.getSrid()}`, 'EPSG:4326')),
				type: new SourceType(SourceTypeName.GEOJSON)
			};
			setRouteAndStats(route, routeStats);
			updateCoordinates(coordinates);
		} catch (e) {
			/**
			 * In that case we remove all route features and reset the s-o-s,
			 * because we can't give the user correct statistics without a profile result
			 */
			this._clearRouteFeatures();
			this._resetStore();
			console.error(e);
			emitNotification(`${this._translationService.translate('olMap_handler_routing_routingService_exception')}`, LevelTypes.ERROR);
		}
	}

	_resetStore() {
		setRouteAndStats(null, null);
	}

	_requestRouteFromInteractionLayer() {
		const features = this._interactionLayer.getSource().getFeatures();
		if (features.length > 1) {
			this._clearRouteFeatures();

			const coordinates3857 = this._getInteractionFeatures().map((feature) => {
				return feature.getGeometry().getCoordinates();
			});
			// update waypoints
			setWaypoints(coordinates3857);
		}
	}

	async _requestAndDisplayRoute(defaultCategoryId, alternativeCategoryIds, coordinates3857) {
		const categories = this._getIntermediateFeatures().length === 0 ? [defaultCategoryId].concat(alternativeCategoryIds) : [defaultCategoryId];

		const routingResult = await this._routingService.calculateRoute(categories, coordinates3857);

		this._displayCurrentRoutingGeometry(routingResult[defaultCategoryId]);

		if (this._getIntermediateFeatures().length === 0) {
			alternativeCategoryIds.forEach((id) => {
				this._displayAlternativeRoutingGeometry(routingResult[id]);
			});
		}

		return routingResult;
	}

	_highlightSegments(highlightedSegments, highlightLayer, routeLayer) {
		clearTimeout(this._highlightSegmentsTimeoutId);
		highlightLayer.getSource().clear();

		if (highlightedSegments) {
			const { segments, zoomToExtent } = highlightedSegments;

			const clearHighlightLayerWithDelay = () => {
				this._highlightSegmentsTimeoutId = setTimeout(() => {
					highlightLayer.getSource().clear();
				}, REMOVE_HIGHLIGHTED_SEGMENTS_TIMEOUT_MS);
			};

			const routeFeatureCoordinates = routeLayer
				.getSource()
				.getFeatures()
				.find((f) => f.get(ROUTING_FEATURE_TYPE) && f.get(ROUTING_FEATURE_TYPE) === RoutingFeatureTypes.ROUTE)
				.getGeometry()
				.getCoordinates();
			const highlightFeatures = segments.map((s) => {
				const feature = new Feature(new LineString(routeFeatureCoordinates.slice(s[0], s[1] + 1)));
				feature.set(ROUTING_FEATURE_TYPE, RoutingFeatureTypes.ROUTE_HIGHLIGHT);
				feature.setStyle(getRoutingStyleFunction());
				return feature;
			});

			highlightLayer.getSource().addFeatures(highlightFeatures);

			if (zoomToExtent) {
				fit(highlightLayer.getSource().getExtent());
				clearHighlightLayerWithDelay();
			} else if (this._environmentService.isTouch()) {
				clearHighlightLayerWithDelay();
			}
		}
	}

	_addIntermediate(intermediateCoord3857, routeLayerCopy) {
		const coordinates3857 = this._getInteractionFeatures().map((feature) => {
			return feature.getGeometry().getCoordinates();
		});

		const routelayerCopyFeatures = routeLayerCopy.getSource().getFeatures();
		if (routelayerCopyFeatures.length > 0) {
			// find the closest segment
			const closestSegmentFeature = routelayerCopyFeatures.reduce((acc, curr) => {
				const closestCurr = curr.getGeometry().getClosestPoint(intermediateCoord3857);
				const closestAcc = acc.getGeometry().getClosestPoint(intermediateCoord3857);
				// planar distance! -> must be adapted when changed to 3857
				const dCurr = distance(closestCurr, intermediateCoord3857);
				const dAcc = distance(closestAcc, intermediateCoord3857);
				return dCurr < dAcc ? curr : acc;
			});

			const segmentIndex = closestSegmentFeature.get(ROUTING_SEGMENT_INDEX);

			coordinates3857.splice(segmentIndex + 1, 0, intermediateCoord3857);
		}
		return coordinates3857;
	}

	_register(store) {
		const updateCategoryAndRequestRoute = (coordinates3857, catId, status) => {
			// let's ensure each request is executed one after each other
			this._promiseQueue.add(async () => {
				this._catId = catId;
				await this._requestRouteFromCoordinates([...coordinates3857.map((c) => [...c])], status);
			});
		};
		const addIntermediatePointAndRequestRoute = (coordinate3857) => {
			setWaypoints([...this._addIntermediate(coordinate3857, this._routeLayerCopy).map((c) => [...c])]);
		};
		return [
			observe(
				store,
				(state) => state.routing.waypoints,
				(waypoints, state) => updateCategoryAndRequestRoute(waypoints, state.routing.categoryId, state.routing.status),
				false
			),
			observe(
				store,
				(state) => state.routing.categoryId,
				(categoryId, state) => updateCategoryAndRequestRoute(state.routing.waypoints, categoryId, state.routing.status)
			),
			observe(
				store,
				(state) => state.routing.highlightedSegments,
				(highlightedSegments) => this._highlightSegments(highlightedSegments.payload, this._highlightLayer, this._routeLayer)
			),
			observe(
				store,
				(state) => state.routing.intermediate,
				(intermediate) => addIntermediatePointAndRequestRoute([...intermediate.payload])
			)
		];
	}

	/**
	 *  @override
	 */
	onDeactivate() {
		this._convertToPermanentLayer();
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
		this._selectInteraction = null;
		this._catId = null;
		this._currentRoutingResponse = null;
		this._unsubscribe(this._registeredObservers);
		this._unregisterMapListener(this._mapListeners);
		this._helpTooltip.deactivate();
	}
	_unsubscribe(observers) {
		observers.forEach((unsubscribe) => unsubscribe());
		observers.splice(0, observers.length);
	}

	_unregisterMapListener(listeners) {
		listeners.forEach((listener) => unByKey(listener));
		listeners.splice(0, listeners.length);
	}

	_convertToPermanentLayer() {
		if (this._routeLayerCopy.getSource().getFeatures().length > 0) {
			const labelRtLayer = this._translationService.translate('olMap_handler_routing_rt_layer_label');
			const labelWpLayer = this._translationService.translate('olMap_handler_routing_wp_layer_label');

			const routeKML = createKML(this._routeLayerCopy, `EPSG:${this._mapService.getSrid()}`);
			const interactionKML = createKML(this._interactionLayer, `EPSG:${this._mapService.getSrid()}`);

			const getOrCreateVectorGeoResource = (id, label) => {
				const fromService = this._geoResourceService.byId(id);
				return fromService ? fromService : new VectorGeoResource(id, label, VectorSourceType.KML);
			};
			const vgrRoute = getOrCreateVectorGeoResource(PERMANENT_ROUTE_LAYER_ID, labelRtLayer)
				.setSource(routeKML, 4326)
				.setHidden(true)
				.setAttributionProvider(this._attributionProvider);
			const vgrInteraction = getOrCreateVectorGeoResource(PERMANENT_WP_LAYER_ID, labelWpLayer)
				.setSource(interactionKML, 4326)
				.setHidden(true)
				.setAttributionProvider(getAttributionForLocallyImportedOrCreatedGeoResource);

			this._geoResourceService.addOrReplace(vgrRoute);
			this._geoResourceService.addOrReplace(vgrInteraction);
			addLayer(PERMANENT_ROUTE_LAYER_ID, { constraints: { metaData: false } });
			addLayer(PERMANENT_WP_LAYER_ID, { constraints: { metaData: false } });
		}
	}
}
