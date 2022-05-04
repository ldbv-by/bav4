import { html, nothing } from 'lit-html';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';
import { BaElement } from '../BaElement';
import css from './baOverlay.css';
import { classMap } from 'lit-html/directives/class-map.js';

export const BaOverlayTypes = {
	TEXT: 'text',
	HELP: 'help'
};
/**
 * Internal overlay content for measurements on map-components
 *
 * Configurable Attributes:
 *
 * Observed Attributes:
 *
 * Configurable Properties:
 * - `type`
 * - `value`
 * - `static`
 * - `geometry`
 * - `projectionHints`
 *
 *
 * Observed Properties:
 * - `value`
 * - `static`
 * - `geometry`
 * - `position`
 * - `projectionHints`
 * @class
 * @author thiloSchlemmer
 */
export class BaOverlay extends BaElement {

	constructor() {
		super();
		this._value = null;
		this._static = false;
		this._type = BaOverlayTypes.TEXT;
		this._projectionHints = false;
		this._isDraggable = false;
	}

	/**
	 * @override
	 */
	createView() {
		const content = this._getContent(this._type);

		const classes = {
			help: this._type === BaOverlayTypes.HELP,
			static: this._static && this._type !== BaOverlayTypes.HELP,
			floating: !this._static && this._type !== BaOverlayTypes.HELP,
			draggable: this._isDraggable
		};

		return html`
			<style>${css}</style>
			<div class='ba-overlay ${classMap(classes)}'>
			${content ? unsafeHTML(content) : nothing}
			</div>
		`;
	}

	/**
	 * @protected
	 */
	_updatePosition() {
		this._position = this.geometry.getLastCoordinate();
	}

	/**
	 * Returns the displayable content of Overlay
	 * @protected
	 * @abstract
	 * @param {string|BaOverlayTypes} type the BaOverlayType
	 * @returns {string}
	 */
	_getContent(/*eslint-disable no-unused-vars */type) {
		return this._value;
	}

	static get tag() {
		return 'ba-map-overlay';
	}

	set value(val) {
		if (val !== this.value) {
			this._value = val;
			this.render();
		}
	}

	get value() {
		return this._value;
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

	set isDraggable(value) {
		if (value !== this.isDraggable) {
			this._isDraggable = value;
			this.render();
		}
	}

	get isDraggable() {
		return this._isDraggable;
	}

	set static(value) {
		if (value !== this.static) {
			this._static = value;
			this.render();
		}
	}

	get static() {
		return this._static;
	}

	set geometry(value) {
		this._geometry = value;
		this._updatePosition();
		this.render();
	}

	get geometry() {
		return this._geometry;
	}

	get position() {
		return this._position;
	}

	set projectionHints(value) {
		if (value.toProjection !== this.projectionHints.toProjection ||
			value.fromProjection !== this.projectionHints.fromProjection) {
			this._projectionHints = value;
			this.render();
		}
	}

	get projectionHints() {
		return this._projectionHints;
	}
}
