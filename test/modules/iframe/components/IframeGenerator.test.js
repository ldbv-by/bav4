import { PathParameters } from '../../../../src/domain/pathParameters';
import { $injector } from '../../../../src/injection';
import { Toggle } from '../../../../src/modules/commons/components/toggle/Toggle';
import { IframeGenerator } from '../../../../src/modules/iframe/components/generator/IframeGenerator';
import { LevelTypes } from '../../../../src/store/notifications/notifications.action';
import { notificationReducer } from '../../../../src/store/notifications/notifications.reducer';
import { IFRAME_ENCODED_STATE } from '../../../../src/utils/markup';
import { TestUtils } from '../../../test-utils';

window.customElements.define(IframeGenerator.tag, IframeGenerator);
window.customElements.define(Toggle.tag, Toggle);

describe('IframeGenerator', () => {
	let store;

	const shareServiceMock = {
		encodeState: () => {},
		copyToClipboard() {}
	};

	const setup = () => {
		store = TestUtils.setupStoreAndDi({ notifications: { latest: null } }, { notifications: notificationReducer });
		$injector.registerSingleton('ShareService', shareServiceMock).registerSingleton('TranslationService', { translate: (key) => key });
		return TestUtils.render(IframeGenerator.tag);
	};

	describe('when instantiated', () => {
		it('has a model with default values', async () => {
			await setup();
			const model = new IframeGenerator().getModel();
			expect(model).toEqual({
				size: [800, 600],
				autoWidth: false,
				previewUrl: null
			});
		});
	});

	describe('when initialized', () => {
		it('renders the input elements with correct attributes', async () => {
			const element = await setup();
			const iframeWidthInput = element.shadowRoot.querySelector('#iframe_width');
			const iframeWidthSliderInput = element.shadowRoot.querySelector('#iframe_slider_width');
			const iframeHeightInput = element.shadowRoot.querySelector('#iframe_height');
			const iframeHeightSliderInput = element.shadowRoot.querySelector('#iframe_slider_height');

			expect(iframeWidthInput.value).toBe('800');
			expect(iframeWidthInput.getAttribute('type')).toBe('number');
			expect(iframeWidthInput.getAttribute('min')).toBe('250');
			expect(iframeWidthInput.getAttribute('max')).toBe('2000');

			expect(iframeWidthSliderInput.value).toBe('800');
			expect(iframeWidthSliderInput.getAttribute('type')).toBe('range');
			expect(iframeWidthSliderInput.getAttribute('min')).toBe('250');
			expect(iframeWidthSliderInput.getAttribute('max')).toBe('2000');
			expect(iframeWidthSliderInput.getAttribute('step')).toBe('10');

			expect(iframeHeightInput.value).toBe('600');
			expect(iframeHeightInput.getAttribute('type')).toBe('number');
			expect(iframeHeightInput.getAttribute('min')).toBe('250');
			expect(iframeHeightInput.getAttribute('max')).toBe('2000');

			expect(iframeHeightSliderInput.value).toBe('600');
			expect(iframeHeightSliderInput.getAttribute('type')).toBe('range');
			expect(iframeHeightSliderInput.getAttribute('min')).toBe('250');
			expect(iframeHeightSliderInput.getAttribute('max')).toBe('2000');
			expect(iframeHeightSliderInput.getAttribute('step')).toBe('10');
		});

		it('renders the iframe content', async () => {
			const element = await setup();

			expect(element.shadowRoot.querySelectorAll('iframe')).toHaveSize(1);
		});

		it('specifies the correct iframe source', async () => {
			const expectedUrl = 'https://myhost/app/embed.html?param=foo';
			const shareServiceSpy = spyOn(shareServiceMock, 'encodeState').and.returnValue(expectedUrl);
			const element = await setup();

			const iframeElement = element.shadowRoot.querySelector('iframe');

			expect(iframeElement.src).toBe(expectedUrl);
			expect(shareServiceSpy).toHaveBeenCalledWith({}, [PathParameters.EMBED]);
		});

		it('shows a textarea with a embedable code', async () => {
			const expectedUrl = 'https://myhost/app/embed.html?param=foo';
			const shareServiceSpy = spyOn(shareServiceMock, 'encodeState').and.returnValue(expectedUrl);
			const element = await setup();

			const textAreaElement = element.shadowRoot.querySelector('textarea');

			expect(textAreaElement.readOnly).toBeTrue();
			expect(textAreaElement.value).toBe(
				`<iframe src=${expectedUrl} width='800px' height='600px' loading='lazy' frameborder='0' style='border:0'></iframe>`
			);
			expect(shareServiceSpy).toHaveBeenCalledWith({}, [PathParameters.EMBED]);
		});

		it('shows a ba-icon to copy code to clipboard', async () => {
			const element = await setup();

			const iconElements = element.shadowRoot.querySelectorAll('ba-icon');

			expect(iconElements).toHaveSize(1);
			expect(iconElements[0].classList.contains('iframe__copy_icon')).toBeTrue();
			expect(iconElements[0].title).toBe('iframe_generator_copy_icon');
		});
	});

	describe('when user requests the iframe code', () => {
		it('copies the example html code to clipboard', async () => {
			const expectedUrl = 'https://myhost/app/embed.html?param=foo';
			spyOn(shareServiceMock, 'encodeState').withArgs({}, [PathParameters.EMBED]).and.returnValue(expectedUrl);
			const element = await setup();
			const clipboardSpy = spyOn(shareServiceMock, 'copyToClipboard').and.callThrough();

			const buttonElement = element.shadowRoot.querySelector('#iframe_code_copy');
			buttonElement.click();

			expect(clipboardSpy).toHaveBeenCalledWith(
				`<iframe src=${expectedUrl} width='800px' height='600px' loading='lazy' frameborder='0' style='border:0'></iframe>`
			);
		});

		it('notifies about successfully copied to clipboard', async () => {
			const element = await setup();

			const buttonElement = element.shadowRoot.querySelector('#iframe_code_copy');
			buttonElement.click();
			await TestUtils.timeout(); //waiting for async ShareAPI call

			expect(store.getState().notifications.latest.payload.content).toBe('iframe_generator_clipboard_success');
			expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.INFO);
		});

		it('notifies about failed copy to clipboard', async () => {
			const element = await setup();
			spyOn(shareServiceMock, 'copyToClipboard').and.throwError();

			const buttonElement = element.shadowRoot.querySelector('#iframe_code_copy');
			buttonElement.click();
			await TestUtils.timeout(); //waiting for async ShareAPI call

			expect(store.getState().notifications.latest.payload.content).toBe('iframe_generator_clipboard_error');
			expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.WARN);
		});
	});

	describe('when input values for size changes', () => {
		it('renders iframe with the changed values', async () => {
			const expectedUrl = 'https://myhost/app/embed.html?param=foo';
			spyOn(shareServiceMock, 'encodeState').withArgs({}, [PathParameters.EMBED]).and.returnValue(expectedUrl);
			const element = await setup();
			const textElement = element.shadowRoot.querySelector('#iframe_code');
			const widthInputElement = element.shadowRoot.querySelector('#iframe_width');
			const heightInputElement = element.shadowRoot.querySelector('#iframe_height');
			const iframeElement = element.shadowRoot.querySelector('iframe');

			// init values
			expect(iframeElement.width).toBe('800px');
			expect(textElement.value).toBe(
				`<iframe src=${expectedUrl} width='800px' height='600px' loading='lazy' frameborder='0' style='border:0'></iframe>`
			);

			// changing width
			widthInputElement.value = 420;
			widthInputElement.dispatchEvent(new Event('input'));

			expect(iframeElement.width).toBe('420px');
			expect(textElement.value).toBe(
				`<iframe src=${expectedUrl} width='420px' height='600px' loading='lazy' frameborder='0' style='border:0'></iframe>`
			);

			// changing height
			heightInputElement.value = 620;
			heightInputElement.dispatchEvent(new Event('input'));

			expect(iframeElement.height).toBe('620px');
			expect(textElement.value).toBe(
				`<iframe src=${expectedUrl} width='420px' height='620px' loading='lazy' frameborder='0' style='border:0'></iframe>`
			);
		});

		it('does NOT render the iframe when values are out of range', async () => {
			const expectedUrl = 'https://myhost/app/embed.html?param=foo';
			spyOn(shareServiceMock, 'encodeState').withArgs({}, [PathParameters.EMBED]).and.returnValue(expectedUrl);
			const element = await setup();
			const textElement = element.shadowRoot.querySelector('#iframe_code');
			const widthInputElement = element.shadowRoot.querySelector('#iframe_width');
			const heightInputElement = element.shadowRoot.querySelector('#iframe_height');
			const iframeElement = element.shadowRoot.querySelector('iframe');

			// init values
			expect(iframeElement.width).toBe('800px');
			expect(textElement.value).toBe(
				`<iframe src=${expectedUrl} width='800px' height='600px' loading='lazy' frameborder='0' style='border:0'></iframe>`
			);

			// changing width
			widthInputElement.value = 42;
			widthInputElement.dispatchEvent(new Event('input'));

			expect(iframeElement.width).toBe('800px');
			expect(textElement.value).toBe(
				`<iframe src=${expectedUrl} width='800px' height='600px' loading='lazy' frameborder='0' style='border:0'></iframe>`
			);

			// changing height
			heightInputElement.value = 4200;
			heightInputElement.dispatchEvent(new Event('input'));

			expect(iframeElement.height).toBe('600px');
			expect(textElement.value).toBe(
				`<iframe src=${expectedUrl} width='800px' height='600px' loading='lazy' frameborder='0' style='border:0'></iframe>`
			);
		});

		it('renders iframe with the changed slider values', async () => {
			const expectedUrl = 'https://myhost/app/embed.html?param=foo';
			spyOn(shareServiceMock, 'encodeState').withArgs({}, [PathParameters.EMBED]).and.returnValue(expectedUrl);
			const element = await setup();
			const textElement = element.shadowRoot.querySelector('#iframe_code');
			const widthInputElement = element.shadowRoot.querySelector('#iframe_slider_width');
			const heightInputElement = element.shadowRoot.querySelector('#iframe_slider_height');
			const iframeElement = element.shadowRoot.querySelector('iframe');

			// init values
			expect(iframeElement.width).toBe('800px');
			expect(textElement.value).toBe(
				`<iframe src=${expectedUrl} width='800px' height='600px' loading='lazy' frameborder='0' style='border:0'></iframe>`
			);

			// changing width
			widthInputElement.value = 310;
			widthInputElement.dispatchEvent(new Event('input'));

			expect(iframeElement.width).toBe('310px');
			expect(textElement.value).toBe(
				`<iframe src=${expectedUrl} width='310px' height='600px' loading='lazy' frameborder='0' style='border:0'></iframe>`
			);

			// changing height
			heightInputElement.value = 420;
			heightInputElement.dispatchEvent(new Event('input'));

			expect(iframeElement.height).toBe('420px');
			expect(textElement.value).toBe(
				`<iframe src=${expectedUrl} width='310px' height='420px' loading='lazy' frameborder='0' style='border:0'></iframe>`
			);
		});

		it('renders iframe with the min slider values', async () => {
			const expectedUrl = 'https://myhost/app/embed.html?param=foo';
			spyOn(shareServiceMock, 'encodeState').withArgs({}, [PathParameters.EMBED]).and.returnValue(expectedUrl);
			const element = await setup();
			const textElement = element.shadowRoot.querySelector('#iframe_code');
			const widthInputElement = element.shadowRoot.querySelector('#iframe_slider_width');
			const heightInputElement = element.shadowRoot.querySelector('#iframe_slider_height');
			const iframeElement = element.shadowRoot.querySelector('iframe');

			// init values
			expect(iframeElement.width).toBe('800px');
			expect(textElement.value).toBe(
				`<iframe src=${expectedUrl} width='800px' height='600px' loading='lazy' frameborder='0' style='border:0'></iframe>`
			);

			// changing width
			widthInputElement.value = 42;
			widthInputElement.dispatchEvent(new Event('input'));

			expect(iframeElement.width).toBe('250px');
			expect(textElement.value).toBe(
				`<iframe src=${expectedUrl} width='250px' height='600px' loading='lazy' frameborder='0' style='border:0'></iframe>`
			);

			// changing height
			heightInputElement.value = 42;
			heightInputElement.dispatchEvent(new Event('input'));

			expect(iframeElement.height).toBe('250px');
			expect(textElement.value).toBe(
				`<iframe src=${expectedUrl} width='250px' height='250px' loading='lazy' frameborder='0' style='border:0'></iframe>`
			);
		});

		it('renders iframe with the max slider values', async () => {
			const expectedUrl = 'https://myhost/app/embed.html?param=foo';
			spyOn(shareServiceMock, 'encodeState').withArgs({}, [PathParameters.EMBED]).and.returnValue(expectedUrl);
			const element = await setup();

			const textElement = element.shadowRoot.querySelector('#iframe_code');
			const widthInputElement = element.shadowRoot.querySelector('#iframe_slider_width');
			const heightInputElement = element.shadowRoot.querySelector('#iframe_slider_height');
			const iframeElement = element.shadowRoot.querySelector('iframe');

			// init values
			expect(iframeElement.width).toBe('800px');
			expect(textElement.value).toBe(
				`<iframe src=${expectedUrl} width='800px' height='600px' loading='lazy' frameborder='0' style='border:0'></iframe>`
			);

			// changing width
			widthInputElement.value = 3000;
			widthInputElement.dispatchEvent(new Event('input'));

			expect(iframeElement.width).toBe('2000px');
			expect(textElement.value).toBe(
				`<iframe src=${expectedUrl} width='2000px' height='600px' loading='lazy' frameborder='0' style='border:0'></iframe>`
			);

			// changing height
			heightInputElement.value = 3000;
			heightInputElement.dispatchEvent(new Event('input'));

			expect(iframeElement.height).toBe('2000px');
			expect(textElement.value).toBe(
				`<iframe src=${expectedUrl} width='2000px' height='2000px' loading='lazy' frameborder='0' style='border:0'></iframe>`
			);
		});

		it('toggles auto width', async () => {
			const expectedUrl = 'https://myhost/app/embed.html?param=foo';
			spyOn(shareServiceMock, 'encodeState').withArgs({}, [PathParameters.EMBED]).and.returnValue(expectedUrl);
			const element = await setup();
			const toggle = element.shadowRoot.querySelector('#toggleAutoWidth');
			const textElement = element.shadowRoot.querySelector('#iframe_code');
			const iframeElement = element.shadowRoot.querySelector('iframe');

			toggle.click();

			expect(element.shadowRoot.querySelectorAll('#iframe_width')).toHaveSize(0);
			expect(element.shadowRoot.querySelector('.width_placeholder').textContent).toBe('100');
			expect(iframeElement.width).toBe('100%');
			expect(textElement.value).toBe(
				`<iframe src=${expectedUrl} width='100%' height='600px' loading='lazy' frameborder='0' style='border:0'></iframe>`
			);

			toggle.click();

			expect(element.shadowRoot.querySelectorAll('#iframe_width')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.width_placeholder')).toHaveSize(0);
			expect(iframeElement.width).toBe('800px');
			expect(textElement.value).toBe(
				`<iframe src=${expectedUrl} width='800px' height='600px' loading='lazy' frameborder='0' style='border:0'></iframe>`
			);
		});
	});

	describe('when iframe source changes by user interaction (drag&zoom)', () => {
		it('renders iframe with the changed values', async () => {
			const expectedUrl = 'https://myhost/app/embed.html?param=foo';
			spyOn(shareServiceMock, 'encodeState').withArgs({}, [PathParameters.EMBED]).and.returnValue(expectedUrl);
			const element = await setup();

			const textElement = element.shadowRoot.querySelector('#iframe_code');
			const iframeElement = element.shadowRoot.querySelector('iframe');

			expect(textElement.value).toBe(
				`<iframe src=${expectedUrl} width='800px' height='600px' loading='lazy' frameborder='0' style='border:0'></iframe>`
			);

			iframeElement.setAttribute(IFRAME_ENCODED_STATE, 'foo');
			await TestUtils.timeout();

			expect(textElement.value).toBe("<iframe src=foo width='800px' height='600px' loading='lazy' frameborder='0' style='border:0'></iframe>");
		});
	});
});
