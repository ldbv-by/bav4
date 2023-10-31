/**
 * @module modules/commons/components/guiSwitch/GuiSwitch
 */
import css from './guiSwitch.css';
import { html } from 'lit-html';
import { MvuElement } from '../../../MvuElement';
import { getPseudoStyle, getStyle } from '../../../../utils/style-utils';
import { TEST_ID_ATTRIBUTE_NAME } from '../../../../utils/markup';
import { isFunction } from '../../../../utils/checks';

const Update_Disabled = 'update_disabled';
const Update_Checked = 'update_checked';
const Update_Indeterminate = 'update_indeterminate';
const Update_Title = 'update_title';
// eslint-disable-next-line no-unused-vars
const Toggle_No_Op = (checked) => {};

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
 *
 *
 * @class
 * @author nklein
 * @author thiloSchlemmer
 *
 * @property {boolean} checked = false - The checkbox is whether checked or not.
 * @property {boolean} indeterminate = false - The checkbox has an indeterminate state.
 * @property {string} title = '' - The title of the button.
 * @property {boolean} disabled = false - The checkbox react on user interactions or not.
 * @property {function(checked)} onToggle - The toggle event fires when the checked state of a GuiSwitch element is toggled.
 */
export class GuiSwitch extends MvuElement {
	#switch = {};
	#onToggle = Toggle_No_Op;
	#activeThumb = null;
	#recentlyDragged = false;
	#dragging = false;

	constructor() {
		super({
			checked: false,
			indeterminate: false,
			disabled: false,
			title: ''
		});
	}

	onInitialize() {
		this.setAttribute(TEST_ID_ATTRIBUTE_NAME, '');
	}

	update(type, data, model) {
		const returnAndPropagate = (data) => {
			this.dispatchEvent(
				new CustomEvent('toggle', {
					detail: { checked: data }
				})
			);
			this.#onToggle(data);

			return data;
		};

		switch (type) {
			case Update_Checked:
				return { ...model, checked: returnAndPropagate(data), indeterminate: false };

			case Update_Indeterminate:
				return { ...model, indeterminate: data };

			case Update_Disabled:
				return { ...model, disabled: data };

			case Update_Title:
				return { ...model, title: data };
		}
	}

	onAfterRender(firstTime) {
		if (firstTime) {
			const checkbox = this.shadowRoot.querySelector('input');
			const thumbSize = getPseudoStyle(checkbox, 'width');
			const padding = getStyle(checkbox, 'padding-left') + getStyle(checkbox, 'padding-right');

			this.#switch = {
				thumbSize: thumbSize,
				padding,
				bounds: {
					lower: 0,
					middle: (checkbox.clientWidth - padding) / 4,
					upper: checkbox.clientWidth - thumbSize - padding
				}
			};
		}
	}

	createView(model) {
		const { checked, indeterminate, disabled, title } = model;

		const onChange = (event) => {
			const checked = event.target.checked;
			this.signal(Update_Checked, checked);
		};

		return html`
			<style>
				${css}
			</style>

			<label title="${title}" for="guiSwitch" @click=${(e) => this._labelClick(e)} class="ba-switch  ${disabled ? 'cursor-disabled' : ''}">
				<slot name="before"></slot>
				<input
					@change=${onChange}
					@pointerdown=${(event) => this._dragInit(event)}
					@pointerup=${() => this._dragEnd()}
					@click=${(event) => this._preventBubbles(event)}
					@keydown=${(event) => this._keydown(event)}
					id="guiSwitch"
					type="checkbox"
					role="switch"
					.checked=${checked}
					.indeterminate=${indeterminate}
					.disabled=${disabled}
					tabindex="0"
				/>
				<slot name="after"></slot>
				<slot></slot>
			</label>
		`;
	}

	_dragInit(event) {
		if (event.target.disabled) return;

		this.#activeThumb = event.target;
		this.#activeThumb.addEventListener('pointermove', (event) => {
			this._dragging(event);
		});
		window.addEventListener('pointerup', () => this._dragEnd(), { once: true });
		this.#activeThumb.style.setProperty('--thumb-transition-duration', '0s');
		this.#activeThumb.style.setProperty('--thumb-position', this._calculateThumbPosition(event.offsetX));
	}

	_dragging(event) {
		if (this.#activeThumb) {
			this.#activeThumb.style.setProperty('--thumb-position', this._calculateThumbPosition(event.offsetX));
			this.#dragging = true;
		}
	}

	_calculateThumbPosition(offsetX) {
		const getHarmonizedPosition = (offsetX, thumbSize, bounds) => {
			const rawPosition = Math.round(offsetX - thumbSize / 2);

			return rawPosition < bounds.lower ? 0 : rawPosition > bounds.upper ? bounds.upper : rawPosition;
		};

		const { thumbSize, bounds, padding } = this.#switch;
		const directionality = getStyle(this.#activeThumb, '--isLTR');
		const track = directionality === -1 ? this.#activeThumb.clientWidth * -1 + thumbSize + padding : 0;

		const position = getHarmonizedPosition(offsetX, thumbSize, bounds);
		return `${track + position}px`;
	}

	_dragEnd() {
		if (!this.#activeThumb) return;

		this.#activeThumb.checked = this.#dragging ? this._determineChecked() : !this._determineChecked();
		this.signal(Update_Checked, this.#activeThumb.checked);
		if (this.#activeThumb.indeterminate) {
			this.#activeThumb.indeterminate = false;
		}

		this.#activeThumb.style.removeProperty('--thumb-transition-duration');
		this.#activeThumb.style.removeProperty('--thumb-position');
		this.#activeThumb.removeEventListener('pointermove', this._dragging);
		this.#activeThumb = null;
		this.#dragging = false;

		this._padRelease();
	}

	_padRelease() {
		this.#recentlyDragged = true;

		setTimeout(() => {
			this.#recentlyDragged = false;
		}, 300);
	}

	_preventBubbles(event) {
		if (this.#recentlyDragged) {
			event.preventDefault();
			event.stopPropagation();
		}
	}

	_keydown(event) {
		const target = event.target;
		if (target.disabled) {
			return;
		}

		if (event.key === ' ') {
			this.signal(Update_Checked, !target.checked);

			event.preventDefault();
			event.stopPropagation();
		}
	}

	_labelClick(event) {
		const target = event.target;
		const checkbox = target.querySelector('input');

		if (this.#recentlyDragged || !target.classList.contains('ba-switch') || checkbox.disabled) {
			return;
		}

		this.signal(Update_Checked, !checkbox.checked);
		event.preventDefault();
	}

	_determineChecked() {
		const { bounds } = this.#switch;
		const currentPosition = parseInt(this.#activeThumb.style.getPropertyValue('--thumb-position'));
		return currentPosition >= bounds.middle;
	}

	set indeterminate(value) {
		this.signal(Update_Indeterminate, value);
	}

	get indeterminate() {
		return this.getModel().indeterminate;
	}

	set title(value) {
		this.signal(Update_Title, value);
	}

	get title() {
		return this.getModel().title;
	}

	set disabled(value) {
		this.signal(Update_Disabled, value);
	}

	get disabled() {
		return this.getModel().disabled;
	}

	set checked(value) {
		this.signal(Update_Checked, value);
	}

	get checked() {
		return this.getModel().checked;
	}
	set onToggle(callback) {
		this.#onToggle = callback && isFunction(callback) ? callback : Toggle_No_Op;
	}

	get onToggle() {
		return this.#onToggle;
	}

	static get tag() {
		return 'ba-switch';
	}
}
