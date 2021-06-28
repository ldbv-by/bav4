import { TestUtils } from '../../../../test-utils';
import { $injector } from '../../../../../src/injection';
import { ShareToolContent } from '../../../../../src/modules/toolbox/components/shareToolContent/ShareToolContent';

window.customElements.define(ShareToolContent.tag, ShareToolContent);

describe('ShareToolContent', () => {

	const urlServiceMock = {
		shorten() {} 
	};
    
	const shareServiceMock = {
		encodeState() {},
		copyToClipboard() {}   
	}; 

	const setup = async (config = {}) => {

		const { embed = false, windowMock = { navigator: { }, open() {} } } = config;

		const state = {
			toolContainer: {
				open: false,
				contentId:false
			}
		};

		TestUtils.setupStoreAndDi(state, {} );
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

		it('renders UI elements without share api button', async() => {
			const element = await setup();

			expect(element._tools).toBeTruthy();
			expect(element._tools.length).toBe(3);
			expect(element.shadowRoot.querySelector('.tool-container__buttons')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.tool-container__buttons').childElementCount).toBe(2);
			expect(element.shadowRoot.querySelector('.tool-container__buttons').innerHTML).not.toContain('toolbox_shareTool_share');

			expect(element.shadowRoot.querySelector('.tool-container__input')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.tool-container__embed')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.tool-container__buttons-secondary')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.tool-container__checkbox')).toBeTruthy();
		});

		it('renders UI elements with share api button', async() => {
			const config = { embed: false, windowMock: { navigator: { share() { } } } };

			const element = await setup(config);

			expect(element._tools).toBeTruthy();
			expect(element._tools.length).toBe(3);
			expect(element.shadowRoot.querySelector('.tool-container__buttons')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.tool-container__buttons').childElementCount).toBe(3);
			expect(element.shadowRoot.querySelector('.tool-container__buttons').innerHTML).toContain('toolbox_shareTool_share');

			expect(element.shadowRoot.querySelector('.tool-container__input')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.tool-container__embed')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.tool-container__buttons-secondary')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.tool-container__checkbox')).toBeTruthy();
		});

		// it('shows shortened url', async() => {
		// 	const mockUrl = 'https://some.url';
		// 	const mockShortUrl = 'https://short/url';

		// 	const shareServiceSpy = spyOn(shareServiceMock, 'encodeState').and.returnValue(mockUrl);
		// 	const urlServiceSpy = spyOn(urlServiceMock, 'shorten').withArgs(mockUrl).and.returnValue(mockShortUrl);

		// 	const element = await setup();

		// 	expect(element.shadowRoot.querySelector('.url-input').value).toEqual(mockShortUrl);

		// 	expect(shareServiceSpy).toHaveBeenCalled();
		// 	expect(urlServiceSpy).toHaveBeenCalledOnceWith(mockUrl);
		// });

		it('opens window on mail and qr button click', async(done) => {
			const mockUrl = 'https://some.url';
			const mockShortUrl = 'https://short/url';
			const mailUrl = 'mailto:?body=' + mockShortUrl;
			const qrUrl = 'https://v.bayern.de?url=' + mockShortUrl;
			const windowMock = {
				matchMedia() { },
				navigator: { },
				open() { } 
			};
			const config = { embed: false, windowMock };

			const shareServiceSpy = spyOn(shareServiceMock, 'encodeState').and.returnValue(mockUrl);
			const urlServiceSpy = spyOn(urlServiceMock, 'shorten').withArgs(mockUrl).and.returnValue(mockShortUrl);
			const windowOpenSpy = spyOn(windowMock, 'open');

			const element = await setup(config);

			expect(element.shadowRoot.querySelector('.tool-container__button')).toBeTruthy();

			element.shadowRoot.querySelectorAll('.tool-container__button')[0].click();

			setTimeout(() => {
				expect(windowOpenSpy).toHaveBeenCalledWith(mailUrl);
				expect(shareServiceSpy).toHaveBeenCalled();
				expect(urlServiceSpy).toHaveBeenCalledWith(mockUrl);
				done();
			});	
			
			element.shadowRoot.querySelectorAll('.tool-container__button')[1].click();

			setTimeout(() => {
				expect(windowOpenSpy).toHaveBeenCalledWith(qrUrl);
				expect(shareServiceSpy).toHaveBeenCalled();
				expect(urlServiceSpy).toHaveBeenCalledWith(mockUrl);
				done();
			});			
		});

		it('disables buttons if no short url available', async(done) => {
			const mockUrl = 'https://some.url';
			const windowMock = {
				matchMedia() { },
				open() { }, 
				navigator: {
					share () {}
				} 
			};
			const config = { embed: false, windowMock };

			const shareServiceSpy = spyOn(shareServiceMock, 'encodeState').and.returnValue(mockUrl);
			const urlServiceSpy = spyOn(urlServiceMock, 'shorten').withArgs(mockUrl).and.returnValue('');
			const windowMockSpy = spyOn(windowMock.navigator, 'share');

			const element = await setup(config);

			expect(element.shadowRoot.querySelector('.tool-container__button')).toBeTruthy();

			for (let i = 0; i < 3; i++ ) {
				element.shadowRoot.querySelectorAll('.tool-container__button')[i].click();

				setTimeout(() => {
					expect(windowMockSpy).not.toHaveBeenCalled();
					expect(shareServiceSpy).toHaveBeenCalled();
					expect(urlServiceSpy).toHaveBeenCalledWith(mockUrl);
					expect(element.shadowRoot.querySelectorAll('.tool-container__button')[i].classList).toContain('disabled_tool__button');
					done();
				});
			} 			
		});

		it('initializes share api button', async(done) => {
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
					share () {}
				} 
			};	 

			const shareServiceSpy = spyOn(shareServiceMock, 'encodeState').and.returnValue(mockUrl);
			const urlServiceSpy = spyOn(urlServiceMock, 'shorten').withArgs(mockUrl).and.returnValue(mockShortUrl);
			const windowShareSpy = spyOn(windowMock.navigator, 'share');

			const config = { embed: false, windowMock };

			const element = await setup(config);

			expect(element.shadowRoot.querySelectorAll('.tool-container__button')[2]).toBeTruthy();
			expect(element.shadowRoot.querySelectorAll('.tool-container__button')[2].innerHTML).toContain('toolbox_shareTool_share');

			element.shadowRoot.querySelectorAll('.tool-container__button')[2].click(); 

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
					share () {} 
				} 
			};

			const shareServiceSpy = spyOn(shareServiceMock, 'encodeState').and.returnValue(mockUrl);
			const urlServiceSpy = spyOn(urlServiceMock, 'shorten').withArgs(mockUrl).and.returnValue(mockShortUrl);
			const windowShareSpy = spyOn(windowMock.navigator, 'share').and.returnValue(Promise.reject(new Error(mockErrorMsg)));
			const warnSpy = spyOn(console, 'warn');

			const config = { embed: false, windowMock };

			const element = await setup(config);

			expect(element.shadowRoot.querySelector('.tool-container__buttons').innerHTML).toContain('toolbox_shareTool_share');

			element.shadowRoot.querySelectorAll('.tool-container__button')[2].click(); 

			setTimeout(() => {
				expect(warnSpy).toHaveBeenCalledWith('Share API not available: Error: ' + mockErrorMsg);
				expect(windowShareSpy).toHaveBeenCalledWith(mockShareData);
				done();
			});

			expect(shareServiceSpy).toHaveBeenCalled();
			expect(urlServiceSpy).toHaveBeenCalledWith(mockUrl);
		});

		// it('shows no url on Promise reject', async() => {
		// 	const mockUrl = 'https://some.url';

		// 	const shareServiceSpy = spyOn(shareServiceMock, 'encodeState').and.returnValue(mockUrl);
		// 	const urlServiceSpy = spyOn(urlServiceMock, 'shorten').withArgs(mockUrl).and.returnValue(Promise.reject(new Error('something got wrong')));

		// 	const element = await setup();

		// 		expect(element.shadowRoot.querySelector('.url-input').value).toEqual('');
		// 		done();

		// 	expect(shareServiceSpy).toHaveBeenCalled();
		// 	expect(urlServiceSpy).toHaveBeenCalledOnceWith(mockUrl);
		// });

		// it('copies short url to clipboard', async () => {
		// 	const mockUrl = 'https://some.url';
		// 	const mockShortUrl = 'https://short/url';

		// 	const shareServiceSpy = spyOn(shareServiceMock, 'encodeState').and.returnValue(mockUrl);
		// 	const urlServiceSpy = spyOn(urlServiceMock, 'shorten').withArgs(mockUrl).and.returnValue(mockShortUrl);
		// 	const copyToClipboardMock = spyOn(shareServiceMock, 'copyToClipboard').and.returnValue(Promise.resolve());

		// 	const element = await setup();

		// 	const copyIcon = element.shadowRoot.querySelector('ba-icon');
		// 	expect(copyIcon).toBeTruthy();

		// 	copyIcon.click();

		// 	expect(copyToClipboardMock).toHaveBeenCalledWith(mockShortUrl);
		// 	expect(shareServiceSpy).toHaveBeenCalled();
		// 	expect(urlServiceSpy).toHaveBeenCalledOnceWith(mockUrl);
		// });

		it('logs a warn statement when Clipboard API is not available', async (done) => {
			const mockUrl = 'https://some.url';
			const mockShortUrl = 'https://short/url';

			const shareServiceSpy = spyOn(shareServiceMock, 'encodeState').and.returnValue(mockUrl);
			const urlServiceSpy = spyOn(urlServiceMock, 'shorten').withArgs(mockUrl).and.returnValue(mockShortUrl);
			const copyToClipboardMock = spyOn(shareServiceMock, 'copyToClipboard').and.returnValue(Promise.reject(new Error('something got wrong')));
			const warnSpy = spyOn(console, 'warn');

			const element = await setup();

			const copyIcon = element.shadowRoot.querySelector('ba-icon');
			expect(copyIcon).toBeTruthy();
			copyIcon.click();

			setTimeout(() => {
				expect(warnSpy).toHaveBeenCalledWith('something got wrong');
				expect(copyToClipboardMock).toHaveBeenCalledWith(mockShortUrl);
				done();
			});

			expect(shareServiceSpy).toHaveBeenCalled();
			expect(urlServiceSpy).toHaveBeenCalledOnceWith(mockUrl);
		});

		it('enables preview button on checkbox click', async () => {
			const element = await setup();

			expect(element.shadowRoot.querySelector('.preview_button')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.preview_button').classList).toContain('disabled-preview');

			const checkbox = element.shadowRoot.querySelector('ba-checkbox');
			expect(checkbox).toBeTruthy();

			checkbox.dispatchEvent(new CustomEvent('toggle', {
				detail: { checked: true }
			}));

			expect(element.shadowRoot.querySelector('.preview_button').classList).not.toContain('disabled-preview');

			checkbox.dispatchEvent(new CustomEvent('toggle', {
				detail: { checked: false }
			}));

			expect(element.shadowRoot.querySelector('.preview_button').classList).toContain('disabled-preview');
		});
	});
});