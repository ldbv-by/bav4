import { $injector } from '../../../../src/injection';
import { IFrameGenerator } from '../../../../src/modules/iframe/components/iframeGenerator/IFrameGenerator';
import { LevelTypes } from '../../../../src/store/notifications/notifications.action';
import { notificationReducer } from '../../../../src/store/notifications/notifications.reducer';
import { TestUtils } from '../../../test-utils';

window.customElements.define(IFrameGenerator.tag, IFrameGenerator);

describe('IFrameGenerator', () => {
	let store;

	const shareServiceMock = {
		encodeState: () => 'https://myhost/app/?param=foo',
		copyToClipboard() { }
	};
	// const baseLocation = `${location.protocol}//${location.host}${location.pathname}` + '?';
	const mockWindow = {
		location: {
			protocol: 'https:',
			host: 'myhost/',
			pathname: 'app/' },
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
		$injector.registerSingleton('EnvironmentService', environmentServiceMock)
			.registerSingleton('ShareService', shareServiceMock)
			.registerSingleton('TranslationService', { translate: (key) => key });
		return TestUtils.render(IFrameGenerator.tag);

	};

	describe('when instantiated', () => {

		it('has a model with default values', async () => {
			const element = await setup();
			const model = element.getModel();
			expect(model).toEqual({
				size: ['400px', '300px']
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

		it('renders embeddable example html code', async () => {
			const element = await setup();

			const inputElement = element.shadowRoot.querySelector('.iframe__embed_string input');

			expect(inputElement.value).toBe('<iframe src=https://myhost/app/embed.html?param=foo width=\'400px\' height=\'300px\' loading=\'lazy\' frameborder=\'0\' style=\'border:0\'></iframe>');
		});

		it('copies the example html code to clipboard', async () => {
			const element = await setup();
			const clipboardSpy = spyOn(shareServiceMock, 'copyToClipboard').and.callThrough();

			const iconElement = element.shadowRoot.querySelector('.iframe__embed_string ba-icon');
			iconElement.click();

			expect(clipboardSpy).toHaveBeenCalledWith('<iframe src=https://myhost/app/embed.html?param=foo width=\'400px\' height=\'300px\' loading=\'lazy\' frameborder=\'0\' style=\'border:0\'></iframe>');
		});


		it('notifies about successfully copied to clipboard', async () => {
			const element = await setup();

			const iconElement = element.shadowRoot.querySelector('.iframe__embed_string ba-icon');
			iconElement.click();
			await TestUtils.timeout(); //waiting for async ShareAPI call

			expect(store.getState().notifications.latest.payload.content).toBe('iframe_embed_clipboard_success');
			expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.INFO);
		});

		it('notifies about failed copy to clipboard', async () => {
			const element = await setup();
			spyOn(shareServiceMock, 'copyToClipboard').and.throwError();

			const iconElement = element.shadowRoot.querySelector('.iframe__embed_string ba-icon');
			iconElement.click();
			await TestUtils.timeout(); //waiting for async ShareAPI call

			expect(store.getState().notifications.latest.payload.content).toBe('iframe_embed_clipboard_error');
			expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.WARN);
		});

	});

	describe('when input values for size changes', () => {
		it('renders iframe with the changed values', async () => {
			const element = await setup();

			const inputElement = element.shadowRoot.querySelector('.iframe__embed_string input');
			const widthInputElement = element.shadowRoot.querySelector('#iframe_width');
			const heightInputElement = element.shadowRoot.querySelector('#iframe_height');
			const iframeElement = element.shadowRoot.querySelector('iframe');
			expect(inputElement.value).toBe('<iframe src=https://myhost/app/embed.html?param=foo width=\'400px\' height=\'300px\' loading=\'lazy\' frameborder=\'0\' style=\'border:0\'></iframe>');

			widthInputElement.value = '42px';
			widthInputElement.dispatchEvent(new Event('input'));

			expect(inputElement.value).toBe('<iframe src=https://myhost/app/embed.html?param=foo width=\'42px\' height=\'300px\' loading=\'lazy\' frameborder=\'0\' style=\'border:0\'></iframe>');
			expect(iframeElement.width).toBe('42px');

			heightInputElement.value = '420px';
			heightInputElement.dispatchEvent(new Event('input'));

			expect(inputElement.value).toBe('<iframe src=https://myhost/app/embed.html?param=foo width=\'42px\' height=\'420px\' loading=\'lazy\' frameborder=\'0\' style=\'border:0\'></iframe>');
			expect(iframeElement.height).toBe('420px');
		});
	});
});
