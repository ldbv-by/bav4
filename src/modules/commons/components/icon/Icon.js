import { html } from 'lit-html';
import { MvuElement } from '../../../MvuElement';
import css from './icon.css';
import { classMap } from 'lit-html/directives/class-map.js';

const Update_Disabled = 'update_disabled';
const Update_Icon = 'update_icon';
const Update_Size = 'update_size';
const Update_Color = 'update_color';
const Update_Color_Hover = 'update_hover';
const Update_Title = 'update_title';

const defaultIcon = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgZmlsbD0iY3VycmVudENvbG9yIiBjbGFzcz0iYmkgYmktYXJyb3ctdXAtY2lyY2xlLWZpbGwiIHZpZXdCb3g9IjAgMCAxNiAxNiI+PCEtLU1JVCBMaWNlbnNlLS0+CiAgPHBhdGggZD0iTTE2IDhBOCA4IDAgMSAwIDAgOGE4IDggMCAwIDAgMTYgMHptLTcuNSAzLjVhLjUuNSAwIDAgMS0xIDBWNS43MDdMNS4zNTQgNy44NTRhLjUuNSAwIDEgMS0uNzA4LS43MDhsMy0zYS41LjUgMCAwIDEgLjcwOCAwbDMgM2EuNS41IDAgMCAxLS43MDguNzA4TDguNSA1LjcwN1YxMS41eiIvPgo8L3N2Zz4=';
/**
 * Clickable icon.
 *
 *  Events:
 * - `onClick()`
 *
 * Properties:
 * - `icon`
 * - `size`
 * - `color`
 * - `color_hover`
 * - `title`
 * - `disabled`
 *
 * @class
 * @author taulinger
 * @author alsturm
 *
 *
 */
export class Icon extends MvuElement {

	constructor() {
		super({
			disabled: false,
			icon: defaultIcon,
			title: '',
			size: 2,
			color: 'var(--primary-color)',
			color_hover: 'var(--primary-color)'
		});
		this._onClick = () => { };
	}

	update(type, data, model) {
		switch (type) {
			case Update_Disabled:
				return { ...model, disabled: data };
			case Update_Icon:
				return { ...model, icon: data };
			case Update_Title:
				return { ...model, title: data };
			case Update_Size:
				return { ...model, size: data };
			case Update_Color:
				return { ...model, color: data };
			case Update_Color_Hover:
				return { ...model, color_hover: data };
		}
	}

	onInitialize() {
		/**
		 * To harmonize click event handling
		 * for both attribute and property callback, we register an event handler
		 * here on the render target
		 */
		this.getRenderTarget().addEventListener('click', (e) => {
			if (this.getModel().disabled) {
				e.stopPropagation();
			}
			else {
				this._onClick();
			}
		});
	}

	/**
	 * @override
	 * @protected
	 */
	createView(model) {
		const { size, color, color_hover, icon, disabled, title } = model;

		const iconClass = `.icon {
			--size: ${size}em; 
			background: ${color}; 
		}`;
		const anchorClassHover = color_hover ? `.anchor:hover .icon{
			transform: scale(1.1);
			background: ${color_hover}; 
		}` : '';
		const customIconClass = icon ? `.icon-custom {
			mask : url("${icon}");
			-webkit-mask-image : url("${icon}");
		}` : '';
		const anchorClass = `.anchor {
			--radius: ${size / 2}em;
			--size: ${size}em;
		}`;
		const anchorClassFocus = (color_hover !== color) ?
			`.anchor:focus .icon{
			transform: scale(1.1);
			background: ${color_hover};
		}
		.anchor:focus {
			  background: ${color};
			  box-shadow: 0 0 0 .2em var(--primary-color-lighter);
		}
		` : '';
		const classes = {
			disabled: disabled
		};

		return html`
			<style>
			${iconClass}
			${anchorClassHover}
			${customIconClass}
			${css}
			${anchorClass}
			${anchorClassFocus}
			</style>	
			<button class='anchor' title=${title}>
				<span class='icon icon-custom ${classMap(classes)}'></span >
			</button>
			`;
	}

	static get tag() {
		return 'ba-icon';
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

	/**
	 * @property {boolean} disabled=false - Icon clickable?
	 */
	set disabled(value) {
		this.signal(Update_Disabled, value);
	}

	get disabled() {
		return this.getModel().disabled;
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
	 * @property {number} size=2 - Size of the icon in em
	 */
	set size(value) {
		this.signal(Update_Size, value);
	}

	get size() {
		return this.getModel().size;
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
	 * @property {string} color_hover=var(--primary-color) - Hover color as Css variable. A value of `null` removes the hover effect.
	 */
	set color_hover(value) {
		this.signal(Update_Color_Hover, value);
	}

	get color_hover() {
		return this.getModel().color_hover;
	}

	/**
	 * @property {string} title='' - Title of the Icon
	 */
	set title(value) {
		this.signal(Update_Title, value);
	}

	get title() {
		return this.getModel().title;
	}
}
