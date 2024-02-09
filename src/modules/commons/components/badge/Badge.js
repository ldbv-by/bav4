/**
 * @module modules/commons/components/icon/Icon
 */
import { html, nothing } from 'lit-html';
import { MvuElement } from '../../../MvuElement';
import css from './badge.css';

const Update_Icon = 'update_icon';
const Update_Color = 'update_color';
const Update_Label = 'update_label';
const Update_Background = 'update_background';

/**
 * Badge with optional icon.
 *
 *
 * Properties:
 * - `icon`
 * - `color`
 * - `background`
 * - `label`
 *
 * @class
 * @author alsturm
 *
 *
 */
export class Badge extends MvuElement {
	constructor() {
		super({
			icon: null,
			label: 'label',
			color: 'var(--text3)',
			background: 'var(--secondary-color)'
		});
	}

	update(type, data, model) {
		switch (type) {
			case Update_Icon:
				return { ...model, icon: data };
			case Update_Label:
				return { ...model, label: data };
			case Update_Color:
				return { ...model, color: data };
			case Update_Background:
				return { ...model, background: data };
		}
	}

	/**
	 * @override
	 * @protected
	 */
	createView(model) {
		const { color, background, icon, label } = model;

		const badgeClass = `.badge {
			background: ${background}; 
			color: ${color}; 
		}`;

		const customIconClass = icon
			? `.icon {
			mask : url("${icon}");
			-webkit-mask-image : url("${icon}");
			background: ${color}; 
		}`
			: '';

		const getIcon = () => {
			return icon ? html`<span class="icon"></span>` : nothing;
		};

		return html`
			<style>
				${badgeClass}
				${customIconClass}
				${css}
			</style>
			<span class="badge">
				${getIcon()}
				<span class="text">${label}</span>
			</span>
		`;
	}

	static get tag() {
		return 'ba-badge';
	}

	/**
	 * @property {string} icon='default_svg_icon' - Data-URI of Base64 encoded SVG
	 */
	set icon(value) {
		this.signal(Update_Icon, value);
	}

	get icon() {
		return this.getModel().icon;
	}

	/**
	 * @property {string} color=var(--primary-color) - Color as Css variable
	 */
	set color(value) {
		this.signal(Update_Color, value);
	}

	get color() {
		return this.getModel().color;
	}
	/**
	 * @property {string} color=var(--primary-color) - Background as Css variable
	 */
	set background(value) {
		this.signal(Update_Background, value);
	}

	get background() {
		return this.getModel().background;
	}

	/**
	 * @property {string} label='' - Label of the Badge
	 */
	set label(value) {
		this.signal(Update_Label, value);
	}

	get label() {
		return this.getModel().label;
	}
}
