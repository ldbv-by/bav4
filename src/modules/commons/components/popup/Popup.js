import { html } from 'lit-html';
import { BaElement } from '../../../BaElement';
import css from './popup.css';
import { classMap } from 'lit-html/directives/class-map.js';


/**
 * Popup
 * 
 * Configurable Attributes:
 * - `type` (default=hide or show)
 * - `right` (in px)
 * - `top` (in px)
 * 
 * Observed Attributes:
 * - `type`
 * 
 * Configurable Properties / Methods:
 * - `type` (default=hide or show)
 * - `isOpen()`: true if popup is visible
 * - `openPopup()` 
 * - `closePopup()`
 * 
 * Observed Properties:
 * - `type` (default=hide or show)
 * 
 * Content is set via slot
 * 
 * @class
 * @author bakir_en
 */
export class Popup extends BaElement {


	/**
     *@override  
     */
	initialize() {
		this._type = this.getAttribute('type') || 'hide';
		this._right = this.getAttribute('right') || '0';
		this._top = this.getAttribute('top') || '0';  
	} 

	/**
     *@override 
     */
	createView() {
		if (this._type === 'show') {			
			var popup = this.shadowRoot.getElementById('this-popup');	
			popup.style.right = this._right + 'px';
			popup.style.top = this._top + 'px';
		} 
			
		const classes = {
			show: this._type === 'show',
		}; 

		return html`
        <style>${css}</style>
		<div class='popup' id=this-popup>
			<div class='popuptext ${classMap(classes)}' right=${this._right} top=${this._top}>
				 <slot></slot>
			</div>
        </div>  
        `;
	} 

	static get tag() {
		return 'ba-popup';
	} 

	static get observedAttributes() {
		return ['type'];
	}

	attributeChangedCallback(name, oldValue, newValue) {
		switch (name) {
			case 'type': 
				this.type = newValue; 
				break;
		} 
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

	/**
	 * @param {number} value
	 */
	set right(value) {
		this._right = value;
	}

	get right() {
		return this._right;
	} 

	/**
	 * @param {number} value
	 */
	set top(value) {
		this._top = value;
	}

	get top() {
		return this._top;
	} 

	/** 
	 *@private 
	 */
	isOpen() {
		return this._type === 'show';
	} 

	/**
	 *@private 
	 */
	openPopup() {
		this.setAttribute('type', 'show');
	}

	/**
	 *@private 
	 */
	closePopup() {
		this.setAttribute('type', 'hide');
	}	
	
} 