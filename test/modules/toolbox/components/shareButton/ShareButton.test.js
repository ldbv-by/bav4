import { $injector } from '../../../../../src/injection';
import { ShareButton } from '../../../../../src/modules/toolbox/components/shareButton/ShareButton';
import { modalReducer } from '../../../../../src/store/modal/modal.reducer';
import { TestUtils } from '../../../../test-utils';

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
		store = TestUtils.setupStoreAndDi({}, { modal: modalReducer });
		$injector
			.registerSingleton('EnvironmentService', {

			}).registerSingleton('TranslationService', { translate: (key) => key })
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

		it('opens the modal with shortened share-urls on click', async (done) => {
			const fileSaveResult = { adminId: 'a_fooBar', fileId: 'f_fooBar' };
			const shortenerSpy = spyOn(urlServiceMock, 'shorten').and.callFake(() => Promise.resolve('http://shorten.foo'));
			const element = await setup();
			element.share = fileSaveResult;

			const shareButton = element.shadowRoot.querySelector('#share');
			shareButton.click();

			setTimeout(() => {
				expect(shareButton).toBeTruthy();
				expect(shortenerSpy).toHaveBeenCalledTimes(2);
				expect(store.getState().modal.data.title).toBe('toolbox_measureTool_share');
				done();
			});
		});

		it('logs a warning, when shortener fails', async (done) => {
			const fileSaveResult = { adminId: 'a_fooBar', fileId: 'f_fooBar' };

			const shortenerSpy = spyOn(urlServiceMock, 'shorten').and.callFake(() => Promise.reject('not available'));
			const warnSpy = spyOn(console, 'warn');
			const element = await setup();
			element.share = fileSaveResult;

			const shareButton = element.shadowRoot.querySelector('#share');
			shareButton.click();

			setTimeout(() => {
				expect(shareButton).toBeTruthy();
				expect(shortenerSpy).toHaveBeenCalledTimes(2);
				expect(warnSpy).toHaveBeenCalledTimes(2);
				expect(warnSpy).toHaveBeenCalledWith('Could shortener-service is not working:', 'not available');
				done();
			});

		});


	});
});
