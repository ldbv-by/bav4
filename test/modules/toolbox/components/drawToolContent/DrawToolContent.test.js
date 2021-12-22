import { TestUtils } from '../../../../test-utils';
import { $injector } from '../../../../../src/injection';
import { DrawToolContent } from '../../../../../src/modules/toolbox/components/drawToolContent/DrawToolContent';
import { AbstractToolContent } from '../../../../../src/modules/toolbox/components/toolContainer/AbstractToolContent';
import { drawReducer } from '../../../../../src/store/draw/draw.reducer';
import { setSelectedStyle, setStyle, setType } from '../../../../../src/store/draw/draw.action';
import { EventLike } from '../../../../../src/utils/storeUtils';
import { modalReducer } from '../../../../../src/store/modal/modal.reducer';
import { sharedReducer } from '../../../../../src/store/shared/shared.reducer';
import { IconResult } from '../../../../../src/services/IconService';
import { IconSelect } from '../../../../../src/modules/iconSelect/components/IconSelect';
import { Icon } from '../../../../../src/modules/commons/components/icon/Icon';

window.customElements.define(Icon.tag, Icon);
window.customElements.define(IconSelect.tag, IconSelect);
window.customElements.define(DrawToolContent.tag, DrawToolContent);


describe('DrawToolContent', () => {
	let store;
	const windowMock = {
		matchMedia() { }
	};

	const shareServiceMock = {
		copyToClipboard() {
			return Promise.resolve();
		},
		encodeState() {
			return 'http://this.is.a.url?forTestCase';
		}
	};
	const urlServiceMock = {
		shorten() {
			return Promise.resolve('http://foo');
		}
	};

	const iconServiceMock = { default: () => new IconResult('marker', 'foo'), all: () => [], getIconResult: () => { } };

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
	const setup = async (drawState = drawDefaultState, config = {}) => {
		const state = {
			draw: drawState,
			shared: { termsOfUseAcknowledged: false,
				fileSaveResult: null }
		};

		const { embed = false, isTouch = false } = config;

		store = TestUtils.setupStoreAndDi(state, { draw: drawReducer, modal: modalReducer, shared: sharedReducer });
		$injector
			.registerSingleton('EnvironmentService', {
				isEmbedded: () => embed,
				getWindow: () => windowMock,
				isTouch: () => isTouch
			})
			.registerSingleton('TranslationService', { translate: (key) => key })
			.registerSingleton('ShareService', shareServiceMock)
			.registerSingleton('IconService', iconServiceMock)
			.registerSingleton('UrlService', urlServiceMock);
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

			expect(element._model.tools).toBeTruthy();
			expect(element._model.tools.length).toBe(4);
			expect(element.shadowRoot.querySelector('.tool-container__buttons')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.tool-container__buttons').childElementCount).toBe(4);
		});

		it('activates the Line draw tool', async () => {

			const element = await setup();
			const toolButton = element.shadowRoot.querySelector('#line');

			toolButton.click();

			expect(toolButton.classList.contains('is-active')).toBeTrue();
			expect(store.getState().draw.type).toBe('line');
		});

		it('activates the marker draw tool', async () => {

			const element = await setup();
			const toolButton = element.shadowRoot.querySelector('#marker');

			toolButton.click();

			expect(toolButton.classList.contains('is-active')).toBeTrue();
			expect(store.getState().draw.type).toBe('marker');
		});

		it('activates the Text draw tool', async () => {

			const element = await setup();
			const toolButton = element.shadowRoot.querySelector('#text');

			toolButton.click();

			expect(toolButton.classList.contains('is-active')).toBeTrue();
			expect(store.getState().draw.type).toBe('text');
		});

		it('activates the Polygon draw tool', async () => {

			const element = await setup();
			const toolButton = element.shadowRoot.querySelector('#polygon');

			toolButton.click();

			expect(toolButton.classList.contains('is-active')).toBeTrue();
			expect(store.getState().draw.type).toBe('polygon');
		});

		it('deactivates last tool, when activate another', async () => {
			const element = await setup();

			const lastButton = element.shadowRoot.querySelector('#polygon');
			lastButton.click();

			const toolButton = element.shadowRoot.querySelector('#line');
			toolButton.click();

			expect(toolButton.classList.contains('is-active')).toBeTrue();
			expect(lastButton.classList.contains('is-active')).toBeFalse();
		});

		it('toggles a tool', async () => {
			const element = await setup();
			const toolButton = element.shadowRoot.querySelector('#line');

			toolButton.click();

			expect(toolButton.classList.contains('is-active')).toBeTrue();

			toolButton.click();

			expect(toolButton.classList.contains('is-active')).toBeFalse();
		});

		it('displays style form, when style is available', async () => {
			const style = { ...StyleOptionTemplate, color: '#f00ba3' };
			const element = await setup();
			const drawType = 'marker';

			expect(element.shadowRoot.querySelector('#style_marker')).toBeNull();
			setType(drawType);
			setStyle(style);
			expect(element.shadowRoot.querySelector('#style_marker')).toBeTruthy();
		});

		it('displays style form, when selectedStyle is available', async () => {
			const selectedStyle = { type: 'marker', style: { ...StyleOptionTemplate, color: '#f00ba3' } };
			const element = await setup();

			expect(element.shadowRoot.querySelector('#style_marker')).toBeNull();
			setSelectedStyle(selectedStyle);
			expect(element.shadowRoot.querySelector('#style_marker')).toBeTruthy();
		});

		it('sets the style, after color changes in color-input (with LOCAL icon-asset)', async () => {
			const style = { ...StyleOptionTemplate, color: '#f00ba3', symbolSrc: 'data:image/svg+xml;base64,foobar' };
			const newColor = '#ffffff';
			const element = await setup({ ...drawDefaultState, style });

			setType('marker');
			const colorInput = element.shadowRoot.querySelector('#style_color');
			expect(colorInput).toBeTruthy();
			expect(colorInput.value).toBe('#f00ba3');

			colorInput.value = newColor;
			colorInput.dispatchEvent(new Event('input'));

			expect(store.getState().draw.style.color).toBe(newColor);
		});

		it('sets the style, after color changes in color-input (with REMOTE icon-asset)', async () => {
			const style = { ...StyleOptionTemplate, color: '#f00ba3', symbolSrc: 'https://some.url/foo/bar/0,0,0/foobar' };
			const getIconResultSpy = spyOn(iconServiceMock, 'getIconResult').and.callFake(() => {
				return {
					getUrl: () => 'https://some.url/foo/bar/1,2,3/foobarbaz'
				};
			});
			const newColor = '#ffffff';
			const element = await setup({ ...drawDefaultState, style });

			setType('marker');
			const colorInput = element.shadowRoot.querySelector('#style_color');
			expect(colorInput).toBeTruthy();
			expect(colorInput.value).toBe('#f00ba3');

			colorInput.value = newColor;
			colorInput.dispatchEvent(new Event('input'));

			expect(getIconResultSpy).toHaveBeenCalledWith('https://some.url/foo/bar/0,0,0/foobar');
			expect(store.getState().draw.style.symbolSrc).toBe('https://some.url/foo/bar/1,2,3/foobarbaz');
		});

		it('sets the style, after color changes in color-input (ignoring icon-asset)', async () => {
			const style = { ...StyleOptionTemplate, color: '#f00ba3', symbolSrc: 'https://some.url/foo/bar/0,0,0/foobar' };
			const newColor = '#ffffff';
			const element = await setup({ ...drawDefaultState, style });

			setType('line');
			const colorInput = element.shadowRoot.querySelector('#style_color');
			expect(colorInput).toBeTruthy();
			expect(colorInput.value).toBe('#f00ba3');

			colorInput.value = newColor;
			colorInput.dispatchEvent(new Event('input'));

			expect(store.getState().draw.style.color).toBe(newColor);
			expect(store.getState().draw.style.symbolSrc).toBeNull();
		});

		it('sets the style, after scale changes in scale-input', async () => {
			const style = { symbolSrc: null, color: '#f00ba3', scale: 'medium' };
			const newScale = 'large';
			const element = await setup({ ...drawDefaultState, style });

			setType('marker');
			const sizeSelect = element.shadowRoot.querySelector('#style_size');
			expect(sizeSelect).toBeTruthy();
			expect(sizeSelect.value).toBe('medium');

			sizeSelect.value = newScale;
			sizeSelect.dispatchEvent(new Event('change'));

			expect(store.getState().draw.style.scale).toBe(newScale);
		});

		it('sets the style, after text changes in text-input', async () => {
			const style = { ...StyleOptionTemplate, text: 'foo' };
			const newText = 'bar';
			const element = await setup({ ...drawDefaultState, style });

			setType('text');
			const textInput = element.shadowRoot.querySelector('#style_text');
			expect(textInput).toBeTruthy();
			expect(textInput.value).toBe('foo');

			textInput.value = newText;
			textInput.dispatchEvent(new Event('input'));

			expect(store.getState().draw.style.text).toBe(newText);
		});

		it('sets the style, after symbol changes in iconSelect', async (done) => {
			spyOn(iconServiceMock, 'all').and.returnValue(Promise.resolve([new IconResult('foo', '42'), new IconResult('bar', '42')]));
			const style = { ...StyleOptionTemplate, text: 'foo', symbolSrc: null };
			const element = await setup({ ...drawDefaultState, style });

			setType('marker');
			const iconSelect = element.shadowRoot.querySelector('ba-iconselect');
			expect(iconSelect).toBeTruthy();
			// wait to get icons loaded....
			setTimeout(() => {
				// ..then perform ui-actions
				const iconButton = iconSelect.shadowRoot.querySelector('ba-icon');
				iconButton.click();

				const selectableIcon = iconSelect.shadowRoot.querySelector('#svg_foo');
				selectableIcon.click();

				expect(store.getState().draw.style.symbolSrc).toBeTruthy();
				done();
			});

		});

		it('sets the style-inputs for symbol-tool', async () => {
			const style = { symbolSrc: null, color: '#f00ba3', scale: 'medium' };
			const element = await setup({ ...drawDefaultState, style });

			setType('marker');

			expect(element.shadowRoot.querySelector('#style_color')).toBeTruthy();
			expect(element.shadowRoot.querySelector('#style_size')).toBeTruthy();
		});

		it('sets the style-inputs for symbol-tool', async () => {
			const style = { symbolSrc: null, color: '#f00ba3', scale: 'medium' };
			const element = await setup({ ...drawDefaultState, style });

			setType('text');

			expect(element.shadowRoot.querySelector('#style_color')).toBeTruthy();
			expect(element.shadowRoot.querySelector('#style_size')).toBeTruthy();
			expect(element.shadowRoot.querySelector('#style_text')).toBeTruthy();
		});

		it('sets the style-inputs for line-tool', async () => {
			const style = { symbolSrc: null, color: '#f00ba3', scale: 'medium' };
			const element = await setup({ ...drawDefaultState, style });

			setType('line');

			expect(element.shadowRoot.querySelector('#style_color')).toBeTruthy();
		});

		it('sets the style-inputs for polygon-tool', async () => {
			const style = { symbolSrc: null, color: '#f00ba3', scale: 'medium' };
			const element = await setup({ ...drawDefaultState, style });

			setType('polygon');

			expect(element.shadowRoot.querySelector('#style_color')).toBeTruthy();
		});

		it('hides the style-inputs', async () => {
			const style = { symbolSrc: null, color: '#f00ba3', scale: 'medium' };
			const element = await setup({ ...drawDefaultState, style });

			setType('polygon');

			expect(element.shadowRoot.querySelector('#style_color')).toBeTruthy();

			setType(null);
			expect(element.shadowRoot.querySelector('.tool-container__form').childElementCount).toBe(0);
		});

		it('hides the style-inputs on invalid drawType', async () => {
			const style = { symbolSrc: null, color: '#f00ba3', scale: 'medium' };
			const element = await setup({ ...drawDefaultState, style });

			setType('polygon');

			expect(element.shadowRoot.querySelector('#style_color')).toBeTruthy();

			setType('foo');
			expect(element.shadowRoot.querySelector('.tool-container__form').childElementCount).toBe(0);
		});

		it('displays the finish-button for polygon', async () => {
			const element = await setup({ ...drawDefaultState, mode: 'draw', type: 'polygon', validGeometry: true });

			expect(element.shadowRoot.querySelector('#cancel')).toBeFalsy();
			expect(element.shadowRoot.querySelector('#finish')).toBeTruthy();
			expect(element.shadowRoot.querySelector('#finish').label).toBe('toolbox_drawTool_finish');
		});

		it('displays the finish-button for line', async () => {
			const element = await setup({ ...drawDefaultState, mode: 'draw', type: 'line', validGeometry: true });

			expect(element.shadowRoot.querySelector('#cancel')).toBeFalsy();
			expect(element.shadowRoot.querySelector('#finish')).toBeTruthy();
			expect(element.shadowRoot.querySelector('#finish').label).toBe('toolbox_drawTool_finish');
		});

		it('displays NOT the finish-button for marker', async () => {
			const element = await setup({ ...drawDefaultState, mode: 'draw', type: 'marker' });

			expect(element.shadowRoot.querySelector('#cancel')).toBeTruthy();
			expect(element.shadowRoot.querySelector('#finish')).toBeFalsy();
			expect(element.shadowRoot.querySelector('#cancel').label).toBe('toolbox_drawTool_cancel');
		});

		it('displays NOT the finish-button for text', async () => {
			const element = await setup({ ...drawDefaultState, mode: 'draw', type: 'marker' });

			expect(element.shadowRoot.querySelector('#cancel')).toBeTruthy();
			expect(element.shadowRoot.querySelector('#finish')).toBeFalsy();
			expect(element.shadowRoot.querySelector('#cancel').label).toBe('toolbox_drawTool_cancel');
		});

		it('finishes the drawing', async () => {
			const element = await setup({ ...drawDefaultState, mode: 'draw', type: 'line', validGeometry: true });
			const finishButton = element.shadowRoot.querySelector('#finish');

			finishButton.click();

			expect(store.getState().draw.finish).toBeInstanceOf(EventLike);
		});

		it('resets the measurement', async () => {
			const element = await setup({ ...drawDefaultState, mode: 'draw', type: 'marker' });
			const resetButton = element.shadowRoot.querySelector('#cancel');

			resetButton.click();
			expect(resetButton.label).toBe('toolbox_drawTool_cancel');
			expect(store.getState().draw.reset).toBeInstanceOf(EventLike);
		});

		it('removes the selected drawing', async () => {
			const element = await setup({ ...drawDefaultState, mode: 'modify', type: 'line' });
			const removeButton = element.shadowRoot.querySelector('#remove');

			removeButton.click();
			expect(removeButton.label).toBe('toolbox_drawTool_delete_drawing');
			expect(store.getState().draw.remove).toBeInstanceOf(EventLike);
		});

		it('deletes the last drawn point of drawing', async () => {
			const element = await setup({ ...drawDefaultState, mode: 'draw', type: 'line', validGeometry: true });
			const removeButton = element.shadowRoot.querySelector('#remove');

			removeButton.click();
			expect(removeButton.label).toBe('toolbox_drawTool_delete_point');
			expect(store.getState().draw.remove).toBeInstanceOf(EventLike);
		});

		it('shows the drawing sub-text', async () => {
			const element = await setup(drawDefaultState);
			const subTextElement = element.shadowRoot.querySelector('.sub-text');

			expect(subTextElement).toBeTruthy();
			expect(subTextElement.textContent).toBe('');
		});

		it('shows the share-button', async () => {
			const element = await setup({ ...drawDefaultState, fileSaveResult: { adminId: 'a_fooBar', fileId: 'f_fooBar' } });
			const shareButton = element.shadowRoot.querySelector('ba-share-button');

			expect(shareButton).toBeTruthy();
		});

		describe('with touch-device', () => {
			const touchConfig = {
				embed: false,
				isTouch: true
			};

			it('shows the drawing sub-text for mode:active', async () => {
				const element = await setup({ ...drawDefaultState, mode: 'active' }, touchConfig);
				const subTextElement = element.shadowRoot.querySelector('.sub-text');

				expect(subTextElement).toBeTruthy();
				expect(subTextElement.textContent).toBe('toolbox_drawTool_draw_active');
			});

			it('shows the drawing sub-text for mode:draw', async () => {
				const element = await setup({ ...drawDefaultState, mode: 'draw' }, touchConfig);
				const subTextElement = element.shadowRoot.querySelector('.sub-text');

				expect(subTextElement).toBeTruthy();
				expect(subTextElement.textContent).toBe('toolbox_drawTool_draw_draw');
			});

			it('shows the drawing sub-text for mode:modify', async () => {
				const element = await setup({ ...drawDefaultState, mode: 'modify' }, touchConfig);
				const subTextElement = element.shadowRoot.querySelector('.sub-text');

				expect(subTextElement).toBeTruthy();
				expect(subTextElement.textContent).toBe('toolbox_drawTool_draw_modify');
			});

			it('shows the drawing sub-text for mode:select', async () => {
				const element = await setup({ ...drawDefaultState, mode: 'select' }, touchConfig);
				const subTextElement = element.shadowRoot.querySelector('.sub-text');

				expect(subTextElement).toBeTruthy();
				expect(subTextElement.textContent).toBe('toolbox_drawTool_draw_select');
			});
		});
	});
});
