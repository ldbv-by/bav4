/**
 * @module modules/commons/components/switch/Switch
 */
import css from './switch.css';
import { html } from 'lit-html';
import { MvuElement } from '../../../MvuElement';
import { TEST_ID_ATTRIBUTE_NAME } from '../../../../utils/markup';
import { isFunction } from '../../../../utils/checks';

const Update_Disabled = 'update_disabled';
const Update_Checked = 'update_checked';
const Update_Checked_Propagate = 'update_checked_propagate';
const Update_Indeterminate = 'update_indeterminate';
const Update_Title = 'update_title';

/**
 * Returns a number representing the integer value of the specified CSS property
 * @param {Element} element
 * @param {string} property
 * @returns {number} the number value
 */
const getComputedStyleProperty = (element, property, pseudoElement = null) =>
	parseInt(window.getComputedStyle(element, pseudoElement).getPropertyValue(property));

// eslint-disable-next-line no-unused-vars
const Toggle_No_Op = (checked) => {};

export const PAD_RELEASE_TIMEOUT = 300;

/**
 * A toggle web component based on {@link https://web.dev/building-a-switch-component/}
 *
 * @class
 * @author nklein
 * @author thiloSchlemmer
 *
 * @property {boolean} checked=false - The checkbox is whether checked or not.
 * @property {boolean} indeterminate=false - The checkbox has an indeterminate state.
 * @property {string} title='' - The title of the button.
 * @property {boolean} disabled=false - The checkbox react on user interactions or not.
 * @property {function(checked)} onToggle - The toggle callback function when the checked state of a Switch element is toggled.
 * @fires onToggle The toggle event fires when the checked state of a Switch element is toggled
 */
export class Switch extends MvuElement {
	#switch = {};
	#onToggle = Toggle_No_Op;
	#recentlyDragged = false;
	#dragging = false;
	#draggingListener = null;

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
			if (data !== model.checked) {
				this.dispatchEvent(
					new CustomEvent('toggle', {
						detail: { checked: data }
					})
				);
				this.#onToggle(data);
			}

			return data;
		};

		switch (type) {
			case Update_Checked_Propagate:
				return { ...model, checked: returnAndPropagate(data), indeterminate: false };
			case Update_Checked:
				return { ...model, checked: data, indeterminate: false };
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
			const thumbSize = getComputedStyleProperty(checkbox, 'width', '::before');
			const padding = getComputedStyleProperty(checkbox, 'padding-left') + getComputedStyleProperty(checkbox, 'padding-right');
			const width = getComputedStyleProperty(checkbox, 'width');

			this.#switch = {
				thumbSize: thumbSize,
				padding: padding,
				bounds: {
					lower: 0,
					middle: (width - padding) / 4,
					upper: width - thumbSize / 2 - padding
				}
			};
		}
	}

	createView(model) {
		const { checked, indeterminate, disabled, title } = model;

		const onLabelClick = (event) => {
			const target = event.target;
			const checkbox = target.querySelector('input');

			if (this.#recentlyDragged || !target.classList.contains('ba-switch') || checkbox.disabled) {
				return;
			}

			this.signal(Update_Checked_Propagate, !checkbox.checked);
			event.preventDefault();
		};

		const onChange = (event) => {
			const checked = event.target.checked;
			this.signal(Update_Checked_Propagate, checked);
		};

		const onPointerup = () => {
			this._finishPointerAction();
		};

		const onPointercancel = () => {
			this._finishPointerAction();
		};
		const dragging = (event) => {
			event.target.style.setProperty('--thumb-position', this._calculateThumbPosition(event));
			this.#dragging = true;
		};

		const onPointerdown = (event) => {
			if (event.target.disabled) return;

			this.#draggingListener = new AbortController();
			event.target.addEventListener('pointermove', dragging, { signal: this.#draggingListener.signal });
			window.addEventListener('pointerup', onPointerup, { once: true });
			event.target.style.setProperty('--thumb-transition-duration', '0s');
			event.target.style.setProperty('--thumb-position', this._calculateThumbPosition(event));
		};

		const onClick = (event) => {
			// preventBubbles
			if (this.#recentlyDragged) {
				event.preventDefault();
				event.stopPropagation();
			}
		};

		const onKeydown = (event) => {
			const target = event.target;
			if (target.disabled) {
				return;
			}

			if (event.key === ' ') {
				this.signal(Update_Checked_Propagate, !target.checked);

				event.preventDefault();
				event.stopPropagation();
			}
		};

		return html`
			<style>
				${css}
			</style>

			<label title="${title}" for="baSwitch" @click=${onLabelClick} class="ba-switch  ${disabled ? 'cursor-disabled' : ''}">
				<slot name="before"></slot>
				<input
					@change=${onChange}
					@pointerdown=${onPointerdown}
					@pointerup=${onPointerup}
					@pointercancel=${onPointercancel}
					@click=${onClick}
					@keydown=${onKeydown}
					id="baSwitch"
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

	_finishPointerAction() {
		if (!this.#draggingListener) return;

		const checkbox = this.shadowRoot.querySelector('input');
		checkbox.checked = this.#dragging ? this._determineChecked(checkbox) : !checkbox.checked;
		checkbox.style.removeProperty('--thumb-transition-duration');
		checkbox.style.removeProperty('--thumb-position');
		this.#draggingListener.abort();
		this.#draggingListener = null;
		this.#dragging = false;

		this.signal(Update_Checked_Propagate, checkbox.checked);

		this._padRelease();
	}

	_calculateThumbPosition(event) {
		const getHarmonizedPosition = (offsetX, thumbSize, bounds) => {
			const rawPosition = Math.round(offsetX - thumbSize / 2);
			return rawPosition < bounds.lower ? 0 : rawPosition > bounds.upper ? bounds.upper : rawPosition;
		};

		const { thumbSize, bounds, padding } = this.#switch;
		const directionality = getComputedStyleProperty(event.target, '--isLTR');
		const track = directionality === -1 ? event.target.clientWidth * -1 + thumbSize + padding : 0;

		const position = getHarmonizedPosition(event.offsetX, thumbSize, bounds);
		return `${track + position}px`;
	}

	_padRelease() {
		this.#recentlyDragged = true;

		setTimeout(() => {
			this.#recentlyDragged = false;
		}, PAD_RELEASE_TIMEOUT);
	}

	_determineChecked(checkbox) {
		const { bounds } = this.#switch;
		const currentPosition = parseInt(checkbox.style.getPropertyValue('--thumb-position'));
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

	click() {
		this._root.querySelector('.ba-switch').click();
	}
}
