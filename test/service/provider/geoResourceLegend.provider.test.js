import { $injector } from '@src/injection';
import { Legend, LegendEntry, LegendEntryType } from '@src/services/GeoResourceLegendService';
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
			it('loads a one dimensional Legend for a provided geoResource id', async () => {
				const geoResourceId = '914c9263-5312-453e-b3eb-5104db1bf788';
				const httpResponseBody = JSON.stringify({
					geoResourceId: geoResourceId,
					entries: [
						[
							{
								type: LegendEntryType.HTML,
								urlOrData: '<div></div>'
							},

							{
								type: LegendEntryType.IMAGE_BASE64,
								urlOrData: 'BASE64 DATA'
							}
						]
					]
				});

				const backendUrl = 'https://backend.url/';
				const httpArg = backendUrl + 'georesource/legend/' + geoResourceId;
				const configServiceSpy = vi.spyOn(configService, 'getValueAsPath').mockReturnValue(backendUrl);
				const httpServiceSpy = vi.spyOn(httpService, 'get').mockResolvedValue(new Response(httpResponseBody, { status: 200 }));

				const result = await bvvGeoResourceLegendProvider(geoResourceId);

				expect(configServiceSpy).toHaveBeenCalledWith('BACKEND_URL');
				expect(httpServiceSpy).toHaveBeenCalledWith(httpArg);
				expect(result.geoResourceId).toBe(geoResourceId);
				expect(result.entries).toHaveLength(2);
				expect(result).toBeInstanceOf(Legend);
				expect(result.entries[0]).toBeInstanceOf(LegendEntry);
				expect(result.entries[0].type).toBe(LegendEntryType.HTML);
				expect(result.entries[0].urlOrData).toBe('<div></div>');
			});

			it('loads a two dimensional Legend for a provided geoResource id', async () => {
				const geoResourceId = '914c9263-5312-453e-b3eb-5104db1bf788';
				const httpResponseBody = JSON.stringify({
					geoResourceId: geoResourceId,
					entries: [
						[
							{
								type: LegendEntryType.HTML,
								urlOrData: '<div></div>'
							}
						],
						[
							{
								type: LegendEntryType.IMAGE_BASE64,
								urlOrData: 'BASE64 DATA'
							}
						]
					]
				});

				const backendUrl = 'https://backend.url/';
				const httpArg = backendUrl + 'georesource/legend/' + geoResourceId;
				const configServiceSpy = vi.spyOn(configService, 'getValueAsPath').mockReturnValue(backendUrl);
				const httpServiceSpy = vi.spyOn(httpService, 'get').mockResolvedValue(new Response(httpResponseBody, { status: 200 }));

				const result = await bvvGeoResourceLegendProvider(geoResourceId);

				expect(configServiceSpy).toHaveBeenCalledWith('BACKEND_URL');
				expect(httpServiceSpy).toHaveBeenCalledWith(httpArg);
				expect(result.geoResourceId).toBe(geoResourceId);
				expect(result.entries).toHaveLength(2);
				expect(result).toBeInstanceOf(Legend);
				expect(result.entries[0][0]).toBeInstanceOf(LegendEntry);
				expect(result.entries[0][0].type).toBe(LegendEntryType.HTML);
				expect(result.entries[0][0].urlOrData).toBe('<div></div>');
				expect(result.entries[1][0]).toBeInstanceOf(LegendEntry);
				expect(result.entries[1][0].type).toBe(LegendEntryType.IMAGE_BASE64);
				expect(result.entries[1][0].urlOrData).toBe('BASE64 DATA');
			});

			it('loads a Legend with empty entries', async () => {
				const geoResourceId = '914c9263-5312-453e-b3eb-5104db1bf788';
				const httpResponseBody = JSON.stringify({
					geoResourceId: geoResourceId
				});

				const backendUrl = 'https://backend.url/';
				const httpArg = backendUrl + 'georesource/legend/' + geoResourceId;
				const configServiceSpy = vi.spyOn(configService, 'getValueAsPath').mockReturnValue(backendUrl);
				const httpServiceSpy = vi.spyOn(httpService, 'get').mockResolvedValue(new Response(httpResponseBody, { status: 200 }));

				const result = await bvvGeoResourceLegendProvider(geoResourceId);

				expect(configServiceSpy).toHaveBeenCalledWith('BACKEND_URL');
				expect(httpServiceSpy).toHaveBeenCalledWith(httpArg);
				expect(result.geoResourceId).toBe(geoResourceId);
				expect(result).toBeInstanceOf(Legend);
				expect(result.entries).toHaveLength(0);
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
