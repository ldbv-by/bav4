import { html } from 'lit-html';
import { BaElement } from '../../../BaElement';
import css from './popup.css';
import { classMap } from 'lit-html/directives/class-map.js';


/**
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

		const classes = {
			show: this._type === 'show',
		}; 

		return html`
        <style>${css}</style>
		<div class='popup' id=this-popup>
			<span class='popuptext ${classMap(classes)}' right=${this._right} top=${this._top}>
				 <slot></slot>
			</span>
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
		switch(name) {
			case 'type': 
				this.type = newValue; 
				break;
		} 
	}

	set type(value) {
		this._type = value;
		if(this._type === 'show') {
			this._setPosition(this._right, this._top);
		} 
		this.render();
	}

	get type() {
		return this._type;
	}

	/**
	 * @param {number} value
	 */
	set right(value) {
		this._right = value;
		this.render();
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
	 * 
	 *
	 *@private 
	 *@param {string} right
	 *@param {string} top   
	 */
	_setPosition(right, top) {
		var popup = this.shadowRoot.getElementById('this-popup');	
		popup.style.right = right + 'px';
		popup.style.top = top + 'px';
		this.render();
	} 

	

} 