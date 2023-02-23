import { TestUtils } from '../../../../test-utils';
import { $injector } from '../../../../../src/injection';
import { ShareToolContent } from '../../../../../src/modules/toolbox/components/shareToolContent/ShareToolContent';
import { Checkbox } from '../../../../../src/modules/commons/components/checkbox/Checkbox';
import { modalReducer } from '../../../../../src/store/modal/modal.reducer';
import { IFrameGenerator } from '../../../../../src/modules/iframe/components/iframeGenerator/IFrameGenerator';
import { isTemplateResultOf } from '../../../../../src/utils/checks';

window.customElements.define(ShareToolContent.tag, ShareToolContent);
window.customElements.define(Checkbox.tag, Checkbox);

describe('ShareToolContent', () => {
	let store;

	const urlServiceMock = {
		shorten() {},
		qrCode() {}
	};

	const shareServiceMock = {
		encodeState() {},
		copyToClipboard() {}
	};

	const setup = async (config = {}) => {
		const { windowMock = { navigator: {}, open() {} } } = config;
		const { standalone = false } = config;

		const state = {};

		store = TestUtils.setupStoreAndDi(state, { modal: modalReducer });
		$injector
			.registerSingleton('EnvironmentService', {
				getWindow: () => windowMock,
				isStandalone: () => standalone
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
	describe('share buttons', () => {
		describe('shareApi available', () => {
			it('renders UI elements', async () => {
				const windowMock = {
					navigator: {
						share() {}
					}
				};
				const config = { windowMock };

				const element = await setup(config);

				expect(element.shadowRoot.querySelector('.tool-container__buttons').childElementCount).toBe(1);
				expect(element.shadowRoot.querySelector('.tool-container__button-text').innerText).toBe('toolbox_shareTool_share');
				expect(element.shadowRoot.querySelector('.tool-container__icon').classList).toContain('share');
			});

			describe('on share button click', () => {
				it('initializes share api button', async () => {
					const mockShortUrl = 'https://short/url';
					const mockShareData = {
						title: 'toolbox_shareTool_title',
						url: mockShortUrl
					};
					const windowMock = {
						open() {},
						navigator: {
							share() {}
						}
					};
					const windowShareSpy = spyOn(windowMock.navigator, 'share');
					const config = { windowMock };
					const element = await setup(config);
					spyOn(element, '_generateShortUrl').and.returnValue(mockShortUrl);

					element.shadowRoot.querySelectorAll('.tool-container__button')[0].click();

					await TestUtils.timeout();
					expect(windowShareSpy).toHaveBeenCalledWith(mockShareData);
				});

				it('logs a warn statement on share api reject', async () => {
					const mockShortUrl = 'https://short/url';
					const mockErrorMsg = 'something got wrong';
					const windowMock = {
						navigator: {
							share() {}
						}
					};
					spyOn(windowMock.navigator, 'share').and.returnValue(Promise.reject(new Error(mockErrorMsg)));
					const warnSpy = spyOn(console, 'warn');
					const config = { windowMock };
					const element = await setup(config);
					spyOn(element, '_generateShortUrl').and.returnValue(mockShortUrl);
					const shareButton = element.shadowRoot.querySelectorAll('.tool-container__button')[0];

					shareButton.click();

					await TestUtils.timeout();
					expect(warnSpy).toHaveBeenCalledWith('ShareAPI not available: Error: ' + mockErrorMsg);
				});
			});
		});

		describe('shareApi NOT available', () => {
			describe('shortUrl service available', () => {
				it('renders UI elements', async () => {
					const windowMock = {
						navigator: {}
					};
					const config = { windowMock };
					const element = await setup(config);

					expect(element.shadowRoot.querySelector('.tool-container__buttons').childElementCount).toBe(3);
					expect(element.shadowRoot.querySelectorAll('.tool-container__button-text')[0].innerText).toBe('toolbox_shareTool_link');
					expect(element.shadowRoot.querySelectorAll('.tool-container__button-text')[1].innerText).toBe('toolbox_shareTool_mail');
					expect(element.shadowRoot.querySelectorAll('.tool-container__button-text')[2].innerText).toBe('toolbox_shareTool_qr');
					expect(element.shadowRoot.querySelectorAll('.tool-container__icon')[0].classList).toContain('link');
					expect(element.shadowRoot.querySelectorAll('.tool-container__icon')[1].classList).toContain('mail');
					expect(element.shadowRoot.querySelectorAll('.tool-container__icon')[2].classList).toContain('qr');
				});
			});

			describe('shortUrl service NOT available', () => {
				it('renders UI elements', async () => {
					const windowMock = {
						navigator: {}
					};
					const standalone = true;
					const config = { windowMock, standalone };

					const element = await setup(config);

					expect(element.shadowRoot.querySelector('.tool-container__buttons').childElementCount).toBe(2);
					expect(element.shadowRoot.querySelectorAll('.tool-container__button-text')[0].innerText).toBe('toolbox_shareTool_link');
					expect(element.shadowRoot.querySelectorAll('.tool-container__button-text')[1].innerText).toBe('toolbox_shareTool_mail');
					expect(element.shadowRoot.querySelectorAll('.tool-container__icon')[0].classList).toContain('link');
					expect(element.shadowRoot.querySelectorAll('.tool-container__icon')[1].classList).toContain('mail');
				});
			});

			describe('on share button click', () => {
				it('opens the modal', async () => {
					const windowMock = {
						navigator: {}
					};
					const config = { windowMock };
					const element = await setup(config);
					spyOn(element, '_generateShortUrl').and.returnValue('https://short/url');

					element.shadowRoot.querySelectorAll('.tool-container__button')[0].click();

					await TestUtils.timeout();
					expect(store.getState().modal.data.title).toBe('toolbox_shareTool_share');
				});
			});

			describe('on mail and qr button click', () => {
				it('opens a window', async () => {
					const mockShortUrl = 'https://short.foo/url';
					const mailUrl = 'mailto:?body=' + mockShortUrl;
					const qrUrl = 'https://qrCode.foo?url=' + mockShortUrl;
					const windowMock = {
						navigator: {},
						open() {}
					};
					const config = { windowMock };
					const windowOpenSpy = spyOn(windowMock, 'open');
					const element = await setup(config);
					spyOn(element, '_generateShortUrl').and.returnValue(mockShortUrl);
					spyOn(urlServiceMock, 'qrCode').withArgs(mockShortUrl).and.returnValue(qrUrl);

					element.shadowRoot.querySelectorAll('.tool-container__button')[1].click();

					await TestUtils.timeout();
					expect(windowOpenSpy).toHaveBeenCalledWith(mailUrl);

					element.shadowRoot.querySelectorAll('.tool-container__button')[2].click();

					await TestUtils.timeout();
					expect(windowOpenSpy).toHaveBeenCalledWith(qrUrl);
				});

				it('throws error if window could not be opened', async () => {
					const mockShortUrl = 'https://short.foo/url';
					const mailUrl = 'mailto:?body=' + mockShortUrl;
					const windowMock = {
						navigator: {},
						open() {}
					};
					const config = { windowMock };
					const windowOpenSpy = spyOn(windowMock, 'open').and.returnValue(null);
					const warnSpy = spyOn(console, 'warn');
					const element = await setup(config);
					spyOn(element, '_generateShortUrl').and.returnValue(mockShortUrl);

					element.shadowRoot.querySelectorAll('.tool-container__button')[1].click();

					await TestUtils.timeout();
					expect(windowOpenSpy).toHaveBeenCalledWith(mailUrl);
					expect(warnSpy).toHaveBeenCalledWith('Could not share content: Error: Could not open window');
				});
			});
		});
	});

	describe('iframe container', () => {
		it('renders UI elements', async () => {
			const element = await setup();
			const checkbox = element.shadowRoot.querySelector('ba-checkbox');
			const button = element.shadowRoot.querySelector('.preview_button');


			expect(window.getComputedStyle(button).display).toBe('block');
			const title = element.shadowRoot.querySelectorAll('.ba-tool-container__title');
			expect(window.getComputedStyle(title[1]).display).toBe('block');
			const content = element.shadowRoot.querySelectorAll('.ba-tool-container__content');
			expect(window.getComputedStyle(content[1]).display).toBe('block');

			expect(button.disabled).toBeTrue();
			expect(checkbox.checked).toBeFalse();
			expect(element.shadowRoot.querySelector('.disclaimer-text').innerText).toBe('toolbox_shareTool_disclaimer');
		});

		describe('on checkbox click', () => {
			it('enables/disables the preview button', async () => {
				const element = await setup();
				const checkbox = element.shadowRoot.querySelector('ba-checkbox');
				const button = element.shadowRoot.querySelector('.preview_button');

				checkbox.click();

				expect(button.disabled).toBeFalse();

				checkbox.click();

				expect(button.disabled).toBeTrue();
			});

			it('opens the modal with IframeGenerator as content', async () => {
				const element = await setup();
				const checkbox = element.shadowRoot.querySelector('ba-checkbox');
				const button = element.shadowRoot.querySelector('.preview_button');

				checkbox.click();
				button.click();

				await TestUtils.timeout();
				expect(store.getState().modal.data.title).toBe('BayernAtlas-IFrame');
				expect(isTemplateResultOf(store.getState().modal.data.content, IFrameGenerator.tag)).toBeTrue();
			});
		});
	});
});
