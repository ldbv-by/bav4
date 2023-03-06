import { $injector } from '../../../../src/injection';
import { Toggle } from '../../../../src/modules/commons/components/toggle/Toggle';
import { IFrameGenerator } from '../../../../src/modules/iframe/components/iframeGenerator/IFrameGenerator';
import { LevelTypes } from '../../../../src/store/notifications/notifications.action';
import { notificationReducer } from '../../../../src/store/notifications/notifications.reducer';
import { IFRAME_ENCODED_STATE } from '../../../../src/utils/markup';
import { TestUtils } from '../../../test-utils';

window.customElements.define(IFrameGenerator.tag, IFrameGenerator);
window.customElements.define(Toggle.tag, Toggle);

describe('IFrameGenerator', () => {
	let store;

	const shareServiceMock = {
		encodeState: () => 'https://myhost/app/embed.html?param=foo',
		copyToClipboard() {}
	};
	const mockWindow = {
		location: {
			protocol: 'https:',
			host: 'myhost/',
			pathname: 'app/'
		},
		parent: {
			location: 'iframe'
		}
	};

	const environmentServiceMock = {
		getWindow: () => mockWindow,
		isEmbedded: () => false
	};

	const setup = () => {
		store = TestUtils.setupStoreAndDi({ notifications: { latest: null } }, { notifications: notificationReducer });
		$injector
			.registerSingleton('EnvironmentService', environmentServiceMock)
			.registerSingleton('ShareService', shareServiceMock)
			.registerSingleton('TranslationService', { translate: (key) => key });
		return TestUtils.render(IFrameGenerator.tag);
	};

	describe('when instantiated', () => {
		it('has a model with default values', async () => {
			const element = await setup();
			const model = element.getModel();
			expect(model).toEqual({
				size: [800, 600],
				autoWidth: false
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

		it('copies the example html code to clipboard', async () => {
			const element = await setup();
			const clipboardSpy = spyOn(shareServiceMock, 'copyToClipboard').and.callThrough();

			const buttonElement = element.shadowRoot.querySelector('#iframe-button');
			buttonElement.click();

			expect(clipboardSpy).toHaveBeenCalledWith(
				"<iframe src=https://myhost/app/embed.html?param=foo width='800px' height='600px' loading='lazy' frameborder='0' style='border:0'></iframe>"
			);
		});

		it('notifies about successfully copied to clipboard', async () => {
			const element = await setup();

			const buttonElement = element.shadowRoot.querySelector('#iframe-button');
			buttonElement.click();
			await TestUtils.timeout(); //waiting for async ShareAPI call

			expect(store.getState().notifications.latest.payload.content).toBe('iframe_embed_clipboard_success');
			expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.INFO);
		});

		it('notifies about failed copy to clipboard', async () => {
			const element = await setup();
			spyOn(shareServiceMock, 'copyToClipboard').and.throwError();

			const buttonElement = element.shadowRoot.querySelector('#iframe-button');
			buttonElement.click();
			await TestUtils.timeout(); //waiting for async ShareAPI call

			expect(store.getState().notifications.latest.payload.content).toBe('iframe_embed_clipboard_error');
			expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.WARN);
		});
	});

	describe('when input values for size changes', () => {
		it('renders iframe with the changed values', async () => {
			const element = await setup();
			const clipboardSpy = spyOn(shareServiceMock, 'copyToClipboard').and.callThrough();

			const buttonElement = element.shadowRoot.querySelector('#iframe-button');
			const widthInputElement = element.shadowRoot.querySelector('#iframe_width');
			const heightInputElement = element.shadowRoot.querySelector('#iframe_height');
			const iframeElement = element.shadowRoot.querySelector('iframe');

			// init values
			expect(iframeElement.width).toBe('800px');
			buttonElement.click();
			expect(clipboardSpy).toHaveBeenCalledWith(
				"<iframe src=https://myhost/app/embed.html?param=foo width='800px' height='600px' loading='lazy' frameborder='0' style='border:0'></iframe>"
			);
			clipboardSpy.calls.reset();

			// changing width
			widthInputElement.value = 42;
			widthInputElement.dispatchEvent(new Event('input'));

			expect(iframeElement.width).toBe('42px');
			buttonElement.click();
			expect(clipboardSpy).toHaveBeenCalledWith(
				"<iframe src=https://myhost/app/embed.html?param=foo width='42px' height='600px' loading='lazy' frameborder='0' style='border:0'></iframe>"
			);
			clipboardSpy.calls.reset();

			// changing height
			heightInputElement.value = 420;
			heightInputElement.dispatchEvent(new Event('input'));

			expect(iframeElement.height).toBe('420px');
			buttonElement.click();
			expect(clipboardSpy).toHaveBeenCalledWith(
				"<iframe src=https://myhost/app/embed.html?param=foo width='42px' height='420px' loading='lazy' frameborder='0' style='border:0'></iframe>"
			);
		});

		it('renders iframe with the changed slider values', async () => {
			const element = await setup();
			const clipboardSpy = spyOn(shareServiceMock, 'copyToClipboard').and.callThrough();

			const buttonElement = element.shadowRoot.querySelector('#iframe-button');
			const widthInputElement = element.shadowRoot.querySelector('#iframe_slider_width');
			const heightInputElement = element.shadowRoot.querySelector('#iframe_slider_height');
			const iframeElement = element.shadowRoot.querySelector('iframe');

			// init values
			expect(iframeElement.width).toBe('800px');
			buttonElement.click();
			expect(clipboardSpy).toHaveBeenCalledWith(
				"<iframe src=https://myhost/app/embed.html?param=foo width='800px' height='600px' loading='lazy' frameborder='0' style='border:0'></iframe>"
			);
			clipboardSpy.calls.reset();

			// changing width
			widthInputElement.value = 210;
			widthInputElement.dispatchEvent(new Event('input'));

			expect(iframeElement.width).toBe('210px');
			buttonElement.click();
			expect(clipboardSpy).toHaveBeenCalledWith(
				"<iframe src=https://myhost/app/embed.html?param=foo width='210px' height='600px' loading='lazy' frameborder='0' style='border:0'></iframe>"
			);
			clipboardSpy.calls.reset();

			// changing height
			heightInputElement.value = 420;
			heightInputElement.dispatchEvent(new Event('input'));

			expect(iframeElement.height).toBe('420px');
			buttonElement.click();
			expect(clipboardSpy).toHaveBeenCalledWith(
				"<iframe src=https://myhost/app/embed.html?param=foo width='210px' height='420px' loading='lazy' frameborder='0' style='border:0'></iframe>"
			);
		});

		it('renders iframe with the min slider values', async () => {
			const element = await setup();
			const clipboardSpy = spyOn(shareServiceMock, 'copyToClipboard').and.callThrough();

			const buttonElement = element.shadowRoot.querySelector('#iframe-button');
			const widthInputElement = element.shadowRoot.querySelector('#iframe_slider_width');
			const heightInputElement = element.shadowRoot.querySelector('#iframe_slider_height');
			const iframeElement = element.shadowRoot.querySelector('iframe');

			// init values
			expect(iframeElement.width).toBe('800px');
			buttonElement.click();
			expect(clipboardSpy).toHaveBeenCalledWith(
				"<iframe src=https://myhost/app/embed.html?param=foo width='800px' height='600px' loading='lazy' frameborder='0' style='border:0'></iframe>"
			);
			clipboardSpy.calls.reset();

			// changing width
			widthInputElement.value = 42;
			widthInputElement.dispatchEvent(new Event('input'));

			expect(iframeElement.width).toBe('100px');
			buttonElement.click();
			expect(clipboardSpy).toHaveBeenCalledWith(
				"<iframe src=https://myhost/app/embed.html?param=foo width='100px' height='600px' loading='lazy' frameborder='0' style='border:0'></iframe>"
			);
			clipboardSpy.calls.reset();

			// changing height
			heightInputElement.value = 42;
			heightInputElement.dispatchEvent(new Event('input'));

			expect(iframeElement.height).toBe('100px');
			buttonElement.click();
			expect(clipboardSpy).toHaveBeenCalledWith(
				"<iframe src=https://myhost/app/embed.html?param=foo width='100px' height='100px' loading='lazy' frameborder='0' style='border:0'></iframe>"
			);
		});

		it('renders iframe with the max slider values', async () => {
			const element = await setup();
			const clipboardSpy = spyOn(shareServiceMock, 'copyToClipboard').and.callThrough();

			const buttonElement = element.shadowRoot.querySelector('#iframe-button');
			const widthInputElement = element.shadowRoot.querySelector('#iframe_slider_width');
			const heightInputElement = element.shadowRoot.querySelector('#iframe_slider_height');
			const iframeElement = element.shadowRoot.querySelector('iframe');

			// init values
			expect(iframeElement.width).toBe('800px');
			buttonElement.click();
			expect(clipboardSpy).toHaveBeenCalledWith(
				"<iframe src=https://myhost/app/embed.html?param=foo width='800px' height='600px' loading='lazy' frameborder='0' style='border:0'></iframe>"
			);
			clipboardSpy.calls.reset();

			// changing width
			widthInputElement.value = 3000;
			widthInputElement.dispatchEvent(new Event('input'));

			expect(iframeElement.width).toBe('2000px');
			buttonElement.click();
			expect(clipboardSpy).toHaveBeenCalledWith(
				"<iframe src=https://myhost/app/embed.html?param=foo width='2000px' height='600px' loading='lazy' frameborder='0' style='border:0'></iframe>"
			);
			clipboardSpy.calls.reset();

			// changing height
			heightInputElement.value = 3000;
			heightInputElement.dispatchEvent(new Event('input'));

			expect(iframeElement.height).toBe('2000px');
			buttonElement.click();
			expect(clipboardSpy).toHaveBeenCalledWith(
				"<iframe src=https://myhost/app/embed.html?param=foo width='2000px' height='2000px' loading='lazy' frameborder='0' style='border:0'></iframe>"
			);
		});

		it('toggles auto width', async () => {
			const element = await setup();
			const clipboardSpy = spyOn(shareServiceMock, 'copyToClipboard').and.callThrough();

			const toggle = element.shadowRoot.querySelector('#toggleAutoWidth');
			const buttonElement = element.shadowRoot.querySelector('#iframe-button');
			const iframeElement = element.shadowRoot.querySelector('iframe');
			const widthInputElement = element.shadowRoot.querySelector('#iframe_width');

			toggle.click();

			expect(widthInputElement.value).toBe('');
			expect(iframeElement.width).toBe('100%');
			buttonElement.click();
			expect(clipboardSpy).toHaveBeenCalledWith(
				"<iframe src=https://myhost/app/embed.html?param=foo width='100%' height='600px' loading='lazy' frameborder='0' style='border:0'></iframe>"
			);

			toggle.click();

			expect(widthInputElement.value).toBe('800');
			expect(iframeElement.width).toBe('800px');
		});
	});

	describe('when iframe source changes by user interaction (drag&zoom)', () => {
		it('renders iframe with the changed values', async () => {
			const element = await setup();
			const clipboardSpy = spyOn(shareServiceMock, 'copyToClipboard').and.callThrough();

			const buttonElement = element.shadowRoot.querySelector('#iframe-button');
			const iframeElement = element.shadowRoot.querySelector('iframe');

			// init values
			buttonElement.click();
			expect(clipboardSpy).toHaveBeenCalledWith(
				"<iframe src=https://myhost/app/embed.html?param=foo width='800px' height='600px' loading='lazy' frameborder='0' style='border:0'></iframe>"
			);
			clipboardSpy.calls.reset();

			iframeElement.setAttribute(IFRAME_ENCODED_STATE, 'foo');

			buttonElement.click();
			expect(clipboardSpy).toHaveBeenCalledWith(
				"<iframe src=foo width='800px' height='600px' loading='lazy' frameborder='0' style='border:0'></iframe>"
			);
		});
	});
});
