/**
 * @module modules/commons/components/checkbox/Checkbox
 */
import { html } from 'lit-html';
import { TEST_ID_ATTRIBUTE_NAME } from '../../../../utils/markup';
import { MvuElement } from '../../../MvuElement';
import css from './checkbox.css';
import { classMap } from 'lit-html/directives/class-map.js';

const Update_Disabled = 'update_disabled';
const Update_Checked = 'update_checked';
const Update_Title = 'update_title';
const Update_Type = 'update_type';

/**
 * * Basic checkbox component.
 *
 * @property {boolean} checked='false' - The state of the checkbox.
 * @property {boolean} disabled=false - The checkbox react on user interactions or not.
 * @property {string|null} title=null - The title of the checkbox.
 * @property {'check'| 'eye'} type=check - The type of the checkbox.
 * @fires toggle The onToggle event fires when the checkbox is clicked.
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
			title: '',
			type: 'check'
		});
	}

	/**
	 * @override
	 */
	onInitialize() {
		this._onToggle = () => {};

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

		this.setAttribute(TEST_ID_ATTRIBUTE_NAME, '');
	}

	update(type, data, model) {
		switch (type) {
			case Update_Checked:
				return { ...model, checked: data };

			case Update_Disabled:
				return { ...model, disabled: data };

			case Update_Title:
				return { ...model, title: data };

			case Update_Type:
				return { ...model, type: data };
		}
	}

	/**
	 * @override
	 */
	createView(model) {
		const { title, disabled, checked, type } = model;

		const classes = {
			check: type === 'check',
			eye: type === 'eye'
		};

		const onChange = (event) => {
			const checked = event.target.checked;
			this.signal(Update_Checked, checked);
			this.dispatchEvent(
				new CustomEvent('toggle', {
					detail: { checked: checked }
				})
			);

			this._onToggle(event);
		};

		const getSvg = () => {
			switch (type) {
				case 'eye':
					return html`<svg width="100%" height="100%" viewBox="0 0 16 16">
						<path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0" />
						<path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8m8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7" />
					</svg>`;
				case 'check':
					return html`<svg width="100%" height="100%" viewbox="0 0 12 9"><polyline points="1 5 4 8 11 1"></polyline></svg>`;
			}
		};

		return html`
			<style>
				${css}
			</style>
			<input @change=${onChange} class="input" id="cbx" type="checkbox" style="display: none;" ?disabled=${disabled} .checked=${checked} />
			<label title="${title}" class="ba-checkbox ${classMap(classes)}">
				<span part="checkbox-background"> ${getSvg()} </span>
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
	 * @property {string} title='' - The title of the checkbox
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
	 * @property {string} type='check' - The type of the checkbox
	 */
	set type(value) {
		this.signal(Update_Type, value);
	}

	get type() {
		return this.getModel().type;
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
