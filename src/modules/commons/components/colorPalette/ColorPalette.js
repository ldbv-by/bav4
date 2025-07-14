/**
 * @module modules/commons/components/colorPalette/ColorPalette
 */
import { html } from '../../../../../node_modules/lit-html/lit-html';
import css from './colorpalette.css';
import { TEST_ID_ATTRIBUTE_NAME } from '../../../../utils/markup';
import { MvuElement } from '../../../MvuElement';

/**
 * A ColorPalette component to select predefined colors.
 *
 * @property {String} color The selected RGBA color as hexadecimal string representation.
 * @fires colorChanged The onColorChanged event fires when the selected color changes.
 */
export class ColorPalette extends MvuElement {
	#color = null;
	constructor() {
		super();
	}

	onInitialize() {
		this.setAttribute(TEST_ID_ATTRIBUTE_NAME, '');
	}

	/**
	 * @override
	 */
	createView() {
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

		return html`<style>
				${css}
			</style>
			<div class="color-row">
				<button class="color red" value="#FF0000" @click=${onColorChanged}></button>
				<button class="color yellow" value="#FFFF00" @click=${onColorChanged}></button>
				<button class="color lime" value="#00FF00" @click=${onColorChanged}></button>
				<button class="color aqua" value="#00FFFF" @click=${onColorChanged}></button>
				<button class="color blue" value="#0000FF" @click=${onColorChanged}></button>
				<button class="color fuchsia mr" value="#FF00FF" @click=${onColorChanged}></button>
				<button class="color white" value="#FFFFFF" @click=${onColorChanged}></button>
				<button class="color grey" value="#808080" @click=${onColorChanged}></button>
			</div>
			<div class="color-row">
				<button class="color maroon" value="#800000" @click=${onColorChanged}></button>
				<button class="color olive" value="#808000" @click=${onColorChanged}></button>
				<button class="color green" value="#008000" @click=${onColorChanged}></button>
				<button class="color teal" value="#008080" @click=${onColorChanged}></button>
				<button class="color navy" value="#000080" @click=${onColorChanged}></button>
				<button class="color purple mr" value="#800080" @click=${onColorChanged}></button>
				<button class="color silver" value="#C0C0C0" @click=${onColorChanged}></button>
				<button class="color black" value="#000000" @click=${onColorChanged}></button>
			</div> `;
	}

	static get tag() {
		return 'ba-color-palette';
	}

	get color() {
		return this.#color;
	}
}
