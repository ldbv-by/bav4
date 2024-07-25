import { $injector } from '../../../../src/injection';
import { ShareDataChip } from '../../../../src/modules/chips/components/assistChips/ShareDataChip';
import { modalReducer } from '../../../../src/store/modal/modal.reducer';
import { TestUtils } from '../../../test-utils';
import shareSvg from '../../../../src/modules/chips/components/assistChips/assets/share.svg';
import { sharedReducer } from '../../../../src/store/shared/shared.reducer';
import { fileStorageReducer } from '../../../../src/store/fileStorage/fileStorage.reducer';
import { ShareDialogContent } from '../../../../src/modules/share/components/dialog/ShareDialogContent';
import { QueryParameters } from '../../../../src/domain/queryParameters';
import { EventLike } from '../../../../src/utils/storeUtils';

window.customElements.define(ShareDialogContent.tag, ShareDialogContent);
window.customElements.define(ShareDataChip.tag, ShareDataChip);

describe('ShareDataChip', () => {
	const defaultState = {
		shared: {
			fileSaveResult: null,
			coordinates: []
		}
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
	const setup = async (state = defaultState) => {
		const windowMock = { navigator: {}, open() {} };
		store = TestUtils.setupStoreAndDi(state, { modal: modalReducer, shared: sharedReducer, fileStorage: fileStorageReducer });
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

			expect(element.getModel()).toEqual({ storedDataAvailable: false, fileId: null, adminId: null });
		});

		it('properly implements abstract methods', async () => {
			const element = await setup();

			expect(element.getLabel()).toBe('chips_assist_chip_share_stored_data');
			expect(element.getIcon()).toBe(shareSvg);
		});
	});

	describe('when initialized', () => {
		it('renders the view with given FileSaveResults', async () => {
			const state = { ...defaultState, fileStorage: { adminId: 'a_fooBar', fileId: 'f_fooBar', latest: new EventLike({ success: true }) } };
			const element = await setup(state);

			expect(element.isVisible()).toBeTrue();
		});

		it('does NOT render the view with missing FileSaveResult', async () => {
			const element = await setup();

			expect(element.isVisible()).toBeFalse();
		});

		it('does NOT render the view with invalid FileSaveResult', async () => {
			const invalidFileStorage = { adminId: null, fileId: null, latest: new EventLike({ success: false }) };
			const state = { ...defaultState, fileStorage: invalidFileStorage };
			const element = await setup(state);

			expect(element.isVisible()).toBeFalse();
		});
	});

	describe('when chip is clicked', () => {
		it('opens the modal with shortened share-urls', async () => {
			const fileStorageState = { adminId: 'a_fooBar', fileId: 'f_fooBar', latest: new EventLike({ success: true }) };
			const shortenerSpy = spyOn(urlServiceMock, 'shorten').and.callFake(() => Promise.resolve('http://shorten.foo'));
			const state = { ...defaultState, fileStorage: fileStorageState };
			const element = await setup(state);

			const button = element.shadowRoot.querySelector('button');
			button.click();

			await TestUtils.timeout();
			expect(shortenerSpy).toHaveBeenCalledTimes(2);
			expect(store.getState().modal.data.title).toBe('chips_assist_chip_share_stored_data');

			const contentElement = TestUtils.renderTemplateResult(store.getState().modal.data.content);
			const shareDialogContentElement = contentElement.querySelector('ba-share-content');
			expect(shareDialogContentElement.shadowRoot.querySelector('input').value).toBe('http://shorten.foo');
		});

		it('explicitly sets the TOOL_ID query parameter', async () => {
			const fileStorageState = { adminId: 'a_fooBar', fileId: 'f_fooBar', latest: new EventLike({ success: true }) };
			const shortenerSpy = spyOn(urlServiceMock, 'shorten').and.callFake(() => Promise.resolve('http://shorten.foo'));
			spyOn(shareServiceMock, 'encodeState').and.returnValue(`http://foo.bar?${QueryParameters.TOOL_ID}=someTool`);
			const state = { ...defaultState, fileStorage: fileStorageState };
			const element = await setup(state);

			const button = element.shadowRoot.querySelector('button');
			button.click();

			await TestUtils.timeout();
			expect(shortenerSpy).toHaveBeenCalledTimes(2);
			expect(shortenerSpy.calls.all()[0].args[0]).toBe(`http://foo.bar/?${QueryParameters.TOOL_ID}=`);
			expect(shortenerSpy.calls.all()[1].args[0]).toBe(`http://foo.bar/?${QueryParameters.TOOL_ID}=`);
		});
	});

	describe('when shortener fails', () => {
		it('logs a warning', async () => {
			const shortenerSpy = spyOn(urlServiceMock, 'shorten').and.callFake(() => Promise.reject('not available'));
			const warnSpy = spyOn(console, 'warn');
			const fileStorageState = { adminId: 'a_fooBar', fileId: 'f_fooBar', latest: new EventLike({ success: true }) };
			const state = { ...defaultState, fileStorage: fileStorageState };
			const element = await setup(state);

			const button = element.shadowRoot.querySelector('button');
			button.click();

			await TestUtils.timeout();
			expect(shortenerSpy).toHaveBeenCalledTimes(2);
			expect(warnSpy).toHaveBeenCalledTimes(2);
			expect(warnSpy).toHaveBeenCalledWith('Could not shorten url', 'not available');
		});
	});
});
