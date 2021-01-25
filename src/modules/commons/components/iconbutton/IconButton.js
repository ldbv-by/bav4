import { html } from 'lit-html';
import { BaElement } from '../../../BaElement';
import css from './iconbutton.css';
import { classMap } from 'lit-html/directives/class-map.js';

/**
 * 
 * @class
 * @author thiloSchlemmer
 */
export class IconButton extends BaElement {

	/**
	 * @override
	 */
	initialize() {
		//properties 'onClick' and 'disabled' are exposed via getter and setter
		this._onClick = () => { };
		this._disabled = this.getAttribute('disabled') === 'true';
		this._title = this.getAttribute('title') || '';	
	}


	onAfterRender(firsttime) {
		if (firsttime) {
			const slottable = this._root.querySelector('button');
			if(this._disabled) {
				slottable.classList.add('disabled');
			}
		}
	}

	/**
	 * @override
	 */
	createView() {
		const onClick = () => {
			this._onClick();
		};		

		const classes = {
			disabled: this._disabled
		};

		return html`
		<style>${css}</style>				 
		<button class='button ${classMap(classes)}' title=${this._title} ?disabled=${this._disabled} @click=${onClick}>
			<div class='slot'>
				<slot></slot>
			<div>
		</button>
		`;
	}

	static get tag() {
		return 'ba-icon-button';
	}

	static get observedAttributes() {
		return ['disabled'];
	}

	attributeChangedCallback(name, oldValue, newValue) {
		this.disabled = newValue;
	}

	set disabled(value) {
		if(value !== this.disabled) {
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
}