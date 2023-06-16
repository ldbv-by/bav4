import { GlobalCoordinateRepresentations } from '../../../../../src/domain/coordinateRepresentation';
import { $injector } from '../../../../../src/injection';
import { SharePositionChip } from '../../../../../src/modules/map/components/assistChips/SharePositionChip';
import shareSvg from '../../../../../src/modules/map/components/assistChips/assets/share.svg';
import { LevelTypes } from '../../../../../src/store/notifications/notifications.action';
import { notificationReducer } from '../../../../../src/store/notifications/notifications.reducer';
import { TestUtils } from '../../../../test-utils';

window.customElements.define(SharePositionChip.tag, SharePositionChip);

describe('SharePositionChip', () => {
	let store;
	const shareServiceMock = {
		copyToClipboard() {
			return Promise.resolve();
		},
		encodeState() {
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
	const mapServiceMock = {
		getCoordinateRepresentations() {},
		getSrid() {},
		getLocalProjectedSrid: () => []
	};

	const coordinateServiceMock = {
		transform: (c) => c
	};

	const setup = async (config = {}) => {
		const { share = false } = config;
		windowMock.navigator.share = share;
		store = TestUtils.setupStoreAndDi({}, { notifications: notificationReducer });
		$injector
			.registerSingleton('EnvironmentService', {
				getWindow: () => windowMock
			})
			.registerSingleton('TranslationService', { translate: (key) => key })
			.registerSingleton('ShareService', shareServiceMock)
			.registerSingleton('CoordinateService', coordinateServiceMock)
			.registerSingleton('MapService', mapServiceMock)
			.registerSingleton('UrlService', urlServiceMock);

		return TestUtils.render(SharePositionChip.tag);
	};

	describe('when instantiated', () => {
		it('has a model containing default values', async () => {
			const element = await setup();

			expect(element.getModel()).toEqual({ position: null });
		});

		it('properly implements abstract methods', async () => {
			const element = await setup();

			expect(element.getLabel()).toBe('map_assistChips_share_position_label');
			expect(element.getIcon()).toBe(shareSvg);
		});
	});

	describe('when initialized', () => {
		it('renders the view with given position', async () => {
			const element = await setup();
			element.position = [42, 21];

			expect(element.isVisible()).toBeTrue();
		});

		it('does NOT renders the view with missing position', async () => {
			const element = await setup();

			expect(element.isVisible()).toBeFalse();
		});

		it('does NOT renders the view with invalid position', async () => {
			const invalidPosition = [42];

			const element = await setup();
			element.position = invalidPosition;

			expect(element.isVisible()).toBeFalse();
		});
	});

	describe('when chip is clicked', () => {
		describe('and ShareAPI available', () => {
			it('shares the shortened url', async () => {
				const element = await setup({ share: () => Promise.resolve(true) });
				element.position = [42, 21];
				spyOn(mapServiceMock, 'getCoordinateRepresentations').and.returnValue([GlobalCoordinateRepresentations.WGS84]);
				spyOn(mapServiceMock, 'getSrid').and.returnValue(3857);

				const shortenerSpy = spyOn(urlServiceMock, 'shorten').and.callFake(() => Promise.resolve('http://shorten.foo'));
				const shareSpy = spyOn(windowMock.navigator, 'share').and.callFake(() => Promise.resolve(true));

				const button = element.shadowRoot.querySelector('button');
				button.click();

				await TestUtils.timeout();
				expect(shortenerSpy).toHaveBeenCalledTimes(1);
				expect(shareSpy).toHaveBeenCalledWith({ title: 'map_assistChips_share_position_link_title', url: 'http://shorten.foo' });
			});

			it('logs a warning when shareApi fails', async () => {
				const element = await setup({ share: () => Promise.resolve(true) });
				element.position = [42, 21];
				spyOn(mapServiceMock, 'getCoordinateRepresentations').and.returnValue([GlobalCoordinateRepresentations.WGS84]);
				spyOn(mapServiceMock, 'getSrid').and.returnValue(3857);

				const errorSpy = spyOn(console, 'error');
				const shortenerSpy = spyOn(urlServiceMock, 'shorten').and.callFake(() => Promise.resolve('http://shorten.foo'));
				const shareSpy = spyOn(windowMock.navigator, 'share').and.callFake(() => Promise.reject('because!'));

				const button = element.shadowRoot.querySelector('button');
				button.click();

				await TestUtils.timeout();
				expect(shortenerSpy).toHaveBeenCalledTimes(1);
				expect(errorSpy).toHaveBeenCalledWith('Share-API failed:', 'because!');
				expect(shareSpy).toHaveBeenCalledWith({ title: 'map_assistChips_share_position_link_title', url: 'http://shorten.foo' });
			});
		});

		describe('and ShareAPI not available', () => {
			it('copies the shortened url to clipboard', async () => {
				const element = await setup({ share: false });
				element.position = [42, 21];
				spyOn(mapServiceMock, 'getCoordinateRepresentations').and.returnValue([GlobalCoordinateRepresentations.WGS84]);
				spyOn(mapServiceMock, 'getSrid').and.returnValue(3857);

				const shortenerSpy = spyOn(urlServiceMock, 'shorten').and.callFake(() => Promise.resolve('http://shorten.foo'));
				const clipboardSpy = spyOn(shareServiceMock, 'copyToClipboard').and.returnValue(() => Promise.resolve());

				const button = element.shadowRoot.querySelector('button');
				button.click();

				await TestUtils.timeout();
				expect(shortenerSpy).toHaveBeenCalledTimes(1);
				expect(clipboardSpy).toHaveBeenCalledWith('http://shorten.foo');
			});

			it('logs a warning when copyToClipboard fails', async () => {
				const element = await setup({ share: false });
				element.position = [42, 21];
				spyOn(mapServiceMock, 'getCoordinateRepresentations').and.returnValue([GlobalCoordinateRepresentations.WGS84]);
				spyOn(mapServiceMock, 'getSrid').and.returnValue(3857);

				const warnSpy = spyOn(console, 'warn');
				const shortenerSpy = spyOn(urlServiceMock, 'shorten').and.callFake(() => Promise.resolve('http://shorten.foo'));
				const clipboardSpy = spyOn(shareServiceMock, 'copyToClipboard').and.callFake(() => Promise.reject());

				const button = element.shadowRoot.querySelector('button');
				button.click();

				await TestUtils.timeout();
				expect(shortenerSpy).toHaveBeenCalledTimes(1);
				expect(clipboardSpy).toHaveBeenCalledWith('http://shorten.foo');
				//check notification
				expect(store.getState().notifications.latest.payload.content).toBe('map_assistChips_share_position_clipboard_error');
				expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.WARN);
				expect(warnSpy).toHaveBeenCalledWith('Clipboard API not available');
			});
		});

		describe('and shortener fails', () => {
			it('logs a warning', async () => {
				const shortenerSpy = spyOn(urlServiceMock, 'shorten').and.callFake(() => Promise.reject('not available'));
				const warnSpy = spyOn(console, 'warn');
				const element = await setup({ share: () => Promise.resolve(true) });
				element.position = [42, 21];
				spyOn(mapServiceMock, 'getCoordinateRepresentations').and.returnValue([GlobalCoordinateRepresentations.WGS84]);
				spyOn(mapServiceMock, 'getSrid').and.returnValue(3857);

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
