import { QueryParameters } from '../../../../src/domain/queryParameters';
import { $injector } from '../../../../src/injection';
import { SharePositionChip } from '../../../../src/modules/chips/components/assistChips/SharePositionChip';
import shareSvg from '../../../../src/modules/chips/components/assistChips/assets/share.svg';
import { ShareDialogContent } from '../../../../src/modules/share/components/dialog/ShareDialogContent';
import { modalReducer } from '../../../../src/store/modal/modal.reducer';
import { LevelTypes } from '../../../../src/store/notifications/notifications.action';
import { notificationReducer } from '../../../../src/store/notifications/notifications.reducer';
import { TestUtils } from '../../../test-utils';

window.customElements.define(ShareDialogContent.tag, ShareDialogContent);
window.customElements.define(SharePositionChip.tag, SharePositionChip);

describe('SharePositionChip', () => {
	let store;
	const shareServiceMock = {
		copyToClipboard() {
			return Promise.resolve();
		},
		encodeStateForPosition() {
			return 'http://this.is.a.url?forTestCase';
		}
	};

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

	const urlServiceMock = {
		shorten() {
			return Promise.resolve('http://foo');
		}
	};

	const setup = async (config = {}) => {
		const { share = false } = config;
		windowMock.navigator.share = share;
		store = TestUtils.setupStoreAndDi({}, { modal: modalReducer, notifications: notificationReducer });
		$injector
			.registerSingleton('EnvironmentService', {
				getWindow: () => windowMock
			})
			.registerSingleton('TranslationService', { translate: (key) => key })
			.registerSingleton('ShareService', shareServiceMock)
			.registerSingleton('UrlService', urlServiceMock);

		return TestUtils.render(SharePositionChip.tag);
	};

	describe('when instantiated', () => {
		it('has a model containing default values', async () => {
			const element = await setup();

			expect(element.getModel()).toEqual({ center: null });
		});

		it('properly implements abstract methods', async () => {
			const element = await setup();

			expect(element.getLabel()).toBe('chips_assist_chip_share_position_label');
			expect(element.getIcon()).toBe(shareSvg);
		});
	});

	describe('when initialized', () => {
		it('renders the view with given center', async () => {
			const element = await setup();
			element.center = [42, 21];

			expect(element.isVisible()).toBeTrue();
		});

		it('does NOT renders the view with missing center', async () => {
			const element = await setup();

			expect(element.isVisible()).toBeFalse();
		});

		it('does NOT renders the view with invalid center', async () => {
			const invalidCenter = [42];

			const element = await setup();
			element.center = invalidCenter;

			expect(element.isVisible()).toBeFalse();
		});
	});

	describe('when chip is clicked', () => {
		describe('and ShareAPI available', () => {
			it('shares the shortened url', async () => {
				const element = await setup({ share: () => Promise.resolve(true) });
				element.center = [42, 21];
				const shareServiceSpy = spyOn(shareServiceMock, 'encodeStateForPosition').and.callThrough();
				const shortenerSpy = spyOn(urlServiceMock, 'shorten').and.callFake(() => Promise.resolve('http://shorten.foo'));
				const shareSpy = spyOn(windowMock.navigator, 'share').and.callFake(() => Promise.resolve(true));

				const button = element.shadowRoot.querySelector('button');
				button.click();

				await TestUtils.timeout();
				expect(shortenerSpy).toHaveBeenCalledTimes(1);
				expect(shareServiceSpy).toHaveBeenCalledWith({ center: [42, 21] }, { [QueryParameters.CROSSHAIR]: true });
				expect(shareSpy).toHaveBeenCalledWith({ url: 'http://shorten.foo' });
			});

			it('emits a warn notification when shareApi fails', async () => {
				const element = await setup({ share: () => Promise.resolve(true) });
				element.center = [42, 21];
				const shareServiceSpy = spyOn(shareServiceMock, 'encodeStateForPosition').and.callThrough();

				const shortenerSpy = spyOn(urlServiceMock, 'shorten').and.callFake(() => Promise.resolve('http://shorten.foo'));
				const shareSpy = spyOn(windowMock.navigator, 'share').and.callFake(() => Promise.reject('because!'));

				const button = element.shadowRoot.querySelector('button');
				button.click();

				await TestUtils.timeout();
				expect(shortenerSpy).toHaveBeenCalledTimes(1);
				expect(shareServiceSpy).toHaveBeenCalledWith({ center: [42, 21] }, { [QueryParameters.CROSSHAIR]: true });

				expect(shareSpy).toHaveBeenCalledWith({ url: 'http://shorten.foo' });

				expect(store.getState().notifications.latest.payload.content).toBe('chips_assist_chip_share_position_api_failed');
				expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.WARN);
			});
		});

		describe('and ShareAPI not available', () => {
			it('opens the modal with shareDialogContent', async () => {
				const element = await setup({ share: false });
				element.center = [42, 21];
				const shortenerSpy = spyOn(urlServiceMock, 'shorten').and.callFake(() => Promise.resolve('http://shorten.foo'));

				const button = element.shadowRoot.querySelector('button');
				button.click();

				await TestUtils.timeout();
				expect(shortenerSpy).toHaveBeenCalledTimes(1);
				expect(store.getState().modal.data.title).toBe('chips_assist_chip_share_position_label');

				const contentElement = TestUtils.renderTemplateResult(store.getState().modal.data.content);
				const shareDialogContentElement = contentElement.querySelector('ba-share-content');
				expect(shareDialogContentElement.shadowRoot.querySelector('input').value).toBe('http://shorten.foo');
			});
		});

		describe('and shortener fails', () => {
			it('logs a warning', async () => {
				const shortenerSpy = spyOn(urlServiceMock, 'shorten').and.callFake(() => Promise.reject('not available'));
				const warnSpy = spyOn(console, 'warn');
				const element = await setup({ share: () => Promise.resolve(true) });
				element.center = [42, 21];

				const button = element.shadowRoot.querySelector('button');
				button.click();

				await TestUtils.timeout();
				expect(shortenerSpy).toHaveBeenCalledTimes(1);
				expect(warnSpy).toHaveBeenCalledTimes(1);
				expect(warnSpy).toHaveBeenCalledWith('Could not shorten url', 'not available');
			});
		});
	});
});
