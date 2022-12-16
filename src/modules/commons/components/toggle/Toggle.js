import { html } from 'lit-html';
import css from './toggle.css';
import { classMap } from 'lit-html/directives/class-map.js';
import { MvuElement } from '../../../MvuElement';
import { TEST_ID_ATTRIBUTE_NAME } from '../../../../utils/markup';

const Update_Disabled = 'update_disabled';
const Update_Checked = 'update_checked';
const Update_Title = 'update_title';

/**
 *
 * Events:
 * - onToggle()
 *
 * Properties:
 * - `checked`
 * - `disabled`
 * - `title`
 *
 * @class
 * @author taulinger
 */
export class Toggle extends MvuElement {

	constructor() {
		super({
			checked: false,
			disabled: false,
			title: ''
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

	onInitialize() {
		this._onToggle = () => { };

		this.addEventListener('click', (event) => {
			this._click();
			event.stopPropagation();
		});

		this.setAttribute(TEST_ID_ATTRIBUTE_NAME, '');
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
		const classes = {
			disabled: disabled,
			active: checked
		};

		return html`
        <style>${css}</style>
        <label title='${title}' class='switch ${classMap(classes)}'>
            <slot></slot>
			<div>
		  		<input type='checkbox' @change=${onChange} ?disabled=${disabled} .checked=${checked}>
		  		<span class='slider round'></span>
			</div>
	  	</label>
		`;
	}

	static get tag() {
		return 'ba-toggle';
	}

	_click() {
		this._root.querySelector('.switch').click();
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
