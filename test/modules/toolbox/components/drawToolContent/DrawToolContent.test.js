import { TestUtils } from '../../../../test-utils';
import { $injector } from '../../../../../src/injection';
import { DrawToolContent } from '../../../../../src/modules/toolbox/components/drawToolContent/DrawToolContent';
import { AbstractToolContent } from '../../../../../src/modules/toolbox/components/toolContainer/AbstractToolContent';
import { drawReducer } from '../../../../../src/store/draw/draw.reducer';
import { setMode, setSelectedStyle, setStatistic, setStyle, setType } from '../../../../../src/store/draw/draw.action';
import { EventLike } from '../../../../../src/utils/storeUtils';
import { modalReducer } from '../../../../../src/store/modal/modal.reducer';
import { IconResult } from '../../../../../src/services/IconService';
import { IconSelect } from '../../../../../src/modules/iconSelect/components/IconSelect';
import { createNoInitialStateMediaReducer } from '../../../../../src/store/media/media.reducer';
import { TEST_ID_ATTRIBUTE_NAME } from '../../../../../src/utils/markup';
import { elevationProfileReducer } from '../../../../../src/store/elevationProfile/elevationProfile.reducer';
import { fileStorageReducer } from '../../../../../src/store/fileStorage/fileStorage.reducer.js';
import { setData } from '../../../../../src/store/fileStorage/fileStorage.action.js';
import { setIsPortrait } from '../../../../../src/store/media/media.action';

window.customElements.define(DrawToolContent.tag, DrawToolContent);
window.customElements.define(IconSelect.tag, IconSelect);

describe('DrawToolContent', () => {
	let store;
	const windowMock = {
		matchMedia() {}
	};

	const securityServiceMock = {
		sanitizeHtml(html) {
			return html;
		}
	};

	const iconServiceMock = { default: () => new IconResult('marker', 'foo'), all: () => [], getIconResult: () => {} };

	const drawDefaultState = {
		active: false,
		style: null,
		mode: null,
		type: null,
		reset: null
	};
	const defaultMediaState = {
		portrait: false,
		minWidth: true,
		observeResponsiveParameter: true
	};

	const defaultStatistic = { geometryType: null, coordinate: null, azimuth: null, length: null, area: null };

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
	const setup = async (drawState = drawDefaultState, config = {}, mediaState = defaultMediaState) => {
		const state = {
			draw: drawState,
			media: mediaState
		};

		const { embed = false, isTouch = false } = config;

		store = TestUtils.setupStoreAndDi(state, {
			draw: drawReducer,
			modal: modalReducer,
			media: createNoInitialStateMediaReducer(),
			elevationProfile: elevationProfileReducer,
			fileStorage: fileStorageReducer
		});
		$injector
			.registerSingleton('EnvironmentService', {
				isEmbedded: () => embed,
				getWindow: () => windowMock,
				isTouch: () => isTouch
			})
			.registerSingleton('TranslationService', { translate: (key) => key })
			.registerSingleton('IconService', iconServiceMock)
			.registerSingleton('SecurityService', securityServiceMock);
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
			await setup();
			const model = new DrawToolContent().getModel();
			expect(model).toEqual({
				type: null,
				style: null,
				description: null,
				statistic: null,
				selectedStyle: null,
				mode: null,
				validGeometry: null,
				tools: jasmine.any(Array),
				collapsedInfo: null,
				collapsedStyle: null,
				storedContent: null
			});
		});
	});

	describe('when initialized', () => {
		it('builds list of tools', async () => {
			const element = await setup();

			expect(element.getModel().tools).toBeTruthy();
			expect(element.getModel().tools.length).toBe(4);
			expect(element.shadowRoot.querySelector('.tool-container__buttons')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.tool-container__buttons').childElementCount).toBe(4);
		});

		it('activates the line draw tool', async () => {
			const element = await setup();
			const toolButton = element.shadowRoot.querySelector('#line-button');

			toolButton.click();

			expect(toolButton.classList.contains('is-active')).toBeTrue();
			expect(store.getState().draw.reset).toBeTruthy();
			expect(store.getState().draw.type).toBe('line');
			expect(store.getState().draw.style.text).toBeNull();
			expect(store.getState().draw.description).toBeNull();
			expect(element.shadowRoot.querySelectorAll(`[${TEST_ID_ATTRIBUTE_NAME}]`)).toHaveSize(4);
			expect(element.shadowRoot.querySelector('#line-button').hasAttribute(TEST_ID_ATTRIBUTE_NAME)).toBeTrue();
		});

		it('activates the marker draw tool', async () => {
			const element = await setup();
			const toolButton = element.shadowRoot.querySelector('#marker-button');

			toolButton.click();

			expect(toolButton.classList.contains('is-active')).toBeTrue();
			expect(store.getState().draw.reset).toBeTruthy();
			expect(store.getState().draw.type).toBe('marker');
			expect(store.getState().draw.style.text).toBeNull();
			expect(store.getState().draw.description).toBeNull();
			expect(element.shadowRoot.querySelectorAll(`[${TEST_ID_ATTRIBUTE_NAME}]`)).toHaveSize(4);
			expect(element.shadowRoot.querySelector('#marker-button').hasAttribute(TEST_ID_ATTRIBUTE_NAME)).toBeTrue();
		});

		it('activates the text draw tool', async () => {
			const element = await setup();
			const toolButton = element.shadowRoot.querySelector('#text-button');

			toolButton.click();

			expect(toolButton.classList.contains('is-active')).toBeTrue();
			expect(store.getState().draw.reset).toBeTruthy();
			expect(store.getState().draw.type).toBe('text');
			expect(store.getState().draw.style.text).toBeNull();
			expect(store.getState().draw.description).toBeNull();
			expect(element.shadowRoot.querySelectorAll(`[${TEST_ID_ATTRIBUTE_NAME}]`)).toHaveSize(4);
			expect(element.shadowRoot.querySelector('#text-button').hasAttribute(TEST_ID_ATTRIBUTE_NAME)).toBeTrue();
		});

		it('activates the polygon draw tool', async () => {
			const element = await setup();
			const toolButton = element.shadowRoot.querySelector('#polygon-button');

			toolButton.click();

			expect(toolButton.classList.contains('is-active')).toBeTrue();
			expect(store.getState().draw.reset).toBeTruthy();
			expect(store.getState().draw.type).toBe('polygon');
			expect(store.getState().draw.style.text).toBeNull();
			expect(store.getState().draw.description).toBeNull();
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

			expect(element.shadowRoot.querySelectorAll('.collapse-content.iscollapse')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.collapse-content:not(.iscollapse)')).toHaveSize(1);

			collapseButton[0].click();

			expect(element.shadowRoot.querySelectorAll('.collapse-content.iscollapse')).toHaveSize(2);
			expect(element.shadowRoot.querySelectorAll('.collapse-content:not(.iscollapse)')).toHaveSize(0);

			collapseButton[1].click();

			expect(element.shadowRoot.querySelectorAll('.collapse-content.iscollapse')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.collapse-content:not(.iscollapse)')).toHaveSize(1);

			collapseButton[0].click();

			expect(element.shadowRoot.querySelectorAll('.collapse-content.iscollapse')).toHaveSize(0);
			expect(element.shadowRoot.querySelectorAll('.collapse-content:not(.iscollapse)')).toHaveSize(2);

			collapseButton[1].click();

			expect(element.shadowRoot.querySelectorAll('.collapse-content.iscollapse')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.collapse-content:not(.iscollapse)')).toHaveSize(1);
		});

		it('sets the style, after color changes in ColorPalette (with LOCAL icon-asset)', async () => {
			const style = { ...StyleOptionTemplate, color: '#f00ba3', symbolSrc: 'data:image/svg+xml;base64,foobar' };

			const element = await setup({ ...drawDefaultState, style });
			setType('marker');

			let colorInput = element.shadowRoot.querySelector('#style_color');
			let colorPalette = element.shadowRoot.querySelector('ba-color-palette');

			colorPalette.dispatchEvent(new CustomEvent('colorChanged', { detail: { color: '#FF0000' } }));
			expect(colorInput.value.toUpperCase()).toBe('#FF0000');
			expect(store.getState().draw.style.color.toUpperCase()).toBe('#FF0000');

			setType('text');
			colorInput = element.shadowRoot.querySelector('#style_color');
			colorPalette = element.shadowRoot.querySelector('ba-color-palette');

			colorPalette.dispatchEvent(new CustomEvent('colorChanged', { detail: { color: '#FFF000' } }));
			expect(colorInput.value.toUpperCase()).toBe('#FFF000');
			expect(store.getState().draw.style.color.toUpperCase()).toBe('#FFF000');

			setType('line');
			colorInput = element.shadowRoot.querySelector('#style_color');
			colorPalette = element.shadowRoot.querySelector('ba-color-palette');

			colorPalette.dispatchEvent(new CustomEvent('colorChanged', { detail: { color: '#FFFF00' } }));
			expect(colorInput.value.toUpperCase()).toBe('#FFFF00');
			expect(store.getState().draw.style.color.toUpperCase()).toBe('#FFFF00');

			setType('polygon');
			colorInput = element.shadowRoot.querySelector('#style_color');
			colorPalette = element.shadowRoot.querySelector('ba-color-palette');

			colorPalette.dispatchEvent(new CustomEvent('colorChanged', { detail: { color: '#FFFFF0' } }));
			expect(colorInput.value.toUpperCase()).toBe('#FFFFF0');
			expect(store.getState().draw.style.color.toUpperCase()).toBe('#FFFFF0');
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

		describe('after color changes in color-input (ignoring icon-asset)', () => {
			it('sets the style for marker', async () => {
				const style = { ...StyleOptionTemplate, color: '#f00ba3', symbolSrc: 'https://some.url/foo/bar/0,0,0/foobar' };
				const newColor = '#ffffff';
				const element = await setup({ ...drawDefaultState, style });
				const iconResultMock = { getUrl: () => 'https://some.url/foo/bar/255,255,255/foobar' };
				spyOn(iconServiceMock, 'getIconResult').and.callFake(() => iconResultMock);
				setType('marker');
				const colorInput = element.shadowRoot.querySelector('#style_color');
				expect(colorInput).toBeTruthy();
				expect(colorInput.value).toBe('#f00ba3');

				colorInput.value = newColor;
				colorInput.dispatchEvent(new Event('input'));

				expect(store.getState().draw.style.color).toBe(newColor);
				expect(store.getState().draw.style.symbolSrc).toBe('https://some.url/foo/bar/255,255,255/foobar');
			});

			it('sets the style for text', async () => {
				const style = { ...StyleOptionTemplate, color: '#f00ba3', symbolSrc: 'https://some.url/foo/bar/0,0,0/foobar' };
				const newColor = '#ffffff';
				const element = await setup({ ...drawDefaultState, style });
				const iconResultMock = { getUrl: () => 'https://some.url/foo/bar/255,255,255/foobar' };
				spyOn(iconServiceMock, 'getIconResult').and.callFake(() => iconResultMock);
				setType('text');
				const colorInput = element.shadowRoot.querySelector('#style_color');
				expect(colorInput).toBeTruthy();
				expect(colorInput.value).toBe('#f00ba3');

				colorInput.value = newColor;
				colorInput.dispatchEvent(new Event('input'));

				expect(store.getState().draw.style.color).toBe(newColor);
				expect(store.getState().draw.style.symbolSrc).toBe('https://some.url/foo/bar/255,255,255/foobar');
			});

			it('sets the style for line', async () => {
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

			it('sets the style for polygon', async () => {
				const style = { ...StyleOptionTemplate, color: '#f00ba3', symbolSrc: 'https://some.url/foo/bar/0,0,0/foobar' };
				const newColor = '#ffffff';
				const element = await setup({ ...drawDefaultState, style });
				const iconResultMock = { getUrl: () => 'https://some.url/foo/bar/255,255,255/foobar' };
				spyOn(iconServiceMock, 'getIconResult').and.callFake(() => iconResultMock);
				setType('polygon');
				const colorInput = element.shadowRoot.querySelector('#style_color');
				expect(colorInput).toBeTruthy();
				expect(colorInput.value).toBe('#f00ba3');

				colorInput.value = newColor;
				colorInput.dispatchEvent(new Event('input'));

				expect(store.getState().draw.style.color).toBe(newColor);
				expect(store.getState().draw.style.symbolSrc).toBe('https://some.url/foo/bar/255,255,255/foobar');
			});
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

		it('sets the style with sanitized text, after text changes in text-input', async () => {
			const style = { ...StyleOptionTemplate, text: 'foo' };
			const newText = 'bar';
			const element = await setup({ ...drawDefaultState, style });
			const sanitizeSpy = spyOn(securityServiceMock, 'sanitizeHtml').withArgs('bar').and.callThrough();

			setType('text');
			const textInput = element.shadowRoot.querySelector('#style_text');
			expect(textInput).toBeTruthy();
			expect(textInput.value).toBe('foo');

			textInput.value = newText;
			textInput.dispatchEvent(new Event('input'));

			expect(store.getState().draw.style.text).toBe(newText);
			expect(sanitizeSpy).toHaveBeenCalled();
		});

		it('resets the style, after empty text-input lost focus', async () => {
			const style = { ...StyleOptionTemplate, text: 'foo' };
			const newText = '';
			const element = await setup({ ...drawDefaultState, style });

			setType('text');
			const textInput = element.shadowRoot.querySelector('#style_text');
			expect(textInput).toBeTruthy();
			expect(textInput.value).toBe('foo');

			textInput.value = newText;
			textInput.dispatchEvent(new Event('input'));

			expect(store.getState().draw.style.text).toBe(newText);

			textInput.dispatchEvent(new Event('blur'));

			expect(store.getState().draw.style.text).toBeNull();
		});

		it('does NOT resets the style, after valid text-input lost focus', async () => {
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

			textInput.dispatchEvent(new Event('blur'));

			expect(store.getState().draw.style.text).toBe(newText);
		});

		it('sets the style, after symbol changes in iconSelect', async () => {
			spyOn(iconServiceMock, 'all').and.returnValue(Promise.resolve([new IconResult('foo', '42'), new IconResult('bar', '42')]));
			const style = { ...StyleOptionTemplate, text: 'foo', symbolSrc: null };
			const element = await setup({ ...drawDefaultState, style });

			setType('marker');
			const iconSelect = element.shadowRoot.querySelector('ba-iconselect');
			expect(iconSelect).toBeTruthy();
			// wait to get icons loaded....
			await TestUtils.timeout();
			// ..then perform ui-actions
			const iconButton = iconSelect.shadowRoot.querySelector('.iconselect__toggle-button');
			iconButton.click();

			const selectableIcon = iconSelect.shadowRoot.querySelector('#svg_foo');
			selectableIcon.click();

			expect(store.getState().draw.style.symbolSrc).toBeTruthy();
		});

		it('sets the style, after symbol changes to symbol in iconSelect and requests url with current color', async () => {
			const iconResult1 = new IconResult('foo', '42');
			const iconResult2 = new IconResult('bar', '42');
			const getUrlSpy1 = spyOn(iconResult1, 'getUrl').and.returnValue('http://some.foo.url');

			spyOn(iconServiceMock, 'all').and.returnValue(Promise.resolve([iconResult1, iconResult2]));
			const style = { ...StyleOptionTemplate, text: 'foo', symbolSrc: null };
			const element = await setup({ ...drawDefaultState, style });

			setType('marker');
			const iconSelect = element.shadowRoot.querySelector('ba-iconselect');
			expect(iconSelect).toBeTruthy();
			// wait to get icons loaded....
			await TestUtils.timeout();
			// ..then perform ui-actions
			const iconButton = iconSelect.shadowRoot.querySelector('.iconselect__toggle-button');
			iconButton.click();

			const selectableIcon = iconSelect.shadowRoot.querySelector('#svg_foo');
			selectableIcon.click();

			expect(store.getState().draw.style.symbolSrc).toBeTruthy();
			expect(getUrlSpy1).toHaveBeenCalledWith(jasmine.arrayContaining([255, 218, 255]));
		});

		it('sets the sanitized description, after description changes in textarea', async () => {
			const newText = 'bar';
			const element = await setup({ ...drawDefaultState, description: 'Foo', style: StyleOptionTemplate });
			const sanitizeSpy = spyOn(securityServiceMock, 'sanitizeHtml').withArgs('bar').and.callThrough();

			setType('text');
			const descriptionTextArea = element.shadowRoot.querySelector('textarea');
			expect(descriptionTextArea).toBeTruthy();
			expect(descriptionTextArea.value).toBe('Foo');

			descriptionTextArea.value = newText;
			descriptionTextArea.dispatchEvent(new Event('input'));

			expect(store.getState().draw.description).toBe(newText);
			expect(sanitizeSpy).toHaveBeenCalled();
		});

		it('sets the statistics in geometry-info, after statistic changes', async () => {
			const element = await setup({ ...drawDefaultState, statistic: { defaultStatistic }, style: StyleOptionTemplate });
			const actualStatistic = { ...defaultStatistic, length: 42 };
			setType('line');
			let geometryInfo = element.shadowRoot.querySelector('ba-geometry-info');
			expect(geometryInfo).toBeTruthy();

			setStatistic(actualStatistic);
			geometryInfo = element.shadowRoot.querySelector('ba-geometry-info');

			expect(element.getModel().statistic).toBe(actualStatistic);
			expect(geometryInfo.statistic).toBe(actualStatistic);
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
			expect(element.shadowRoot.querySelector('#finish-button').title).toBe('toolbox_drawTool_finish_title');
		});

		it('displays the finish-button for line', async () => {
			const element = await setup({ ...drawDefaultState, mode: 'draw', type: 'line', validGeometry: true });

			expect(element.shadowRoot.querySelector('#cancel-button')).toBeFalsy();
			expect(element.shadowRoot.querySelector('#finish-button')).toBeTruthy();
			expect(element.shadowRoot.querySelector('#finish-button').label).toBe('toolbox_drawTool_finish');
			expect(element.shadowRoot.querySelector('#finish-button').title).toBe('toolbox_drawTool_finish_title');
		});

		it('displays NOT the finish-button for marker', async () => {
			const element = await setup({ ...drawDefaultState, mode: 'draw', type: 'marker' });

			expect(element.shadowRoot.querySelector('#cancel-button')).toBeTruthy();
			expect(element.shadowRoot.querySelector('#finish-button')).toBeFalsy();
			expect(element.shadowRoot.querySelector('#cancel-button').label).toBe('toolbox_drawTool_cancel');
			expect(element.shadowRoot.querySelector('#cancel-button').title).toBe('toolbox_drawTool_cancel_title');
		});

		it('displays NOT the finish-button for text', async () => {
			const element = await setup({ ...drawDefaultState, mode: 'draw', type: 'marker' });

			expect(element.shadowRoot.querySelector('#cancel-button')).toBeTruthy();
			expect(element.shadowRoot.querySelector('#finish-button')).toBeFalsy();
			expect(element.shadowRoot.querySelector('#cancel-button').label).toBe('toolbox_drawTool_cancel');
			expect(element.shadowRoot.querySelector('#cancel-button').title).toBe('toolbox_drawTool_cancel_title');
		});

		it('displays the elevation profile chip', async () => {
			const element = await setup({ ...drawDefaultState, mode: 'draw', type: 'polygon', validGeometry: true });

			expect(element.shadowRoot.querySelectorAll('ba-profile-chip')).toHaveSize(1);
		});

		it('contains the share data chip', async () => {
			const element = await setup({ ...drawDefaultState, mode: 'draw', type: 'polygon', validGeometry: true });

			expect(element.shadowRoot.querySelectorAll('ba-share-data-chip')).toHaveSize(1);
		});

		it('contains the export vector data chip', async () => {
			const element = await setup({ ...drawDefaultState, mode: 'draw', type: 'polygon', validGeometry: true });

			expect(element.shadowRoot.querySelectorAll('ba-export-vector-data-chip')).toHaveSize(1);
		});

		it('shows the export vector data chip with exportData', async () => {
			const exportData = '<kml/>';
			const element = await setup({
				...drawDefaultState,
				mode: 'draw',
				type: 'polygon',
				validGeometry: true
			});
			setData(exportData);
			const chipElement = element.shadowRoot.querySelector('ba-export-vector-data-chip');

			expect(chipElement.exportData).toBe(exportData);
		});

		it('finishes the drawing', async () => {
			const element = await setup({ ...drawDefaultState, mode: 'draw', type: 'line', validGeometry: true });
			const finishButton = element.shadowRoot.querySelector('#finish-button');

			finishButton.click();

			expect(store.getState().draw.finish).toBeInstanceOf(EventLike);
		});

		it('expands the info collapsible only in landscape mode', async () => {
			const style = { ...StyleOptionTemplate, color: '#f00ba3', symbolSrc: 'data:image/svg+xml;base64,foobar' };

			const element = await setup({ ...drawDefaultState, style }, {}, { ...defaultMediaState, portrait: true });

			setType('marker');

			expect(element.shadowRoot.querySelectorAll('.iscollapse').length).toBe(2);

			setIsPortrait(false);

			expect(element.shadowRoot.querySelectorAll('.collapse-content.iscollapse').length).toBe(1);
			expect(element.shadowRoot.querySelectorAll('.collapse-content:not(.iscollapse)').length).toBe(1);
		});

		it('sets focus to first input element after first switch to modify', async () => {
			const style = { ...StyleOptionTemplate, color: '#f00ba3', symbolSrc: 'data:image/svg+xml;base64,foobar' };

			const element = await setup({ ...drawDefaultState, style }, {}, { ...defaultMediaState, portrait: false });

			setType('marker');
			setMode('active');
			expect([...element.shadowRoot.querySelectorAll('*:is(input,textarea)')].every((elem) => !elem.matches(':focus'))).toBeTrue();

			setMode('draw');
			expect([...element.shadowRoot.querySelectorAll('*:is(input,textarea)')].every((elem) => !elem.matches(':focus'))).toBeTrue();

			setMode('modify');
			expect([...element.shadowRoot.querySelectorAll('*:is(input,textarea)')].some((elem) => elem.matches(':focus'))).toBeTrue();
		});

		it('resets the drawing', async () => {
			const element = await setup({ ...drawDefaultState, mode: 'draw', type: 'marker' });
			const resetButton = element.shadowRoot.querySelector('#cancel-button');

			resetButton.click();
			expect(resetButton.label).toBe('toolbox_drawTool_cancel');
			expect(resetButton.title).toBe('toolbox_drawTool_cancel_title');
			expect(store.getState().draw.reset).toBeInstanceOf(EventLike);
		});

		it('removes the selected drawing', async () => {
			const element = await setup({ ...drawDefaultState, mode: 'modify', type: 'line' });
			const removeButton = element.shadowRoot.querySelector('#remove-button');

			removeButton.click();
			expect(removeButton.label).toBe('toolbox_drawTool_delete_drawing');
			expect(removeButton.title).toBe('');
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

		describe('with touch-device', () => {
			const touchConfig = {
				embed: false,
				isTouch: true
			};

			it('shows the drawing sub-text for mode:null', async () => {
				const element = await setup({ ...drawDefaultState, mode: null }, touchConfig);
				const subTextElement = element.shadowRoot.querySelector('.sub-text');

				expect(subTextElement).toBeTruthy();
				expect(subTextElement.textContent).toBe('toolbox_drawTool_draw_init');
			});

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
