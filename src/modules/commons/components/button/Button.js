/**
 * @module modules/commons/components/button/Button
 */
import { html, nothing } from 'lit-html';
import css from './button.css';
import { classMap } from 'lit-html/directives/class-map.js';
import { MvuElement } from '../../../MvuElement';
import { TEST_ID_ATTRIBUTE_NAME } from '../../../../utils/markup';

const Update_Disabled = 'update_disabled';
const Update_Label = 'update_label';
const Update_Type = 'update_type';
const Update_Icon = 'update_icon';

/**
 * Events;
 * - `onClick()`
 *
 *
 * Properties:
 * - `label`
 * - `disabled`
 * - `icon`
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
			icon: null,
			type: 'secondary'
		});
		this._onClick = () => {};
	}

	onInitialize() {
		this.setAttribute(TEST_ID_ATTRIBUTE_NAME, '');
	}

	update(type, data, model) {
		switch (type) {
			case Update_Disabled:
				return { ...model, disabled: data };
			case Update_Label:
				return { ...model, label: data };
			case Update_Type:
				return { ...model, type: data };
			case Update_Icon:
				return { ...model, icon: data };
		}
	}

	/**
	 * @override
	 */
	createView(model) {
		const { disabled, label, icon, type } = model;
		const onClick = () => {
			this._onClick();
		};

		const classes = {
			primary: type === 'primary',
			loading: type === 'loading',
			secondary: type === 'secondary',
			disabled: disabled,
			iconbutton: icon
		};

		const iconClass = `.icon {
			mask : url("${icon}");
			-webkit-mask-image : url("${icon}");
			mask-size: cover;
			-webkit-mask-size: cover;
		}`;

		const getIconStyle = () => {
			return icon
				? html`<style>
						${iconClass}
					</style>`
				: nothing;
		};

		const getIcon = () => {
			return icon ? html`<span class="icon"></span>` : nothing;
		};

		return html`
			<style>
				${css}
			</style>
			${getIconStyle()}
			<button class="button ${classMap(classes)}" ?disabled=${disabled} @click=${onClick}>${getIcon()} ${label}</button>
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
	 * @property {string} type=secondary - Type of the button. One of 'primary', 'secondary', 'loading'
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
	 * @property {string} icon='null' - Data-URI of Base64 encoded SVG
	 */
	set icon(value) {
		this.signal(Update_Icon, value);
	}

	get icon() {
		return this.getModel().icon;
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
