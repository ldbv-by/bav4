import { html, nothing } from 'lit-html';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';
import { $injector } from '../../../../../../injection';
import css from './measure.css';
import { classMap } from 'lit-html/directives/class-map.js';
import { getAzimuth, getCoordinateAt, canShowAzimuthCircle, getGeometryLength, getArea, getSegmentAt } from '../../olGeometryUtils';
import { Polygon } from 'ol/geom';
import { BaOverlay } from '../../BaOverlay';

export const MeasurementOverlayTypes = {
	TEXT: 'text',
	AREA: 'area',
	DISTANCE: 'distance',
	DISTANCE_PARTITION: 'distance-partition',
	HELP: 'help'
};
/**
 * Internal overlay content for measurements on map-components
 *
 * Configurable Attributes:
 *
 * Observed Attributes:
 *
 * Configurable Properties:
 * - `type`
 * - `value`
 * - `static`
 * - `geometry`
 * - `projectionHints`
 *
 *
 * Observed Properties:
 * - `value`
 * - `static`
 * - `geometry`
 * - `position`
 * - `placement`
 * - `projectionHints`
 * @class
 * @author thiloSchlemmer
 */
export class MeasurementOverlay extends BaOverlay {

	constructor() {
		super();
		const { UnitsService } = $injector.inject('UnitsService');
		this._unitsService = UnitsService;
		this._static = false;
		this._type = MeasurementOverlayTypes.TEXT;
		this._projectionHints = false;
		this._isDraggable = false;
		this._placement = { sector: 'init', positioning: 'top-center', offset: [0, -25] };
	}

	/**
	 * @override
	 */
	createView() {
		const content = this._getContent(this._type);
		const classes = {
			help: this._type === MeasurementOverlayTypes.HELP,
			area: this._type === MeasurementOverlayTypes.AREA,
			distance: this._type === MeasurementOverlayTypes.DISTANCE,
			partition: this._type === MeasurementOverlayTypes.DISTANCE_PARTITION,
			static: this._static && this._type !== MeasurementOverlayTypes.HELP,
			floating: !this._static && this._type !== MeasurementOverlayTypes.HELP,
			draggable: this._isDraggable,
			top: this.placement.sector === 'top',
			right: this.placement.sector === 'right',
			bottom: this.placement.sector === 'bottom',
			left: this.placement.sector === 'left',
			init: this.placement.sector === 'init'
		};

		return html`
			<style>${css}</style>
			<div class='ba-overlay ${classMap(classes)}'>
				${content ? unsafeHTML(content) : nothing}
			</div>
		`;
	}

	_updatePosition() {

		switch (this._type) {
			case MeasurementOverlayTypes.AREA:
				this._position = this.geometry.getInteriorPoint().getCoordinates().slice(0, -1);
				break;
			case MeasurementOverlayTypes.DISTANCE_PARTITION:
				this._position = getCoordinateAt(this.geometry, this._value);
				this._placement = this._updatePlacement(this._placement);
				break;
			case MeasurementOverlayTypes.DISTANCE:
			case MeasurementOverlayTypes.HELP:
			case MeasurementOverlayTypes.TEXT:
			default:
				this._position = this.geometry.getLastCoordinate();
		}
	}

	_updatePlacement(currentPlacement) {
		if (this._value && this._geometry) {
			const newPlacement = this._getPlacement(this._geometry, this._value);
			return newPlacement ? newPlacement : currentPlacement;
		}
		return currentPlacement;
	}

	_getContent(type) {
		switch (type) {
			case MeasurementOverlayTypes.AREA:

				if (this.geometry instanceof Polygon) {
					return this._unitsService.formatArea(getArea(this._geometry, this._projectionHints), 2);
				}
				return '';
			case MeasurementOverlayTypes.DISTANCE:
				if (canShowAzimuthCircle(this.geometry)) {
					const azimuthValue = getAzimuth(this.geometry);
					const azimuth = azimuthValue ? azimuthValue.toFixed(2) : '-';

					return azimuth + '°/' + this._unitsService.formatDistance(getGeometryLength(this._geometry, this._projectionHints), 2);
				}
				return this._unitsService.formatDistance(getGeometryLength(this._geometry, this._projectionHints), 2);
			case MeasurementOverlayTypes.DISTANCE_PARTITION:
				return this._unitsService.formatDistance(getGeometryLength(this._geometry, this.projectionHints) * this._value, 0);
			case MeasurementOverlayTypes.HELP:
			case MeasurementOverlayTypes.TEXT:
				return this._value;
		}
	}

	_getPlacement(geometry, fraction) {

		const segment = getSegmentAt(geometry, fraction);
		if (segment) {
			const angle = Math.round(getAzimuth(segment));
			const sectorFunction = [
				(angle) => angle <= 60 || 300 < angle ? 'top' : false,
				(angle) => 60 < angle && angle <= 120 ? 'right' : false,
				(angle) => 120 < angle && angle <= 210 ? 'bottom' : false,
				(angle) => 210 < angle && angle <= 300 ? 'left' : false
			].find(isSector => isSector(angle));
			const sector = sectorFunction ? sectorFunction(angle) : null;
			switch (sector) {
				case 'right':
					return { sector: sector, positioning: 'top-center', offset: [0, -25] };
				case 'bottom':
					return { sector: sector, positioning: 'center-left', offset: [10, 0] };
				case 'left':
					return { sector: sector, positioning: 'bottom-center', offset: [0, 25] };
				case 'top':
					return { sector: sector, positioning: 'center-right', offset: [-15, 0] };
				default:
					return null;
			}
		}
	}

	get placement() {
		if (this._placement.sector === 'init' && this._value && this._geometry) {
			this._placement = this._updatePlacement(this._placement);
		}
		return this._placement;
	}

	static get tag() {
		return 'ba-measure-overlay';
	}

}
