/**
 * @module modules/olMap/components/BaOverlay
 */
import { html, nothing } from 'lit-html';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';
import css from './baOverlay.css';
import { classMap } from 'lit-html/directives/class-map.js';
import { $injector } from '../../../injection/index';
import { PROJECTED_LENGTH_GEOMETRY_PROPERTY, canShowAzimuthCircle, getAzimuth, getCoordinateAt } from '../utils/olGeometryUtils';
import { Polygon } from 'ol/geom';
import { round } from '../../../utils/numberUtils';
import { getCenter } from 'ol/extent';
import { MvuElement } from '../../MvuElement';

export const BaOverlayTypes = {
	TEXT: 'text',
	AREA: 'area',
	DISTANCE: 'distance',
	DISTANCE_PARTITION: 'distance-partition',
	HELP: 'help'
};
export const OVERLAY_STYLE_CLASS = 'ba-overlay';

const Update_Value = 'update_value';
const Update_Overlay_Type = 'update_overlay_type';
const Update_Draggable = 'update_draggable';
const Update_Floating = 'update_floating';
const Update_Geometry_Revision = 'update_geometry_revision';
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
	#geometry;
	constructor() {
		super({
			value: null,
			floating: true,
			overlayType: BaOverlayTypes.TEXT,
			draggable: false,
			placement: Default_Placement,
			geometryRevision: null,
			position: null
		});
		const { UnitsService, MapService } = $injector.inject('UnitsService', 'MapService');
		this.#unitsService = UnitsService;
		this.#mapService = MapService;
		this.#geometry = null;
	}

	update(type, data, model) {
		const getPosition = (overlayType, value) => {
			switch (overlayType) {
				case BaOverlayTypes.AREA:
					return this.#geometry instanceof Polygon
						? this.#geometry.getInteriorPoint().getCoordinates().slice(0, -1)
						: getCenter(this.#geometry.getExtent());
				case BaOverlayTypes.DISTANCE_PARTITION:
					return getCoordinateAt(this.#geometry, value);
				case BaOverlayTypes.DISTANCE:
				case BaOverlayTypes.HELP:
				case BaOverlayTypes.TEXT:
				default:
					return this.#geometry.getLastCoordinate();
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
			case Update_Geometry_Revision:
				return { ...model, position: getPosition(model.overlayType, model.value), geometryRevision: data };
			case Update_Placement:
				return { ...model, placement: data };
		}
	}

	createView(model) {
		const { overlayType, floating, draggable, placement } = model;
		const content = this.#getContent(model);

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
		classes[OVERLAY_STYLE_CLASS] = true;

		return html`
			<style>
				${css}
			</style>
			<div class="${classMap(classes)}">${content ? unsafeHTML(content) : nothing}</div>
		`;
	}

	#getContent(model) {
		const { overlayType, value } = model;
		const geometry = this.#geometry;
		const getStaticDistance = () => {
			const distance = this.#getMeasuredLength(geometry) * value;
			return this.#unitsService.formatDistance(round(Math.round(distance), -1), 0);
		};

		const getDistance = () => {
			if (canShowAzimuthCircle(geometry)) {
				// canShowAzimuthCircle() secures that getAzimuth() always returns a valid value except NULL
				const azimuthValue = getAzimuth(geometry).toFixed(2);
				const distanceValue = this.#unitsService.formatDistance(this.#getMeasuredLength(geometry), 2);
				return `${azimuthValue}°/${distanceValue}`;
			}
			return geometry ? this.#unitsService.formatDistance(this.#getMeasuredLength(geometry), 2) : '';
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

	#getMeasuredLength = (geometry) => {
		const alreadyMeasuredLength = geometry.get(PROJECTED_LENGTH_GEOMETRY_PROPERTY);
		return alreadyMeasuredLength ?? 0;
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
		this.#geometry = value;
		this.signal(Update_Geometry_Revision, this.#geometry?.getRevision());
	}

	get geometry() {
		return this.#geometry;
	}

	get position() {
		return this.getModel().position;
	}
}
