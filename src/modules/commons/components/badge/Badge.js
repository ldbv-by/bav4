/**
 * @module modules/commons/components/badge/Badge
 */
import { html, nothing } from 'lit-html';
import { MvuElement } from '../../../MvuElement';
import css from './badge.css';

const Update_Label = 'update_label';
const Update_Title = 'update_title';
const Update_Icon = 'update_icon';
const Update_Size = 'update_size';
const Update_Color = 'update_color';
const Update_Background = 'update_background';

/**
 * Badge with optional icon.
 *
 *
 * Properties:
 * - `label`
 * - `title`
 * - `icon`
 * - `size`
 * - `color`
 * - `background`
 *
 * @class
 * @author alsturm
 */
export class Badge extends MvuElement {
	constructor() {
		super({
			label: '',
			title: '',
			icon: null,
			size: 0.8,
			color: 'var(--text1)',
			background: 'var(--secondary-bg-color)'
		});
	}

	update(type, data, model) {
		switch (type) {
			case Update_Label:
				return { ...model, label: data };
			case Update_Title:
				return { ...model, title: data };
			case Update_Icon:
				return { ...model, icon: data };
			case Update_Size:
				return { ...model, size: data };
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
		const { color, background, icon, label, size, title } = model;

		const badgeClass = `.badge {
			--size: ${size}rem; 
			background: ${background}; 
			color: ${color}; 
			font-size: var(--size);
		}`;

		const customIconClass = icon
			? `.icon {
			mask : url("${icon}");
			-webkit-mask-image : url("${icon}");
			background: ${color}; 
			height:var(--size);
			width:var(--size);
			mask-size: cover;
		}`
			: '';

		const getIcon = () => {
			return icon ? html`<span class="icon"></span>` : nothing;
		};

		return html`
			<style>
				${css}
				${badgeClass}
				${customIconClass}
			</style>
			<span class="badge" title=${title}>
				${getIcon()}
				<span class="text">${label}</span>
			</span>
		`;
	}

	static get tag() {
		return 'ba-badge';
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

	/**
	 * @property {string} title='' - Title of the Badge
	 */
	set title(value) {
		this.signal(Update_Title, value);
	}

	get title() {
		return this.getModel().title;
	}

	/**
	 * @property {string} icon='' - Data-URI of Base64 encoded SVG
	 */
	set icon(value) {
		this.signal(Update_Icon, value);
	}

	get icon() {
		return this.getModel().icon;
	}

	/**
	 * @property {string} color=var(--text1) - Color as Css variable
	 */
	set color(value) {
		this.signal(Update_Color, value);
	}

	get color() {
		return this.getModel().color;
	}

	/**
	 * @property {string} color=var(--secondary-bg-color) - Background as Css variable
	 */
	set background(value) {
		this.signal(Update_Background, value);
	}

	get background() {
		return this.getModel().background;
	}

	/**
	 * @property {number} size=.8 - Size of the Badge in rem
	 */
	set size(value) {
		this.signal(Update_Size, value);
	}

	get size() {
		return this.getModel().size;
	}
}
