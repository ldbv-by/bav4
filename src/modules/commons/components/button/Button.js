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
const Update_Title = 'update_title';

/**
 * Basic button component, to combine standard use-cases (button with icon, with text...etc) in a general component.
 *
 * @property {string} label='' - The label of the button.
 * @property {boolean} disabled=false - The button react on user interactions or not.
 * @property {string|null} icon=null - The Data-URI of a Base64-encoded SVG resource.
 * @property {'primary'| 'secondary'| 'loading'} type=secondary - The type of the button.
 * @property {string|null} title=null - The title of the button. The value is also used for the aria-label attribute.
 * @fires onClick The onClick event fires when the button is clicked.
 *
 * @class
 * @author taulinger
 */
export class Button extends MvuElement {
	#onClick = () => {};
	constructor() {
		super({
			disabled: false,
			label: 'label',
			icon: null,
			type: 'secondary',
			title: null
		});
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
			case Update_Title:
				return { ...model, title: data };
		}
	}

	/**
	 * @override
	 */
	createView(model) {
		const { disabled, label, icon, type, title } = model;
		const onClick = () => {
			this.#onClick();
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
			return icon ? html`<span class="icon" part="icon"></span>` : nothing;
		};

		return html`
			<style>
				${css}
			</style>
			${getIconStyle()}
			<button class="button ${classMap(classes)}" title=${title} aria-label=${title} ?disabled=${disabled} @click=${onClick} part="button">
				${getIcon()} ${label}
			</button>
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

	set title(value) {
		this.signal(Update_Title, value);
	}

	get title() {
		return this.getModel().title;
	}

	set icon(value) {
		this.signal(Update_Icon, value);
	}

	get icon() {
		return this.getModel().icon;
	}

	set onClick(callback) {
		this.#onClick = callback;
	}

	get onClick() {
		return this.#onClick;
	}
}
