import { ShareDialogContent } from '../../../../../src/modules/share/components/dialog/ShareDialogContent';
import { TestUtils } from '../../../../test-utils';
import { $injector } from '../../../../../src/injection';
import { notificationReducer } from '../../../../../src/store/notifications/notifications.reducer';
import { LevelTypes } from '../../../../../src/store/notifications/notifications.action';
import { Switch } from '../../../../../src/modules/commons/components/switch/Switch';

window.customElements.define(ShareDialogContent.tag, ShareDialogContent);
window.customElements.define(Switch.tag, Switch);

describe('ShareDialogContent', () => {
	let store;

	const shareUrls = { adminId: 'https://v.bayern.de/adminId', fileId: 'https://v.bayern.de/fileId' };

	const windowMock = {
		matchMedia() {},
		navigator: () => {
			return {
				share() {
					return false;
				}
			};
		}
	};

	const shareServiceMock = {
		copyToClipboard() {
			return Promise.resolve();
		}
	};

	const setup = (state = {}, config = {}) => {
		const { embed = false, isTouch = false, share = false } = config;
		windowMock.navigator.share = share;
		store = TestUtils.setupStoreAndDi(state, { notifications: notificationReducer });

		$injector
			.registerSingleton('EnvironmentService', {
				isEmbedded: () => embed,
				getWindow: () => windowMock,
				isTouch: () => isTouch
			})
			.registerSingleton('TranslationService', { translate: (key) => key })
			.registerSingleton('ShareService', shareServiceMock);

		return TestUtils.render(ShareDialogContent.tag);
	};

	describe('when instantiated', () => {
		it('has a model with default values', async () => {
			await setup();
			const model = new ShareDialogContent().getModel();
			expect(model).toEqual({ checkedToggle: false, url: null, fileSaveUrl: null });
		});
	});

	describe('when initialized', () => {
		it('renders the component', async () => {
			const element = await setup();
			element.urls = shareUrls;

			expect(element.shadowRoot.querySelectorAll('ba-switch')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('input')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('ba-icon')).toHaveSize(1);
		});

		it('renders the url to share', async () => {
			const element = await setup();
			element.urls = shareUrls;
			const inputElements = element.shadowRoot.querySelectorAll('input');

			expect(inputElements).toHaveSize(1);
			expect(inputElements[0].value).toBe(shareUrls.fileId);
		});

		it('renders the shareApi-Button', async () => {
			const element = await setup({}, { share: true });
			element.urls = shareUrls;

			expect(element.shadowRoot.querySelectorAll('.share_item .share_api')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.share_item .share_copy_icon')).toHaveSize(0);
		});

		it('checks the toggle default value to be not checked => false', async () => {
			const element = await setup({}, { share: true });
			element.urls = shareUrls;

			const toggleElement = element.shadowRoot.querySelector('ba-switch');

			expect(toggleElement.checked).toBe(false);
		});
	});

	describe('when toggle is switched', () => {
		it('shows different urls ', async () => {
			const element = await setup();
			element.urls = shareUrls;

			const toggleElement = element.shadowRoot.querySelector('#toggle');

			// toggle default value is not checked => false => url = fieldId
			expect(element.shadowRoot.querySelector('.share_url').value).toBe(shareUrls.fileId);
			expect(toggleElement.checked).toBe(false);

			// switch the toggle element
			toggleElement.click();

			// toggle switched to be checked => true => url = adminId
			expect(element.shadowRoot.querySelector('.share_url').value).toBe(shareUrls.adminId);
			expect(toggleElement.checked).toBe(true);
		});

		it('uses the fileId url when toggle is false => default value', async () => {
			const copySpy = spyOn(shareServiceMock, 'copyToClipboard')
				.withArgs(shareUrls.fileId)
				.and.returnValue(() => Promise.resolve());
			const element = await setup();
			element.urls = shareUrls;
			const copyButton = element.shadowRoot.querySelector('.share_item .share_copy_icon');

			copyButton.click();

			expect(copySpy).toHaveBeenCalledWith(shareUrls.fileId);
		});

		it('uses the adminId url when toggle is switched to true', async () => {
			const copySpy = spyOn(shareServiceMock, 'copyToClipboard')
				.withArgs(shareUrls.adminId)
				.and.returnValue(() => Promise.resolve());
			const element = await setup();
			element.urls = shareUrls;

			const toggleElement = element.shadowRoot.querySelector('ba-switch');
			toggleElement.click();

			const copyButton = element.shadowRoot.querySelector('.share_item .share_copy_icon');

			copyButton.click();

			expect(copySpy).toHaveBeenCalledWith(shareUrls.adminId);
		});
	});

	describe('when ShareApi is missing', () => {
		it('renders the CopyToClipboard-Button', async () => {
			const element = await setup();
			element.urls = shareUrls;

			expect(element.shadowRoot.querySelectorAll('.share_item .share_api')).toHaveSize(0);
			expect(element.shadowRoot.querySelectorAll('.share_item .share_copy_icon')).toHaveSize(1);
		});
	});

	describe('when click', () => {
		it('copies the url to the clipboard', async () => {
			const copySpy = spyOn(shareServiceMock, 'copyToClipboard').and.callFake(() => Promise.resolve());

			const element = await setup();
			element.urls = shareUrls;
			const copyButton = element.shadowRoot.querySelector('.share_item .share_copy_icon');

			copyButton.click();

			await TestUtils.timeout();
			expect(element.shadowRoot.querySelectorAll('.share_item .share_copy_icon')).toHaveSize(1);
			expect(copySpy).toHaveBeenCalledWith(shareUrls.fileId);
			//check notification
			expect(store.getState().notifications.latest.payload.content).toBe('share_clipboard_link_notification_text share_clipboard_success');
			expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.INFO);
		});

		it('calls the shareApi', async () => {
			const element = await setup({}, { share: () => Promise.resolve(true) });
			const shareSpy = spyOn(windowMock.navigator, 'share').and.callFake(() => Promise.resolve(true));
			element.urls = shareUrls;
			const shareButton = element.shadowRoot.querySelector('.share_item .share_api');

			shareButton.click();

			await TestUtils.timeout();
			expect(element.shadowRoot.querySelectorAll('.share_item .share_api')).toHaveSize(1);
			expect(shareSpy).toHaveBeenCalledWith({ url: shareUrls.fileId });
		});
	});

	it('emits a warn notification when shareApi fails', async () => {
		const element = await setup({}, { share: () => Promise.reject() });
		element.urls = shareUrls;
		const shareButton = element.shadowRoot.querySelector('.share_item .share_api');

		shareButton.click();

		await TestUtils.timeout();
		expect(store.getState().notifications.latest.payload.content).toBe('share_dialog_api_failed');
		expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.WARN);
	});

	it('logs a warning and emits a notification when copyToClipboard fails', async () => {
		const copySpy = spyOn(shareServiceMock, 'copyToClipboard').and.callFake(() => Promise.reject());
		const warnSpy = spyOn(console, 'warn');
		const element = await setup();
		element.urls = shareUrls;
		const copyElement = element.shadowRoot.querySelector('.share_item .share_copy_icon');

		copyElement.click();

		await TestUtils.timeout();
		expect(copySpy).toHaveBeenCalledWith(shareUrls.fileId);
		//check notification
		expect(store.getState().notifications.latest.payload.content).toBe('share_clipboard_error');
		expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.WARN);
		expect(warnSpy).toHaveBeenCalledWith('Clipboard API not available');
	});

	describe('when anything except a FileSaveUrl is provided', () => {
		it('renders nothing', async () => {
			const element = await setup();
			element.urls = { something: 'something' };

			expect(element.childElementCount).toBe(0);
		});

		it('renders the component without toggle-button, showing the url', async () => {
			const element = await setup();
			const url = 'https://v.bayern.de/foobar';
			element.urls = url;

			expect(element.shadowRoot.querySelectorAll('ba-switch')).toHaveSize(0);
			expect(element.shadowRoot.querySelectorAll('input')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('input')[0].value).toBe(url);
			expect(element.shadowRoot.querySelectorAll('ba-icon')).toHaveSize(1);
		});
	});
});
