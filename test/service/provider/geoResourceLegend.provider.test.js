import { $injector } from '@src/injection';
import { bvvGeoResourceLegendProvider } from '@src/services/provider/geoResourceLegend.provider';

describe('GeoResourceLegend provider', () => {
	const configService = {
		getValueAsPath: () => {}
	};

	const httpService = {
		get: async () => {}
	};

	beforeAll(() => {
		$injector.registerSingleton('ConfigService', configService).registerSingleton('HttpService', httpService);
	});

	describe('getGeoResourceInfoFromGeoResource provider', () => {
		describe('bvvGeoResourceLegendProvider', () => {
			it('loads a Legend for a provided geoResource id', async () => {
				const geoResourceId = '914c9263-5312-453e-b3eb-5104db1bf788';
				const backendUrl = 'https://backend.url/';
				const httpArg = backendUrl + 'georesource/legend/' + geoResourceId;
				const configServiceSpy = vi.spyOn(configService, 'getValueAsPath').mockReturnValue(backendUrl);
				const httpServiceSpy = vi.spyOn(httpService, 'get').mockResolvedValue(new Response('Legend Object', { status: 200 }));

				const result = await bvvGeoResourceLegendProvider(geoResourceId);

				expect(configServiceSpy).toHaveBeenCalledWith('BACKEND_URL');
				expect(httpServiceSpy).toHaveBeenCalledWith(httpArg);
				expect(result).toBe('Legend Object');
			});

			it('returns null when response has no content', async () => {
				const geoResourceId = '914c9263-5312-453e-b3eb-5104db1bf788';
				const backendUrl = 'https://backend.url/';
				const httpArg = backendUrl + 'georesource/legend/' + geoResourceId;
				const configServiceSpy = vi.spyOn(configService, 'getValueAsPath').mockReturnValue(backendUrl);
				const httpServiceSpy = vi.spyOn(httpService, 'get').mockResolvedValue(new Response(null, { status: 204 }));

				const result = await bvvGeoResourceLegendProvider(geoResourceId);

				expect(result).toBe(null);
				expect(configServiceSpy).toHaveBeenCalledWith('BACKEND_URL');
				expect(httpServiceSpy).toHaveBeenCalledWith(httpArg);
			});

			it('returns null when access is denied', async () => {
				const geoResourceId = '914c9263-5312-453e-b3eb-5104db1bf788';
				const backendUrl = 'https://backend.url/';
				const httpArg = backendUrl + 'georesource/legend/' + geoResourceId;
				const configServiceSpy = vi.spyOn(configService, 'getValueAsPath').mockReturnValue(backendUrl);
				const httpServiceSpy = vi.spyOn(httpService, 'get').mockResolvedValue(new Response('Legend Object', { status: 403 }));

				const result = await bvvGeoResourceLegendProvider(geoResourceId);

				expect(result).toBe(null);
				expect(configServiceSpy).toHaveBeenCalledWith('BACKEND_URL');
				expect(httpServiceSpy).toHaveBeenCalledWith(httpArg);
			});

			it('returns null when Legend was not found', async () => {
				const geoResourceId = '914c9263-5312-453e-b3eb-5104db1bf788';
				const backendUrl = 'https://backend.url/';
				const httpArg = backendUrl + 'georesource/legend/' + geoResourceId;
				const configServiceSpy = vi.spyOn(configService, 'getValueAsPath').mockReturnValue(backendUrl);
				const httpServiceSpy = vi.spyOn(httpService, 'get').mockResolvedValue(new Response('Legend Object', { status: 404 }));

				const result = await bvvGeoResourceLegendProvider(geoResourceId);

				expect(result).toBe(null);
				expect(configServiceSpy).toHaveBeenCalledWith('BACKEND_URL');
				expect(httpServiceSpy).toHaveBeenCalledWith(httpArg);
			});

			it('throws an error when status code is unhandled', async () => {
				const geoResourceId = '914c9263-5312-453e-b3eb-5104db1bf788';
				const backendUrl = 'https://backend.url/';
				const httpArg = backendUrl + 'georesource/legend/' + geoResourceId;
				const configServiceSpy = vi.spyOn(configService, 'getValueAsPath').mockReturnValue(backendUrl);
				const httpServiceSpy = vi.spyOn(httpService, 'get').mockResolvedValue(new Response('Legend Object', { status: 500 }));

				await expect(bvvGeoResourceLegendProvider(geoResourceId)).rejects.toThrow(
					`GeoResourceInfoResult for '${geoResourceId}' could not be loaded: Http-Status 500`
				);
				expect(configServiceSpy).toHaveBeenCalledWith('BACKEND_URL');
				expect(httpServiceSpy).toHaveBeenCalledWith(httpArg);
			});
		});
	});
});
