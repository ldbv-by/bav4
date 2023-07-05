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
 *
 * @class
 * @author nklein
 */
export class GuiSwitch extends MvuElement {
	#isDragging = false;
	#recentlyDragged = false;
	#thumbsize = 0;
	#padding = 0;
	#bounds = {
		lower: 0,
		middle: 0,
		upper: 0
	};

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
	}

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
		}
	}

	/**
	 * @override
	 */
	onAfterRender(firstTime) {
		if (firstTime) {
			const elements = this.shadowRoot.querySelectorAll('.ba-switch');
			const switches = new WeakMap();
			const state = {
				activethumb: null,
				recentlyDragged: false
			};

			const dragInit = (event) => {
				if (event.target.disabled) return;

				state.activethumb = event.target;
				state.activethumb.addEventListener('pointermove', dragging);
				state.activethumb.style.setProperty('--thumb-transition-duration', '0s');
			};

			const dragging = (event) => {
				if (!state.activethumb) return;

				const { thumbsize, bounds, padding } = switches.get(state.activethumb.parentElement);
				const directionality = getStyle(state.activethumb, '--isLTR');

				const track = directionality === -1 ? state.activethumb.clientWidth * -1 + thumbsize + padding : 0;

				let pos = Math.round(event.offsetX - thumbsize / 2);

				if (pos < bounds.lower) pos = 0;
				if (pos > bounds.upper) pos = bounds.upper;

				state.activethumb.style.setProperty('--thumb-position', `${track + pos}px`);
			};

			const dragEnd = () => {
				if (!state.activethumb) return;

				state.activethumb.checked = determineChecked();

				if (state.activethumb.indeterminate) state.activethumb.indeterminate = false;

				state.activethumb.style.removeProperty('--thumb-transition-duration');
				state.activethumb.style.removeProperty('--thumb-position');
				state.activethumb.removeEventListener('pointermove', dragging);
				state.activethumb = null;

				padRelease();
			};

			const padRelease = () => {
				state.recentlyDragged = true;

				setTimeout(() => {
					state.recentlyDragged = false;
				}, 300);
			};

			const preventBubbles = (event) => {
				if (state.recentlyDragged) {
					event.preventDefault();
					event.stopPropagation();
				}
			};

			const labelClick = (event) => {
				if (state.recentlyDragged || !event.target.classList.contains('ba-switch') || event.target.querySelector('input').disabled) return;

				const checkbox = event.target.querySelector('input');
				checkbox.checked = !checkbox.checked;
				event.preventDefault();
			};

			const determineChecked = () => {
				const { bounds } = switches.get(state.activethumb.parentElement);
				let curpos = Math.abs(parseInt(state.activethumb.style.getPropertyValue('--thumb-position')));

				if (!curpos) {
					curpos = state.activethumb.checked ? bounds.lower : bounds.upper;
				}

				return curpos >= bounds.middle;
			};

			elements.forEach((guiswitch) => {
				const checkbox = guiswitch.querySelector('input');
				const thumbsize = getPseudoStyle(checkbox, 'width');
				const padding = getStyle(checkbox, 'padding-left') + getStyle(checkbox, 'padding-right');

				checkbox.addEventListener('pointerdown', dragInit);
				checkbox.addEventListener('pointerup', dragEnd);
				checkbox.addEventListener('click', preventBubbles);
				guiswitch.addEventListener('click', labelClick);

				switches.set(guiswitch, {
					thumbsize,
					padding,
					bounds: {
						lower: 0,
						middle: (checkbox.clientWidth - padding) / 4,
						upper: checkbox.clientWidth - thumbsize - padding
					}
				});
			});

			window.addEventListener('pointerup', () => {
				if (!state.activethumb) return;

				dragEnd();
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

			<label for="guiswitch" class="ba-switch">
				${title}
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

	// _click() {
	// 	this._root.querySelector('#guiswitch').click();
	// }
	// handleDragStart = (event) => {
	// 	if (event.type === 'mousemove') {
	// 		return;
	// 	}

	// 	console.log('🚀 ~ GuiSwitch ~ handleDragStart ~ event.target:', event.target);
	// 	console.log('🚀 ~ GuiSwitch ~ handleDragStart ~ event:', event);
	// 	// if (event.target === this.sliderElement) {
	// 	//   this.isDragging = true;
	// 	//   this.startX = this.getClientX(event);
	// 	//   this.currentX = this.startX;
	// 	// }
	// };

	// handleDrag = (event) => {
	// 	if (event.type === 'mousemove') {
	// 		return;
	// 	}

	// 	console.log('🚀 ~ GuiSwitch ~ handleDrag ~ event.target:', event.target);
	// 	console.log('🚀 ~ GuiSwitch ~ handleDrag ~ event:', event);
	// 	// if (this.isDragging) {
	// 	//   const newX = this.getClientX(event);
	// 	//   const diffX = newX - this.currentX;
	// 	//   this.currentX = newX;
	// 	//   this.toggleElement.checked = newX >= this.startX;
	// 	//   this.sliderElement.style.transform = `translateX(${newX - this.startX}px)`;
	// 	// }
	// };

	// handleDragEnd = () => {
	// 	console.log('🚀 ~ GuiSwitch ~ handleDragEnd');
	// 	// if (this.isDragging) {
	// 	//   this.isDragging = false;
	// 	//   this.startX = 0;
	// 	//   this.currentX = 0;
	// 	//   this.updateToggleState();
	// 	// }
	// };

	/**
	 * @property {boolean} indeterminate=false - Checkbox indeterminate?
	 */
	set indeterminate(value) {
		this.signal(Update_Indeterminate, value);
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
		return 'ba-switch';
	}
}
