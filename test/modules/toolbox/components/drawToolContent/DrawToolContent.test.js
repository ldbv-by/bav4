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
import { createNoInitialStateMediaReducer } from '../../../../../src/store/media/media.reducer';
import { TEST_ID_ATTRIBUTE_NAME } from '../../../../../src/utils/markup';

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
			shared: {
				termsOfUseAcknowledged: false,
				fileSaveResult: null
			},
			media: {
				portrait: false
			}
		};

		const { embed = false, isTouch = false } = config;

		store = TestUtils.setupStoreAndDi(state, { draw: drawReducer, modal: modalReducer, shared: sharedReducer, media: createNoInitialStateMediaReducer() });
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

	describe('when instantiated', () => {

		it('has a model with default values', async () => {
			const element = await setup();
			const model = element.getModel();
			expect(model).toEqual({
				type: null,
				style: null,
				description: null,
				selectedStyle: null,
				mode: null,
				fileSaveResult: null,
				validGeometry: null,
				tools: jasmine.any(Array),
				collapsedInfo: null,
				collapsedStyle: null
			});
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
			const toolButton = element.shadowRoot.querySelector('#line-button');

			toolButton.click();

			expect(toolButton.classList.contains('is-active')).toBeTrue();
			expect(store.getState().draw.type).toBe('line');
			expect(element.shadowRoot.querySelectorAll(`[${TEST_ID_ATTRIBUTE_NAME}]`)).toHaveSize(4);
			expect(element.shadowRoot.querySelector('#line-button').hasAttribute(TEST_ID_ATTRIBUTE_NAME)).toBeTrue();
		});

		it('activates the marker draw tool', async () => {

			const element = await setup();
			const toolButton = element.shadowRoot.querySelector('#marker-button');

			toolButton.click();

			expect(toolButton.classList.contains('is-active')).toBeTrue();
			expect(store.getState().draw.type).toBe('marker');
			expect(element.shadowRoot.querySelectorAll(`[${TEST_ID_ATTRIBUTE_NAME}]`)).toHaveSize(4);
			expect(element.shadowRoot.querySelector('#marker-button').hasAttribute(TEST_ID_ATTRIBUTE_NAME)).toBeTrue();
		});

		it('activates the Text draw tool', async () => {

			const element = await setup();
			const toolButton = element.shadowRoot.querySelector('#text-button');

			toolButton.click();

			expect(toolButton.classList.contains('is-active')).toBeTrue();
			expect(store.getState().draw.type).toBe('text');
			expect(element.shadowRoot.querySelectorAll(`[${TEST_ID_ATTRIBUTE_NAME}]`)).toHaveSize(4);
			expect(element.shadowRoot.querySelector('#text-button').hasAttribute(TEST_ID_ATTRIBUTE_NAME)).toBeTrue();
		});

		it('activates the Polygon draw tool', async () => {

			const element = await setup();
			const toolButton = element.shadowRoot.querySelector('#polygon-button');

			toolButton.click();

			expect(toolButton.classList.contains('is-active')).toBeTrue();
			expect(store.getState().draw.type).toBe('polygon');
			expect(element.shadowRoot.querySelectorAll(`[${TEST_ID_ATTRIBUTE_NAME}]`)).toHaveSize(4);
			expect(element.shadowRoot.querySelector('#polygon-button').hasAttribute(TEST_ID_ATTRIBUTE_NAME)).toBeTrue();
		});

		it('deactivates last tool, when activate another', async () => {
			const element = await setup();

			const lastButton = element.shadowRoot.querySelector('#polygon-button');
			lastButton.click();

			const toolButton = element.shadowRoot.querySelector('#line-button');
			toolButton.click();

			expect(toolButton.classList.contains('is-active')).toBeTrue();
			expect(lastButton.classList.contains('is-active')).toBeFalse();
		});

		it('toggles a tool', async () => {
			const element = await setup();
			const toolButton = element.shadowRoot.querySelector('#line-button');

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

		it('collapse container', async () => {

			const style = { ...StyleOptionTemplate, color: '#f00ba3', symbolSrc: 'data:image/svg+xml;base64,foobar' };

			const element = await setup({ ...drawDefaultState, style });

			setType('marker');
			const sections = element.shadowRoot.querySelectorAll('.tool-section');
			expect(sections.length).toBe(2);

			const collapseButton = element.shadowRoot.querySelectorAll('.sub-header');
			expect(collapseButton.length).toBe(2);

			const isCollapse = element.shadowRoot.querySelectorAll('.iscollapse');
			expect(isCollapse.length).toBe(2);

			collapseButton[0].click();

			const isCollapse1 = element.shadowRoot.querySelectorAll('.iscollapse');
			expect(isCollapse1.length).toBe(1);

			collapseButton[1].click();

			const isCollapse2 = element.shadowRoot.querySelectorAll('.iscollapse');
			expect(isCollapse2.length).toBe(0);

			collapseButton[0].click();
			collapseButton[1].click();

			const isCollapse3 = element.shadowRoot.querySelectorAll('.iscollapse');
			expect(isCollapse3.length).toBe(2);
		});

		it('sets the style, after color changes in ColorPalette (with LOCAL icon-asset)', async () => {
			const style = { ...StyleOptionTemplate, color: '#f00ba3', symbolSrc: 'data:image/svg+xml;base64,foobar' };

			const element = await setup({ ...drawDefaultState, style });

			setType('marker');
			const colorInput = element.shadowRoot.querySelector('#style_color');

			const redButton = element.shadowRoot.querySelector('.red');
			expect(redButton).toBeTruthy();
			redButton.click();
			expect(colorInput.value.toUpperCase()).toBe('#FF0000');
			expect(store.getState().draw.style.color.toUpperCase()).toBe('#FF0000');

			const yellowButton = element.shadowRoot.querySelector('.yellow');
			expect(yellowButton).toBeTruthy();
			yellowButton.click();
			expect(colorInput.value.toUpperCase()).toBe('#FFFF00');
			expect(store.getState().draw.style.color.toUpperCase()).toBe('#FFFF00');

			const limeButton = element.shadowRoot.querySelector('.lime');
			expect(limeButton).toBeTruthy();
			limeButton.click();
			expect(colorInput.value.toUpperCase()).toBe('#00FF00');
			expect(store.getState().draw.style.color.toUpperCase()).toBe('#00FF00');

			const aquaButton = element.shadowRoot.querySelector('.aqua');
			expect(aquaButton).toBeTruthy();
			aquaButton.click();
			expect(colorInput.value.toUpperCase()).toBe('#00FFFF');
			expect(store.getState().draw.style.color.toUpperCase()).toBe('#00FFFF');

			const blueButton = element.shadowRoot.querySelector('.blue');
			expect(blueButton).toBeTruthy();
			blueButton.click();
			expect(colorInput.value.toUpperCase()).toBe('#0000FF');
			expect(store.getState().draw.style.color.toUpperCase()).toBe('#0000FF');

			const fuchsiaButton = element.shadowRoot.querySelector('.fuchsia');
			expect(fuchsiaButton).toBeTruthy();
			fuchsiaButton.click();
			expect(colorInput.value.toUpperCase()).toBe('#FF00FF');
			expect(store.getState().draw.style.color.toUpperCase()).toBe('#FF00FF');

			const whiteButton = element.shadowRoot.querySelector('.white');
			expect(whiteButton).toBeTruthy();
			whiteButton.click();
			expect(colorInput.value.toUpperCase()).toBe('#FFFFFF');
			expect(store.getState().draw.style.color.toUpperCase()).toBe('#FFFFFF');

			const greyButton = element.shadowRoot.querySelector('.grey');
			expect(greyButton).toBeTruthy();
			greyButton.click();
			expect(colorInput.value.toUpperCase()).toBe('#808080');
			expect(store.getState().draw.style.color.toUpperCase()).toBe('#808080');

			const maroonButton = element.shadowRoot.querySelector('.maroon');
			expect(maroonButton).toBeTruthy();
			maroonButton.click();
			expect(colorInput.value.toUpperCase()).toBe('#800000');
			expect(store.getState().draw.style.color.toUpperCase()).toBe('#800000');

			const oliveButton = element.shadowRoot.querySelector('.olive');
			expect(oliveButton).toBeTruthy();
			oliveButton.click();
			expect(colorInput.value.toUpperCase()).toBe('#808000');
			expect(store.getState().draw.style.color.toUpperCase()).toBe('#808000');

			const greenButton = element.shadowRoot.querySelector('.green');
			expect(greenButton).toBeTruthy();
			greenButton.click();
			expect(colorInput.value.toUpperCase()).toBe('#008000');
			expect(store.getState().draw.style.color.toUpperCase()).toBe('#008000');

			const tealButton = element.shadowRoot.querySelector('.teal');
			expect(tealButton).toBeTruthy();
			tealButton.click();
			expect(colorInput.value.toUpperCase()).toBe('#008080');
			expect(store.getState().draw.style.color.toUpperCase()).toBe('#008080');

			const navyButton = element.shadowRoot.querySelector('.navy');
			expect(navyButton).toBeTruthy();
			navyButton.click();
			expect(colorInput.value.toUpperCase()).toBe('#000080');
			expect(store.getState().draw.style.color.toUpperCase()).toBe('#000080');

			const purpleButton = element.shadowRoot.querySelector('.purple');
			expect(purpleButton).toBeTruthy();
			purpleButton.click();
			expect(colorInput.value.toUpperCase()).toBe('#800080');
			expect(store.getState().draw.style.color.toUpperCase()).toBe('#800080');

			const silverButton = element.shadowRoot.querySelector('.silver');
			expect(silverButton).toBeTruthy();
			silverButton.click();
			expect(colorInput.value.toUpperCase()).toBe('#C0C0C0');
			expect(store.getState().draw.style.color.toUpperCase()).toBe('#C0C0C0');

			const blackButton = element.shadowRoot.querySelector('.black');
			expect(blackButton).toBeTruthy();
			blackButton.click();
			expect(colorInput.value.toUpperCase()).toBe('#000000');
			expect(store.getState().draw.style.color.toUpperCase()).toBe('#000000');

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
			const iconResultMock = { getUrl: () => 'https://some.url/foo/bar/255,255,255/foobar' };
			spyOn(iconServiceMock, 'getIconResult').and.callFake(() => iconResultMock);
			setType('line');
			const colorInput = element.shadowRoot.querySelector('#style_color');
			expect(colorInput).toBeTruthy();
			expect(colorInput.value).toBe('#f00ba3');

			colorInput.value = newColor;
			colorInput.dispatchEvent(new Event('input'));

			expect(store.getState().draw.style.color).toBe(newColor);
			expect(store.getState().draw.style.symbolSrc).toBe('https://some.url/foo/bar/255,255,255/foobar');
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
				const iconButton = iconSelect.shadowRoot.querySelector('.iconselect__toggle-button');
				iconButton.click();

				const selectableIcon = iconSelect.shadowRoot.querySelector('#svg_foo');
				selectableIcon.click();

				expect(store.getState().draw.style.symbolSrc).toBeTruthy();
				done();
			});

		});

		it('sets the description, after description changes in textarea', async () => {

			const newText = 'bar';
			const element = await setup({ ...drawDefaultState, description: 'Foo', style: StyleOptionTemplate });

			setType('text');
			const descriptionTextArea = element.shadowRoot.querySelector('textarea');
			expect(descriptionTextArea).toBeTruthy();
			expect(descriptionTextArea.value).toBe('Foo');

			descriptionTextArea.value = newText;
			descriptionTextArea.dispatchEvent(new Event('input'));

			expect(store.getState().draw.description).toBe(newText);
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

			expect(element.shadowRoot.querySelector('#cancel-button')).toBeFalsy();
			expect(element.shadowRoot.querySelector('#finish-button')).toBeTruthy();
			expect(element.shadowRoot.querySelector('#finish-button').label).toBe('toolbox_drawTool_finish');
		});

		it('displays the finish-button for line', async () => {
			const element = await setup({ ...drawDefaultState, mode: 'draw', type: 'line', validGeometry: true });

			expect(element.shadowRoot.querySelector('#cancel-button')).toBeFalsy();
			expect(element.shadowRoot.querySelector('#finish-button')).toBeTruthy();
			expect(element.shadowRoot.querySelector('#finish-button').label).toBe('toolbox_drawTool_finish');
		});

		it('displays NOT the finish-button for marker', async () => {
			const element = await setup({ ...drawDefaultState, mode: 'draw', type: 'marker' });

			expect(element.shadowRoot.querySelector('#cancel-button')).toBeTruthy();
			expect(element.shadowRoot.querySelector('#finish-button')).toBeFalsy();
			expect(element.shadowRoot.querySelector('#cancel-button').label).toBe('toolbox_drawTool_cancel');
		});

		it('displays NOT the finish-button for text', async () => {
			const element = await setup({ ...drawDefaultState, mode: 'draw', type: 'marker' });

			expect(element.shadowRoot.querySelector('#cancel-button')).toBeTruthy();
			expect(element.shadowRoot.querySelector('#finish-button')).toBeFalsy();
			expect(element.shadowRoot.querySelector('#cancel-button').label).toBe('toolbox_drawTool_cancel');
		});

		it('finishes the drawing', async () => {
			const element = await setup({ ...drawDefaultState, mode: 'draw', type: 'line', validGeometry: true });
			const finishButton = element.shadowRoot.querySelector('#finish-button');

			finishButton.click();

			expect(store.getState().draw.finish).toBeInstanceOf(EventLike);
		});

		it('resets the measurement', async () => {
			const element = await setup({ ...drawDefaultState, mode: 'draw', type: 'marker' });
			const resetButton = element.shadowRoot.querySelector('#cancel-button');

			resetButton.click();
			expect(resetButton.label).toBe('toolbox_drawTool_cancel');
			expect(store.getState().draw.reset).toBeInstanceOf(EventLike);
		});

		it('removes the selected drawing', async () => {
			const element = await setup({ ...drawDefaultState, mode: 'modify', type: 'line' });
			const removeButton = element.shadowRoot.querySelector('#remove-button');

			removeButton.click();
			expect(removeButton.label).toBe('toolbox_drawTool_delete_drawing');
			expect(store.getState().draw.remove).toBeInstanceOf(EventLike);
		});

		it('deletes the last drawn point of drawing', async () => {
			const element = await setup({ ...drawDefaultState, mode: 'draw', type: 'line', validGeometry: true });
			const removeButton = element.shadowRoot.querySelector('#remove-button');

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
