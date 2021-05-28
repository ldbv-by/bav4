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
	 * @param {ol.feature} feature 
	 * @param {ol.map} map
	 */
	add(feature, map) {
		this._createDistanceOverlay(map, feature);
		this._createOrRemoveAreaOverlay(map, feature);
		this._createOrRemovePartitionOverlays(map, feature);

		this._restoreManualOverlayPosition(feature, map);
	}

	/**
	 * @override
	 * @param {ol.feature} feature 
	 * @param {ol.map} map
	 * @param {ol.geometry|null} geometry
	 */
	update(feature, map, geometry = null) {	
		const distanceOverlay = feature.get('measurement');
		const measureGeometry = geometry ? geometry : feature.getGeometry();
		if (distanceOverlay) {
			this._updateOlOverlay(distanceOverlay, measureGeometry, '');
			this._createOrRemoveAreaOverlay(map, feature);
			this._createOrRemovePartitionOverlays(map, feature, measureGeometry);
		}		
	}
	
	/**
	 * @override
	 * @param {ol.feature} feature 
	 * @param {ol.map} map
	 */
	remove(feature, map) {
		const featureOverlays = feature.get('overlays') || [];				
		featureOverlays.forEach(o => map.removeOverlay(o));
		feature.set('measurement', null);
		feature.set('area', null);
		feature.set('partitions', null);
		feature.set('overlays', []);		
	}

	_createDistanceOverlay(map, feature) {		
		const createNew = () => {	
			const isDraggable = !this._environmentService.isTouch();
			const overlay = this._createOlOverlay(map, { offset: [0, -15], positioning: 'bottom-center' }, MeasurementOverlayTypes.DISTANCE, this._projectionHints, isDraggable);
			feature.set('measurement', overlay);			
			this._add(overlay, feature, map);		
			return overlay;			
		};
		const distanceOverlay = feature.get('measurement') || createNew();		
		this._updateOlOverlay(distanceOverlay, feature.getGeometry());	
		return distanceOverlay;
	}

	_createOrRemoveAreaOverlay(map, feature) {
		let areaOverlay = feature.get('area');
		if (feature.getGeometry() instanceof Polygon) {		
			
			if (feature.getGeometry().getArea())	{
				const isDraggable = !this._environmentService.isTouch();
				
				if (!areaOverlay) {
					areaOverlay = this._createOlOverlay(map, { positioning: 'top-center' }, MeasurementOverlayTypes.AREA, this._projectionHints, isDraggable);
					this._add(areaOverlay, feature, map);
				}
				this._updateOlOverlay(areaOverlay, feature.getGeometry());
				feature.set('area', areaOverlay);					
			}
			else {
				if (areaOverlay) {
					this._remove(areaOverlay, feature, map);
					feature.set('area', null);					
				}
			}		
		}
		else {
			if (areaOverlay) {
				this._remove(areaOverlay, feature, map);
				feature.set('area', null);					
			}
		}		
	}

	_createOrRemovePartitionOverlays(map, feature, simplifiedGeometry = null) {
		if (!simplifiedGeometry) {
			simplifiedGeometry = feature.getGeometry();
			if (feature.getGeometry() instanceof Polygon) {
				simplifiedGeometry = new LineString(feature.getGeometry().getCoordinates()[0]);
			}
		}
		const partitions = feature.get('partitions') || [];
		const resolution = map.getView().getResolution();
		const delta = getPartitionDelta(simplifiedGeometry, resolution, this._projectionHints);
		let partitionIndex = 0;
		for (let i = delta; i < 1; i += delta, partitionIndex++) {
			let partition = partitions[partitionIndex] || false;
			if (partition === false) {
				partition = this._createOlOverlay(map, { offset: [0, -25], positioning: 'top-center' }, MeasurementOverlayTypes.DISTANCE_PARTITION, this._projectionHints);
				this._add(partition, feature, map);
				partitions.push(partition);
			}
			this._updateOlOverlay(partition, simplifiedGeometry, i);
		}

		if (partitionIndex < partitions.length) {
			for (let j = partitions.length - 1; j >= partitionIndex; j--) {
				const removablePartition = partitions[j];
				this._remove(removablePartition, feature, map);
				partitions.pop();
			}
		}
		feature.set('partitions', partitions);
	}

	_restoreManualOverlayPosition(feature) {
		const draggableOverlayTypes = ['area', 'measurement'];
		draggableOverlayTypes.forEach(t => {
			const overlay = feature.get(t);
			if (overlay) {
				const posX = feature.get(t + '_position_x');
				const posY = feature.get(t + '_position_y');
				if (posX !== undefined && posY !== undefined) {
					overlay.set('manualPositioning', true);
					overlay.setOffset([0, 0]);
					overlay.setPosition([posX, posY]);
				}					
			}
		});			
	}

	_createOlOverlay(map, overlayOptions = {}, type, projectionHints, isDraggable = false) {
		const measurementOverlay = document.createElement(MeasurementOverlay.tag);
		measurementOverlay.type = type;
		measurementOverlay.isDraggable = isDraggable;
		measurementOverlay.projectionHints = projectionHints;
		const overlay = new Overlay({ ...overlayOptions, element: measurementOverlay, stopEvent: isDraggable });
		if (isDraggable) {
			this._createDragOn(overlay, map);
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

	_createDragOn(overlay, map) {
		const element = overlay.getElement();
		const dragPanInteraction = map.getInteractions().getArray().find(i =>  i instanceof DragPan );

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