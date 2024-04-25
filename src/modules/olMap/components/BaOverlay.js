/**
 * @module modules/olMap/components/BaOverlay
 */
import { html, nothing } from 'lit-html';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';
import css from './baOverlay.css';
import { classMap } from 'lit-html/directives/class-map.js';
import { $injector } from '../../../injection/index';
import { PROJECTED_LENGTH_GEOMETRY_PROPERTY, canShowAzimuthCircle, getAzimuth, getCoordinateAt } from '../utils/olGeometryUtils';
import { Point, Polygon } from '../../../../node_modules/ol/geom';
import { round } from '../../../utils/numberUtils';
import { getCenter } from '../../../../node_modules/ol/extent';
import { MvuElement } from '../../MvuElement';

export const BaOverlayTypes = {
	TEXT: 'text',
	AREA: 'area',
	DISTANCE: 'distance',
	DISTANCE_PARTITION: 'distance-partition',
	HELP: 'help'
};

const Update_Value = 'update_value';
const Update_Overlay_Type = 'update_overlay_type';
const Update_Draggable = 'update_draggable';
const Update_Floating = 'update_floating';
const Update_Geometry = 'update_geometry';
const Update_Placement = 'update_placement';

const Default_Placement = { sector: 'init', positioning: 'top-center', offset: [0, -25] };
/**
 * Internal overlay content for measurements or context help on map-components
 *
 * @class
 * @property {string| null} [value] The numeric value.
 * @property {Geometry} geometry The ol geometry which relates to this overlay.
 * @property {boolean} static Defines, whether the overlay is static or not.
 * @property {boolean} isDraggable Defines, whether the overlay is draggable or not.
 * @property {BaOverlayTypes} type='text' Defines the display properties of the overlay.
 * @property {Object} [placement={ sector: 'init', positioning: 'top-center', offset: [0, -25] }] Defines the placement of the overlay relative to the geometry.
 * @property {Coordinate} position The coordinate of the anchor, to positioning the overlay.
 * @author thiloSchlemmer
 */
export class BaOverlay extends MvuElement {
	#unitsService;
	#mapService;
	constructor() {
		super({
			value: null,
			floating: true,
			overlayType: BaOverlayTypes.TEXT,
			draggable: false,
			placement: Default_Placement,
			geometry: null,
			position: null
		});
		const { UnitsService, MapService } = $injector.inject('UnitsService', 'MapService');
		this.#unitsService = UnitsService;
		this.#mapService = MapService;
	}

	update(type, data, model) {
		const getPosition = (geometry, overlayType, value) => {
			switch (overlayType) {
				case BaOverlayTypes.AREA:
					return geometry instanceof Polygon ? geometry.getInteriorPoint().getCoordinates().slice(0, -1) : getCenter(geometry.getExtent());
				case BaOverlayTypes.DISTANCE_PARTITION:
					return getCoordinateAt(geometry, value);
				case BaOverlayTypes.DISTANCE:
				case BaOverlayTypes.HELP:
				case BaOverlayTypes.TEXT:
				default:
					return geometry.getLastCoordinate();
			}
		};

		switch (type) {
			case Update_Value:
				return { ...model, value: data };
			case Update_Overlay_Type:
				return { ...model, overlayType: data };
			case Update_Draggable:
				return { ...model, draggable: data };
			case Update_Floating:
				return { ...model, floating: data };
			case Update_Geometry:
				return { ...model, geometry: data, position: getPosition(data, model.overlayType, model.value) };
			case Update_Placement:
				return { ...model, placement: data };
		}
	}

	createView(model) {
		const { overlayType, floating, draggable, placement } = model;
		const content = this._getContent(model);

		const classes = {
			help: overlayType === BaOverlayTypes.HELP,
			area: overlayType === BaOverlayTypes.AREA,
			distance: overlayType === BaOverlayTypes.DISTANCE,
			partition: overlayType === BaOverlayTypes.DISTANCE_PARTITION,
			static: !floating && overlayType !== BaOverlayTypes.HELP,
			floating: floating && overlayType !== BaOverlayTypes.HELP,
			draggable: draggable,
			top: placement.sector === 'top',
			right: placement.sector === 'right',
			bottom: placement.sector === 'bottom',
			left: placement.sector === 'left',
			init: placement.sector === 'init'
		};
		return html`
			<style>
				${css}
			</style>
			<div class="ba-overlay ${classMap(classes)}">${content ? unsafeHTML(content) : nothing}</div>
		`;
	}

	_getContent(model) {
		const { geometry, overlayType, value } = model;
		const getStaticDistance = () => {
			const distance = this._getMeasuredLength(geometry) * value;
			return this.#unitsService.formatDistance(round(Math.round(distance), -1), 0);
		};

		const getDistance = () => {
			if (canShowAzimuthCircle(geometry)) {
				// canShowAzimuthCircle() secures that getAzimuth() always returns a valid value except NULL
				const azimuthValue = getAzimuth(geometry).toFixed(2);
				const distanceValue = this.#unitsService.formatDistance(this._getMeasuredLength(geometry), 2);
				return `${azimuthValue}°/${distanceValue}`;
			}
			return geometry ? this.#unitsService.formatDistance(this._getMeasuredLength(geometry), 2) : '';
		};

		const getArea = () => {
			if (geometry instanceof Polygon) {
				return this.#unitsService.formatArea(this.#mapService.calcArea(geometry.getCoordinates()), 2);
			}
			return '';
		};
		switch (overlayType) {
			case BaOverlayTypes.AREA:
				return getArea();
			case BaOverlayTypes.DISTANCE:
				return getDistance();
			case BaOverlayTypes.DISTANCE_PARTITION:
				return geometry ? getStaticDistance() : '';
			case BaOverlayTypes.HELP:
			case BaOverlayTypes.TEXT:
			default:
				return value;
		}
	}

	static get tag() {
		return 'ba-map-overlay';
	}

	_getMeasuredLength = (geometry) => {
		const alreadyMeasuredLength = geometry ? geometry.get(PROJECTED_LENGTH_GEOMETRY_PROPERTY) : null;
		return alreadyMeasuredLength ?? this.#mapService.calcLength(geometry.getCoordinates());
	};

	set placement(value) {
		this.signal(Update_Placement, value);
	}

	get placement() {
		return this.getModel().placement;
	}

	set value(val) {
		this.signal(Update_Value, val);
	}

	get value() {
		return this.getModel().value;
	}

	set type(value) {
		this.signal(Update_Overlay_Type, value);
	}

	get type() {
		return this.getModel().overlayType;
	}

	set isDraggable(value) {
		this.signal(Update_Draggable, value);
	}

	get isDraggable() {
		return this.getModel().draggable;
	}

	set static(value) {
		this.signal(Update_Floating, !value);
	}

	get static() {
		return !this.getModel().floating;
	}

	set geometry(value) {
		this.signal(Update_Geometry, value);
	}

	get geometry() {
		return this.getModel().geometry;
	}

	get position() {
		return this.getModel().position;
	}
}
