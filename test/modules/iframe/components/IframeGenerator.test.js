import { $injector } from '../../../../src/injection';
import { Toggle } from '../../../../src/modules/commons/components/toggle/Toggle';
import { IframeGenerator } from '../../../../src/modules/iframe/components/iframeGenerator/IframeGenerator';
import { LevelTypes } from '../../../../src/store/notifications/notifications.action';
import { notificationReducer } from '../../../../src/store/notifications/notifications.reducer';
import { IFRAME_ENCODED_STATE } from '../../../../src/utils/markup';
import { TestUtils } from '../../../test-utils';

window.customElements.define(IframeGenerator.tag, IframeGenerator);
window.customElements.define(Toggle.tag, Toggle);

describe('IframeGenerator', () => {
	let store;

	const shareServiceMock = {
		encodeState: () => 'https://myhost/app/embed.html?param=foo',
		copyToClipboard() {}
	};

	const setup = () => {
		store = TestUtils.setupStoreAndDi({ notifications: { latest: null } }, { notifications: notificationReducer });
		$injector.registerSingleton('ShareService', shareServiceMock).registerSingleton('TranslationService', { translate: (key) => key });
		return TestUtils.render(IframeGenerator.tag);
	};

	describe('when instantiated', () => {
		it('has a model with default values', async () => {
			const element = await setup();
			const model = element.getModel();
			expect(model).toEqual({
				size: [800, 600],
				autoWidth: false,
				previewUrl: null
			});
		});
	});

	describe('when initialized', () => {
		it('renders iframe content', async () => {
			const element = await setup();

			expect(element.shadowRoot.querySelectorAll('iframe')).toHaveSize(1);
		});

		it('specifies correct iframe source', async () => {
			const element = await setup();

			const iframeElement = element.shadowRoot.querySelector('iframe');

			expect(iframeElement.src).toBe('https://myhost/app/embed.html?param=foo');
		});

		it('shows a textarea with a embedable code', async () => {
			const element = await setup();

			const textAreaElement = element.shadowRoot.querySelector('textarea');

			expect(textAreaElement.readOnly).toBeTrue();
			expect(textAreaElement.value).toBe(
				"<iframe src=https://myhost/app/embed.html?param=foo width='800px' height='600px' loading='lazy' frameborder='0' style='border:0'></iframe>"
			);
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
			const element = await setup();
			const clipboardSpy = spyOn(shareServiceMock, 'copyToClipboard').and.callThrough();

			const buttonElement = element.shadowRoot.querySelector('#iframe_code_copy');
			buttonElement.click();

			expect(clipboardSpy).toHaveBeenCalledWith(
				"<iframe src=https://myhost/app/embed.html?param=foo width='800px' height='600px' loading='lazy' frameborder='0' style='border:0'></iframe>"
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
			const element = await setup();
			const textElement = element.shadowRoot.querySelector('#iframe_code');
			const widthInputElement = element.shadowRoot.querySelector('#iframe_width');
			const heightInputElement = element.shadowRoot.querySelector('#iframe_height');
			const iframeElement = element.shadowRoot.querySelector('iframe');

			// init values
			expect(iframeElement.width).toBe('800px');
			expect(textElement.value).toBe(
				"<iframe src=https://myhost/app/embed.html?param=foo width='800px' height='600px' loading='lazy' frameborder='0' style='border:0'></iframe>"
			);

			// changing width
			widthInputElement.value = 42;
			widthInputElement.dispatchEvent(new Event('input'));

			expect(iframeElement.width).toBe('42px');
			expect(textElement.value).toBe(
				"<iframe src=https://myhost/app/embed.html?param=foo width='42px' height='600px' loading='lazy' frameborder='0' style='border:0'></iframe>"
			);

			// changing height
			heightInputElement.value = 420;
			heightInputElement.dispatchEvent(new Event('input'));

			expect(iframeElement.height).toBe('420px');
			expect(textElement.value).toBe(
				"<iframe src=https://myhost/app/embed.html?param=foo width='42px' height='420px' loading='lazy' frameborder='0' style='border:0'></iframe>"
			);
		});

		it('renders iframe with the changed slider values', async () => {
			const element = await setup();
			const textElement = element.shadowRoot.querySelector('#iframe_code');
			const widthInputElement = element.shadowRoot.querySelector('#iframe_slider_width');
			const heightInputElement = element.shadowRoot.querySelector('#iframe_slider_height');
			const iframeElement = element.shadowRoot.querySelector('iframe');

			// init values
			expect(iframeElement.width).toBe('800px');
			expect(textElement.value).toBe(
				"<iframe src=https://myhost/app/embed.html?param=foo width='800px' height='600px' loading='lazy' frameborder='0' style='border:0'></iframe>"
			);

			// changing width
			widthInputElement.value = 210;
			widthInputElement.dispatchEvent(new Event('input'));

			expect(iframeElement.width).toBe('210px');
			expect(textElement.value).toBe(
				"<iframe src=https://myhost/app/embed.html?param=foo width='210px' height='600px' loading='lazy' frameborder='0' style='border:0'></iframe>"
			);

			// changing height
			heightInputElement.value = 420;
			heightInputElement.dispatchEvent(new Event('input'));

			expect(iframeElement.height).toBe('420px');
			expect(textElement.value).toBe(
				"<iframe src=https://myhost/app/embed.html?param=foo width='210px' height='420px' loading='lazy' frameborder='0' style='border:0'></iframe>"
			);
		});

		it('renders iframe with the min slider values', async () => {
			const element = await setup();
			const textElement = element.shadowRoot.querySelector('#iframe_code');
			const widthInputElement = element.shadowRoot.querySelector('#iframe_slider_width');
			const heightInputElement = element.shadowRoot.querySelector('#iframe_slider_height');
			const iframeElement = element.shadowRoot.querySelector('iframe');

			// init values
			expect(iframeElement.width).toBe('800px');
			expect(textElement.value).toBe(
				"<iframe src=https://myhost/app/embed.html?param=foo width='800px' height='600px' loading='lazy' frameborder='0' style='border:0'></iframe>"
			);

			// changing width
			widthInputElement.value = 42;
			widthInputElement.dispatchEvent(new Event('input'));

			expect(iframeElement.width).toBe('100px');
			expect(textElement.value).toBe(
				"<iframe src=https://myhost/app/embed.html?param=foo width='100px' height='600px' loading='lazy' frameborder='0' style='border:0'></iframe>"
			);

			// changing height
			heightInputElement.value = 42;
			heightInputElement.dispatchEvent(new Event('input'));

			expect(iframeElement.height).toBe('100px');
			expect(textElement.value).toBe(
				"<iframe src=https://myhost/app/embed.html?param=foo width='100px' height='100px' loading='lazy' frameborder='0' style='border:0'></iframe>"
			);
		});

		it('renders iframe with the max slider values', async () => {
			const element = await setup();

			const textElement = element.shadowRoot.querySelector('#iframe_code');
			const widthInputElement = element.shadowRoot.querySelector('#iframe_slider_width');
			const heightInputElement = element.shadowRoot.querySelector('#iframe_slider_height');
			const iframeElement = element.shadowRoot.querySelector('iframe');

			// init values
			expect(iframeElement.width).toBe('800px');
			expect(textElement.value).toBe(
				"<iframe src=https://myhost/app/embed.html?param=foo width='800px' height='600px' loading='lazy' frameborder='0' style='border:0'></iframe>"
			);

			// changing width
			widthInputElement.value = 3000;
			widthInputElement.dispatchEvent(new Event('input'));

			expect(iframeElement.width).toBe('2000px');
			expect(textElement.value).toBe(
				"<iframe src=https://myhost/app/embed.html?param=foo width='2000px' height='600px' loading='lazy' frameborder='0' style='border:0'></iframe>"
			);

			// changing height
			heightInputElement.value = 3000;
			heightInputElement.dispatchEvent(new Event('input'));

			expect(iframeElement.height).toBe('2000px');
			expect(textElement.value).toBe(
				"<iframe src=https://myhost/app/embed.html?param=foo width='2000px' height='2000px' loading='lazy' frameborder='0' style='border:0'></iframe>"
			);
		});

		it('toggles auto width', async () => {
			const element = await setup();
			const toggle = element.shadowRoot.querySelector('#toggleAutoWidth');
			const textElement = element.shadowRoot.querySelector('#iframe_code');
			const iframeElement = element.shadowRoot.querySelector('iframe');
			const widthInputElement = element.shadowRoot.querySelector('#iframe_width');

			toggle.click();

			expect(widthInputElement.value).toBe('');
			expect(iframeElement.width).toBe('100%');
			expect(textElement.value).toBe(
				"<iframe src=https://myhost/app/embed.html?param=foo width='100%' height='600px' loading='lazy' frameborder='0' style='border:0'></iframe>"
			);

			toggle.click();

			expect(widthInputElement.value).toBe('800');
			expect(iframeElement.width).toBe('800px');
			expect(textElement.value).toBe(
				"<iframe src=https://myhost/app/embed.html?param=foo width='800px' height='600px' loading='lazy' frameborder='0' style='border:0'></iframe>"
			);
		});
	});

	describe('when iframe source changes by user interaction (drag&zoom)', () => {
		it('renders iframe with the changed values', async () => {
			const element = await setup();

			const textElement = element.shadowRoot.querySelector('#iframe_code');
			const iframeElement = element.shadowRoot.querySelector('iframe');

			expect(textElement.value).toBe(
				"<iframe src=https://myhost/app/embed.html?param=foo width='800px' height='600px' loading='lazy' frameborder='0' style='border:0'></iframe>"
			);

			iframeElement.setAttribute(IFRAME_ENCODED_STATE, 'foo');
			await TestUtils.timeout();

			expect(textElement.value).toBe("<iframe src=foo width='800px' height='600px' loading='lazy' frameborder='0' style='border:0'></iframe>");
		});
	});
});
