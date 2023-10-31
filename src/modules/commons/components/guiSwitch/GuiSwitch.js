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
 *
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
			title: ''
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
		}
	}

	/**
	 * @override
	 */
	onAfterRender(firstTime) {
		if (firstTime) {
			const switchLabelElement = this.shadowRoot.querySelector('.ba-switch');
			this._state = {
				activeThumb: null,
				recentlyDragged: false
			};

			const checkbox = switchLabelElement.querySelector('input');
			const thumbSize = getPseudoStyle(checkbox, 'width');
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

			checkbox.addEventListener('keydown', (event) => {
				this._keydown(event);
			});

			switchLabelElement.addEventListener('click', (event) => {
				this._labelClick(event);
			});

			this.#switch = {
				thumbSize: thumbSize,
				padding,
				bounds: {
					lower: 0,
					middle: (checkbox.clientWidth - padding) / 4,
					upper: checkbox.clientWidth - thumbSize - padding
				}
			};

			window.addEventListener('pointerup', () => {
				if (!this._state.activeThumb) return;

				this._dragEnd();
			});
		}
	}

	/**
	 * @override
	 */
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

			<label title="${title}" for="guiSwitch" class="ba-switch  ${disabled ? 'cursor-disabled' : ''}">
				<slot name="before"></slot>
				<input
					@change=${onChange}
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

		this._state.activeThumb = event.target;
		this._state.activeThumb.addEventListener('pointermove', (event) => {
			this._dragging(event);
		});
		this._state.activeThumb.style.setProperty('--thumb-transition-duration', '0s');
	}

	_dragging(event) {
		const getHarmonizedPosition = (event, thumbSize, bounds) => {
			const rawPosition = Math.round(event.offsetX - thumbSize / 2);

			return rawPosition < bounds.lower ? 0 : rawPosition > bounds.upper ? bounds.upper : rawPosition;
		};

		if (this._state.activeThumb) {
			const { thumbSize, bounds, padding } = this.#switch;
			const directionality = getStyle(this._state.activeThumb, '--isLTR');
			const track = directionality === -1 ? this._state.activeThumb.clientWidth * -1 + thumbSize + padding : 0;

			const position = getHarmonizedPosition(event, thumbSize, bounds);
			this._state.activeThumb.style.setProperty('--thumb-position', `${track + position}px`);
		}
	}

	_dragEnd() {
		if (!this._state.activeThumb) return;

		this._state.activeThumb.checked = this._determineChecked();
		this.signal(Update_Checked, this._state.activeThumb.checked);

		if (this._state.activeThumb.indeterminate) {
			this._state.activeThumb.indeterminate = false;
		}

		this._state.activeThumb.style.removeProperty('--thumb-transition-duration');
		this._state.activeThumb.style.removeProperty('--thumb-position');
		this._state.activeThumb.removeEventListener('pointermove', this._dragging);
		this._state.activeThumb = null;

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

		if (this._state.recentlyDragged || !target.classList.contains('ba-switch') || checkbox.disabled) {
			return;
		}

		this.signal(Update_Checked, !checkbox.checked);
		event.preventDefault();
	}

	_determineChecked() {
		const { bounds } = this.#switch;
		const currentPosition = parseInt(this._state.activeThumb.style.getPropertyValue('--thumb-position'));

		return currentPosition >= bounds.middle;
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
