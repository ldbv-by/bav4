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

		it('sets the style, after scale changes in scale-input', async () => {
			const style = { symbolSrc: null, color: '#f00ba3', scale: 0.5 };
			const newScale = '0.7';
			const element = await setup({ ...drawDefaultState, style });

			setType('Symbol');
			const scaleInput = element.shadowRoot.querySelector('#style_scale');
			expect(scaleInput).toBeTruthy();
			expect(scaleInput.value).toBe('0.5');

			scaleInput.value = newScale;
			scaleInput.dispatchEvent(new Event('change'));

			expect(store.getState().draw.style.scale).toBe(newScale);
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
