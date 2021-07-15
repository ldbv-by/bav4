import { TestUtils } from '../../../../test-utils';
import { $injector } from '../../../../../src/injection';
import { ShareToolContent } from '../../../../../src/modules/toolbox/components/shareToolContent/ShareToolContent';
import { modalReducer } from '../../../../../src/modules/modal/store/modal.reducer';
import { Checkbox } from '../../../../../src/modules/commons/components/checkbox/Checkbox';

window.customElements.define(ShareToolContent.tag, ShareToolContent);
window.customElements.define(Checkbox.tag, Checkbox);

describe('ShareToolContent', () => {
	let store;

	const urlServiceMock = {
		shorten() { }
	};

	const shareServiceMock = {
		encodeState() { },
		copyToClipboard() { }
	};

	const setup = async (config = {}) => {

		const { embed = false, windowMock = { navigator: {}, open() { } } } = config;

		const state = {
		};

		store = TestUtils.setupStoreAndDi(state, { modal: modalReducer });
		$injector
			.registerSingleton('EnvironmentService', {
				isEmbedded: () => embed,
				getWindow: () => windowMock
			})
			.registerSingleton('TranslationService', { translate: (key) => key })
			.registerSingleton('UrlService', urlServiceMock)
			.registerSingleton('ShareService', shareServiceMock);
		return TestUtils.render(ShareToolContent.tag);
	};

	describe('when initialized', () => {

		it('renders UI elements', async () => {
			const config = { embed: false, windowMock: { navigator: { share() { } } } };

			const element = await setup(config);

			expect(element._tools).toBeTruthy();
			expect(element._tools.length).toBe(3);
			expect(element.shadowRoot.querySelector('.tool-container__buttons')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.tool-container__buttons').childElementCount).toBe(3);
			expect(element.shadowRoot.querySelector('.tool-container__buttons').innerHTML).toContain('toolbox_shareTool_share');

			expect(element.shadowRoot.querySelector('.tool-container__buttons')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.tool-container__checkbox')).toBeTruthy();
		});

		it('opens window on mail and qr button click', async (done) => {
			const mockUrl = 'https://some.url';
			const mockShortUrl = 'https://short/url';
			const mailUrl = 'mailto:?body=' + mockShortUrl;
			const qrUrl = 'https://v.bayern.de?url=' + mockShortUrl;
			const windowMock = {
				matchMedia() { },
				navigator: {},
				open() { }
			};
			const config = { embed: false, windowMock };

			const shareServiceSpy = spyOn(shareServiceMock, 'encodeState').and.returnValue(mockUrl);
			const urlServiceSpy = spyOn(urlServiceMock, 'shorten').withArgs(mockUrl).and.returnValue(mockShortUrl);
			const windowOpenSpy = spyOn(windowMock, 'open');

			const element = await setup(config);

			expect(element.shadowRoot.querySelector('.tool-container__button')).toBeTruthy();

			element.shadowRoot.querySelectorAll('.tool-container__button')[1].click();

			setTimeout(() => {
				expect(windowOpenSpy).toHaveBeenCalledWith(mailUrl);
				expect(shareServiceSpy).toHaveBeenCalled();
				expect(urlServiceSpy).toHaveBeenCalledWith(mockUrl);
				done();
			});

			element.shadowRoot.querySelectorAll('.tool-container__button')[2].click();

			setTimeout(() => {
				expect(windowOpenSpy).toHaveBeenCalledWith(qrUrl);
				expect(shareServiceSpy).toHaveBeenCalled();
				expect(urlServiceSpy).toHaveBeenCalledWith(mockUrl);
				done();
			});
		});

		it('throws error if window could not be opened', async (done) => {
			const mockUrl = 'https://some.url';
			const mockShortUrl = 'https://short/url';
			const mailUrl = 'mailto:?body=' + mockShortUrl;
			const windowMock = {
				matchMedia() { },
				navigator: {},
				open() { }
			};
			const config = { embed: false, windowMock };

			const shareServiceSpy = spyOn(shareServiceMock, 'encodeState').and.returnValue(mockUrl);
			const urlServiceSpy = spyOn(urlServiceMock, 'shorten').withArgs(mockUrl).and.returnValue(mockShortUrl);
			const windowOpenSpy = spyOn(windowMock, 'open').and.returnValue(null);
			const warnSpy = spyOn(console, 'warn');

			const element = await setup(config);

			expect(element.shadowRoot.querySelector('.tool-container__button')).toBeTruthy();

			element.shadowRoot.querySelectorAll('.tool-container__button')[1].click();

			setTimeout(() => {
				expect(windowOpenSpy).toHaveBeenCalledWith(mailUrl);
				expect(shareServiceSpy).toHaveBeenCalled();
				expect(urlServiceSpy).toHaveBeenCalledWith(mockUrl);
				expect(warnSpy).toHaveBeenCalledWith('Could not share content: Error: Could not open window');
				done();
			});
		});

		it('opens modal on button click', async (done) => {
			const mockUrl = 'https://some.url';
			const mockShortUrl = 'https://short/url';

			const shareServiceSpy = spyOn(shareServiceMock, 'encodeState').and.returnValue(mockUrl);
			const urlServiceSpy = spyOn(urlServiceMock, 'shorten').withArgs(mockUrl).and.returnValue(mockShortUrl);

			const element = await setup();

			element.shadowRoot.querySelectorAll('.tool-container__button')[0].click();

			setTimeout(() => {
				expect(shareServiceSpy).toHaveBeenCalled();
				expect(urlServiceSpy).toHaveBeenCalledWith(mockUrl);
				expect(store.getState().modal.data.title).toBe('toolbox_shareTool_share');
				done();
			});
		});

		it('logs warn statement and opens modal with url if short url could not be generated on generate link button click', async (done) => {
			const mockUrl = 'https://some.url';
			const mockErrorMsg = 'something got wrong';

			const shareServiceSpy = spyOn(shareServiceMock, 'encodeState').and.returnValue(mockUrl);
			const urlServiceSpy = spyOn(urlServiceMock, 'shorten').withArgs(mockUrl).and.returnValue(Promise.reject(new Error(mockErrorMsg)));
			const warnSpy = spyOn(console, 'warn');

			const element = await setup();

			element.shadowRoot.querySelectorAll('.tool-container__button')[0].click();

			setTimeout(() => {
				expect(shareServiceSpy).toHaveBeenCalled();
				expect(urlServiceSpy).toHaveBeenCalledWith(mockUrl);
				expect(warnSpy).toHaveBeenCalledWith('Could not shorten url: Error: ' + mockErrorMsg);
				expect(store.getState().modal.data.title).toBe('toolbox_shareTool_share');
				done();
			});
		});

		it('log warn and share url if short url is not available', async (done) => {
			const mockUrl = 'https://some.url';
			const mockErrorMsg = 'something got wrong';
			const mockShareData = {
				title: 'toolbox_shareTool_title',
				url: mockUrl
			};
			const windowMock = {
				matchMedia() { },
				open() { },
				navigator: {
					share() { }
				}
			};
			const config = { embed: false, windowMock };

			const shareServiceSpy = spyOn(shareServiceMock, 'encodeState').and.returnValue(mockUrl);
			const urlServiceSpy = spyOn(urlServiceMock, 'shorten').withArgs(mockUrl).and.returnValue(Promise.reject(new Error(mockErrorMsg)));
			const windowMockSpy = spyOn(windowMock.navigator, 'share');
			const warnSpy = spyOn(console, 'warn');

			const element = await setup(config);

			expect(element.shadowRoot.querySelector('.tool-container__button')).toBeTruthy();

			for (let i = 0; i < 3; i++) {
				element.shadowRoot.querySelectorAll('.tool-container__button')[i].click();

				setTimeout(() => {
					expect(windowMockSpy).toHaveBeenCalledWith(mockShareData);
					expect(shareServiceSpy).toHaveBeenCalled();
					expect(urlServiceSpy).toHaveBeenCalledWith(mockUrl);
					expect(warnSpy).toHaveBeenCalledWith('Could not shorten url: Error: ' + mockErrorMsg);
					done();
				});
			}
		});

		it('initializes share api button', async (done) => {
			const mockUrl = 'https://some.url';
			const mockShortUrl = 'https://short/url';
			const mockShareData = {
				title: 'toolbox_shareTool_title',
				url: mockShortUrl
			};
			const windowMock = {
				matchMedia() { },
				open() { },
				navigator: {
					share() { }
				}
			};

			const shareServiceSpy = spyOn(shareServiceMock, 'encodeState').and.returnValue(mockUrl);
			const urlServiceSpy = spyOn(urlServiceMock, 'shorten').withArgs(mockUrl).and.returnValue(mockShortUrl);
			const windowShareSpy = spyOn(windowMock.navigator, 'share');

			const config = { embed: false, windowMock };

			const element = await setup(config);

			expect(element.shadowRoot.querySelectorAll('.tool-container__button')[0]).toBeTruthy();
			expect(element.shadowRoot.querySelectorAll('.tool-container__button')[0].innerHTML).toContain('toolbox_shareTool_share');

			element.shadowRoot.querySelectorAll('.tool-container__button')[0].click();

			setTimeout(() => {
				expect(windowShareSpy).toHaveBeenCalledWith(mockShareData);
				expect(shareServiceSpy).toHaveBeenCalled();
				expect(urlServiceSpy).toHaveBeenCalledWith(mockUrl);
				done();
			});
		});

		it('logs a warn statement on share api reject', async (done) => {
			const mockUrl = 'https://some.url';
			const mockShortUrl = 'https://short/url';
			const mockErrorMsg = 'something got wrong';
			const mockShareData = {
				title: 'toolbox_shareTool_title',
				url: mockShortUrl
			};
			const windowMock = {
				matchMedia() { },
				navigator: {
					share() { }
				}
			};

			const shareServiceSpy = spyOn(shareServiceMock, 'encodeState').and.returnValue(mockUrl);
			const urlServiceSpy = spyOn(urlServiceMock, 'shorten').withArgs(mockUrl).and.returnValue(mockShortUrl);
			const windowShareSpy = spyOn(windowMock.navigator, 'share').and.returnValue(Promise.reject(new Error(mockErrorMsg)));
			const warnSpy = spyOn(console, 'warn');

			const config = { embed: false, windowMock };

			const element = await setup(config);

			expect(element.shadowRoot.querySelector('.tool-container__buttons').innerHTML).toContain('toolbox_shareTool_share');

			element.shadowRoot.querySelectorAll('.tool-container__button')[0].click();

			setTimeout(() => {
				expect(warnSpy).toHaveBeenCalledWith('Share API not available: Error: ' + mockErrorMsg);
				expect(windowShareSpy).toHaveBeenCalledWith(mockShareData);
				done();
			});

			expect(shareServiceSpy).toHaveBeenCalled();
			expect(urlServiceSpy).toHaveBeenCalledWith(mockUrl);
		});

		it('enables/disables preview button on checkbox click', async () => {
			const element = await setup();

			expect(element.shadowRoot.querySelector('.preview_button').classList).toContain('disabled-preview');

			const checkbox = element.shadowRoot.querySelector('ba-checkbox');

			checkbox.click();
			
			expect(element.shadowRoot.querySelector('.preview_button').classList).not.toContain('disabled-preview');
			
			checkbox.click();

			expect(element.shadowRoot.querySelector('.preview_button').classList).toContain('disabled-preview');
		});
	});
});