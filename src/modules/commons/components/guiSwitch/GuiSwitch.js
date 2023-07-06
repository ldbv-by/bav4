/**
 * @module modules/commons/components/guiSwitch/GuiSwitch
 */
import css from './guiSwitch.css';
import { html } from 'lit-html';
// import { classMap } from 'lit-html/directives/class-map.js';
import { MvuElement } from '../../../MvuElement';
import { getPseudoStyle, getStyle } from '../../../../utils/style-utils';

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
 */
export class GuiSwitch extends MvuElement {
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
	}

	/**
	 * @override
	 */
	update(type, data, model) {
		switch (type) {
			case Update_Checked:
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
			this.switch = {};
			this.state = {
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

			this.switch = {
				thumbsize,
				padding,
				bounds: {
					lower: 0,
					middle: (checkbox.clientWidth - padding) / 4,
					upper: checkbox.clientWidth - thumbsize - padding
				}
			};

			window.addEventListener('pointerup', () => {
				if (!this.state.activethumb) return;

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
			this.dispatchEvent(
				new CustomEvent('toggle', {
					detail: { checked: checked }
				})
			);
			this._onToggle(event);
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

		this.state.activethumb = event.target;
		this.state.activethumb.addEventListener('pointermove', (event) => {
			this._dragging(event);
		});
		this.state.activethumb.style.setProperty('--thumb-transition-duration', '0s');
	}

	_dragging(event) {
		if (!this.state.activethumb) return;

		const { thumbsize, bounds, padding } = this.switch;
		const directionality = getStyle(this.state.activethumb, '--isLTR');

		const track = directionality === -1 ? this.state.activethumb.clientWidth * -1 + thumbsize + padding : 0;

		let pos = Math.round(event.offsetX - thumbsize / 2);

		if (pos < bounds.lower) pos = 0;
		if (pos > bounds.upper) pos = bounds.upper;

		this.state.activethumb.style.setProperty('--thumb-position', `${track + pos}px`);
	}

	_dragEnd() {
		if (!this.state.activethumb) return;

		this.state.activethumb.checked = this._determineChecked();

		if (this.state.activethumb.indeterminate) {
			this.state.activethumb.indeterminate = false;
		}

		this.state.activethumb.style.removeProperty('--thumb-transition-duration');
		this.state.activethumb.style.removeProperty('--thumb-position');
		this.state.activethumb.removeEventListener('pointermove', this._dragging);
		this.state.activethumb = null;

		this._padRelease();
	}

	_padRelease() {
		this.state.recentlyDragged = true;

		setTimeout(() => {
			this.state.recentlyDragged = false;
		}, 300);
	}

	_preventBubbles(event) {
		if (this.state.recentlyDragged) {
			event.preventDefault();
			event.stopPropagation();
		}
	}

	_labelClick(event) {
		const target = event.target;
		if (this.state.recentlyDragged || !target.classList.contains('ba-switch') || target.querySelector('input').disabled) {
			return;
		}

		const checkbox = event.target.querySelector('input');
		checkbox.checked = !checkbox.checked;
		event.preventDefault();
	}

	_determineChecked() {
		const { bounds } = this.switch;
		let curpos = Math.abs(parseInt(this.state.activethumb.style.getPropertyValue('--thumb-position')));

		if (!curpos) {
			curpos = this.state.activethumb.checked ? bounds.lower : bounds.upper;
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
