/**
 * @module modules/olMap/components/MeasurementOverlay
 */
import { html, nothing } from 'lit-html';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';
import { $injector } from '../../../injection';
import css from './measurementOverlay.css';
import { classMap } from 'lit-html/directives/class-map.js';
import {
	getAzimuth,
	getCoordinateAt,
	canShowAzimuthCircle,
	PROJECTED_LENGTH_GEOMETRY_PROPERTY,
	getProjectedLength,
	getProjectedArea
} from '../utils/olGeometryUtils';
import { Polygon } from 'ol/geom';
import { BaOverlay } from './BaOverlay';
import { round } from '../../../utils/numberUtils';

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
 *
 *
 * Observed Properties:
 * - `value`
 * - `static`
 * - `geometry`
 * - `position`
 * - `placement`
 * @class
 * @author thiloSchlemmer
 */
export class MeasurementOverlay extends BaOverlay {
	constructor() {
		super();
		const { UnitsService, MapService } = $injector.inject('UnitsService', 'MapService');
		this._unitsService = UnitsService;
		this._mapService = MapService;
		this._static = false;
		this._type = MeasurementOverlayTypes.TEXT;
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
			<style>
				${css}
			</style>
			<div class="ba-overlay ${classMap(classes)}">${content ? unsafeHTML(content) : nothing}</div>
		`;
	}

	_updatePosition() {
		switch (this._type) {
			case MeasurementOverlayTypes.AREA:
				this._position = this.geometry.getInteriorPoint().getCoordinates().slice(0, -1);
				break;
			case MeasurementOverlayTypes.DISTANCE_PARTITION:
				this._position = getCoordinateAt(this.geometry, this._value);
				break;
			case MeasurementOverlayTypes.DISTANCE:
			case MeasurementOverlayTypes.HELP:
			case MeasurementOverlayTypes.TEXT:
			default:
				this._position = this.geometry.getLastCoordinate();
		}
	}

	_getContent(type) {
		const getMeasuredLength = () => {
			const alreadyMeasuredLength = this.geometry ? this.geometry.get(PROJECTED_LENGTH_GEOMETRY_PROPERTY) : null;
			return alreadyMeasuredLength ?? getProjectedLength(this.geometry);
		};
		switch (type) {
			case MeasurementOverlayTypes.AREA:
				if (this.geometry instanceof Polygon) {
					return this._unitsService.formatArea(getProjectedArea(this.geometry), 2);
				}
				return '';
			case MeasurementOverlayTypes.DISTANCE:
				if (canShowAzimuthCircle(this.geometry)) {
					// canShowAzimuthCircle() secures that getAzimuth() always returns a valid value except NULL
					const azimuthValue = getAzimuth(this.geometry).toFixed(2);
					const distanceValue = this._unitsService.formatDistance(getMeasuredLength(), 2);
					return `${azimuthValue}°/${distanceValue}`;
				}
				return this._unitsService.formatDistance(getMeasuredLength(), 2);
			case MeasurementOverlayTypes.DISTANCE_PARTITION:
				return this._unitsService.formatDistance(round(Math.round(getMeasuredLength() * this._value), -1), 0);
			case MeasurementOverlayTypes.HELP:
			case MeasurementOverlayTypes.TEXT:
				return this.value;
		}
	}

	set placement(value) {
		if (value !== this.placement) {
			this._placement = value;
			this.render();
		}
	}

	get placement() {
		return this._placement;
	}

	get innerText() {
		return this._getContent(this._type);
	}

	static get tag() {
		return 'ba-measure-overlay';
	}
}
