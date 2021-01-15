import { html } from 'lit-html';
import { BaElement } from '../../../BaElement';
import css from './toggle.css';
import { classMap } from 'lit-html/directives/class-map.js';


/**
 * 
 * @class
 * @author aul
 */
export class Toggle extends BaElement {


	/**
	 * @override
	 */
	initialize() {
		//properties 'onChange', 'checked', 'disabled', 'title' are exposed via getter and setter
		this._onChange = () => { };
		this._checked = this.getAttribute('checked') === 'true';
		this._disabled = this.getAttribute('disabled') === 'true';
		this.title = this.getAttribute('title') || '';
	}


	/**
	 * @override
	 */
	createView() {

		const onChange = (event) => {
			this._onChange(event);
		};

		const classes = {
			disabled: this._disabled,
			active: this._checked,
		};

		return html`
        <style>${css}</style>
        <label title='${this._title}' class='switch ${classMap(classes)}'>
            <slot></slot>
			<div>
		  		<input type='checkbox' @change=${onChange} ?disabled=${this._disabled} ?checked=${this._checked}>
		  		<span class='slider round'></span>
			</div>
	  	</label>
		`;
	}

	static get tag() {
		return 'ba-toggle';
	}

	static get observedAttributes() {
		return ['disabled', 'checked', 'title'];
	}

	attributeChangedCallback(name, oldValue, newValue) {
		switch (name) {
			case 'disabled':
				this.disabled = (newValue === 'true');
				break;
			case 'checked':
				this.checked = (newValue === 'true');
				break;
			case 'title':
				this.title = newValue;
				break;
		}
	}

	set title(value) {
		this._title = value;
		this.render();
	}

	get title() {
		return this._title;
	}

	set disabled(value) {
		this._disabled = value;
		this.render();
	}

	get disabled() {
		return this._disabled;
	}

	set checked(value) {
		this._checked = value;
		this.render();
	}

	get checked() {
		return this._checked;
	}

	set onChange(callback) {
		this._onChange = callback;
	}

	get onChange() {
		return this._onChange;
	}
}