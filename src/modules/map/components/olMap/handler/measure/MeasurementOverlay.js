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
			top: this.placement ? this.placement.sector === 'top' : false,
			right: this.placement ? this.placement.sector === 'right' : false,
			bottom: this.placement ? this.placement.sector === 'bottom' : false,
			left: this.placement ? this.placement.sector === 'left' : false
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
				this._placement = this._getPlacement(this.geometry, this._value) ;
				break;
			case MeasurementOverlayTypes.DISTANCE:
			case MeasurementOverlayTypes.HELP:
			case MeasurementOverlayTypes.TEXT:
			default:
				this._position = this.geometry.getLastCoordinate();
		}
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

			const angle = getAzimuth(segment);
			const isSectorTop = (angle) => angle < 60 || 300 < angle ? 'top' : false;
			const isSectorRight = (angle) => 60 < angle && angle < 120 ? 'right' : false;
			const isSectorBottom = (angle) => 120 < angle && angle < 210 ? 'bottom' : false;
			const isSectorLeft = (angle) => 210 < angle && angle < 300 ? 'left' : false;
			const sector = [isSectorTop, isSectorRight, isSectorBottom, isSectorLeft].find(isSector => isSector(angle));
			switch (sector(angle)) {
				case 'right':
					return { sector: sector(angle), positioning: 'top-center', offset: [0, -25] };
				case 'bottom':
					return { sector: sector(angle), positioning: 'center-left', offset: [25, 0] };
				case 'left':
					return { sector: sector(angle), positioning: 'bottom-center', offset: [0, 25] };
				case 'top':
					return { sector: sector(angle), positioning: 'center-right', offset: [-25, 0] };
				default:
					console.warn('No sector found for:', angle);
			}
		}
	}

	get placement() {
		return this._placement ? this._placement : { sector: 'right', positioning: 'top-center', offset: [0, -25] };
	}

	static get tag() {
		return 'ba-measure-overlay';
	}

}
