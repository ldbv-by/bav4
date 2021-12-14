import { ShareToolDialog } from '../../../../../src/modules/toolbox/components/shareToolContent/ShareToolDialog';
import { TestUtils } from '../../../../test-utils';
import { $injector } from '../../../../../src/injection';
import { LevelTypes } from '../../../../../src/store/notifications/notifications.action';
import { notificationReducer } from '../../../../../src/store/notifications/notifications.reducer';

window.customElements.define(ShareToolDialog.tag, ShareToolDialog);

describe('ShareToolDialog', () => {
	let element;
	let store;

	const windowMock = {
		matchMedia() { }
	};
	const shareServiceMock = {
		copyToClipboard() { }
	};
	const state = {
		notifications: {
			notification: null
		}
	};

	const setup = (config = {}) => {
		const { embed = false, isTouch = false } = config;
		store = TestUtils.setupStoreAndDi(state, { notifications: notificationReducer });
		$injector
			.registerSingleton('EnvironmentService', {
				isEmbedded: () => embed,
				getWindow: () => windowMock,
				isTouch: () => isTouch
			})
			.registerSingleton('TranslationService', { translate: (key) => key })
			.registerSingleton('ShareService', shareServiceMock);
		return TestUtils.render(ShareToolDialog.tag);
	};

	beforeEach(async () => {
		element = await setup();
		element.shareUrl = 'https://mock.url';
	});

	it('renders the component', () => {
		expect(element).toBeTruthy;
		expect(element.shadowRoot.querySelector('.share_item .share_copy')).toBeTruthy();
	});

	it('renders the sharedUrl', async () => {
		expect(element.shadowRoot.querySelectorAll('.share_item').length).toBe(1);
	});

	it('copies the https url to the clipboard, when click', async (done) => {
		const url = 'https://mock.url';

		const copyToClipboardMock = spyOn(shareServiceMock, 'copyToClipboard').withArgs(url).and.returnValue(Promise.resolve());
		const copyButton = element.shadowRoot.querySelector('.share_item .share_copy');
		copyButton.click();

		expect(copyButton).toBeTruthy();
		expect(copyToClipboardMock).toHaveBeenCalledWith(url);
		setTimeout(() => {
			//check notification
			expect(store.getState().notifications.latest.payload.content).toBe('toolbox_clipboard_link_notification_text toolbox_clipboard_success');
			expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.INFO);
			done();
		});
	});

	it('logs a warning when copyToClipboard fails using http ', async (done) => {
		const url = 'https://mock.url';

		const copyToClipboardMock = spyOn(shareServiceMock, 'copyToClipboard').withArgs(url).and.returnValue(Promise.reject());
		const warnSpy = spyOn(console, 'warn');
		const copyButton = element.shadowRoot.querySelector('.share_item .share_copy');
		copyButton.click();

		expect(copyButton).toBeTruthy();
		expect(copyToClipboardMock).toHaveBeenCalledWith(url);
		setTimeout(() => {
			//check notification
			expect(store.getState().notifications.latest.payload.content).toBe('toolbox_clipboard_error');
			expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.WARN);
			expect(warnSpy).toHaveBeenCalledWith('Clipboard API not available');
			done();
		});
	});
});
