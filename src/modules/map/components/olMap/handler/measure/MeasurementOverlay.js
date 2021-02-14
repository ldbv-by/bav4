import { html } from 'lit-html';
import { BaElement } from '../../../../../BaElement';
import css from './measure.css';
import { classMap } from 'lit-html/directives/class-map.js';

export const MeasurementOverlayTypes = {
	TEXT:'text',
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
 * 
 * Observed Properties:
 * - `value` 
 * - `static`
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
		this._contentFunction = () => '';
	}

	/**
	 * @override
	 */
	createView() {
		const content = this._contentFunction();

		const classes = {
			help: this._type === MeasurementOverlayTypes.HELP,
			distance: this._type === MeasurementOverlayTypes.DISTANCE,
			partition: this._type === MeasurementOverlayTypes.DISTANCE_PARTITION,
			static: this._static && this._type !== MeasurementOverlayTypes.HELP,
			floating: !this._static && this._type !== MeasurementOverlayTypes.HELP
		};

		return html`
			<style>${css}</style>
			<div class='ba-overlay ${classMap(classes)}'>
				${content}
			</div>
		`;
	}

	_updatePosition() {
		switch (this._type) {
			case MeasurementOverlayTypes.DISTANCE_PARTITION:
				this._position = this._geometry.getCoordinateAt(this._value);
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
			case MeasurementOverlayTypes.DISTANCE:
				this._contentFunction = () => {
					const length = this.geometry ? this._geometry.getLength() : 1;
					return this._getFormatted(length );
				};
				break;
			case MeasurementOverlayTypes.DISTANCE_PARTITION:
				this._contentFunction = () => { 					
					const length = this.geometry ? this._geometry.getLength() : 1;
					return this._getFormatted(length *  this._value);
				};
				break;
			case MeasurementOverlayTypes.HELP:
			case MeasurementOverlayTypes.TEXT:
				this._contentFunction = () => this._value;
				break;
		}
	}

	_getFormatted(length) {		
		let output;
		if (length > 100) {
			output = Math.round((length / 1000) * 100) / 100 + ' ' + 'km';
		}
		else {
			output = length !== 0 ? Math.round(length * 100) / 100 + ' ' + 'm' : '0 m';
		}
		return output;
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
}