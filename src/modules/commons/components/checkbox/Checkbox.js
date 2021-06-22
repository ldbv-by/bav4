import { html } from 'lit-html';
import { BaElement } from '../../../BaElement';
import css from './checkbox.css';

/**
 * Checkbox.
 * 
 * Configurable Attributes:
 * - `onToggle()`
 * - `checked` (true|false)
 * - `disabled` (true|false)
 * - `title` 
 * 
 * Configurable Properties:
 * - `onToggle()`
 * - `checked` (default=false)
 * - `title` (default='')
 * - `disabled` (default=false)
 * 
 * @class
 * @author alsturm
 * @author taulinger
 */
export class Checkbox extends BaElement {


	/**
	 * @override
	 */
	initialize() {
		//properties 'onToggle', 'checked', 'disabled', 'title' are exposed via getter and setter
		this._onToggle = () => { };
		this._checked = this.getAttribute('checked') === 'true';
		this._disabled = this.getAttribute('disabled') === 'true';
		this.title = this.getAttribute('title') || '';

		this.addEventListener('click', (event) => {
			this._click();
			event.stopPropagation();
		});

		this.addEventListener('keydown', (event) => {
			//handle Enter and Space events
			if (event.key === 'Enter' || event.key === ' ') {
				this._click();
				event.preventDefault();
				event.stopPropagation();
			}
		});
	}

	/**
	 * @override
	 */
	createView() {
		const onChange = (event) => {
			const checked = event.target.checked;
			this.checked = checked;
			this.dispatchEvent(new CustomEvent('toggle', {
				detail: { checked: checked }
			}));

			this._onToggle(event);
		};

		return html`
        <style>${css}</style>
		<input @change=${onChange} class="input" id="cbx" type="checkbox" style="display: none;" ?disabled=${this._disabled} .checked=${this._checked} />
		<label title='${this._title}' class="ba-checkbox" >
		  		<span>
			  	<svg width="100%" height="100%" viewbox="0 0 12 9">
					<polyline points="1 5 4 8 11 1"></polyline>
			 	 </svg>
				</span>
				<span>
				<slot></slot>
				</span>
		 </label>
		`;
	}

	static get tag() {
		return 'ba-checkbox';
	}

	static get observedAttributes() {
		return ['disabled', 'checked', 'title'];
	}

	_click() {
		this._root.querySelector('#cbx').click();
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
		if (value !== this._title) {
			this._title = value;
			this.render();
		}
	}

	get title() {
		return this._title;
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

	set checked(value) {
		if (value !== this._checked) {
			this._checked = value;
			this.render();
		}
	}

	get checked() {
		return this._checked;
	}

	set onToggle(callback) {
		this._onToggle = callback;
	}

	get onToggle() {
		return this._onToggle;
	}
}
