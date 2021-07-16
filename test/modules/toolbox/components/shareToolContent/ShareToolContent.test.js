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

	describe('methods', () => {

		describe('_generateShortUrl', () => {

			it('generates a short url', async () => {
				const mockUrl = 'https://some.url';
				const mockShortUrl = 'https://short/url';
				spyOn(shareServiceMock, 'encodeState').and.returnValue(mockUrl);
				spyOn(urlServiceMock, 'shorten').withArgs(mockUrl).and.returnValue(mockShortUrl);
				const element = await setup();

				const url = await element._generateShortUrl();
				
				expect(url).toBe(mockShortUrl);
			});

			it('returns the original url in case of error and logs a warn statement', async () => {
				const mockUrl = 'https://some.url';
				spyOn(shareServiceMock, 'encodeState').and.returnValue(mockUrl);
				spyOn(urlServiceMock, 'shorten').withArgs(mockUrl).and.rejectWith('Something got wrong');
				const warnSpy = spyOn(console, 'warn');
				const element = await setup();

				const url = await element._generateShortUrl();

				expect(warnSpy).toHaveBeenCalledWith('Could not shorten url: Something got wrong');
				expect(url).toBe(mockUrl);
			});
		});
	});


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
	});

	describe('on mail and qr button click', () => {

		it('opens a window', async (done) => {
			const mockShortUrl = 'https://short/url';
			const mailUrl = 'mailto:?body=' + mockShortUrl;
			const qrUrl = 'https://v.bayern.de?url=' + mockShortUrl;
			const windowMock = {
				navigator: {},
				open() { }
			};
			const config = { embed: false, windowMock };
			const windowOpenSpy = spyOn(windowMock, 'open');
			const element = await setup(config);
			spyOn(element, '_generateShortUrl').and.returnValue(mockShortUrl);

			expect(element.shadowRoot.querySelector('.tool-container__button')).toBeTruthy();

			element.shadowRoot.querySelectorAll('.tool-container__button')[1].click();

			setTimeout(() => {
				expect(windowOpenSpy).toHaveBeenCalledWith(mailUrl);
				done();
			});

			element.shadowRoot.querySelectorAll('.tool-container__button')[2].click();

			setTimeout(() => {
				expect(windowOpenSpy).toHaveBeenCalledWith(qrUrl);
				done();
			});
		});

		it('throws error if window could not be opened', async (done) => {
			const mockShortUrl = 'https://short/url';
			const mailUrl = 'mailto:?body=' + mockShortUrl;
			const windowMock = {
				navigator: {},
				open() { }
			};
			const config = { embed: false, windowMock };
			const windowOpenSpy = spyOn(windowMock, 'open').and.returnValue(null);
			const warnSpy = spyOn(console, 'warn');
			const element = await setup(config);
			spyOn(element, '_generateShortUrl').and.returnValue(mockShortUrl);
			
			expect(element.shadowRoot.querySelector('.tool-container__button')).toBeTruthy();

			element.shadowRoot.querySelectorAll('.tool-container__button')[1].click();

			setTimeout(() => {
				expect(windowOpenSpy).toHaveBeenCalledWith(mailUrl);
				expect(warnSpy).toHaveBeenCalledWith('Could not share content: Error: Could not open window');
				done();
			});
		});
	});

	describe('on share button click', () => {

		it('opens the modal', async (done) => {
			const mockShortUrl = 'https://short/url';
			const element = await setup();
			spyOn(element, '_generateShortUrl').and.returnValue(mockShortUrl);

			element.shadowRoot.querySelectorAll('.tool-container__button')[0].click();

			setTimeout(() => {
				expect(store.getState().modal.data.title).toBe('toolbox_shareTool_share');
				done();
			});
		});


		it('initializes share api button', async (done) => {
			const mockShortUrl = 'https://short/url';
			const mockShareData = {
				title: 'toolbox_shareTool_title',
				url: mockShortUrl
			};
			const windowMock = {
				open() { },
				navigator: {
					share() { }
				}
			};
			const windowShareSpy = spyOn(windowMock.navigator, 'share');
			const config = { embed: false, windowMock };
			const element = await setup(config);
			spyOn(element, '_generateShortUrl').and.returnValue(mockShortUrl);

			expect(element.shadowRoot.querySelectorAll('.tool-container__button')[0]).toBeTruthy();
			expect(element.shadowRoot.querySelectorAll('.tool-container__button')[0].innerHTML).toContain('toolbox_shareTool_share');

			element.shadowRoot.querySelectorAll('.tool-container__button')[0].click();

			setTimeout(() => {
				expect(windowShareSpy).toHaveBeenCalledWith(mockShareData);
				done();
			});
		});

		it('logs a warn statement on share api reject', async (done) => {
			const mockShortUrl = 'https://short/url';
			const mockErrorMsg = 'something got wrong';
			const mockShareData = {
				title: 'toolbox_shareTool_title',
				url: mockShortUrl
			};
			const windowMock = {
				navigator: {
					share() { }
				}
			};
			const windowShareSpy = spyOn(windowMock.navigator, 'share').and.returnValue(Promise.reject(new Error(mockErrorMsg)));
			const warnSpy = spyOn(console, 'warn');
			const config = { embed: false, windowMock };
			const element = await setup(config);
			spyOn(element, '_generateShortUrl').and.returnValue(mockShortUrl);

			expect(element.shadowRoot.querySelector('.tool-container__buttons').innerHTML).toContain('toolbox_shareTool_share');

			element.shadowRoot.querySelectorAll('.tool-container__button')[0].click();

			setTimeout(() => {
				expect(warnSpy).toHaveBeenCalledWith('Share API not available: Error: ' + mockErrorMsg);
				expect(windowShareSpy).toHaveBeenCalledWith(mockShareData);
				done();
			});
		});

		it('enables/disables preview button on checkbox click', async () => {
			const element = await setup();
			const checkbox = element.shadowRoot.querySelector('ba-checkbox');
			const button = element.shadowRoot.querySelector('.preview_button');

			expect(button.getAttribute('disabled')).toBe('true');
			expect(checkbox.getAttribute('checked')).toBe('false');

			checkbox.click();

			expect(button.disabled).toBeFalse();

			checkbox.click();

			expect(button.disabled).toBeTrue();
		});
	});
});