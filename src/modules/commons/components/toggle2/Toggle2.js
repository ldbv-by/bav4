/**
 * @module modules/commons/components/toggle2/Toggle2
 */
// import { open as openMainMenu, setTab, toggle } from '../../../store/mainMenu/mainMenu.action';
// import { TabIds } from '../../../domain/mainMenu';
// import { $injector } from '../../../injection';
import css from './toggle2.css';
import { html } from 'lit-html';
import { classMap } from 'lit-html/directives/class-map.js';
import { MvuElement } from '../../../MvuElement';
import { TEST_ID_ATTRIBUTE_NAME } from '../../../../utils/markup';

const Update_Disabled = 'update_disabled';
const Update_Checked = 'update_checked';
const Update_Indeterminate = 'update_indeterminate';
const Update_Title = 'update_title';

/**
 * new 'nicer' toggle element
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
 * @author nklein
 */
export class GuiSwitch extends MvuElement {
	constructor() {
		super({
			checked: false,
			indeterminate: false,
			disabled: false,
			title: ''
		});
	}

	update(type, data, model) {
		switch (type) {
			case Update_Checked:
				console.log('🚀 ~ Update_Checked ~ data:', data);
				return { ...model, checked: data, indeterminate: false };

			case Update_Indeterminate:
				console.log('🚀 ~ Update_Indeterminate ~ data:', data);
				return { ...model, indeterminate: data };

			case Update_Disabled:
				return { ...model, disabled: data };

			case Update_Title:
				return { ...model, title: data };
		}
	}

	onInitialize() {
		this._onToggle = () => {};
		this.setAttribute(TEST_ID_ATTRIBUTE_NAME, '');
	}

	createView(model) {
		const { checked, indeterminate, disabled, title } = model;
		console.log('🚀 ~ GuiSwitch ~ createView ~ indeterminate:', indeterminate);

		const onChange = (event) => {
			console.log('🚀 ~ GuiSwitch ~ onChange ');
			const checked = event.target.checked;
			this.signal(Update_Checked, checked);
			this.dispatchEvent(
				new CustomEvent('toggle', {
					detail: { checked: checked }
				})
			);
			this._onToggle(event);
		};

		// const classes = {
		// 	disabled: disabled,
		// 	active: checked
		// };

		// const shadowRoot = this.shadowRoot;
		// console.log('🚀 ~ GuiSwitch ~ createView ~ this.shadowRoot:', shadowRoot);
		// const myswitch = shadowRoot.getElementById('myswitch');
		// console.log('🚀 ~ GuiSwitch ~ createView ~ myswitch:', myswitch);

		// // console.log('🚀 ~ GuiSwitch ~ createView ~ this.shadowRoot:', this.shadowRoot);
		// // const guiswitch = this.shadowRoot.querySelector('.toggle2');
		// // console.log('🚀 ~ GuiSwitch ~ createView ~ guiswitch:', guiswitch);
		// // const label = this.shadowRoot.querySelector('label');
		// // console.log('🚀 ~ GuiSwitch ~ createView ~ label:', label);
		// // const input = this.shadowRoot.querySelector('input');
		// // console.log('🚀 ~ GuiSwitch ~ createView ~ input:', input);

		// // const guiSwitch = this.shadowRoot.querySelector('.toggle2');
		// // console.log('🚀 ~ GuiSwitch ~ createView ~ guiSwitch:', guiSwitch);
		// // if (guiSwitch !== null) {
		// const inputElement = this.shadowRoot.querySelectorAll('input');
		// console.log('🚀 ~ GuiSwitch ~ createView ~ inputElement:', inputElement);
		// if (inputElement !== null && inputElement.length > 0) {
		// 	inputElement[0].setAttribute('indeterminate', indeterminate);
		// }
		// // }

		return html`
			<style>
				${css}
			</style>

			<label class="toggle2">
				<input id="myswitch" type="checkbox" ?checked=${checked} @change=${onChange} ?indeterminate=${indeterminate} tabindex="0" />
				<span class="gui-slider"></span>
			</label>
		`;
	}

	/** 
     * 	<label class="switch ${classMap(classes)}" title="${title}">
				<input type="checkbox" @change=${onChange} ?disabled=${disabled} .checked=${checked} .indeterminate=${indeterminate} tabindex="0" />
				<span class="slider${checked ? ' checked' : ''} ${indeterminate ? 'indeterminate' : ''}"></span>
			</label>
     * 
	 */

	/**
	 * @property {boolean} indeterminate=false - Checkbox indeterminate?
	 */
	set indeterminate(value) {
		console.log('🚀 ~ GuiSwitch ~ setindeterminate ~ value:', value);

		this.signal(Update_Indeterminate, value);

		// console.log('🚀 ~ GuiSwitch ~ setindeterminate ~ this.shadowRoot:', this.shadowRoot);
		// const inputElement = this.shadowRoot.querySelector('.toggle2 > input');
		// console.log('🚀 ~ GuiSwitch ~ setindeterminate ~ inputElement:', inputElement);
		// if (inputElement) {
		// 	inputElement.indeterminate = true;
		// }
	}

	get indeterminate() {
		return this.getModel().indeterminate;
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

	static get tag() {
		return 'toggle2';
	}
}
