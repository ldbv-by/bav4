/**
 * @module modules/commons/components/guiSwitch/GuiSwitch
 */
import css from './guiSwitch.css';
import { html } from 'lit-html';
import { MvuElement } from '../../../MvuElement';
import { getPseudoStyle, getStyle } from '../../../../utils/style-utils';
import { TEST_ID_ATTRIBUTE_NAME } from '../../../../utils/markup';

const Update_Disabled = 'update_disabled';
const Update_Checked = 'update_checked';
const Update_Indeterminate = 'update_indeterminate';
const Update_Title = 'update_title';
const Update_Label = 'update_label';

/**
 * new 'nicer' toggle element based on https://web.dev/building-a-switch-component/
 *
 * Events:
 * - onToggle()
 *
 * Properties:
 * - `checked`
 * - `disabled`
 * - `indeterminate`
 * - `title`
 * - `label`
 *
 *
 * @class
 * @author nklein
 *
 *  todo: change pointer cursor when disabled for whole label
 *  todo: ignore dragging in wrong direction
 *  todo: more tests
 *
 */
export class GuiSwitch extends MvuElement {
	#switch = {};

	constructor() {
		super({
			checked: false,
			indeterminate: false,
			disabled: false,
			title: '',
			label: ''
		});
	}

	/**
	 * @override
	 */
	onInitialize() {
		this._onToggle = () => {};
		this.setAttribute(TEST_ID_ATTRIBUTE_NAME, '');
	}

	/**
	 * @override
	 */
	update(type, data, model) {
		switch (type) {
			case Update_Checked:
				this.dispatchEvent(
					new CustomEvent('toggle', {
						detail: { checked: data }
					})
				);
				if (this._onToggle) {
					this._onToggle(data);
				}

				return { ...model, checked: data, indeterminate: false };

			case Update_Indeterminate:
				return { ...model, indeterminate: data };

			case Update_Disabled:
				return { ...model, disabled: data };

			case Update_Title:
				return { ...model, title: data };

			case Update_Label:
				return { ...model, label: data };
		}
	}

	/**
	 * @override
	 */
	onAfterRender(firstTime) {
		if (firstTime) {
			const switchLabelElement = this.shadowRoot.querySelector('.ba-switch');
			this._state = {
				activethumb: null,
				recentlyDragged: false
			};

			const checkbox = switchLabelElement.querySelector('input');
			const thumbsize = getPseudoStyle(checkbox, 'width');
			const padding = getStyle(checkbox, 'padding-left') + getStyle(checkbox, 'padding-right');

			checkbox.addEventListener('pointerdown', (event) => {
				this._dragInit(event);
			});
			checkbox.addEventListener('pointerup', () => {
				this._dragEnd();
			});
			checkbox.addEventListener('click', (event) => {
				this._preventBubbles(event);
			});

			switchLabelElement.addEventListener('click', (event) => {
				this._labelClick(event);
			});

			this.#switch = {
				thumbsize,
				padding,
				bounds: {
					lower: 0,
					middle: (checkbox.clientWidth - padding) / 4,
					upper: checkbox.clientWidth - thumbsize - padding
				}
			};

			window.addEventListener('pointerup', () => {
				if (!this._state.activethumb) return;

				this._dragEnd();
			});
		}
	}

	/**
	 * @override
	 */
	createView(model) {
		const { checked, indeterminate, disabled, title, label } = model;

		const onChange = (event) => {
			const checked = event.target.checked;
			this.signal(Update_Checked, checked);
		};

		return html`
			<style>
				${css}
			</style>

			<label title="${title}" for="guiswitch" class="ba-switch">
				${label}
				<input
					@change=${onChange}
					id="guiswitch"
					type="checkbox"
					role="switch"
					.checked=${checked}
					.indeterminate=${indeterminate}
					.disabled=${disabled}
					tabindex="0"
				/>
			</label>
		`;
	}

	_dragInit(event) {
		if (event.target.disabled) return;

		this._state.activethumb = event.target;
		this._state.activethumb.addEventListener('pointermove', (event) => {
			this._dragging(event);
		});
		this._state.activethumb.style.setProperty('--thumb-transition-duration', '0s');
	}

	_dragging(event) {
		if (!this._state.activethumb) return;

		const { thumbsize, bounds, padding } = this.#switch;
		const directionality = getStyle(this._state.activethumb, '--isLTR');

		const track = directionality === -1 ? this._state.activethumb.clientWidth * -1 + thumbsize + padding : 0;

		let pos = Math.round(event.offsetX - thumbsize / 2);

		if (pos < bounds.lower) pos = 0;
		if (pos > bounds.upper) pos = bounds.upper;

		this._state.activethumb.style.setProperty('--thumb-position', `${track + pos}px`);
	}

	_dragEnd() {
		if (!this._state.activethumb) return;

		this._state.activethumb.checked = this._determineChecked();
		this.signal(Update_Checked, this._state.activethumb.checked);

		if (this._state.activethumb.indeterminate) {
			this._state.activethumb.indeterminate = false;
		}

		this._state.activethumb.style.removeProperty('--thumb-transition-duration');
		this._state.activethumb.style.removeProperty('--thumb-position');
		this._state.activethumb.removeEventListener('pointermove', this._dragging);
		this._state.activethumb = null;

		this._padRelease();
	}

	_padRelease() {
		this._state.recentlyDragged = true;

		setTimeout(() => {
			this._state.recentlyDragged = false;
		}, 300);
	}

	_preventBubbles(event) {
		if (this._state.recentlyDragged) {
			event.preventDefault();
			event.stopPropagation();
		}
	}

	_labelClick(event) {
		const target = event.target;
		const checkbox = target.querySelector('input');

		if (this._state.recentlyDragged || !target.classList.contains('ba-switch') || checkbox.disabled) {
			return;
		}

		this.signal(Update_Checked, !checkbox.checked);
		event.preventDefault();
	}

	_determineChecked() {
		const { bounds } = this.#switch;
		let curpos = Math.abs(parseInt(this._state.activethumb.style.getPropertyValue('--thumb-position')));

		if (!curpos) {
			curpos = this._state.activethumb.checked ? bounds.lower : bounds.upper;
		}

		return curpos >= bounds.middle;
	}

	/**
	 * @property {boolean} indeterminate = false - Checkbox is indeterminate
	 */
	set indeterminate(value) {
		this.signal(Update_Indeterminate, value);
	}

	get indeterminate() {
		return this.getModel().indeterminate;
	}

	/**
	 * @property {string} title = '' - The title of the button
	 */
	set title(value) {
		this.signal(Update_Title, value);
	}

	get title() {
		return this.getModel().title;
	}

	/**
	 * @property {string} label = '' - The label of the button
	 */
	set label(value) {
		this.signal(Update_Label, value);
	}

	get label() {
		return this.getModel().label;
	}

	/**
	 * @property {boolean} disabled = false - Checkbox is clickable
	 */
	set disabled(value) {
		this.signal(Update_Disabled, value);
	}

	get disabled() {
		return this.getModel().disabled;
	}

	/**
	 * @property {boolean} checked = false - Checkbox is checked
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
		return 'ba-switch';
	}
}
