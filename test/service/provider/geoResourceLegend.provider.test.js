import { $injector } from '@src/injection';
import { requestGeoResourceLegend } from '@src/services/provider/geoResourceLegend.provider';

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
		describe('requestGeoResourceLegend', () => {
			it('loads a Legend for a provided geoResource id', async () => {
				const geoResourceId = '914c9263-5312-453e-b3eb-5104db1bf788';
				const backendUrl = 'https://backend.url/';
				const httpArg = backendUrl + 'georesource/legend/' + geoResourceId;
				const configServiceSpy = vi.spyOn(configService, 'getValueAsPath').mockReturnValue(backendUrl);
				const httpServiceSpy = vi.spyOn(httpService, 'get').mockResolvedValue(new Response('Legend Object', { status: 200 }));

				const result = await requestGeoResourceLegend(geoResourceId);

				expect(configServiceSpy).toHaveBeenCalledWith('BACKEND_URL');
				expect(httpServiceSpy).toHaveBeenCalledWith(httpArg);
				expect(result).toBe('Legend Object');
			});

			it('throws an error when Legend was not found', async () => {
				const geoResourceId = '914c9263-5312-453e-b3eb-5104db1bf788';
				const backendUrl = 'https://backend.url/';
				const httpArg = backendUrl + 'georesource/legend/' + geoResourceId;
				const configServiceSpy = vi.spyOn(configService, 'getValueAsPath').mockReturnValue(backendUrl);
				const httpServiceSpy = vi.spyOn(httpService, 'get').mockResolvedValue(new Response('Legend Object', { status: 404 }));

				await expect(requestGeoResourceLegend(geoResourceId)).rejects.toThrow(
					`GeoResourceInfoResult for '${geoResourceId}' could not be loaded: Http-Status 404`
				);
				expect(configServiceSpy).toHaveBeenCalledWith('BACKEND_URL');
				expect(httpServiceSpy).toHaveBeenCalledWith(httpArg);
			});

			it('throws an error when Legend when access denied', async () => {
				const geoResourceId = '914c9263-5312-453e-b3eb-5104db1bf788';
				const backendUrl = 'https://backend.url/';
				const httpArg = backendUrl + 'georesource/legend/' + geoResourceId;
				const configServiceSpy = vi.spyOn(configService, 'getValueAsPath').mockReturnValue(backendUrl);
				const httpServiceSpy = vi.spyOn(httpService, 'get').mockResolvedValue(new Response('Legend Object', { status: 403 }));

				await expect(requestGeoResourceLegend(geoResourceId)).rejects.toThrow(
					`GeoResourceInfoResult for '${geoResourceId}' could not be loaded: Http-Status 403`
				);
				expect(configServiceSpy).toHaveBeenCalledWith('BACKEND_URL');
				expect(httpServiceSpy).toHaveBeenCalledWith(httpArg);
			});
		});
	});
});
