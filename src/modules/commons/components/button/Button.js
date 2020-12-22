import { html } from 'lit-html';
import { BaElement } from '../../../BaElement';
import css from './button.css';
import { classMap } from 'lit-html/directives/class-map.js';


/**
 * 
 * @class
 * @author aul
 */
export class Button extends BaElement {


	/**
	 * @override
	 */
	initialize() {
		//properties 'onClick' and 'disabled' are exposed via getter and setter
		this._onClick = () => { };
		this._disabled = this.getAttribute('disabled') === 'true';
		//properties 'label' and 'type' are not exposed
		this._label = this.getAttribute('label') || 'label';
		this._type = this.getAttribute('type') || 'secondary';
	}


	/**
	 * @override
	 */
	createView() {
		const onClick = () => {
			this._onClick();
		};


		const classes = {
			primary: this._type === 'primary',
			secondary: this._type !== 'primary',
			disabled: this._disabled
		};

		return html`
		 <style>${css}</style> 
		 <button class='button ${classMap(classes)}' ?disabled=${this._disabled} @click=${onClick}>${this._label}</button>
		`;
	}

	static get tag() {
		return 'ba-button';
	}

	static get observedAttributes() {
		return ['disabled'];
	}

	attributeChangedCallback(name, oldValue, newValue) {
		this.disabled = newValue;
	}

	set disabled(value) {
		this._disabled = value;
		this.render();
	}

	get disabled() {
		return this._disabled;
	}

	set onClick(callback) {
		this._onClick = callback;
	}

	get onClick() {
		return this._onClick;
	}
}