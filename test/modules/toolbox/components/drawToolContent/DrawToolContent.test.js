import { TestUtils } from '../../../../test-utils';
import { $injector } from '../../../../../src/injection';
import { drawReducer } from '../../../../../src/modules/map/store/draw.reducer';
import { DrawToolContent } from '../../../../../src/modules/toolbox/components/drawToolContent/DrawToolContent';
import { AbstractToolContent } from '../../../../../src/modules/toolbox/components/toolContainer/AbstractToolContent';
import { setStyle, setType } from '../../../../../src/modules/map/store/draw.action';

window.customElements.define(DrawToolContent.tag, DrawToolContent);

describe('DrawToolContent', () => {
	let store;
	const windowMock = {
		matchMedia() { }
	};

	const drawDefaultState = {
		active: false,
		style: null,
		mode: null,
		type: null,
		reset: null,
		fileSaveResult: { adminId: 'init', fileId: 'init' }
	};

	const StyleOptionTemplate = {
		symbolSrc: null,
		scale: 0.5,
		width: 1,
		outlineWidth: 1,
		color: '#FFDAFF',
		outlineColor: '#FFDAFF',
		height: 10,
		text: ''
	};
	const setup = async (drawState = drawDefaultState) => {
		const state = {
			draw: drawState
		};

		store = TestUtils.setupStoreAndDi(state, { draw: drawReducer });
		$injector
			.registerSingleton('EnvironmentService', {
				isEmbedded: () => false,
				getWindow: () => windowMock
			})
			.registerSingleton('TranslationService', { translate: (key) => key });
		return TestUtils.render(DrawToolContent.tag);
	};

	describe('class', () => {

		it('inherits from AbstractToolContent', async () => {

			const element = await setup();

			expect(element instanceof AbstractToolContent).toBeTrue();
		});
	});

	describe('when initialized', () => {

		it('builds list of tools', async () => {
			const element = await setup();

			expect(element._tools).toBeTruthy();
			expect(element._tools.length).toBe(4);
			expect(element.shadowRoot.querySelector('.tool-container__buttons')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.tool-container__buttons').childElementCount).toBe(4);
		});

		it('activates the Line draw tool', async () => {

			const element = await setup();
			const spy = spyOn(element, '_setActiveToolByType').and.callThrough();
			const toolButton = element.shadowRoot.querySelector('#Line');

			toolButton.click();

			expect(spy).toHaveBeenCalled();
			expect(toolButton.classList.contains('is-active')).toBeTrue();
			expect(store.getState().draw.type).toBe('Line');
		});

		it('activates the Symbol draw tool', async () => {

			const element = await setup();
			const spy = spyOn(element, '_setActiveToolByType').and.callThrough();
			const toolButton = element.shadowRoot.querySelector('#Symbol');

			toolButton.click();

			expect(spy).toHaveBeenCalled();
			expect(toolButton.classList.contains('is-active')).toBeTrue();
			expect(store.getState().draw.type).toBe('Symbol');
		});

		it('activates the Text draw tool', async () => {

			const element = await setup();
			const spy = spyOn(element, '_setActiveToolByType').and.callThrough();
			const toolButton = element.shadowRoot.querySelector('#Text');

			toolButton.click();

			expect(spy).toHaveBeenCalled();
			expect(toolButton.classList.contains('is-active')).toBeTrue();
			expect(store.getState().draw.type).toBe('Text');
		});

		it('activates the Polygon draw tool', async () => {

			const element = await setup();
			const spy = spyOn(element, '_setActiveToolByType').and.callThrough();
			const toolButton = element.shadowRoot.querySelector('#Polygon');

			toolButton.click();

			expect(spy).toHaveBeenCalled();
			expect(toolButton.classList.contains('is-active')).toBeTrue();
			expect(store.getState().draw.type).toBe('Polygon');
		});

		it('deactivates last tool, when activate another', async () => {
			const element = await setup();

			const lastButton = element.shadowRoot.querySelector('#Polygon');
			lastButton.click();

			const toolButton = element.shadowRoot.querySelector('#Line');
			toolButton.click();

			expect(toolButton.classList.contains('is-active')).toBeTrue();
			expect(lastButton.classList.contains('is-active')).toBeFalse();
		});

		it('toggles a tool', async () => {
			const element = await setup();
			const spy = spyOn(element, '_setActiveToolByType').and.callThrough();
			const toolButton = element.shadowRoot.querySelector('#Line');

			toolButton.click();


			expect(toolButton.classList.contains('is-active')).toBeTrue();

			toolButton.click();

			expect(spy).toHaveBeenCalledTimes(2);
			expect(toolButton.classList.contains('is-active')).toBeFalse();
		});

		it('displays style form, when style is available', async () => {
			const style = { ...StyleOptionTemplate, color: '#f00ba3' };
			const element = await setup();
			const drawType = 'Symbol';

			expect(element.shadowRoot.querySelector('#style_symbol')).toBeNull();
			setType(drawType);
			setStyle(style);
			expect(element.shadowRoot.querySelector('#style_symbol')).toBeTruthy();
		});

		it('sets the style, after color changes in color-input', async () => {
			const style = { ...StyleOptionTemplate, color: '#f00ba3' };
			const newColor = '#ffffff';
			const element = await setup({ ...drawDefaultState, style });

			setType('Symbol');
			const colorInput = element.shadowRoot.querySelector('#style_color');
			expect(colorInput).toBeTruthy();
			expect(colorInput.value).toBe('#f00ba3');

			colorInput.value = newColor;
			colorInput.dispatchEvent(new Event('change'));

			expect(store.getState().draw.style.color).toBe(newColor);
		});

		it('sets the style, after size changes in size-input', async () => {
			const style = { symbolSrc: null, color: '#f00ba3', scale: 0.5 };
			const newSize = '0.7';
			const element = await setup({ ...drawDefaultState, style });

			setType('Symbol');
			const scaleInput = element.shadowRoot.querySelector('#style_scale');
			expect(scaleInput).toBeTruthy();
			expect(scaleInput.value).toBe('0.5');

			scaleInput.value = newSize;
			scaleInput.dispatchEvent(new Event('change'));

			expect(store.getState().draw.style.scale).toBe(newSize);
		});

		it('sets the style, after outlineColor changes in outlineColor-input', async () => {
			const style = { ...StyleOptionTemplate, outlineColor: '#000000' };
			const newColor = '#bada55';
			const element = await setup({ ...drawDefaultState, style });

			setType('Polygon');
			const outlineColorInput = element.shadowRoot.querySelector('#style_outlineColor');
			expect(outlineColorInput).toBeTruthy();
			expect(outlineColorInput.value).toBe('#000000');

			outlineColorInput.value = newColor;
			outlineColorInput.dispatchEvent(new Event('change'));

			expect(store.getState().draw.style.outlineColor).toBe(newColor);
		});

		it('sets the style, after width changes in width-input', async () => {
			const style = { ...StyleOptionTemplate, width: 1 };
			const newWidth = '10';
			const element = await setup({ ...drawDefaultState, style });

			setType('Polygon');
			const widthInput = element.shadowRoot.querySelector('#style_width');
			expect(widthInput).toBeTruthy();
			expect(widthInput.value).toBe('1');

			widthInput.value = newWidth;
			widthInput.dispatchEvent(new Event('change'));

			expect(store.getState().draw.style.width).toBe(newWidth);
		});

		it('sets the style, after outlineWidth changes in outlineWidth-input', async () => {
			const style = { ...StyleOptionTemplate, outLineWidth: 1 };
			const newOutlineWidth = '10';
			const element = await setup({ ...drawDefaultState, style });

			setType('Polygon');
			const outlineWidthInput = element.shadowRoot.querySelector('#style_outlineWidth');
			expect(outlineWidthInput).toBeTruthy();
			expect(outlineWidthInput.value).toBe('1');

			outlineWidthInput.value = newOutlineWidth;
			outlineWidthInput.dispatchEvent(new Event('change'));

			expect(store.getState().draw.style.outlineWidth).toBe(newOutlineWidth);
		});

		it('sets the style, after height changes in height-input', async () => {
			const style = { ...StyleOptionTemplate, height: 10 };
			const newOutlineWidth = '20';
			const element = await setup({ ...drawDefaultState, style });

			setType('Text');
			const heightInput = element.shadowRoot.querySelector('#style_height');
			expect(heightInput).toBeTruthy();
			expect(heightInput.value).toBe('10');

			heightInput.value = newOutlineWidth;
			heightInput.dispatchEvent(new Event('change'));

			expect(store.getState().draw.style.height).toBe(newOutlineWidth);
		});

		it('sets the style, after text changes in text-input', async () => {
			const style = { ...StyleOptionTemplate, text: 'foo' };
			const newText = 'bar';
			const element = await setup({ ...drawDefaultState, style });

			setType('Text');
			const textInput = element.shadowRoot.querySelector('#style_text');
			expect(textInput).toBeTruthy();
			expect(textInput.value).toBe('foo');

			textInput.value = newText;
			textInput.dispatchEvent(new Event('change'));

			expect(store.getState().draw.style.text).toBe(newText);
		});

	});
});
