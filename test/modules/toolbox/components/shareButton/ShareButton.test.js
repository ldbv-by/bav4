import { $injector } from '../../../../../src/injection';
import { ShareButton } from '../../../../../src/modules/toolbox/components/shareButton/ShareButton';
import { ShareDialogContent } from '../../../../../src/modules/toolbox/components/shareButton/ShareDialogContent';
import { modalReducer } from '../../../../../src/store/modal/modal.reducer';
import { TEST_ID_ATTRIBUTE_NAME } from '../../../../../src/utils/markup';
import { TestUtils } from '../../../../test-utils';

window.customElements.define(ShareDialogContent.tag, ShareDialogContent);
window.customElements.define(ShareButton.tag, ShareButton);

describe('ShareButton', () => {
	let store;
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
	const setup = async () => {
		const windowMock = { navigator: {}, open() {} };
		store = TestUtils.setupStoreAndDi({}, { modal: modalReducer });
		$injector
			.registerSingleton('EnvironmentService', {
				getWindow: () => windowMock
			})
			.registerSingleton('TranslationService', { translate: (key) => key })
			.registerSingleton('ShareService', shareServiceMock)
			.registerSingleton('UrlService', urlServiceMock);

		return TestUtils.render(ShareButton.tag);
	};

	describe('when initialized', () => {
		it('shows the share-button', async () => {
			const fileSaveResult = { adminId: 'a_fooBar', fileId: 'f_fooBar' };
			const element = await setup();
			element.share = fileSaveResult;
			const shareButton = element.shadowRoot.querySelector('#share');

			expect(shareButton).toBeTruthy();
		});

		it('shows NOT the share-button for invalid fileSaveResult', async () => {
			const fileSaveResult = { adminId: 'a_fooBar', fileId: null };
			const element = await setup();
			element.share = fileSaveResult;
			const shareButton = element.shadowRoot.querySelector('#share');

			expect(shareButton).toBeFalsy();
		});

		it('opens the modal with shortened share-urls on click', async () => {
			const fileSaveResult = { adminId: 'a_fooBar', fileId: 'f_fooBar' };
			const shortenerSpy = spyOn(urlServiceMock, 'shorten').and.callFake(() => Promise.resolve('http://shorten.foo'));
			const element = await setup();
			element.share = fileSaveResult;

			const shareButton = element.shadowRoot.querySelector('#share');
			shareButton.click();

			await TestUtils.timeout();
			expect(shareButton).toBeTruthy();
			expect(shortenerSpy).toHaveBeenCalledTimes(2);
			expect(store.getState().modal.data.title).toBe('toolbox_measureTool_share');

			const contentElement = TestUtils.renderTemplateResult(store.getState().modal.data.content);
			const shareDialogContentElement = contentElement.querySelector('ba-share-content');
			expect(shareDialogContentElement.shadowRoot.querySelector('input').value).toBe('http://shorten.foo');
		});

		it('logs a warning, when shortener fails', async () => {
			const fileSaveResult = { adminId: 'a_fooBar', fileId: 'f_fooBar' };

			const shortenerSpy = spyOn(urlServiceMock, 'shorten').and.callFake(() => Promise.reject('not available'));
			const warnSpy = spyOn(console, 'warn');
			const element = await setup();
			element.share = fileSaveResult;

			const shareButton = element.shadowRoot.querySelector('#share');
			shareButton.click();

			await TestUtils.timeout();
			expect(shareButton).toBeTruthy();
			expect(shortenerSpy).toHaveBeenCalledTimes(2);
			expect(warnSpy).toHaveBeenCalledTimes(2);
			expect(warnSpy).toHaveBeenCalledWith('Could not shorten url', 'not available');
		});

		it('contains test-id attributes', async () => {
			const fileSaveResult = { adminId: 'a_fooBar', fileId: 'f_fooBar' };
			const element = await setup();
			element.share = fileSaveResult;

			expect(element.shadowRoot.querySelectorAll(`[${TEST_ID_ATTRIBUTE_NAME}]`)).toHaveSize(1);
			expect(element.shadowRoot.querySelector('#share').hasAttribute(TEST_ID_ATTRIBUTE_NAME)).toBeTrue();
		});
	});
});
