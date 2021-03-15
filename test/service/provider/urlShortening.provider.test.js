import { $injector } from '../../../src/injection';
import { shortenBvvUrls } from '../../../src/services/provider/urlShorteningProvider';

describe('GeoResource provider', () => {
	describe('Bvv GeoResource provider', () => {


		const configService = {
			getValueAsPath: () => { }
		};

		const httpService = {
			fetch: async () => { }
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
			const httpServiceSpy = spyOn(httpService, 'fetch').withArgs(expectedArgs0).and.returnValue(Promise.resolve(
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

		it('rejects when backend request cannot be fulfilled', (done) => {

			const urlShorteningServiceUrl = 'https://shortening.url';
			const urlToShorten = 'https://makeme.shorter';
			const expectedArgs0 = urlShorteningServiceUrl + '?createcode=' + encodeURIComponent(urlToShorten);
			const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('SHORTENING_SERVICE_URL').and.returnValue(urlShorteningServiceUrl);
			const httpServiceSpy = spyOn(httpService, 'fetch').withArgs(expectedArgs0).and.returnValue(Promise.resolve(
				new Response(null, { status: 404 })
			));

			shortenBvvUrls(urlToShorten).then(() => {
				done(new Error('Promise should not be resolved'));
			}, (reason) => {
				expect(configServiceSpy).toHaveBeenCalled();
				expect(httpServiceSpy).toHaveBeenCalled();
				expect(reason.message).toBe('A short url could not be retrieved');
				done();
			});

		});

		it('rejects when url is not defined', (done) => {

			const urlToShorten = undefined;

			shortenBvvUrls(urlToShorten).then(() => {
				done(new Error('Promise should not be resolved'));
			}, (reason) => {
				expect(reason.message).toBe('Parameter \'url\' must be a string');
				done();
			});

		});
	});
});


