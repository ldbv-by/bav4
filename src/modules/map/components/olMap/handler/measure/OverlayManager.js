import { MeasurementOverlay } from './MeasurementOverlay';
import { MeasurementOverlayTypes } from './MeasurementOverlay';
import { getPartitionDelta } from '../../olGeometryUtils';
import Overlay from 'ol/Overlay';
import { LineString, Polygon } from 'ol/geom';
import MapBrowserEventType from 'ol/MapBrowserEventType';
import { DragPan } from 'ol/interaction';
import { $injector } from '../../../../../../injection';

if (!window.customElements.get(MeasurementOverlay.tag)) {
	window.customElements.define(MeasurementOverlay.tag, MeasurementOverlay);
}
export class OverlayManager {
	constructor(map) {
		const { MapService, EnvironmentService } = $injector.inject('MapService', 'EnvironmentService');
		this._mapService = MapService;
		this._environmentService = EnvironmentService;
		this._map = map;
		this._overlays = [];
		this._projectionHints = { fromProjection: 'EPSG:' + this._mapService.getSrid(), toProjection: 'EPSG:' + this._mapService.getDefaultGeodeticSrid() };
	}

	activate(map) {
		this._map = map;
		this.reset();
	}

	deactivate() {
		this.reset();
	}

	add(overlay) {
		this._overlays.push(overlay);
		this._map.addOverlay(overlay);
	}

	remove(overlay) {
		this._overlays = this._overlays.filter(o => o !== overlay);
		this._map.removeOverlay(overlay);
	}

	apply(overlayCallback) {
		this._overlays.forEach(o => overlayCallback(o));
	}

	getOverlays() {
		return [...this._overlays];
	}


	reset() {
		this._overlays.forEach(o => this._map.removeOverlay(o));
		this._overlays = [];
	}


	removeFrom(feature) {
		const overlaysToDelete = [];
		overlaysToDelete.push(feature.get('measurement'));
		overlaysToDelete.push(feature.get('area'));
		const partitions = feature.get('partitions');
		if (partitions) {
			partitions.forEach(p => overlaysToDelete.push(p));
		}
		overlaysToDelete.forEach(o => this.remove(o));
	}

	createDistanceOverlay(feature) {
		const isDraggable = !this._environmentService.isTouch();
		const distanceOverlay = this.create({ offset: [0, -15], positioning: 'bottom-center' }, MeasurementOverlayTypes.DISTANCE, this._projectionHints, isDraggable);
		feature.set('measurement', distanceOverlay);
		feature.setId('measurement' + '_' + new Date().getTime());
		this.add(distanceOverlay);	
		this.update(distanceOverlay, feature.getGeometry());	
	}


	createAreaOverlay(feature) {
		if (feature.getGeometry() instanceof Polygon) {		
			if (feature.getGeometry().getArea())	{
				const isDraggable = !this._environmentService.isTouch();
				let areaOverlay = feature.get('area');
				if (!areaOverlay) {
					areaOverlay = this.create({ positioning: 'top-center' }, MeasurementOverlayTypes.AREA, this._projectionHints, isDraggable);
					this.add(areaOverlay);
				}
				this.update(areaOverlay, feature.getGeometry());
				feature.set('area', areaOverlay);	
			}		
		}		
	}

	createPartitionOverlays(feature, simplifiedGeometry = null) {
		if (!simplifiedGeometry) {
			simplifiedGeometry = feature.getGeometry();
			if (feature.getGeometry() instanceof Polygon) {
				simplifiedGeometry = new LineString(feature.getGeometry().getCoordinates()[0]);
			}
		}
		const partitions = feature.get('partitions') || [];
		const resolution = this._map.getView().getResolution();
		const delta = getPartitionDelta(simplifiedGeometry, resolution, this._projectionHints);
		let partitionIndex = 0;
		for (let i = delta; i < 1; i += delta, partitionIndex++) {
			let partition = partitions[partitionIndex] || false;
			if (partition === false) {
				partition = this.create({ offset: [0, -25], positioning: 'top-center' }, MeasurementOverlayTypes.DISTANCE_PARTITION, this._projectionHints);

				this.add(partition);
				partitions.push(partition);
			}
			this.update(partition, simplifiedGeometry, i);
		}

		if (partitionIndex < partitions.length) {
			for (let j = partitions.length - 1; j >= partitionIndex; j--) {
				const removablePartition = partitions[j];
				this.remove(removablePartition);
				partitions.pop();
			}
		}
		feature.set('partitions', partitions);
	}

	saveManualOverlayPosition(feature) {
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
	}

	restoreManualOverlayPosition(feature) {
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

	create(overlayOptions = {}, type, projectionHints, isDraggable = false ) {
		const measurementOverlay = document.createElement(MeasurementOverlay.tag);
		measurementOverlay.type = type;
		measurementOverlay.isDraggable = isDraggable;
		measurementOverlay.projectionHints = projectionHints;
		const overlay = new Overlay({ ...overlayOptions, element: measurementOverlay, stopEvent: isDraggable });
		if (isDraggable) {
			this._createDragOn(overlay);
		}
		return overlay;
	}

	update(overlay, geometry, value) {
		const element = overlay.getElement();
		element.value = value;
		element.geometry = geometry;
		if (!overlay.get('manualPositioning')) {
			overlay.setPosition(element.position);
		}
	}

	_createDragOn(overlay) {
		const element = overlay.getElement();
		const dragPanInteraction = this._map.getInteractions().getArray().find(i =>  i instanceof DragPan );

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