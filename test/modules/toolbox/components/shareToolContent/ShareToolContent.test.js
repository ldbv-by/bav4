import { TestUtils } from '../../../../test-utils';
import { $injector } from '../../../../../src/injection';
import { ShareToolContent } from '../../../../../src/modules/toolbox/components/shareToolContent/ShareToolContent';

window.customElements.define(ShareToolContent.tag, ShareToolContent);

describe('ShareToolContent', () => {

	const windowMock = {
		matchMedia() { }
	};

	const urlServiceMock = {
		shorten() {} 
	};
    
	const shareServiceMock = {
		encodeState() {},
		copyToClipboard() {}   
	}; 

	const setup = async (config = {}) => {

		const { embed = false } = config;

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

		it('renders UI elements', async() => {
			const element = await setup();

			expect(element._tools).toBeTruthy();
			expect(element._tools.length).toBe(2);
			expect(element.shadowRoot.querySelector('.tool-container__buttons')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.tool-container__buttons').childElementCount).toBe(2);

			expect(element.shadowRoot.querySelector('.tool-container__input')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.tool-container__embed')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.tool-container__buttons-secondary')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.tool-container__checkbox')).toBeTruthy();
		});

		it('shows shortened url', async() => {
			const mockUrl = 'https://some.url';
			const mockShortUrl = 'https://short/url';

			const shareServiceSpy = spyOn(shareServiceMock, 'encodeState').and.returnValue(mockUrl);
			const urlServiceSpy = spyOn(urlServiceMock, 'shorten').withArgs(mockUrl).and.returnValue(mockShortUrl);

			const element = await setup();

			expect(element.shadowRoot.querySelector('.url-input').value).toEqual(mockShortUrl);

			expect(shareServiceSpy).toHaveBeenCalled();
			expect(urlServiceSpy).toHaveBeenCalledOnceWith(mockUrl);
		});

		it('initializes mail and qr link', async() => {
			const mockUrl = 'https://some.url';
			const mockShortUrl = 'https://short/url';

			const shareServiceSpy = spyOn(shareServiceMock, 'encodeState').and.returnValue(mockUrl);
			const urlServiceSpy = spyOn(urlServiceMock, 'shorten').withArgs(mockUrl).and.returnValue(mockShortUrl);

			const element = await setup();

			expect(element.shadowRoot.querySelector('a')).toBeTruthy();
			expect(element.shadowRoot.querySelectorAll('a')[0].href).toEqual('mailto:?body=' + mockShortUrl);
			expect(element.shadowRoot.querySelectorAll('a')[1].href).toEqual('https://v.bayern.de/?url=' + mockShortUrl);

			expect(shareServiceSpy).toHaveBeenCalled();
			expect(urlServiceSpy).toHaveBeenCalledOnceWith(mockUrl);
		});

		it('shows no url on Promise reject', async() => {
			const mockUrl = 'https://some.url';

			const shareServiceSpy = spyOn(shareServiceMock, 'encodeState').and.returnValue(mockUrl);
			const urlServiceSpy = spyOn(urlServiceMock, 'shorten').withArgs(mockUrl).and.returnValue(Promise.reject(new Error('something got wrong')));

			const element = await setup();

			expect(element.shadowRoot.querySelector('.url-input').value).toEqual('');

			expect(shareServiceSpy).toHaveBeenCalled();
			expect(urlServiceSpy).toHaveBeenCalledOnceWith(mockUrl);
		});

		it('copies short url to clipboard', async () => {
			const mockUrl = 'https://some.url';
			const mockShortUrl = 'https://short/url';

			const shareServiceSpy = spyOn(shareServiceMock, 'encodeState').and.returnValue(mockUrl);
			const urlServiceSpy = spyOn(urlServiceMock, 'shorten').withArgs(mockUrl).and.returnValue(mockShortUrl);
			const copyToClipboardMock = spyOn(shareServiceMock, 'copyToClipboard').and.returnValue(Promise.resolve());

			const element = await setup();

			const copyIcon = element.shadowRoot.querySelector('ba-icon');
			expect(copyIcon).toBeTruthy();

			copyIcon.click();

			expect(copyToClipboardMock).toHaveBeenCalledWith(mockShortUrl);
			expect(shareServiceSpy).toHaveBeenCalled();
			expect(urlServiceSpy).toHaveBeenCalledOnceWith(mockUrl);
		});

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
				done();
			});

			expect(copyToClipboardMock).toHaveBeenCalledWith(mockShortUrl);
			expect(shareServiceSpy).toHaveBeenCalled();
			expect(urlServiceSpy).toHaveBeenCalledOnceWith(mockUrl);
		});

		it('enables preview button on checkbox click', async () => {
			const element = await setup();

			expect(element.shadowRoot.querySelector('.preview_button')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.preview_button').classList).toContain('disabled-preview');

			const checkbox = element.shadowRoot.querySelector('.embed_checkbox');
			expect(checkbox).toBeTruthy();

			checkbox.click();

			expect(element.shadowRoot.querySelector('.preview_button').classList).not.toContain('disabled-preview');

			checkbox.click();

			expect(element.shadowRoot.querySelector('.preview_button').classList).toContain('disabled-preview');
		});
	});
});