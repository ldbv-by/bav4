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
 * - `type` (BaOverlay.BaOverlayType)
 * - `value` 
 * - `static` (default=false)
 * 
 * Observed Attributes:
 * - `type`
 * - `value` 
 * - `static`
 * 
  * Configurable Properties:
 * - `type`
 * - `value` 
 * - `static`
 * 
 * Observed Properties:
 * - `type`
 * - `value` 
 * - `static`
 * 
 * @class
 * @author thiloSchlemmer
 */
export class MeasurementOverlay extends BaElement {


	/**
	 * @override
	 */
	initialize() {
		this._type = this._getType(this.getAttribute('type'));
		this._value = this.getAttribute('value') || '';
		this._static = this.getAttribute('static') === 'true';
	}

	/**
	 * @override
	 */
	createView() {
		let content;
		switch(this._type) {
			case MeasurementOverlayTypes.DISTANCE:
			case MeasurementOverlayTypes.DISTANCE_PARTITION:
				content = this._getFormatted(parseInt(this._value));
				break;
			case MeasurementOverlayTypes.HELP:
			case MeasurementOverlayTypes.TEXT:
			default:
				content = this._value;
		}

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

	_getFormatted(length) {			
		let output;
		if (length > 100) {
			output = Math.round((length / 1000) * 100) / 100 + ' ' + 'km';
		}
		else {
			output = Math.round(length * 100) / 100 + ' ' + 'm';
		}
		return output;
	}

	_getType(typeValue) {
		switch (typeValue) {
			case 'distance':
				return MeasurementOverlayTypes.DISTANCE;
			case 'distance-partition':
				return MeasurementOverlayTypes.DISTANCE_PARTITION;
			case 'help':
				return MeasurementOverlayTypes.HELP;
			case 'text':
			default:
				return MeasurementOverlayTypes.TEXT;
		}
	}

	static get tag() {
		return 'ba-measure-overlay';
	}

	static get observedAttributes() {
		return ['value', 'static', 'type'];
	}

	attributeChangedCallback(name, oldValue, newValue) {
		switch (name) {
			case 'value':
				this.value = newValue;        
				break;
			case 'static':
				this.static = newValue; 
				break;     
			case 'type':
				this.type = newValue; 
				break;
		}
	}

	set value(val) {
		if(val !== this.value) {
			this._value = val;
			this.render();
		}
	}

	get value() {
		return this._value;
	}

	set type(value) {
		const typeValue = this._getType(value);
		if(typeValue !== this.type) {
			this._type = typeValue ;
			this.render();
		}
	}

	get type() {
		return this._type;
	}

	set static(value) {
		if(value !== this.static) {
			this._static = value;
			this.render();
		}
	}

	get static() {
		return this._static;
	}
}