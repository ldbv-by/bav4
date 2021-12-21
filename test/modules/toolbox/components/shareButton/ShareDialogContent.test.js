import { ShareDialogContent } from '../../../../../src/modules/toolbox/components/shareButton/ShareDialogContent';
import { TestUtils } from '../../../../test-utils';
import { $injector } from '../../../../../src/injection';
import { notificationReducer } from '../../../../../src/store/notifications/notifications.reducer';
import { LevelTypes } from '../../../../../src/store/notifications/notifications.action';
import { Toggle } from '../../../../../src/modules/commons/components/toggle/Toggle';

window.customElements.define(ShareDialogContent.tag, ShareDialogContent);
window.customElements.define(Toggle.tag, Toggle);

describe('ShareDialogContent', () => {
	let store;

	const shareUrls = { adminId: 'https://v.bayern.de/adminId', fileId: 'https://v.bayern.de/fileId' };

	const windowMock = {
		matchMedia() { },
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
			}).registerSingleton('TranslationService', { translate: (key) => key })
			.registerSingleton('ShareService', shareServiceMock);

		return TestUtils.render(ShareDialogContent.tag);
	};

	it('renders the component', async () => {
		const element = await setup();
		element.shareurls = shareUrls;

		expect(element).toBeTruthy;
	});

	it('renders the sharedUrl', async () => {
		const element = await setup();
		element.shareurls = shareUrls;
		const shareItems = element.shadowRoot.querySelectorAll('.share_item');

		expect(shareItems.length).toBe(1);
	});

	it('renders the shareApi-Button', async () => {
		const element = await setup({}, { share: true });
		element.shareurls = shareUrls;

		expect(element.shadowRoot.querySelectorAll('.share_item .share_api')).toHaveSize(1);
		expect(element.shadowRoot.querySelectorAll('.share_item .share_copy')).toHaveSize(0);
	});

	it('checks the toggle default value to be not checked => false', async () => {
		const element = await setup({}, { share: true });
		element.shareurls = shareUrls;

		const toggleElement = element.shadowRoot.querySelector('ba-toggle');

		expect(toggleElement.checked).toBe(false);
	});

	it('should switch the toggle showing different urls ', async () => {
		const element = await setup();
		element.shareurls = shareUrls;

		const toggleElement = element.shadowRoot.querySelector('ba-toggle');

		// toggle default value is not checked => false => url = fieldId
		expect(element.shadowRoot.querySelector('.share_url').value).toBe(shareUrls.fileId);
		expect(toggleElement.checked).toBe(false);

		// switch the toggle element
		toggleElement.dispatchEvent(new CustomEvent('toggle', {
			detail: { checked: true }
		}));

		// toggle switched to be checked => true => url = adminId
		expect(element.shadowRoot.querySelector('.share_url').value).toBe(shareUrls.adminId);
		expect(toggleElement.checked).toBe(true);
	});

	it('uses the fileId url when toggle is false => default value', async () => {
		const copySpy = spyOn(shareServiceMock, 'copyToClipboard').withArgs(shareUrls.fileId).and.returnValue(() => Promise.resolve());
		const element = await setup();
		element.shareurls = shareUrls;
		const copyButton = element.shadowRoot.querySelector('.share_item .share_copy');

		copyButton.click();

		expect(copySpy).toHaveBeenCalledWith(shareUrls.fileId);
	});

	it('uses the adminId url when toggle is switched to true', async () => {
		const copySpy = spyOn(shareServiceMock, 'copyToClipboard').withArgs(shareUrls.adminId).and.returnValue(() => Promise.resolve());
		const element = await setup();
		element.shareurls = shareUrls;

		const toggleElement = element.shadowRoot.querySelector('ba-toggle');
		toggleElement.dispatchEvent(new CustomEvent('toggle', {
			detail: { checked: true }
		}));

		const copyButton = element.shadowRoot.querySelector('.share_item .share_copy');

		copyButton.click();

		expect(copySpy).toHaveBeenCalledWith(shareUrls.adminId);
	});

	it('renders the CopyToClipboard-Button, when ShareApi is missing', async () => {
		const element = await setup();
		element.shareurls = shareUrls;

		expect(element.shadowRoot.querySelectorAll('.share_item .share_api')).toHaveSize(0);
		expect(element.shadowRoot.querySelectorAll('.share_item .share_copy')).toHaveSize(1);
	});

	it('copies the url to the clipboard, when click', async (done) => {
		const copySpy = spyOn(shareServiceMock, 'copyToClipboard').and.callFake(() => Promise.resolve());

		const element = await setup();
		element.shareurls = shareUrls;
		const copyButton = element.shadowRoot.querySelector('.share_item .share_copy');

		copyButton.click();

		setTimeout(() => {
			expect(element.shadowRoot.querySelectorAll('.share_item .share_copy')).toHaveSize(1);
			expect(copySpy).toHaveBeenCalledWith(shareUrls.fileId);
			//check notification
			expect(store.getState().notifications.latest.payload.content).toBe('toolbox_clipboard_link_notification_text toolbox_clipboard_success');
			expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.INFO);
			done();
		});
	});

	it('calls the shareApi, when click', async (done) => {
		const element = await setup({}, { share: () => Promise.resolve(true) });
		const shareSpy = spyOn(windowMock.navigator, 'share').and.callFake(() => Promise.resolve(true));
		element.shareurls = shareUrls;
		const shareButton = element.shadowRoot.querySelector('.share_item .share_api');

		shareButton.click();

		setTimeout(() => {
			expect(element.shadowRoot.querySelectorAll('.share_item .share_api')).toHaveSize(1);
			expect(shareSpy).toHaveBeenCalledWith({ title: 'toolbox_measureTool_share_link_title', url: shareUrls.fileId });
			done();
		});
	});

	it('logs a warning when shareApi fails', async (done) => {
		const element = await setup({}, { share: () => Promise.resolve(true) });
		const shareSpy = spyOn(windowMock.navigator, 'share').and.callFake(() => Promise.reject('because!'));
		const errorSpy = spyOn(console, 'error');
		element.shareurls = shareUrls;
		const shareButton = element.shadowRoot.querySelector('.share_item .share_api');

		shareButton.click();

		setTimeout(() => {
			expect(errorSpy).toHaveBeenCalledWith('Share-API failed:', 'because!');
			expect(shareSpy).toHaveBeenCalledWith({ title: 'toolbox_measureTool_share_link_title', url: shareUrls.fileId });
			done();
		});
	});

	it('logs a warning when copyToClipboard fails', async (done) => {
		const copySpy = spyOn(shareServiceMock, 'copyToClipboard').and.callFake(() => Promise.reject());
		const warnSpy = spyOn(console, 'warn');
		const element = await setup();
		element.shareurls = shareUrls;
		const copyElement = element.shadowRoot.querySelector('.share_item .share_copy');

		copyElement.click();

		setTimeout(() => {
			expect(copySpy).toHaveBeenCalledWith(shareUrls.fileId);
			//check notification
			expect(store.getState().notifications.latest.payload.content).toBe('toolbox_clipboard_error');
			expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.WARN);
			expect(warnSpy).toHaveBeenCalledWith('Clipboard API not available');
			done();
		});
	});
});
