import { $injector } from '../../../../../../injection';
import { OverlayStyle } from '../../OverlayStyle';
import { MeasurementOverlayTypes } from './MeasurementOverlay';
import { getPartitionDelta } from '../../olGeometryUtils';
import Overlay from 'ol/Overlay';
import { LineString, Polygon } from 'ol/geom';
import MapBrowserEventType from 'ol/MapBrowserEventType';
import { DragPan } from 'ol/interaction';
import { MeasurementOverlay } from './MeasurementOverlay';
if (!window.customElements.get(MeasurementOverlay.tag)) {
	window.customElements.define(MeasurementOverlay.tag, MeasurementOverlay);
}

export const saveManualOverlayPosition = (feature) => {
	const draggableOverlayTypes = ['area', 'measurement'];
	draggableOverlayTypes.forEach(t => {
		const overlay = feature.get(t);
		if (overlay) {
			if (overlay.get('manualPositioning')) {
				feature.set(t + '_position_x', overlay.getPosition()[0]);
				feature.set(t + '_position_y', overlay.getPosition()[1]);
			}
		}
	});
};

export class MeasurementOverlayStyle extends OverlayStyle {

	constructor() {
		super();
		const { MapService, EnvironmentService } = $injector.inject('MapService', 'EnvironmentService');
		this._mapService = MapService;
		this._environmentService = EnvironmentService;
		this._projectionHints = { fromProjection: 'EPSG:' + this._mapService.getSrid(), toProjection: 'EPSG:' + this._mapService.getDefaultGeodeticSrid() };
	}

	/**
	 * @override
	 * @param {ol.feature} olFeature 
	 * @param {ol.map} olMap
	 */
	add(olFeature, olMap) {
		this._findUnboundedOverlays(olFeature, olMap);
		this._createDistanceOverlay(olFeature, olMap);
		this._createOrRemoveAreaOverlay(olFeature, olMap);
		this._createOrRemovePartitionOverlays(olFeature, olMap);

		this._restoreManualOverlayPosition(olFeature, olMap);
	}

	/**
	 * @override
	 * @param {ol.feature} olFeature 
	 * @param {ol.map} olMap
	 * @param {import('../../services/StyleService').UpdateProperties} properties
	 */
	update(olFeature, olMap, properties = {}) {
		const distanceOverlay = olFeature.get('measurement');
		const measureGeometry = properties.geometry ? properties.geometry : olFeature.getGeometry();
		if (distanceOverlay) {
			this._updateOlOverlay(distanceOverlay, measureGeometry, '');
			this._createOrRemoveAreaOverlay(olFeature, olMap);
			this._createOrRemovePartitionOverlays(olFeature, olMap, measureGeometry);
		}
		const overlays = olFeature.get('overlays');
		if (overlays) {

			if ('opacity' in properties) {					
				overlays.forEach(o => o.getElement().style.opacity = properties.opacity);
			}

			if ('visible' in properties || 'top' in properties) {	
				const valueOrDefaultVisible = 'visible' in properties ? properties.visible : true;
				const valueOrDefaultTop = 'top' in properties ? properties.top : true;

				const isVisibleStyle = (valueOrDefaultVisible && valueOrDefaultTop) ? '' : 'none';
				overlays.forEach(o => o.getElement().style.display = isVisibleStyle);
			}						
		}
	}

	/**
	 * @override
	 * @param {ol.feature} olFeature 
	 * @param {ol.map} olMap
	 */
	remove(olFeature, olMap) {
		const featureOverlays = olFeature.get('overlays') || [];
		featureOverlays.forEach(o => olMap.removeOverlay(o));
		olFeature.set('measurement', null);
		olFeature.set('area', null);
		olFeature.set('partitions', null);
		olFeature.set('overlays', []);
	}

	_findUnboundedOverlays(olFeature, olMap) {
		const featureId = olFeature.getId();
		const addPartition = (partitionOverlay, olFeature) => {
			const partitionOverlays = olFeature.get('partitions') || [];
			partitionOverlays.push(partitionOverlay);
			olFeature.set('partitions', partitionOverlays);
		};
		olMap.getOverlays().forEach(o => {
			const overlayFeature = o.get('feature');
			if (overlayFeature) {
				const id = overlayFeature.getId();
				const measurementOverlay = o.getElement();
				if (id === featureId && measurementOverlay) {
					switch (measurementOverlay.type) {
						case MeasurementOverlayTypes.DISTANCE:
							olFeature.set('measurement', o);
							break;
						case MeasurementOverlayTypes.AREA:
							olFeature.set('area', o);
							break;
						case MeasurementOverlayTypes.DISTANCE_PARTITION:
							addPartition(o, olFeature);
							break;
					}
				}
			}
		});
	}

	_createDistanceOverlay(olFeature, olMap) {
		const createNew = () => {
			const isDraggable = !this._environmentService.isTouch();
			const overlay = this._createOlOverlay(olMap, { offset: [0, -15], positioning: 'bottom-center' }, MeasurementOverlayTypes.DISTANCE, this._projectionHints, isDraggable);
			olFeature.set('measurement', overlay);
			this._add(overlay, olFeature, olMap);
			return overlay;
		};

		const distanceOverlay = olFeature.get('measurement') || createNew();
		this._updateOlOverlay(distanceOverlay, olFeature.getGeometry());
		return distanceOverlay;
	}

	_createOrRemoveAreaOverlay(olFeature, olMap) {
		let areaOverlay = olFeature.get('area');
		if (olFeature.getGeometry() instanceof Polygon) {

			if (olFeature.getGeometry().getArea()) {
				const isDraggable = !this._environmentService.isTouch();

				if (!areaOverlay) {
					areaOverlay = this._createOlOverlay(olMap, { positioning: 'top-center' }, MeasurementOverlayTypes.AREA, this._projectionHints, isDraggable);
					this._add(areaOverlay, olFeature, olMap);
				}
				this._updateOlOverlay(areaOverlay, olFeature.getGeometry());
				olFeature.set('area', areaOverlay);
			}
			else {
				if (areaOverlay) {
					this._remove(areaOverlay, olFeature, olMap);
					olFeature.set('area', null);
				}
			}
		}
		else {
			if (areaOverlay) {
				this._remove(areaOverlay, olFeature, olMap);
				olFeature.set('area', null);
			}
		}
	}

	_createOrRemovePartitionOverlays(olFeature, olMap, simplifiedGeometry = null) {
		if (!simplifiedGeometry) {
			simplifiedGeometry = olFeature.getGeometry();
			if (olFeature.getGeometry() instanceof Polygon) {
				simplifiedGeometry = new LineString(olFeature.getGeometry().getCoordinates()[0]);
			}
		}
		const partitions = olFeature.get('partitions') || [];
		const resolution = olMap.getView().getResolution();
		let delta;
		if (partitions.length === 0) {
			delta = olFeature.get('partition_delta') || getPartitionDelta(simplifiedGeometry, resolution, this._projectionHints);
		}
		else {
			delta = getPartitionDelta(simplifiedGeometry, resolution, this._projectionHints);
		}
		let partitionIndex = 0;
		for (let i = delta; i < 1; i += delta, partitionIndex++) {
			let partition = partitions[partitionIndex] || false;
			if (partition === false) {
				partition = this._createOlOverlay(olMap, { offset: [0, -25], positioning: 'top-center' }, MeasurementOverlayTypes.DISTANCE_PARTITION, this._projectionHints);
				this._add(partition, olFeature, olMap);
				partitions.push(partition);
			}
			this._updateOlOverlay(partition, simplifiedGeometry, i);
		}

		if (partitionIndex < partitions.length) {
			for (let j = partitions.length - 1; j >= partitionIndex; j--) {
				const removablePartition = partitions[j];
				this._remove(removablePartition, olFeature, olMap);
				partitions.pop();
			}
		}
		olFeature.set('partitions', partitions);
		if (delta !== 1) {
			olFeature.set('partition_delta', delta);
		}
	}

	_restoreManualOverlayPosition(olFeature) {
		const draggableOverlayTypes = ['area', 'measurement'];
		draggableOverlayTypes.forEach(t => {
			const overlay = olFeature.get(t);
			if (overlay) {
				const posX = olFeature.get(t + '_position_x');
				const posY = olFeature.get(t + '_position_y');
				if (posX !== undefined && posY !== undefined) {
					overlay.set('manualPositioning', true);
					overlay.setOffset([0, 0]);
					overlay.setPosition([posX, posY]);
				}
			}
		});
	}

	_createOlOverlay(olMap, overlayOptions = {}, type, projectionHints, isDraggable = false) {
		const measurementOverlay = document.createElement(MeasurementOverlay.tag);
		measurementOverlay.type = type;
		measurementOverlay.isDraggable = isDraggable;
		measurementOverlay.projectionHints = projectionHints;
		const overlay = new Overlay({ ...overlayOptions, element: measurementOverlay, stopEvent: isDraggable });
		if (isDraggable) {
			this._createDragOn(overlay, olMap);
		}
		return overlay;
	}

	_updateOlOverlay(overlay, geometry, value) {
		const element = overlay.getElement();
		element.value = value;
		element.geometry = geometry;
		if (!overlay.get('manualPositioning')) {
			overlay.setPosition(element.position);
		}
	}

	_createDragOn(overlay, olMap) {
		const element = overlay.getElement();
		const dragPanInteraction = olMap.getInteractions().getArray().find(i => i instanceof DragPan);

		if (dragPanInteraction) {
			const handleMouseDown = () => {
				dragPanInteraction.setActive(false);
				overlay.set('dragging', true);
			};

			const handleMouseEnter = () => {
				overlay.set('dragable', true);
			};

			const handleMouseLeave = () => {
				overlay.set('dragable', false);
			};
			element.addEventListener(MapBrowserEventType.POINTERDOWN, handleMouseDown);
			element.addEventListener('mouseenter', handleMouseEnter);
			element.addEventListener('mouseleave', handleMouseLeave);
		}

	}
}