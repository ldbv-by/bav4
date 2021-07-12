import { html } from 'lit-html';
import { BaElement } from '../../../BaElement';
import css from './button.css';
import { classMap } from 'lit-html/directives/class-map.js';

/**
 * Clickable icon.
 * 
 * Configurable Attributes:
 * - `label`
 * - `disabled` (true|false)
 * - `type` (primary|secondary)
 * - `onClick()`
 * 
 * Observed Attributes:
 * - `label`
 * - `disabled`
 * - `type`
 * 
 * Configurable Properties:
 * - `label`
 * - `disabled` (default=false)
 * - `type` (default=secondary)
 * - `onClick()`
 * 
 * Observed Properties:
 * - `label`
 * - `disabled`
 * - `type`
 * 
 * 
 * @class
 * @author taulinger
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
		return ['disabled', 'type', 'label'];
	}

	attributeChangedCallback(name, oldValue, newValue) {
		switch (name) {
			case 'disabled': 
				this.disabled = newValue; 
				break;
			case 'type': 
				this.type = newValue; 
				break;
			case 'label': 
				this.label = newValue; 
				break;
		} 
	}

	set disabled(value) {
		if (value !== this.disabled) {
			this._disabled = value;
			this.render();
		}
	}

	get disabled() {
		return this._disabled;
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

	set label(value) {
		if (value !== this.label) {
			this._label = value;
			this.render();
		}
	}

	get label() {
		return this._label;
	}

	set onClick(callback) {
		this._onClick = callback;
	}

	get onClick() {
		return this._onClick;
	}
}