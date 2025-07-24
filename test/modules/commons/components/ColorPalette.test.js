/* eslint-disable no-undef */

import { ColorPalette } from '../../../../src/modules/commons/components/colorPalette/ColorPalette.js';
import { TestUtils } from '../../../test-utils.js';
window.customElements.define(ColorPalette.tag, ColorPalette);

describe('ColorPalette', () => {
	beforeEach(async () => {
		TestUtils.setupStoreAndDi({});
	});

	describe('when initialized', () => {
		it('contains default values ', async () => {
			const element = await TestUtils.render(ColorPalette.tag);

			expect(element.color).toBeNull;
		});

		it('renders the view', async () => {
			const element = await TestUtils.render(ColorPalette.tag);

			//view
			const colorPalette = element.shadowRoot.querySelectorAll('.color');
			expect(colorPalette.length).toBe(16);
		});

		it('changes the color after click', async () => {
			const element = await TestUtils.render(ColorPalette.tag);
			const onColorChange = jasmine.createSpy('onColorChanged');
			element.addEventListener('colorChanged', onColorChange);

			//view
			const colorPalette = element.shadowRoot.querySelectorAll('.color');
			colorPalette.forEach((e) => e.click());
			expect(onColorChange).toHaveBeenCalledTimes(16);
			expect(onColorChange).toHaveBeenCalledWith(jasmine.objectContaining({ detail: { color: '#FF0000' } }));
			expect(onColorChange).toHaveBeenCalledWith(jasmine.objectContaining({ detail: { color: '#FFFF00' } }));
			expect(onColorChange).toHaveBeenCalledWith(jasmine.objectContaining({ detail: { color: '#00FFFF' } }));
			expect(onColorChange).toHaveBeenCalledWith(jasmine.objectContaining({ detail: { color: '#0000FF' } }));
			expect(onColorChange).toHaveBeenCalledWith(jasmine.objectContaining({ detail: { color: '#FF00FF' } }));
			expect(onColorChange).toHaveBeenCalledWith(jasmine.objectContaining({ detail: { color: '#FFFFFF' } }));
			expect(onColorChange).toHaveBeenCalledWith(jasmine.objectContaining({ detail: { color: '#808080' } }));

			expect(onColorChange).toHaveBeenCalledWith(jasmine.objectContaining({ detail: { color: '#800000' } }));
			expect(onColorChange).toHaveBeenCalledWith(jasmine.objectContaining({ detail: { color: '#808000' } }));
			expect(onColorChange).toHaveBeenCalledWith(jasmine.objectContaining({ detail: { color: '#008000' } }));
			expect(onColorChange).toHaveBeenCalledWith(jasmine.objectContaining({ detail: { color: '#008080' } }));
			expect(onColorChange).toHaveBeenCalledWith(jasmine.objectContaining({ detail: { color: '#800080' } }));
			expect(onColorChange).toHaveBeenCalledWith(jasmine.objectContaining({ detail: { color: '#C0C0C0' } }));
			expect(onColorChange).toHaveBeenCalledWith(jasmine.objectContaining({ detail: { color: '#000000' } }));
		});

		it('renders the view disabled', async () => {
			const element = await TestUtils.render(ColorPalette.tag, { disabled: true });

			//view
			const colorPaletteDisabled = element.shadowRoot.querySelectorAll('.color-disabled');
			const colorPalette = element.shadowRoot.querySelectorAll('.color');
			expect(colorPaletteDisabled.length).toBe(16);
			expect(colorPalette.length).toBe(0);
		});

		it('updates the view to be disabled', async () => {
			const element = await TestUtils.render(ColorPalette.tag, { disabled: false });

			//view
			expect(element.shadowRoot.querySelectorAll('.color-disabled').length).toBe(0);
			expect(element.shadowRoot.querySelectorAll('.color').length).toBe(16);

			element.disabled = true;

			expect(element.shadowRoot.querySelectorAll('.color-disabled').length).toBe(16);
			expect(element.shadowRoot.querySelectorAll('.color').length).toBe(0);
		});
	});
});
