import { $injector } from '@src/injection';
import { shortenBvvUrls } from '@src/services/provider/urlShorteningProvider';

describe('UrlShortening provider', () => {
	describe('Bvv UrlShortening provider', () => {
		const configService = {
			getValueAsPath: () => {}
		};

		const httpService = {
			get: async () => {}
		};

		beforeAll(() => {
			$injector.registerSingleton('ConfigService', configService).registerSingleton('HttpService', httpService);
		});

		it('shortens an url', async () => {
			const urlShorteningServiceUrl = 'https://shortening.url';
			const urlToShorten = 'https://makeme.shorter';
			const expectedShortUrl = 'https://much.shorter';
			const expectedArgs0 = urlShorteningServiceUrl + '?createcode=' + encodeURIComponent(urlToShorten);
			const configServiceSpy = vi.spyOn(configService, 'getValueAsPath').mockReturnValue(urlShorteningServiceUrl);
			const httpServiceSpy = vi.spyOn(httpService, 'get').mockResolvedValue(
				new Response(
					JSON.stringify({
						shorturl: expectedShortUrl
					})
				)
			);

			const shortUrl = await shortenBvvUrls(urlToShorten);

			expect(configServiceSpy).toHaveBeenCalledWith('SHORTENING_SERVICE_URL');
			expect(httpServiceSpy).toHaveBeenCalledWith(expectedArgs0);
			expect(shortUrl).toBe(expectedShortUrl);
		});

		it('rejects when backend request cannot be fulfilled', async () => {
			const urlShorteningServiceUrl = 'https://shortening.url';
			const urlToShorten = 'https://makeme.shorter';
			const expectedArgs0 = urlShorteningServiceUrl + '?createcode=' + encodeURIComponent(urlToShorten);
			const configServiceSpy = vi.spyOn(configService, 'getValueAsPath').mockReturnValue(urlShorteningServiceUrl);
			const httpServiceSpy = vi.spyOn(httpService, 'get').mockResolvedValue(new Response(null, { status: 404 }));

			await expect(shortenBvvUrls(urlToShorten)).rejects.toThrowError('A short url could not be retrieved');
			expect(configServiceSpy).toHaveBeenCalledWith('SHORTENING_SERVICE_URL');
			expect(httpServiceSpy).toHaveBeenCalledWith(expectedArgs0);
		});
	});
});
