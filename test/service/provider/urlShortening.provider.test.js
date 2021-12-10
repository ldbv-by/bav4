import { $injector } from '../../../src/injection';
import { shortenBvvUrls } from '../../../src/services/provider/urlShorteningProvider';

describe('UrlShortening provider', () => {

	describe('Bvv UrlShortening provider', () => {

		const configService = {
			getValueAsPath: () => { }
		};

		const httpService = {
			get: async () => { }
		};

		beforeAll(() => {
			$injector
				.registerSingleton('ConfigService', configService)
				.registerSingleton('HttpService', httpService);
		});


		it('shortens an url', async () => {
			const urlShorteningServiceUrl = 'https://shortening.url';
			const urlToShorten = 'https://makeme.shorter';
			const expectedShortUrl = 'https://much.shorter';
			const expectedArgs0 = urlShorteningServiceUrl + '?createcode=' + encodeURIComponent(urlToShorten);
			const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('SHORTENING_SERVICE_URL').and.returnValue(urlShorteningServiceUrl);
			const httpServiceSpy = spyOn(httpService, 'get').withArgs(expectedArgs0).and.returnValue(Promise.resolve(
				new Response(
					JSON.stringify({
						shorturl: expectedShortUrl
					})
				)
			));

			const shortUrl = await shortenBvvUrls(urlToShorten);

			expect(configServiceSpy).toHaveBeenCalled();
			expect(httpServiceSpy).toHaveBeenCalled();
			expect(shortUrl).toBe(expectedShortUrl);
		});

		it('rejects when backend request cannot be fulfilled', async () => {

			const urlShorteningServiceUrl = 'https://shortening.url';
			const urlToShorten = 'https://makeme.shorter';
			const expectedArgs0 = urlShorteningServiceUrl + '?createcode=' + encodeURIComponent(urlToShorten);
			const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('SHORTENING_SERVICE_URL').and.returnValue(urlShorteningServiceUrl);
			const httpServiceSpy = spyOn(httpService, 'get').withArgs(expectedArgs0).and.returnValue(Promise.resolve(
				new Response(null, { status: 404 })
			));

			try {
				await shortenBvvUrls(urlToShorten);
				throw new Error('Promise should not be resolved');
			}
			catch (error) {
				expect(configServiceSpy).toHaveBeenCalled();
				expect(httpServiceSpy).toHaveBeenCalled();
				expect(error.message).toBe('A short url could not be retrieved');
			}
		});
	});
});


