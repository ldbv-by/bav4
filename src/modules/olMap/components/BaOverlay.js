/**
 * @module modules/olMap/components/BaOverlay
 */
import { html, nothing } from 'lit-html';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';
import { BaElement } from '../../BaElement';
import css from './baOverlay.css';
import { classMap } from 'lit-html/directives/class-map.js';
import { $injector } from '../../../injection/index';
import { PROJECTED_LENGTH_GEOMETRY_PROPERTY, canShowAzimuthCircle, getAzimuth, getCoordinateAt } from '../utils/olGeometryUtils';
import { Polygon } from '../../../../node_modules/ol/geom';
import { round } from '../../../utils/numberUtils';
import { getCenter } from '../../../../node_modules/ol/extent';

export const BaOverlayTypes = {
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
 * @class
 * @author thiloSchlemmer
 */
export class BaOverlay extends BaElement {
	constructor() {
		super();
		const { UnitsService, MapService } = $injector.inject('UnitsService', 'MapService');
		this._unitsService = UnitsService;
		this._mapService = MapService;
		this._value = null;
		this._static = false;
		this._type = BaOverlayTypes.TEXT;
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
			help: this._type === BaOverlayTypes.HELP,
			area: this._type === BaOverlayTypes.AREA,
			distance: this._type === BaOverlayTypes.DISTANCE,
			partition: this._type === BaOverlayTypes.DISTANCE_PARTITION,
			static: this._static && this._type !== BaOverlayTypes.HELP,
			floating: !this._static && this._type !== BaOverlayTypes.HELP,
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
				return this._unitsService.formatArea(this._mapService.calcArea(this.geometry), 2);
			}
			return '';
		};

		switch (this._type) {
			case BaOverlayTypes.AREA:
				this._position =
					this.geometry instanceof Polygon ? this.geometry.getInteriorPoint().getCoordinates().slice(0, -1) : getCenter(this.geometry.getExtent());
				this._content = getArea();
				break;
			case BaOverlayTypes.DISTANCE_PARTITION:
				this._position = getCoordinateAt(this.geometry, this._value);
				this._content = getStaticDistance();
				break;
			case BaOverlayTypes.DISTANCE:
				this._content = getDistance();
				this._position = this.geometry.getLastCoordinate();
				break;
			case BaOverlayTypes.HELP:
			case BaOverlayTypes.TEXT:
			default:
				this._position = this.geometry.getLastCoordinate();
		}
	}

	/**
	 * Returns the displayable content of Overlay
	 * @protected
	 * @abstract
	 * @param {string|BaOverlayTypes} type the BaOverlayType
	 * @returns {string}
	 */
	_getContent(/*eslint-disable no-unused-vars */ type) {
		switch (type) {
			case BaOverlayTypes.AREA:
			case BaOverlayTypes.DISTANCE:
			case BaOverlayTypes.DISTANCE_PARTITION:
				return this._content;
			case BaOverlayTypes.HELP:
			case BaOverlayTypes.TEXT:
				return this.value;
		}
	}

	static get tag() {
		return 'ba-map-overlay';
	}

	_getMeasuredLength = (geometry) => {
		const alreadyMeasuredLength = geometry ? geometry.get(PROJECTED_LENGTH_GEOMETRY_PROPERTY) : null;
		return alreadyMeasuredLength ?? this._mapService.calcLength(this.geometry);
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

	set value(val) {
		if (val !== this.value) {
			this._value = val;
			this.render();
		}
	}

	get value() {
		return this._value;
	}

	set type(value) {
		if (value !== this.type) {
			this._type = value;
			this.render();
		}
	}

	get type() {
		return this._type;
	}

	set isDraggable(value) {
		if (value !== this.isDraggable) {
			this._isDraggable = value;
			this.render();
		}
	}

	get isDraggable() {
		return this._isDraggable;
	}

	set static(value) {
		if (value !== this.static) {
			this._static = value;
			this.render();
		}
	}

	get static() {
		return this._static;
	}

	set geometry(value) {
		this._geometry = value;
		this._updatePosition();
		this.render();
	}

	get geometry() {
		return this._geometry;
	}

	get position() {
		return this._position;
	}

	get innerText() {
		return this._getContent(this._type);
	}
}
