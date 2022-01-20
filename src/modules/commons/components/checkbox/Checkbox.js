import { html } from 'lit-html';
import { MvuElement } from '../../../MvuElement';
import css from './checkbox.css';

const Update_Disabled = 'update_disabled';
const Update_Checked = 'update_checked';
const Update_Title = 'update_title';

/**
 * Events:
 * - onToggle()
 *
 * Properties:
 * - `checked`
 * - `disabled`
 * - `title`
 *
 *
 * @class
 * @author alsturm
 * @author taulinger
 */
export class Checkbox extends MvuElement {

	constructor() {
		super({
			checked: false,
			disabled: false,
			title: ''
		});
	}

	/**
	 * @override
	 */
	onInitialize() {

		this._onToggle = () => { };

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

	update(type, data, model) {

		switch (type) {
			case Update_Checked:
				return { ...model, checked: data };

			case Update_Disabled:
				return { ...model, disabled: data };

			case Update_Title:
				return { ...model, title: data };
		}
	}

	/**
	 * @override
	 */
	createView(model) {
		const { title, disabled, checked } = model;

		const onChange = (event) => {
			const checked = event.target.checked;
			this.signal(Update_Checked, checked);
			this.dispatchEvent(new CustomEvent('toggle', {
				detail: { checked: checked }
			}));

			this._onToggle(event);
		};

		return html`
        <style>${css}</style>
		<input @change=${onChange} class="input" id="cbx" type="checkbox" style="display: none;" ?disabled=${disabled} .checked=${checked} />
		<label title='${title}' class="ba-checkbox" >
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

	_click() {
		this._root.querySelector('#cbx').click();
	}

	/**
	 * @property {string} title='' - The title of the button
	 */
	set title(value) {
		this.signal(Update_Title, value);
	}

	get title() {
		return this.getModel().title;
	}

	/**
	 * @property {boolean} disabled=false - Checkbox clickable?
	 */
	set disabled(value) {
		this.signal(Update_Disabled, value);
	}

	get disabled() {
		return this.getModel().disabled;
	}

	/**
	 * @property {boolean} checked=false - Checkbox checked?
	 */
	set checked(value) {
		this.signal(Update_Checked, value);
	}

	get checked() {
		return this.getModel().checked;
	}

	/**
	 * @property {function} onToggle - Callback function
	 */
	set onToggle(callback) {
		this._onToggle = callback;
	}

	get onToggle() {
		return this._onToggle;
	}
}
