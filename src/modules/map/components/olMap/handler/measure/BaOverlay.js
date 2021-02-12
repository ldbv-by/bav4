import { html } from 'lit-html';
import { BaElement } from '../../../../../BaElement';
import css from './measure.css';
import { classMap } from 'lit-html/directives/class-map.js';

export const BaOverlayTypes = {
	TEXT:'text',
	DISTANCE:'distance',
	DISTANCE_PARTITION:'distance-partition',
	HELP:'help'
};
/**
 * 
 */
export class BaOverlay extends BaElement {


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
		const isContentText = this._type === BaOverlayTypes.HELP || this._type === BaOverlayTypes.TEXT;
		const content = isContentText ? this._value : this._getFormatted(parseInt(this._value));
		const classes = {
			help: this._type === BaOverlayTypes.HELP,
			distance: this._type === BaOverlayTypes.DISTANCE,
			partition: this._type === BaOverlayTypes.DISTANCE_PARTITION,
			static: this._static && this._type !== BaOverlayTypes.HELP,
			floating: !this._static && this._type !== BaOverlayTypes.HELP
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
				return BaOverlayTypes.DISTANCE;
			case 'distance-partition':
				return BaOverlayTypes.DISTANCE_PARTITION;
			case 'help':
				return BaOverlayTypes.HELP;
			case 'text':
			default:
				return BaOverlayTypes.TEXT;
		}
	}

	static get tag() {
		return 'ba-measure-overlay';
	}

	static get observedAttributes() {
		return ['value', 'static'];
	}

	attributeChangedCallback(name, oldValue, newValue) {
		switch (name) {
			case 'value':
				this.value = newValue;        
				break;
			case 'static':
				this.static = newValue;        			
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