/**
 * @module modules/commons/components/colorPalette/ColorPalette
 */
import { html } from '../../../../../node_modules/lit-html/lit-html';
import { classMap } from 'lit-html/directives/class-map.js';
import css from './colorpalette.css';
import { TEST_ID_ATTRIBUTE_NAME } from '../../../../utils/markup';
import { MvuElement } from '../../../MvuElement';

const Update_Disabled = 'update_disabled';

/**
 * A ColorPalette component to select predefined colors.
 *
 * @fires colorChanged The onColorChanged event fires when the selected color changes.
 */
export class ColorPalette extends MvuElement {
	#color = null;
	constructor() {
		super({ disabled: false });
	}

	onInitialize() {
		this.setAttribute(TEST_ID_ATTRIBUTE_NAME, '');
	}

	update(type, data, model) {
		switch (type) {
			case Update_Disabled:
				return {
					...model,
					disabled: data
				};
		}
	}

	/**
	 * @override
	 */
	createView(model) {
		const { disabled } = model;
		const onColorChanged = (e) => {
			this.#color = e.target.value;
			this.dispatchEvent(
				new CustomEvent('colorChanged', {
					detail: {
						color: this.#color
					}
				})
			);
		};

		const classes = {
			color: !disabled,
			'color-disabled': disabled
		};

		return html`<style>
				${css}
			</style>
			<div class="color-row">
				<button class="${classMap(classes)} red" value="#FF0000" @click=${onColorChanged}></button>
				<button class="${classMap(classes)} yellow" value="#FFFF00" @click=${onColorChanged}></button>
				<button class="${classMap(classes)} lime" value="#00FF00" @click=${onColorChanged}></button>
				<button class="${classMap(classes)} aqua" value="#00FFFF" @click=${onColorChanged}></button>
				<button class="${classMap(classes)} blue" value="#0000FF" @click=${onColorChanged}></button>
				<button class="${classMap(classes)} fuchsia mr" value="#FF00FF" @click=${onColorChanged}></button>
				<button class="${classMap(classes)} white" value="#FFFFFF" @click=${onColorChanged}></button>
				<button class="${classMap(classes)} grey" value="#808080" @click=${onColorChanged}></button>
			</div>
			<div class="color-row">
				<button class="${classMap(classes)} maroon" value="#800000" @click=${onColorChanged}></button>
				<button class="${classMap(classes)} olive" value="#808000" @click=${onColorChanged}></button>
				<button class="${classMap(classes)} green" value="#008000" @click=${onColorChanged}></button>
				<button class="${classMap(classes)} teal" value="#008080" @click=${onColorChanged}></button>
				<button class="${classMap(classes)} navy" value="#000080" @click=${onColorChanged}></button>
				<button class="${classMap(classes)} purple mr" value="#800080" @click=${onColorChanged}></button>
				<button class="${classMap(classes)} silver" value="#C0C0C0" @click=${onColorChanged}></button>
				<button class="${classMap(classes)} black" value="#000000" @click=${onColorChanged}></button>
			</div> `;
	}

	static get tag() {
		return 'ba-color-palette';
	}

	set disabled(value) {
		this.signal(Update_Disabled, value === true);
	}
}
