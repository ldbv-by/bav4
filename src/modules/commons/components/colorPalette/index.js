import { ColorPalette } from './ColorPalette';
if (!window.customElements.get(ColorPalette.tag)) {
	window.customElements.define(ColorPalette.tag, ColorPalette);
}
