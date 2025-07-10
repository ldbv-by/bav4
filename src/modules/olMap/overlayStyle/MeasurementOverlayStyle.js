/**
 * @module modules/olMap/overlayStyle/MeasurementOverlayStyle
 */
import { $injector } from '../../../injection';
import { OverlayStyle } from './OverlayStyle';
import { BaOverlayTypes } from '../components/BaOverlay';
import { getAzimuth, PROJECTED_LENGTH_GEOMETRY_PROPERTY, getLineString, getPartitionDelta } from '../utils/olGeometryUtils';
import Overlay from 'ol/Overlay';
import { LineString, Polygon } from 'ol/geom';
import MapBrowserEventType from 'ol/MapBrowserEventType';
import { DragPan } from 'ol/interaction';
import { BaOverlay } from '../components/BaOverlay';
import { GEODESIC_CALCULATION_STATUS, GEODESIC_FEATURE_PROPERTY } from '../ol/geodesic/geodesicGeometry';
import { unByKey } from 'ol/Observable';
import { asInternalProperty } from '../../../utils/propertyUtils';
import { getInternalLegacyPropertyOptionally } from '../utils/olMapUtils';

export const saveManualOverlayPosition = (feature) => {
	const draggableOverlayTypes = ['area', 'measurement'];
	draggableOverlayTypes.forEach((overlayType) => {
		const overlay = feature.get(asInternalProperty(overlayType));
		if (overlay) {
			if (overlay.get(asInternalProperty('manualPositioning'))) {
				feature.set(asInternalProperty(overlayType + '_position_x'), overlay.getPosition()[0]);
				feature.set(asInternalProperty(overlayType + '_position_y'), overlay.getPosition()[1]);
			}
		}
	});
};

export const STYLE_LISTENERS = 'measurement_style_listeners';

const SectorsOfPlacement = [
	{ name: 'top', isSector: (angle) => angle <= 60 || 300 < angle },
	{ name: 'right', isSector: (angle) => 60 < angle && angle <= 120 },
	{ name: 'bottom', isSector: (angle) => 120 < angle && angle <= 210 },
	{ name: 'left', isSector: (angle) => 210 < angle && angle <= 300 }
];

/**
 * @author thiloSchlemmer
 */
export class MeasurementOverlayStyle extends OverlayStyle {
	#environmentService;
	#storeService;
	constructor() {
		super();
		const { EnvironmentService, StoreService } = $injector.inject('EnvironmentService', 'StoreService');
		this.#environmentService = EnvironmentService;
		this.#storeService = StoreService;
	}

	/**
	 * @override
	 * @param {ol.feature} olFeature
	 * @param {ol.map} olMap
	 */
	add(olFeature, olMap) {
		/**
		 * After each resolution change the measurement features need updated overlays
		 * to be synchronized with the rendered measurement style and the drawn partition ticks.
		 *
		 * This must be done while the style is applied for the first time.
		 */

		const existingListeners = olFeature.get(asInternalProperty(STYLE_LISTENERS));
		if (existingListeners) {
			// possible existing listeners, created in the drawing phase should be replaced to prevent broken references
			unByKey(existingListeners);
		}

		const listener = olMap.getView().on('change:resolution', () => {
			const overlays = olFeature.get(asInternalProperty('overlays')) ?? [];
			// current display/opacity property for all overlays of the feature are the same, therefore
			// it is sufficient to only look at the first one
			const overlay = overlays[0];
			const currentProperties = overlay
				? {
						visible: overlay.getElement().style.display === 'inherit',
						opacity: overlay.getElement().style.opacity
					}
				: {};
			this.update(olFeature, olMap, currentProperties);
		});
		olFeature.set(asInternalProperty(STYLE_LISTENERS), [listener]);

		this._createDistanceOverlay(olFeature, olMap);
		this._createOrRemoveAreaOverlay(olFeature, olMap);
		this._createOrRemovePartitionOverlays(olFeature, olMap);

		this._restoreManualOverlayPosition(olFeature, olMap);
	}

	/**
	 * A Container-Object for optional properties related to a update of feature-overlays
	 * @typedef {Object} UpdateProperties
	 * @param {Number} [opacity] the opacity (0-1), may or may not given, to update the opacity of the specified feature, based on the OlFeatureStyleType ({@link OlFeatureStyleTypes}) belonging to the feature
	 * @param {Boolean} [top] the top-flag (true/false),  may or may not given, whether or not to update the behavior of being in the topmost layer
	 * @param {Boolean} [visible] the visible-flag (true/false), may or may not given, whether or not to update the visibility of the specified feature, based on the OlFeatureStyleType ({@link OlFeatureStyleTypes}) belonging to the feature
	 * @param {ol.Geometry} [geometry] the geometry, may or may not given, to update the geometry-based style of the specified feature, based on the OlFeatureStyleType ({@link OlFeatureStyleTypes}) belonging to the feature

	/**
	 * Updates overlays (added by OverlayStyle-classes) on the map and the feature
	 * @override
	 * @param {ol.Map} olMap the map, where overlays related to the feature-style exists
	 * @param {ol.Feature} olFeature the feature
	 * @param {UpdateProperties} properties the optional properties, which are used for additional style updates;
	 * any possible implications of a combination of defined UpdateProperties (i.e. visible=true && top=false) are handled by the current
	 * implementation of the OverlayStyle
	 */
	update(olFeature, olMap, properties = {}) {
		const distanceOverlay = getInternalLegacyPropertyOptionally(olFeature, 'measurement');
		const measureGeometry = properties.geometry ? properties.geometry : olFeature.getGeometry();
		if (distanceOverlay) {
			this._updateOlOverlay(distanceOverlay, measureGeometry, '');
			this._createOrRemoveAreaOverlay(olFeature, olMap);
			this._createOrRemovePartitionOverlays(olFeature, olMap, measureGeometry);
		}
		const overlays = olFeature.get(asInternalProperty('overlays'));
		if (overlays) {
			const isVisible = (properties) => {
				if ('visible' in properties || 'top' in properties) {
					const valueOrDefaultVisible = 'visible' in properties ? properties.visible : true;
					const valueOrDefaultTop = 'top' in properties ? properties.top : true;

					return valueOrDefaultVisible && valueOrDefaultTop ? 'inherit' : 'none';
				}
				return 'inherit';
			};

			const isVisibleStyle = isVisible(properties);
			const opacity = 'opacity' in properties ? properties.opacity : 1;

			// setting both properties, to prevent an issue with webkit-based browsers
			// where opacity is not applied as a single property
			overlays.forEach((o) => {
				o.getElement().style.display = isVisibleStyle;
				o.getElement().style.opacity = opacity;
			});
		}
	}

	/**
	 * @override
	 * @param {ol.feature} olFeature
	 * @param {ol.map} olMap
	 */
	remove(olFeature, olMap) {
		const styleListeners = olFeature.get(asInternalProperty(STYLE_LISTENERS));
		if (styleListeners?.length) {
			unByKey(styleListeners);
			olFeature.unset(asInternalProperty(STYLE_LISTENERS));
		}

		const featureOverlays = olFeature.get(asInternalProperty('overlays')) || [];
		featureOverlays.forEach((o) => olMap.removeOverlay(o));
		olFeature.unset(asInternalProperty('measurement'));
		olFeature.unset(asInternalProperty('area'));
		olFeature.unset(asInternalProperty('partitions'));
		olFeature.unset(asInternalProperty('overlays'));
	}

	_isActiveMeasurement() {
		const { measurement } = this.#storeService.getStore().getState();
		return measurement.active;
	}

	_createDistanceOverlay(olFeature, olMap) {
		const createNew = () => {
			const isDraggable = !this.#environmentService.isTouch() && this._isActiveMeasurement();
			const overlay = this._createOlOverlay(olMap, { offset: [0, -15], positioning: 'bottom-center' }, BaOverlayTypes.DISTANCE, isDraggable);
			olFeature.set(asInternalProperty('measurement'), overlay);
			this._add(overlay, olFeature, olMap);
			return overlay;
		};

		// create new if distanceOverlay does not exists or exists as legacy property
		const distanceOverlay = olFeature.get(asInternalProperty('measurement')) || createNew();
		if (olFeature && !olFeature.getGeometry().get(asInternalProperty(PROJECTED_LENGTH_GEOMETRY_PROPERTY))) {
			olFeature
				.getGeometry()
				.set(asInternalProperty(PROJECTED_LENGTH_GEOMETRY_PROPERTY), olFeature.get(asInternalProperty(PROJECTED_LENGTH_GEOMETRY_PROPERTY)));
		}
		this._updateOlOverlay(distanceOverlay, olFeature.getGeometry());
		return distanceOverlay;
	}

	_createOrRemoveAreaOverlay(olFeature, olMap) {
		let areaOverlay = olFeature.get(asInternalProperty('area'));
		if (olFeature.getGeometry() instanceof Polygon) {
			if (olFeature.getGeometry().getArea()) {
				const isDraggable = !this.#environmentService.isTouch() && this._isActiveMeasurement();

				if (!areaOverlay) {
					areaOverlay = this._createOlOverlay(olMap, { positioning: 'top-center' }, BaOverlayTypes.AREA, isDraggable);
					this._add(areaOverlay, olFeature, olMap);
				}
				this._updateOlOverlay(areaOverlay, olFeature.getGeometry());
				olFeature.set(asInternalProperty('area'), areaOverlay);
			} else {
				if (areaOverlay) {
					this._remove(areaOverlay, olFeature, olMap);
					olFeature.set(asInternalProperty('area'), null);
				}
			}
		} else {
			if (areaOverlay) {
				this._remove(areaOverlay, olFeature, olMap);
				olFeature.set(asInternalProperty('area'), null);
			}
		}
	}

	_createOrRemovePartitionOverlays(olFeature, olMap, simplifiedGeometry = null) {
		const displayRulerFromFeature = getInternalLegacyPropertyOptionally(olFeature, 'displayruler');
		const displayRuler = displayRulerFromFeature ? displayRulerFromFeature === 'true' : true;
		const getOverlayGeometry = (feature) => {
			const geodesic = feature.get(asInternalProperty(GEODESIC_FEATURE_PROPERTY));
			if (geodesic && geodesic.getCalculationStatus() === GEODESIC_CALCULATION_STATUS.ACTIVE) {
				return geodesic.getGeometry();
			}
			return olFeature.getGeometry();
		};
		const overlayGeometry = simplifiedGeometry ?? getOverlayGeometry(olFeature);
		const getPartitions = () => {
			const partitions = olFeature.get(asInternalProperty('partitions')) || [];
			const cleanPartitions = (partitions) => {
				partitions.forEach((p) => this._remove(p, olFeature, olMap));
				return [];
			};
			return simplifiedGeometry ? partitions : cleanPartitions(partitions);
		};
		const partitions = getPartitions();

		const projectedLength = olFeature.get(asInternalProperty(PROJECTED_LENGTH_GEOMETRY_PROPERTY));
		const resolution = olMap.getView().getResolution();

		const delta = projectedLength ? getPartitionDelta(olFeature.get(asInternalProperty(PROJECTED_LENGTH_GEOMETRY_PROPERTY)), resolution) : 1;
		let partitionIndex = 0;
		if (displayRuler) {
			for (let i = delta; i < 1; i += delta, partitionIndex++) {
				let partition = partitions[partitionIndex] || false;
				if (partition === false) {
					partition = this._createOlOverlay(olMap, { offset: [0, -25], positioning: 'top-center' }, BaOverlayTypes.DISTANCE_PARTITION);
					this._add(partition, olFeature, olMap);
					partitions.push(partition);
				}
				this._updateOlOverlay(partition, overlayGeometry, i);
			}
		}

		if (partitionIndex < partitions.length) {
			for (let j = partitions.length - 1; j >= partitionIndex; j--) {
				const removablePartition = partitions[j];
				this._remove(removablePartition, olFeature, olMap);
				partitions.pop();
			}
		}

		this._justifyPlacement(overlayGeometry, partitions);

		olFeature.set(asInternalProperty('partitions'), partitions);
		if (delta !== 1) {
			olFeature.set(asInternalProperty('partition_delta'), delta);
		}
	}

	_restoreManualOverlayPosition(olFeature) {
		const draggableOverlayTypes = [asInternalProperty('area'), asInternalProperty('measurement')];
		draggableOverlayTypes.forEach((t) => {
			const overlay = olFeature.get(t);
			if (overlay) {
				const posX = olFeature.get(t + '_position_x');
				const posY = olFeature.get(t + '_position_y');
				if (posX !== undefined && posY !== undefined) {
					overlay.set(asInternalProperty('manualPositioning'), true);
					overlay.setOffset([0, 0]);
					overlay.setPosition([posX, posY]);
				}
			}
		});
	}

	_justifyPlacement(geometry, partitions) {
		const lineString = getLineString(geometry);
		const collectedSegments = { minPartition: 0, length: 0 };

		lineString?.forEachSegment((from, to) => {
			const segment = new LineString([from, to]);

			const currentLength = collectedSegments.length + segment.getLength();
			const currentMinPartition = currentLength / lineString.getLength();
			const azimuth = getAzimuth(segment);
			partitions.forEach((overlay) => {
				const element = overlay.getElement();
				const partition = element.value;
				if (collectedSegments.minPartition < partition && partition < currentMinPartition) {
					element.placement = this._getPlacement(azimuth);
					overlay.setOffset(element.placement.offset);
					overlay.setPositioning(element.placement.positioning);
				}
			});

			collectedSegments.minPartition = currentMinPartition;
			collectedSegments.length = currentLength;
		});
	}

	_createOlOverlay(olMap, overlayOptions, type, isDraggable = false) {
		const overlayElement = document.createElement(BaOverlay.tag);
		overlayElement.type = type;
		overlayElement.isDraggable = isDraggable;
		const overlay = new Overlay({ ...overlayOptions, element: overlayElement, stopEvent: isDraggable });
		if (isDraggable) {
			this._createDragOn(overlay, olMap);
		}
		return overlay;
	}

	_updateOlOverlay(overlay, geometry, value) {
		const getGeodesicPosition = (feature, value) => {
			if (feature) {
				const geodesic = feature.get(asInternalProperty(GEODESIC_FEATURE_PROPERTY));
				if (geodesic && geodesic.getCalculationStatus() === GEODESIC_CALCULATION_STATUS.ACTIVE) {
					return geodesic.getCoordinateAt(value);
				}
			}
			return null;
		};
		const element = overlay.getElement();
		element.value = value;
		element.geometry = geometry;
		if (!overlay.get(asInternalProperty('manualPositioning'))) {
			if (element.type === BaOverlayTypes.DISTANCE_PARTITION) {
				const feature = overlay.get('feature');
				if (geometry && !geometry.get(asInternalProperty(PROJECTED_LENGTH_GEOMETRY_PROPERTY))) {
					geometry.set(asInternalProperty(PROJECTED_LENGTH_GEOMETRY_PROPERTY), feature.get(asInternalProperty(PROJECTED_LENGTH_GEOMETRY_PROPERTY)));
				}
				const geodesicPosition = getGeodesicPosition(feature, value);
				overlay.setPosition(geodesicPosition ?? element.position);
			} else {
				overlay.setPosition(element.position);
			}
		}
	}

	_createDragOn(overlay, olMap) {
		const element = overlay.getElement();
		const dragPanInteraction = olMap
			.getInteractions()
			.getArray()
			.find((i) => i instanceof DragPan);

		if (dragPanInteraction) {
			const handleMouseDown = () => {
				dragPanInteraction.setActive(false);
				overlay.set(asInternalProperty('dragging'), true);
				olMap.once(MapBrowserEventType.POINTERUP, handleMouseUp);
			};

			const handleMouseUp = () => {
				dragPanInteraction.setActive(true);
				overlay.set(asInternalProperty('dragging'), false);
			};

			const handleMouseEnter = () => {
				overlay.set(asInternalProperty('draggable'), true);
			};

			const handleMouseLeave = () => {
				overlay.set(asInternalProperty('draggable'), false);
			};
			element.addEventListener(MapBrowserEventType.POINTERDOWN, handleMouseDown);
			element.addEventListener(MapBrowserEventType.POINTERUP, handleMouseUp);

			element.addEventListener('mouseenter', handleMouseEnter);
			element.addEventListener('mouseleave', handleMouseLeave);
		}
	}

	_getPlacement(angle) {
		const distance = -25;
		const getOffset = (degree, distance) => {
			const rad = (degree / 180) * Math.PI;
			const point = [Math.sin(rad) * distance, -Math.cos(rad) * distance];
			const lot = Math.atan2(point[1], point[0]);
			return [Math.sin(lot) * distance, -Math.cos(lot) * distance].map((v) => Math.round(v));
		};

		const getSector = (angle) => {
			return SectorsOfPlacement.find((s) => s.isSector(angle));
		};

		const sector = getSector(angle);
		return { sector: sector?.name, positioning: 'center-center', offset: getOffset(angle - 180, distance) };
	}
}
