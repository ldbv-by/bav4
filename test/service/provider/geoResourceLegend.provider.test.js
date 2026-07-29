import { $injector } from '@src/injection';
import { Legend, LegendEntry, LegendEntryType } from '@src/services/GeoResourceLegendService';
import { bvvGeoResourceLegendProvider } from '@src/services/provider/geoResourceLegend.provider';
import { GeoResourceAuthenticationType, WmsGeoResource } from '@src/domain/geoResources';
import { MediaType } from '@src/domain/mediaTypes';

describe('GeoResourceLegend provider', () => {
	const configService = {
		getValueAsPath: () => {}
	};

	const httpService = {
		get: async () => {},
		post: async () => {}
	};

	const geoResourceService = {
		byId: (geoResourceId) => new WmsGeoResource(geoResourceId, 'label', 'url', 'layer', 'format'),
		getAuthResponseInterceptorForGeoResource: () => responseInterceptor
	};

	const baaCredentialService = {
		get: () => {}
	};

	const responseInterceptor = [() => {}];

	beforeAll(() => {
		$injector
			.registerSingleton('ConfigService', configService)
			.registerSingleton('HttpService', httpService)
			.registerSingleton('GeoResourceService', geoResourceService)
			.registerSingleton('BaaCredentialService', baaCredentialService);
	});

	describe('getGeoResourceInfoFromGeoResource provider', () => {
		describe('bvvGeoResourceLegendProvider', () => {
			const legendEntries = [
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
			];

			it('loads an internal Legend for a provided geoResource id', async () => {
				const geoResourceId = '914c9263-5312-453e-b3eb-5104db1bf788';
				const httpResponseBody = JSON.stringify({ id: geoResourceId, entries: legendEntries });
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

			it('loads an external Legend for a provided geoResource id', async () => {
				const geoResourceId = 'http://some.url||layer';
				const httpResponseBody = JSON.stringify({ id: geoResourceId, entries: legendEntries });
				const backendUrl = 'https://backend.url/';
				const httpArg = backendUrl + 'georesource/legend/external/wms';
				const expectedPayLoad = '{"url":"http://some.url","layers":["layer"]}';
				const configServiceSpy = vi.spyOn(configService, 'getValueAsPath').mockReturnValue(backendUrl);
				const httpServiceSpy = vi.spyOn(httpService, 'post').mockResolvedValue(new Response(httpResponseBody, { status: 200 }));
				vi.spyOn(geoResourceService, 'byId').mockReturnValue(new WmsGeoResource(geoResourceId, 'label', 'http://some.url', 'layer', 'format'));

				const result = await bvvGeoResourceLegendProvider(geoResourceId);

				expect(configServiceSpy).toHaveBeenCalledWith('BACKEND_URL');
				expect(httpServiceSpy).toHaveBeenCalledWith(httpArg, expectedPayLoad, MediaType.JSON, { response: [responseInterceptor] });
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

			it('loads an external Legend for a provided geoResource id with credentials', async () => {
				const geoResourceId = 'http://some.url||layer';
				const httpResponseBody = JSON.stringify({ id: geoResourceId, entries: legendEntries });
				const baaCredentialServiceSpy = vi.spyOn(baaCredentialService, 'get').mockReturnValue({ username: 'username', password: 'password' });
				const backendUrl = 'https://backend.url/';
				const httpArg = backendUrl + 'georesource/legend/external/wms';
				const expectedPayLoad = '{"url":"http://some.url","layers":["layer"],"username":"username","password":"password"}';
				const configServiceSpy = vi.spyOn(configService, 'getValueAsPath').mockReturnValue(backendUrl);
				const httpServiceSpy = vi.spyOn(httpService, 'post').mockResolvedValue(new Response(httpResponseBody, { status: 200 }));
				vi.spyOn(geoResourceService, 'byId').mockReturnValue(
					new WmsGeoResource(geoResourceId, 'label', 'http://some.url', 'layer', 'format').setAuthenticationType(GeoResourceAuthenticationType.BAA)
				);

				const result = await bvvGeoResourceLegendProvider(geoResourceId);

				expect(configServiceSpy).toHaveBeenCalledWith('BACKEND_URL');
				expect(httpServiceSpy).toHaveBeenCalledWith(httpArg, expectedPayLoad, MediaType.JSON, { response: [] });
				expect(result.geoResourceId).toBe(geoResourceId);
				expect(result.entries).toHaveLength(2);
				expect(result).toBeInstanceOf(Legend);
				expect(result.entries[0][0]).toBeInstanceOf(LegendEntry);
				expect(result.entries[0][0].type).toBe(LegendEntryType.HTML);
				expect(result.entries[0][0].urlOrData).toBe('<div></div>');
				expect(result.entries[1][0]).toBeInstanceOf(LegendEntry);
				expect(result.entries[1][0].type).toBe(LegendEntryType.IMAGE_BASE64);
				expect(result.entries[1][0].urlOrData).toBe('BASE64 DATA');
				expect(baaCredentialServiceSpy).toHaveBeenCalledWith('http://some.url');
			});

			it('loads a Legend with empty entries', async () => {
				const geoResourceId = '914c9263-5312-453e-b3eb-5104db1bf788';
				const httpResponseBody = JSON.stringify({
					id: geoResourceId
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
				expect(result.entries).toEqual([[]]);
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
					`Legend for '${geoResourceId}' could not be loaded: Http-Status 500`
				);
				expect(configServiceSpy).toHaveBeenCalledWith('BACKEND_URL');
				expect(httpServiceSpy).toHaveBeenCalledWith(httpArg);
			});

			it('throws an error when a external BAA-authenticated GeoResource has missing credential', async () => {
				const geoResourceId = 'http://some.url||foo';
				const url = 'http://some.url';
				const wmsGeoResource = new WmsGeoResource(geoResourceId, 'label', url, 'layer', 'format').setAuthenticationType(
					GeoResourceAuthenticationType.BAA
				);
				vi.spyOn(geoResourceService, 'byId').mockReturnValue(wmsGeoResource);
				const baaCredentialServiceSpy = vi.spyOn(baaCredentialService, 'get').mockReturnValue(null);
				const backendUrl = 'https://backend.url/';
				vi.spyOn(configService, 'getValueAsPath').mockReturnValue(backendUrl);

				await expect(bvvGeoResourceLegendProvider(geoResourceId)).rejects.toThrow(
					`Legend for '${geoResourceId}' could not be loaded: No credential available`
				);
				expect(baaCredentialServiceSpy).toHaveBeenCalledWith('http://some.url');
			});
		});
	});
});
