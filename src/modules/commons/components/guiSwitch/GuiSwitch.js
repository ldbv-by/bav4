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

		// this.addEventListener('click', (event) => {
		// 	this._click();
		// 	event.stopPropagation();
		// });

		// // this.addEventListener('mousedown', this.handleDragStart);
		// // this.addEventListener('touchstart', this.handleDragStart);

		// // this.addEventListener('mousemove', this.handleDrag);
		// // this.addEventListener('touchmove', this.handleDrag);

		// // this.addEventListener('mouseup', this.handleDragEnd);
		// // this.addEventListener('touchend', this.handleDragEnd);

		// this.addEventListener('keydown', (event) => {
		// 	//handle Enter and Space events
		// 	if (event.key === 'Enter' || event.key === ' ') {
		// 		this._click();
		// 		event.preventDefault();
		// 		event.stopPropagation();
		// 	}
		// });

		// todo why everywhere
		// this.setAttribute(TEST_ID_ATTRIBUTE_NAME, '');

		// this.guiswitch = this.shadowRoot.getElementById('guiswitch');

		// const thumbsize = getPseudoStyle(this.guiswitch, 'width');
		// const padding = getStyle(this.guiswitch, 'padding-left') + getStyle(this.guiswitch, 'padding-right');

		// this.#thumbsize = thumbsize;
		// this.#padding = padding;
		// this.#bounds = {
		// 	lower: 0,
		// 	middle: (this.clientWidth - padding) / 4,
		// 	upper: this.clientWidth - thumbsize - padding
		// };

		// this.addEventListener('pointerdown', this.dragInit.bind(this.guiswitch));
		// this.addEventListener('pointerup', this.dragEnd.bind(this.guiswitch));
		// this.addEventListener('click', this.preventBlubbling.bind(this.guiswitch));

		// window.addEventListener('pointerup', this.dragEnd.bind(this.guiswitch));
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
			this.guiswitch = this.shadowRoot.getElementById('guiswitch');

			const thumbsize = getPseudoStyle(this.guiswitch, 'width');
			console.log('🚀 ~ GuiSwitch ~ onAfterRender ~ thumbsize:', thumbsize);
			const padding = getStyle(this.guiswitch, 'padding-left') + getStyle(this.guiswitch, 'padding-right');
			console.log('🚀 ~ GuiSwitch ~ onAfterRender ~ padding:', padding);

			const clientWidth = this.guiswitch.clientWidth;
			console.log('🚀 ~ GuiSwitch ~ onAfterRender ~ clientWidth:', clientWidth);

			this.#thumbsize = thumbsize;
			this.#padding = padding;
			this.#bounds = {
				lower: 0,
				middle: (clientWidth - padding) / 4,
				upper: clientWidth - thumbsize - padding
			};

			const dragInit = () => {
				console.log('🚀 ~ GuiSwitch ~ dragInit ~ this.disabled:', this.disabled);
				if (this.disabled) {
					return;
				}

				this.#isDragging = true;

				this.addEventListener('pointermove', dragging.bind(this.guiswitch));
				this.guiswitch.style.setProperty('--thumb-transition-duration', '0s');
			};

			const dragEnd = () => {
				console.log('🚀 ~ GuiSwitch ~ dragEnd ~ this.#isDragging:', this.#isDragging);
				if (this.#isDragging !== true) {
					return;
				}

				this.checked = determineChecked();

				if (this.indeterminate) {
					this.indeterminate = false;
				}

				this.guiswitch.style.removeProperty('--thumb-transition-duration');
				this.guiswitch.style.removeProperty('--thumb-position');
				this.removeEventListener('pointermove', dragging.bind(this.guiswitch));

				this.#isDragging = false;

				padRelease();
			};

			const dragging = (event) => {
				if (event.type !== 'pointermove') {
					console.log('🚀 ~ GuiSwitch ~ dragging ~ event:', event);
					console.log('🚀 ~ GuiSwitch ~ dragging ~ this.#isDragging:', this.#isDragging);
				}
				if (this.#isDragging !== true) {
					return;
				}

				const directionality = getStyle(this.guiswitch, '--isLTR');
				console.log('🚀 ~ GuiSwitch ~ dragging ~ directionality:', directionality);
				const track = directionality === -1 ? this.guiswitch.clientWidth * -1 + this.#thumbsize + this.#padding : 0;
				console.log('🚀 ~ GuiSwitch ~ dragging ~ track:', track);

				let pos = Math.round(event.offsetX - this.#thumbsize / 2);
				console.log('🚀 ~ GuiSwitch ~ dragging ~ pos:', pos);

				if (pos < this.#bounds.lower) {
					pos = 0;
				}

				if (pos > this.#bounds.upper) {
					pos = this.#bounds.upper;
				}

				this.guiswitch.style.setProperty('--thumb-position', `${track + pos}px`);
			};

			const determineChecked = () => {
				const thumbPos = this.guiswitch.style.getPropertyValue('--thumb-position');
				console.log('🚀 ~ GuiSwitch ~ determineChecked ~ thumbPos:', thumbPos);
				let curpos = Math.abs(Number.parseInt(thumbPos));
				console.log('🚀 ~ GuiSwitch ~ determineChecked ~ curpos:', curpos);

				if (!curpos) {
					curpos = this.checked ? this.#bounds.lower : this.#bounds.upper;
				}

				return curpos >= this.#bounds.middle;
			};

			const padRelease = () => {
				this.#recentlyDragged = true;

				setTimeout(() => (this.#recentlyDragged = false), 300);
			};

			const preventBlubbling = () => {
				if (this.#recentlyDragged && event) {
					event.preventDefault();
					event.stopPropagation();
				}
			};

			this.addEventListener('pointerdown', dragInit.bind(this.guiswitch));
			this.addEventListener('pointerup', dragEnd.bind(this.guiswitch));
			this.addEventListener('click', preventBlubbling.bind(this.guiswitch));

			window.addEventListener('pointerup', dragEnd.bind(this.guiswitch));
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

			<label for="guiswitch" class="gui-switch">
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
		return 'gui-switch';
	}
}
