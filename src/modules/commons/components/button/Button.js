import { html } from 'lit-html';
import css from './button.css';
import { classMap } from 'lit-html/directives/class-map.js';
import { MvuElement } from '../../../MvuElement';


const Update_Disabled = 'update_disabled';
const Update_Label = 'update_label';
const Update_Type = 'update_type';

/**
 * Events;
 * - `onClick()`
 *
 *
 * Properties:
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
			disabled: false,
			label: 'label',
			type: 'secondary'
		});
		this._onClick = () => { };
	}

	update(type, data, model) {

		switch (type) {
			case Update_Disabled:
				return { ...model, disabled: data };
			case Update_Label:
				return { ...model, label: data };
			case Update_Type:
				return { ...model, type: data };
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

	/**
	 * @property {boolean} disabled=false - Button clickable?
	 */
	set disabled(value) {
		this.signal(Update_Disabled, value);
	}

	get disabled() {
		return this.getModel().disabled;
	}

	/**
	 * @property {string} type=secondary - Type of the button. One of 'primary', 'secondary'
	 */
	set type(value) {
		this.signal(Update_Type, value);
	}

	get type() {
		return this.getModel().type;
	}

	/**
	 * @property {string} label='' - Label of the button
	 */
	set label(value) {
		this.signal(Update_Label, value);
	}

	get label() {
		return this.getModel().label;
	}

	/**
	 * @property {function} onClick - Callback function
	 */
	set onClick(callback) {
		this._onClick = callback;
	}

	get onClick() {
		return this._onClick;
	}
}
