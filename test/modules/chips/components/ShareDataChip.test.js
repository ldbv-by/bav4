import { $injector } from '../../../../src/injection';
import { ShareDataChip } from '../../../../src/modules/chips/components/assistChips/ShareDataChip';
import { modalReducer } from '../../../../src/store/modal/modal.reducer';
import { TestUtils } from '../../../test-utils';
import shareSvg from '../../../../src/modules/chips/components/assistChips/assets/share.svg';
import { sharedReducer } from '../../../../src/store/shared/shared.reducer';
import { ShareDialogContent } from '../../../../src/modules/share/components/dialog/ShareDialogContent';

window.customElements.define(ShareDialogContent.tag, ShareDialogContent);
window.customElements.define(ShareDataChip.tag, ShareDataChip);

describe('ShareDataChip', () => {
	const defaultSharedState = {
		fileSaveResult: null,
		coordinates: []
	};

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
	const setup = async (sharedState = defaultSharedState) => {
		const state = {
			shared: sharedState
		};
		const windowMock = { navigator: {}, open() {} };
		store = TestUtils.setupStoreAndDi(state, { modal: modalReducer, shared: sharedReducer });
		$injector
			.registerSingleton('EnvironmentService', {
				getWindow: () => windowMock
			})
			.registerSingleton('TranslationService', { translate: (key) => key })
			.registerSingleton('ShareService', shareServiceMock)
			.registerSingleton('UrlService', urlServiceMock);

		return TestUtils.render(ShareDataChip.tag);
	};

	describe('when instantiated', () => {
		it('has a model containing default values', async () => {
			const element = await setup();

			expect(element.getModel()).toEqual({ fileSaveResult: null });
		});

		it('properly implements abstract methods', async () => {
			const element = await setup();

			expect(element.getLabel()).toBe('chips_assist_chip_share_stored_data');
			expect(element.getIcon()).toBe(shareSvg);
		});
	});

	describe('when initialized', () => {
		it('renders the view with given FileSaveResults', async () => {
			const sharedState = { ...defaultSharedState, fileSaveResult: { adminId: 'a_fooBar', fileId: 'f_fooBar' } };
			const element = await setup(sharedState);

			expect(element.isVisible()).toBeTrue();
		});

		it('does NOT renders the view with missing FileSaveResult', async () => {
			const element = await setup();

			expect(element.isVisible()).toBeFalse();
		});

		it('does NOT renders the view with invalid FileSaveResult', async () => {
			const invalidFileSaveResult = { adminId: 'a_fooBar', fileId: null };
			const sharedState = { ...defaultSharedState, fileSaveResult: invalidFileSaveResult };
			const element = await setup(sharedState);

			expect(element.isVisible()).toBeFalse();
		});
	});

	describe('when chip is clicked', () => {
		it('opens the modal with shortened share-urls', async () => {
			const fileSaveResult = { adminId: 'a_fooBar', fileId: 'f_fooBar' };
			const shortenerSpy = spyOn(urlServiceMock, 'shorten').and.callFake(() => Promise.resolve('http://shorten.foo'));
			const sharedState = { ...defaultSharedState, fileSaveResult: fileSaveResult };
			const element = await setup(sharedState);

			const button = element.shadowRoot.querySelector('button');
			button.click();

			await TestUtils.timeout();
			expect(shortenerSpy).toHaveBeenCalledTimes(2);
			expect(store.getState().modal.data.title).toBe('chips_assist_chip_share_stored_data');

			const contentElement = TestUtils.renderTemplateResult(store.getState().modal.data.content);
			const shareDialogContentElement = contentElement.querySelector('ba-share-content');
			expect(shareDialogContentElement.shadowRoot.querySelector('input').value).toBe('http://shorten.foo');
		});
	});

	describe('when shortener fails', () => {
		it('logs a warning', async () => {
			const shortenerSpy = spyOn(urlServiceMock, 'shorten').and.callFake(() => Promise.reject('not available'));
			const warnSpy = spyOn(console, 'warn');
			const fileSaveResult = { adminId: 'a_fooBar', fileId: 'f_fooBar' };
			const sharedState = { ...defaultSharedState, fileSaveResult: fileSaveResult };
			const element = await setup(sharedState);

			const button = element.shadowRoot.querySelector('button');
			button.click();

			await TestUtils.timeout();
			expect(shortenerSpy).toHaveBeenCalledTimes(2);
			expect(warnSpy).toHaveBeenCalledTimes(2);
			expect(warnSpy).toHaveBeenCalledWith('Could not shorten url', 'not available');
		});
	});
});
