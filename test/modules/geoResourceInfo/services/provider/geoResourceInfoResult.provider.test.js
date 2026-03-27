import { $injector } from '@src/injection';
import {
	getGeoResourceInfoFromGeoResource,
	lastModifiedGeoResourceInfo,
	loadBvvGeoResourceInfo
} from '@src/modules/geoResourceInfo/services/provider/geoResourceInfoResult.provider';
import { GeoResourceAuthenticationType, OafGeoResource, VectorGeoResource, VectorSourceType, WmsGeoResource } from '@src/domain/geoResources';
import { MediaType } from '@src/domain/mediaTypes';
import { isTemplateResult } from '@src/utils/checks';
import { GeoResourceInfoResult } from '@src/modules/geoResourceInfo/services/GeoResourceInfoService';

describe('GeoResourceInfo provider', () => {
	const configService = {
		getValueAsPath: () => {}
	};

	const httpService = {
		get: async () => {},
		post: async () => {}
	};

	const responseInterceptor = [() => {}];
	const geoResourceService = {
		byId: () => {},
		getAuthResponseInterceptorForGeoResource: () => {}
	};

	const baaCredentialService = {
		get: () => {}
	};
	const securityService = {
		sanitizeHtml: (html) => html
	};

	beforeAll(() => {
		$injector
			.registerSingleton('ConfigService', configService)
			.registerSingleton('HttpService', httpService)
			.registerSingleton('GeoResourceService', geoResourceService)
			.registerSingleton('BaaCredentialService', baaCredentialService)
			.registerSingleton('SecurityService', securityService);
	});

	describe('getGeoResourceInfoFromGeoResource provider', () => {
		it('loads a GeoResourceInfoResult by `description` property of the GeoResource', async () => {
			const geoResource0 = new VectorGeoResource('geoResourceId0', 'label', VectorSourceType.EWKT);
			const geoResource1 = new VectorGeoResource('geoResourceId1', 'label', VectorSourceType.EWKT).setDescription('desc');
			const geoResourceServiceSpy = vi
				.spyOn(geoResourceService, 'byId')
				.mockReturnValueOnce(geoResource0)
				.mockReturnValueOnce(geoResource1)
				.mockReturnValueOnce(null);
			const securityServiceSpy = vi.spyOn(securityService, 'sanitizeHtml');

			await expect(getGeoResourceInfoFromGeoResource('geoResourceId')).resolves.toBe(null);
			await expect(getGeoResourceInfoFromGeoResource('geoResourceId')).resolves.toEqual(new GeoResourceInfoResult('desc'));
			await expect(getGeoResourceInfoFromGeoResource('geoResourceId')).resolves.toBe(null);
			expect(geoResourceServiceSpy).toHaveBeenCalledTimes(3);
			expect(geoResourceServiceSpy).toHaveBeenNthCalledWith(1, 'geoResourceId');
			expect(geoResourceServiceSpy).toHaveBeenNthCalledWith(2, 'geoResourceId');
			expect(geoResourceServiceSpy).toHaveBeenNthCalledWith(3, 'geoResourceId');
			expect(securityServiceSpy).toHaveBeenCalledTimes(1);
			expect(securityServiceSpy).toHaveBeenCalledWith('desc');
		});
	});

	describe('loadBvvGeoResourceInfo', () => {
		it('should load a GeoResourceInfo', async () => {
			const geoResourceId = '914c9263-5312-453e-b3eb-5104db1bf788';
			const geoResourceServiceSpy = vi
				.spyOn(geoResourceService, 'byId')
				.mockReturnValue(new WmsGeoResource(geoResourceId, 'label', 'url', 'layer', 'format'));
			const backendUrl = 'https://backend.url/';
			const expectedArgs0 = backendUrl + 'georesource/info/' + geoResourceId;
			const configServiceSpy = vi.spyOn(configService, 'getValueAsPath').mockReturnValue(backendUrl);
			const httpServiceSpy = vi.spyOn(httpService, 'get').mockResolvedValue(new Response('<b>hello</b>', { status: 200 }));

			const result = await loadBvvGeoResourceInfo('914c9263-5312-453e-b3eb-5104db1bf788');

			expect(configServiceSpy).toHaveBeenCalledWith('BACKEND_URL');
			expect(httpServiceSpy).toHaveBeenCalledWith(expectedArgs0);
			expect(geoResourceServiceSpy).toHaveBeenCalledWith(geoResourceId);
			expect(result).toBeTruthy();
			expect(result.content.length > 0).toBe(true);
			expect(result.content).toBe('<b>hello</b>');
		});

		it('should load a GeoResourceInfo for an imported WmsGeoResource', async () => {
			const geoResourceId = 'http://some.url||layer';
			const geoResourceServiceSpy = vi
				.spyOn(geoResourceService, 'byId')
				.mockReturnValue(new WmsGeoResource(geoResourceId, 'label', 'http://some.url', 'layer', 'format'));
			const backendUrl = 'https://backend.url/';
			const expectedArgs0 = backendUrl + 'georesource/info/external/wms';
			const expectedPayLoad = '{"url":"http://some.url","layers":["layer"]}';
			const configServiceSpy = vi.spyOn(configService, 'getValueAsPath').mockReturnValue(backendUrl);
			const authServiceSpy = vi.spyOn(geoResourceService, 'getAuthResponseInterceptorForGeoResource').mockReturnValue(responseInterceptor);
			const httpServiceSpy = vi.spyOn(httpService, 'post').mockResolvedValue(new Response('<b>hello</b>', { status: 200 }));

			const result = await loadBvvGeoResourceInfo(geoResourceId);

			expect(configServiceSpy).toHaveBeenCalledWith('BACKEND_URL');
			expect(httpServiceSpy).toHaveBeenCalledWith(expectedArgs0, expectedPayLoad, MediaType.JSON, { response: [responseInterceptor] });
			expect(geoResourceServiceSpy).toHaveBeenCalledWith(geoResourceId);
			expect(authServiceSpy).toHaveBeenCalledExactlyOnceWith(geoResourceId);
			expect(result).toBeTruthy();
			expect(result.content).toBe('<b>hello</b>');
		});

		it('should load a GeoResourceInfo for an imported OafGeoResource', async () => {
			const geoResourceId = 'http://some.url||collectionId';
			const geoResourceServiceSpy = vi
				.spyOn(geoResourceService, 'byId')
				.mockReturnValue(new OafGeoResource(geoResourceId, 'label', 'http://some.url', 'collectionId'));
			const backendUrl = 'https://backend.url/';
			const expectedArgs0 = backendUrl + 'georesource/info/external/oaf';
			const expectedPayLoad = '{"url":"http://some.url","collectionId":"collectionId"}';
			const configServiceSpy = vi.spyOn(configService, 'getValueAsPath').mockReturnValue(backendUrl);
			const authServiceSpy = vi.spyOn(geoResourceService, 'getAuthResponseInterceptorForGeoResource').mockReturnValue(responseInterceptor);
			const httpServiceSpy = vi.spyOn(httpService, 'post').mockResolvedValue(new Response('<b>hello</b>', { status: 200 }));

			const result = await loadBvvGeoResourceInfo(geoResourceId);

			expect(configServiceSpy).toHaveBeenCalledWith('BACKEND_URL');
			expect(httpServiceSpy).toHaveBeenCalledWith(expectedArgs0, expectedPayLoad, MediaType.JSON, { response: [responseInterceptor] });
			expect(geoResourceServiceSpy).toHaveBeenCalledWith(geoResourceId);
			expect(authServiceSpy).toHaveBeenCalledExactlyOnceWith(geoResourceId);
			expect(result).toBeTruthy();
			expect(result.content).toBe('<b>hello</b>');
		});

		it('should load a GeoResourceInfo for an imported and BAA-authenticated WmsGeoResource', async () => {
			const geoResourceId = 'http://some.url||foo';
			const oafGeoResource = new WmsGeoResource(geoResourceId, 'label', 'http://some.url', 'layer', 'format').setAuthenticationType(
				GeoResourceAuthenticationType.BAA
			);
			const geoResourceServiceSpy = vi.spyOn(geoResourceService, 'byId').mockReturnValue(oafGeoResource);
			const baaCredentialServiceSpy = vi.spyOn(baaCredentialService, 'get').mockReturnValue({ username: 'username', password: 'password' });
			const backendUrl = 'https://backend.url/';
			const expectedArgs0 = backendUrl + 'georesource/info/external/wms';
			const expectedPayLoad = '{"url":"http://some.url","layers":["layer"],"username":"username","password":"password"}';
			const configServiceSpy = vi.spyOn(configService, 'getValueAsPath').mockReturnValue(backendUrl);
			const httpServiceSpy = vi.spyOn(httpService, 'post').mockResolvedValue(new Response('<b>hello</b>', { status: 200 }));

			const result = await loadBvvGeoResourceInfo(geoResourceId);

			expect(configServiceSpy).toHaveBeenCalledWith('BACKEND_URL');
			expect(httpServiceSpy).toHaveBeenCalledWith(expectedArgs0, expectedPayLoad, MediaType.JSON, { response: [] });
			expect(geoResourceServiceSpy).toHaveBeenCalledWith(geoResourceId);
			expect(baaCredentialServiceSpy).toHaveBeenCalledWith('http://some.url');
			expect(result).toBeTruthy();
			expect(result.content).toBe('<b>hello</b>');
		});

		it('should load a GeoResourceInfo for an imported and BAA-authenticated OafGeoResource', async () => {
			const geoResourceId = 'http://some.url||collectionId';
			const oafGeoResource = new OafGeoResource(geoResourceId, 'label', 'http://some.url', 'collectionId').setAuthenticationType(
				GeoResourceAuthenticationType.BAA
			);
			const geoResourceServiceSpy = vi.spyOn(geoResourceService, 'byId').mockReturnValue(oafGeoResource);
			const baaCredentialServiceSpy = vi.spyOn(baaCredentialService, 'get').mockReturnValue({ username: 'username', password: 'password' });
			const backendUrl = 'https://backend.url/';
			const expectedArgs0 = backendUrl + 'georesource/info/external/oaf';
			const expectedPayLoad = '{"url":"http://some.url","collectionId":"collectionId","username":"username","password":"password"}';
			const configServiceSpy = vi.spyOn(configService, 'getValueAsPath').mockReturnValue(backendUrl);
			const httpServiceSpy = vi.spyOn(httpService, 'post').mockResolvedValue(new Response('<b>hello</b>', { status: 200 }));

			const result = await loadBvvGeoResourceInfo(geoResourceId);

			expect(configServiceSpy).toHaveBeenCalledWith('BACKEND_URL');
			expect(httpServiceSpy).toHaveBeenCalledWith(expectedArgs0, expectedPayLoad, MediaType.JSON, { response: [] });
			expect(geoResourceServiceSpy).toHaveBeenCalledWith(geoResourceId);
			expect(baaCredentialServiceSpy).toHaveBeenCalledWith('http://some.url');
			expect(result).toBeTruthy();
			expect(result.content).toBe('<b>hello</b>');
		});

		it('should throw an error a external BAA-authenticated GeoResource with missing credential', async () => {
			const geoResourceId = 'http://some.url||foo';
			const url = 'http://some.url';
			const wmsGeoResource = new WmsGeoResource(geoResourceId, 'label', url, 'layer', 'format').setAuthenticationType(
				GeoResourceAuthenticationType.BAA
			);
			vi.spyOn(geoResourceService, 'byId').mockReturnValue(wmsGeoResource);
			const baaCredentialServiceSpy = vi.spyOn(baaCredentialService, 'get').mockReturnValue(null);
			const backendUrl = 'https://backend.url/';
			vi.spyOn(configService, 'getValueAsPath').mockReturnValue(backendUrl);

			await expect(loadBvvGeoResourceInfo(geoResourceId)).rejects.toThrow(
				`GeoResourceInfoResult for '${geoResourceId}' could not be loaded: No credential available`
			);
			expect(baaCredentialServiceSpy).toHaveBeenCalledWith('http://some.url');
		});

		it('should return null when backend provides empty payload', async () => {
			const geoResourceId = '914c9263-5312-453e-b3eb-5104db1bf788';
			vi.spyOn(geoResourceService, 'byId').mockReturnValue(new WmsGeoResource(geoResourceId, 'label', 'url', 'layer', 'format'));
			const backendUrl = 'https://backend.url/';
			const expectedArgs0 = backendUrl + 'georesource/info/' + geoResourceId;
			const configServiceSpy = vi.spyOn(configService, 'getValueAsPath').mockReturnValue(backendUrl);
			const httpServiceSpy = vi.spyOn(httpService, 'get').mockResolvedValue(new Response(JSON.stringify(), { status: 204 }));

			const result = await loadBvvGeoResourceInfo('914c9263-5312-453e-b3eb-5104db1bf788');

			expect(configServiceSpy).toHaveBeenCalledWith('BACKEND_URL');
			expect(httpServiceSpy).toHaveBeenCalledWith(expectedArgs0);
			expect(result).toBe(null);
		});

		it('should reject when backend request cannot be fulfilled', async () => {
			const geoResourceId = '914c9263-5312-453e-b3eb-5104db1bf788';
			vi.spyOn(geoResourceService, 'byId')

				.mockReturnValue(new WmsGeoResource(geoResourceId, 'label', 'url', 'layer', 'format'));
			const backendUrl = 'https://backend.url/';
			const expectedArgs0 = backendUrl + 'georesource/info/' + geoResourceId;
			const configServiceSpy = vi.spyOn(configService, 'getValueAsPath').mockReturnValue(backendUrl);
			const httpServiceSpy = vi.spyOn(httpService, 'get').mockResolvedValue(new Response(null, { status: 500 }));

			const errorMessage = "GeoResourceInfoResult for '914c9263-5312-453e-b3eb-5104db1bf788' could not be loaded: Http-Status 500";

			await expect(loadBvvGeoResourceInfo('914c9263-5312-453e-b3eb-5104db1bf788')).rejects.toThrow(errorMessage);
			expect(configServiceSpy).toHaveBeenCalledWith('BACKEND_URL');
			expect(httpServiceSpy).toHaveBeenCalledWith(expectedArgs0);
		});

		it('should return NULL for an unsupported imported GeoResource', async () => {
			const geoResourceId = 'http://some.url||foo';
			const geoResourceServiceSpy = vi
				.spyOn(geoResourceService, 'byId')
				.mockReturnValue(new VectorGeoResource(geoResourceId, 'label', VectorSourceType.KML));

			const result = await loadBvvGeoResourceInfo(geoResourceId);

			expect(result).toBeNull();
			expect(geoResourceServiceSpy).toHaveBeenCalledWith(geoResourceId);
		});
	});

	describe('lastModifiedGeoResourceInfo provider', () => {
		const lastModified = 123456789;
		const geoResource = new VectorGeoResource('geoResourceId', 'label', VectorSourceType.DRAW).setLastModified(lastModified);
		const geoResourceWithoutLastModified = new VectorGeoResource('otherGeoResourceId', 'label', VectorSourceType.DRAW);

		it('loads a GeoResourceInfoResult with a LastModifiedItem component as content', async () => {
			const geoResourceServiceSpy = vi.spyOn(geoResourceService, 'byId').mockReturnValue(geoResource);

			const result = await lastModifiedGeoResourceInfo('geoResourceId');

			expect(geoResourceServiceSpy).toHaveBeenCalledWith('geoResourceId');
			expect(result).toBeTruthy();
			expect(isTemplateResult(result.content)).toBe(true);
			expect(result.content.strings[0]).toContain('ba-last-modified-item');
			expect(result.content.values.includes('geoResourceId')).toBe(true);
			expect(result.content.values.includes(lastModified)).toBe(true);
		});

		it('returns NULL for a GeoResource without lastModified timestamp', async () => {
			const geoResourceServiceSpy = vi.spyOn(geoResourceService, 'byId').mockReturnValue(geoResourceWithoutLastModified);

			const result = await lastModifiedGeoResourceInfo('otherGeoResourceId');

			expect(geoResourceServiceSpy).toHaveBeenCalledWith('otherGeoResourceId');
			expect(result).toBeNull();
		});

		it('returns NULL for a non-VectorGeoResource', async () => {
			const geoResourceId = 'geoResourceId';
			const wmsGeoResource = new WmsGeoResource(geoResourceId, 'label', 'url', 'layer', 'format');
			const geoResourceServiceSpy = vi.spyOn(geoResourceService, 'byId').mockReturnValue(wmsGeoResource);

			const result = await lastModifiedGeoResourceInfo(geoResourceId);
			expect(geoResourceServiceSpy).toHaveBeenCalledWith(geoResourceId);
			expect(result).toBeNull();
		});
	});
});
