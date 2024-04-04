/**
 * @module modules/olMap/components/MeasurementOverlay
 */
import { html, nothing } from 'lit-html';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';
import { $injector } from '../../../injection';
import css from './measurementOverlay.css';
import { classMap } from 'lit-html/directives/class-map.js';
import { getAzimuth, getCoordinateAt, canShowAzimuthCircle, PROJECTED_LENGTH_GEOMETRY_PROPERTY, getLineString } from '../utils/olGeometryUtils';
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
		this._content = null;
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
		const getStaticDistance = () => {
			const distance = this._getMeasuredLength(this.geometry) * this.value;
			return this._content ?? this._unitsService.formatDistance(round(Math.round(distance), -1), 0);
		};

		const getDistance = () => {
			if (canShowAzimuthCircle(this.geometry)) {
				// canShowAzimuthCircle() secures that getAzimuth() always returns a valid value except NULL
				const azimuthValue = getAzimuth(this.geometry).toFixed(2);
				const distanceValue = this._unitsService.formatDistance(this._getMeasuredLength(this.geometry), 2);
				return `${azimuthValue}°/${distanceValue}`;
			}
			return this._unitsService.formatDistance(this._getMeasuredLength(this.geometry), 2);
		};

		const getArea = () => {
			if (this.geometry instanceof Polygon) {
				return this._unitsService.formatArea(this._mapService.calcArea(this.geometry.getCoordinates()), 2);
			}
			return '';
		};

		switch (this._type) {
			case MeasurementOverlayTypes.AREA:
				this._position =
					this.geometry instanceof Polygon ? this.geometry.getInteriorPoint().getCoordinates().slice(0, -1) : this.geometry.getLastCoordinate();
				this._content = getArea();
				break;
			case MeasurementOverlayTypes.DISTANCE_PARTITION:
				this._position = getCoordinateAt(this._geodesic ?? this.geometry, this._value);
				this._content = getStaticDistance();
				break;
			case MeasurementOverlayTypes.DISTANCE:
				this._content = getDistance();
				this._position = this.geometry.getLastCoordinate();
				break;
			case MeasurementOverlayTypes.HELP:
			case MeasurementOverlayTypes.TEXT:
			default:
				this._position = this.geometry.getLastCoordinate();
		}
	}

	_getContent(type) {
		switch (type) {
			case MeasurementOverlayTypes.AREA:
			case MeasurementOverlayTypes.DISTANCE:
			case MeasurementOverlayTypes.DISTANCE_PARTITION:
				return this._content;
			case MeasurementOverlayTypes.HELP:
			case MeasurementOverlayTypes.TEXT:
				return this.value;
		}
	}

	set geodesic(value) {
		if (value !== this.geodesic) {
			this._geodesic = value;
			this.render();
		}
	}

	get geodesic() {
		return this._geodesic;
	}

	_getMeasuredLength = (geometry) => {
		const alreadyMeasuredLength = geometry ? geometry.get(PROJECTED_LENGTH_GEOMETRY_PROPERTY) : null;
		const lineString = getLineString(this.geometry);
		return alreadyMeasuredLength ?? lineString ? this._mapService.calcLength(lineString.getCoordinates()) : 0;
	};

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
