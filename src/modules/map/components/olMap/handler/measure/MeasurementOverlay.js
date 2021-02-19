import { html } from 'lit-html';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';
import { BaElement } from '../../../../../BaElement';
import css from './measure.css';
import { classMap } from 'lit-html/directives/class-map.js';
import { getAzimuth, getCoordinateAt, canShowAzimuthCircle, getGeometryLength, getArea, getFormattedArea, getFormattedLength } from './GeometryUtils';
import { Polygon } from 'ol/geom';

export const MeasurementOverlayTypes = {
	TEXT:'text',
	AREA:'area',
	DISTANCE:'distance',
	DISTANCE_PARTITION:'distance-partition',
	HELP:'help'
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
 * 
 * @class
 * @author thiloSchlemmer
 */
export class MeasurementOverlay extends BaElement {

	constructor() {
		super();	
		this._value = '';
		this._static = false;		
		this._type = MeasurementOverlayTypes.TEXT;
		this._projectionHints = false;
		this._contentFunction = () => '';
	}

	/**
	 * @override
	 */
	createView() {
		const content = this._contentFunction();

		const classes = {
			help: this._type === MeasurementOverlayTypes.HELP,
			area:this._type === MeasurementOverlayTypes.AREA,
			distance: this._type === MeasurementOverlayTypes.DISTANCE,
			partition: this._type === MeasurementOverlayTypes.DISTANCE_PARTITION,
			static: this._static && this._type !== MeasurementOverlayTypes.HELP,
			floating: !this._static && this._type !== MeasurementOverlayTypes.HELP
		};

		return html`
			<style>${css}</style>
			<div class='ba-overlay ${classMap(classes)}'>
				${unsafeHTML(content)}
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
				break;				
			case MeasurementOverlayTypes.DISTANCE:	
			case MeasurementOverlayTypes.HELP:				
			case MeasurementOverlayTypes.TEXT:				
			default:
				this._position = this.geometry.getLastCoordinate();
		}
	}

	_setContentFunctionBy(type) {
		switch (type) {
			case MeasurementOverlayTypes.AREA:
				this._contentFunction = () => {					
					if (this.geometry instanceof Polygon) {
						return getFormattedArea(getArea(this._geometry, this._projectionHints));
					}
					return '';
				};
				break;
			case MeasurementOverlayTypes.DISTANCE:
				this._contentFunction = () => {
					const length = getFormattedLength(getGeometryLength(this._geometry, this._projectionHints));
					if (canShowAzimuthCircle(this.geometry)) {
						const azimuthValue = getAzimuth(this.geometry);
						const azimuth = azimuthValue ? azimuthValue.toFixed(2) : '-';
											
						return azimuth + '°/' + length;					
					}
					return length;					
				};
				break;
			case MeasurementOverlayTypes.DISTANCE_PARTITION:
				this._contentFunction = () => {
					const length = getGeometryLength(this._geometry, this.projectionHints);
					return getFormattedLength(length * this._value);
				};
				break;
			case MeasurementOverlayTypes.HELP:
			case MeasurementOverlayTypes.TEXT:
				this._contentFunction = () => this._value;
				break;
		}
	}

	static get tag() {
		return 'ba-measure-overlay';
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
			this._type = value ;
			this._setContentFunctionBy(value);
			this.render();
		}
	}

	get type() {
		return this._type;
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

	set projectionHints(value) {
		if (value.toProjection !== this.projectionHints.toProjection || 
			value.fromProjection !== this.projectionHints.fromProjection) {
			this._projectionHints = value;
			this.render();
		}		
	}

	get projectionHints() {
		return this._projectionHints;
	}
}