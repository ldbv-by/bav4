/**
 * @module modules/commons/components/colorPalette/ColorPalette
 */
import { html } from '../../../../../node_modules/lit-html/lit-html';
import css from './colorpalette.css';
import { TEST_ID_ATTRIBUTE_NAME } from '../../../../utils/markup';
import { MvuElement } from '../../../MvuElement';

/**
 * A ColorPalette component.
 *
 * @property {onChangeCallback} onChangeColor
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
		const onChangeColor = (e) => {
			this.#color = e.target.value;
			this.dispatchEvent(
				new CustomEvent('changeColor', {
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
				<button class="color red" value="#FF0000" @click=${onChangeColor}></button>
				<button class="color yellow" value="#FFFF00" @click=${onChangeColor}></button>
				<button class="color lime" value="#00FF00" @click=${onChangeColor}></button>
				<button class="color aqua" value="#00FFFF" @click=${onChangeColor}></button>
				<button class="color blue" value="#0000FF" @click=${onChangeColor}></button>
				<button class="color fuchsia mr" value="#FF00FF" @click=${onChangeColor}></button>
				<button class="color white" value="#FFFFFF" @click=${onChangeColor}></button>
				<button class="color grey" value="#808080" @click=${onChangeColor}></button>
			</div>
			<div class="color-row">
				<button class="color maroon" value="#800000" @click=${onChangeColor}></button>
				<button class="color olive" value="#808000" @click=${onChangeColor}></button>
				<button class="color green" value="#008000" @click=${onChangeColor}></button>
				<button class="color teal" value="#008080" @click=${onChangeColor}></button>
				<button class="color navy" value="#000080" @click=${onChangeColor}></button>
				<button class="color purple mr" value="#800080" @click=${onChangeColor}></button>
				<button class="color silver" value="#C0C0C0" @click=${onChangeColor}></button>
				<button class="color black" value="#000000" @click=${onChangeColor}></button>
			</div> `;
	}

	static get tag() {
		return 'ba-color-palette';
	}

	get color() {
		return this.#color;
	}
}
