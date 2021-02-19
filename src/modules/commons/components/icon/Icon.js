import { html } from 'lit-html';
import { BaElement } from '../../../BaElement';
import css from './icon.css';
import { classMap } from 'lit-html/directives/class-map.js';
/**
 * Clickable icon.
 * 
 * Configurable Attributes:
 * - `icon` (svg)
 * - `size` (in px)
 * - `color` (css color value)
 * - `title` 
 * - `disabled` (default=false)
 * - `onClick()`
 * 
 * Observed Attributes:
 * - `disabled`
 * 
 * Configurable Properties:
 * - `disabled` (default=false)
 * - `onClick()`
 * 
 * Observed Properties:
 * - `disabled`
 * 
 * 
 * @class
 * 
 * 
 */
export class Icon extends BaElement {

	/**
	 * @override
	 * @protected
	 */
	initialize() {
		this._icon = this.getAttribute('icon') || null;
		this._onClick = () => { };
		this._disabled = this.getAttribute('disabled') === 'true';
		this._title = this.getAttribute('title') || '';
		this._size = this.getAttribute('size') ? parseInt(this.getAttribute('size')) : 25;
		this._color = this.getAttribute('color') ? this.getAttribute('color') : 'var(--primary-color)';
	}


	/**
	 * @override
	 * @protected
	 */
	createView() {
		const onClick = () => {
			if (!this._disabled) {
				this._onClick();
			}
		};

		const iconClass = `.icon {
			--size: ${this._size}px; 
			background: ${this._color}; 
		}`;
		const customIconClass = this._icon ? `.icon-custom {
			mask : url("${this._icon}");
			-webkit-mask-image : url("${this._icon}");
		}` : '';

		const classes = {
			disabled: this._disabled
		};

		return html`
		<style>
		${iconClass}
		${customIconClass}
		${css}
		</style>	
		<a class='anchor' title=${this._title} ?disabled=${this._disabled} @click=${onClick}>
		<span class='icon icon-custom ${classMap(classes)}'></span >
		</a>
			`;
	}

	static get tag() {
		return 'ba-icon';
	}

	static get observedAttributes() {
		return ['disabled'];
	}

	attributeChangedCallback(name, oldValue, newValue) {
		this.disabled = newValue;
	}

	set disabled(value) {
		if (value !== this._disabled) {
			this._disabled = value;
			this.render();
		}
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

	get icon() {
		return this._icon;
	}

	get size() {
		return this._size;
	}

	get color() {
		return this._color;
	}
}