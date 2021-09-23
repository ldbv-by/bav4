import { html } from 'lit-html';
import css from './button.css';
import { classMap } from 'lit-html/directives/class-map.js';
import { MvuElement } from '../../../MvuElement';


const Init_Model = 'init_model';
const Update_Disabled = 'update_disabled';
const Update_Label = 'update_label';
const Update_Type = 'update_type';

/**
 * Clickable icon.
 *
 * Configurable Attributes:
 * - `label`
 * - `disabled` (true|false)
 * - `type` (primary|secondary)
 * - `onClick()`
 *
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
export class Button extends MvuElement {

	constructor() {
		super({
			disabled: null,
			label: null,
			type: null
		});
	}

	/**
	 * @override
	 */
	onInitialize() {
		//properties 'onClick' and 'disabled' are exposed via getter and setter
		this._onClick = () => { };

		this.signal(Init_Model, {
			disabled: this.getAttribute('disabled') === 'true',
			label: this.getAttribute('label') || 'label',
			type: this.getAttribute('type') || 'secondary'
		});
	}

	update(type, data, model) {

		switch (type) {
			case Init_Model:
				return {
					...data
				};
			case Update_Disabled:
				return {
					...model,
					disabled: data
				};
			case Update_Label:
				return {
					...model,
					label: data
				};
			case Update_Type:
				return {
					...model,
					type: data
				};
		}
	}

	/**
	 * @override
	 */
	createView(model) {
		const { disabled, label, type } = model;
		const onClick = () => {
			this._onClick();
		};

		const classes = {
			primary: type === 'primary',
			secondary: type !== 'primary',
			disabled: disabled
		};

		return html`
		 <style>${css}</style> 
		 <button class='button ${classMap(classes)}' ?disabled=${disabled} @click=${onClick}>${label}</button>
		`;
	}

	static get tag() {
		return 'ba-button';
	}

	set disabled(value) {
		this.signal(Update_Disabled, value);
	}

	get disabled() {
		return this.getModel().disabled;
	}

	set type(value) {
		this.signal(Update_Type, value);
	}

	get type() {
		return this.getModel().type;
	}

	set label(value) {
		this.signal(Update_Label, value);
	}

	get label() {
		return this.getModel().label;
	}

	set onClick(callback) {
		this._onClick = callback;
	}

	get onClick() {
		return this._onClick;
	}
}
