import { $injector } from '../../../../../src/injection';
import {
	lastModifiedGeoResourceInfo,
	loadBvvGeoResourceInfo
} from '../../../../../src/modules/geoResourceInfo/services/provider/geoResourceInfoResult.provider';
import {
	GeoResourceAuthenticationType,
	OafGeoResource,
	VectorGeoResource,
	VectorSourceType,
	WmsGeoResource
} from '../../../../../src/domain/geoResources';
import { MediaType } from '../../../../../src/domain/mediaTypes';
import { isTemplateResult } from 'lit-html/directive-helpers.js';

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

	beforeAll(() => {
		$injector
			.registerSingleton('ConfigService', configService)
			.registerSingleton('HttpService', httpService)
			.registerSingleton('GeoResourceService', geoResourceService)
			.registerSingleton('BaaCredentialService', baaCredentialService);
	});

	describe('loadBvvGeoResourceInfo', () => {
		it('should load a GeoResourceInfo', async () => {
			const geoResourceId = '914c9263-5312-453e-b3eb-5104db1bf788';
			spyOn(geoResourceService, 'byId')
				.withArgs(geoResourceId)
				.and.returnValue(new WmsGeoResource(geoResourceId, 'label', 'url', 'layer', 'format'));
			const backendUrl = 'https://backend.url/';
			const expectedArgs0 = backendUrl + 'georesource/info/' + geoResourceId;
			const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
			const httpServiceSpy = spyOn(httpService, 'get')
				.withArgs(expectedArgs0)
				.and.resolveTo(new Response('<b>hello</b>', { status: 200 }));

			const result = await loadBvvGeoResourceInfo('914c9263-5312-453e-b3eb-5104db1bf788');

			expect(configServiceSpy).toHaveBeenCalled();
			expect(httpServiceSpy).toHaveBeenCalled();
			expect(result).toBeTruthy();
			expect(result.content.length > 0).toBeTrue();
			expect(result.content).toBe('<b>hello</b>');
		});

		it('should load a GeoResourceInfo for an imported WmsGeoResource', async () => {
			const geoResourceId = 'http://some.url||layer';
			spyOn(geoResourceService, 'byId')
				.withArgs(geoResourceId)
				.and.returnValue(new WmsGeoResource(geoResourceId, 'label', 'http://some.url', 'layer', 'format'));
			const backendUrl = 'https://backend.url/';
			const expectedArgs0 = backendUrl + 'georesource/info/external/wms';
			const expectedPayLoad = '{"url":"http://some.url","layers":["layer"]}';
			const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
			const authServiceSpy = spyOn(geoResourceService, 'getAuthResponseInterceptorForGeoResource').and.returnValue(responseInterceptor);
			const httpServiceSpy = spyOn(httpService, 'post')
				.withArgs(expectedArgs0, expectedPayLoad, MediaType.JSON, { response: [responseInterceptor] })
				.and.returnValue(Promise.resolve(new Response('<b>hello</b>', { status: 200 })));

			const result = await loadBvvGeoResourceInfo(geoResourceId);

			expect(configServiceSpy).toHaveBeenCalled();
			expect(httpServiceSpy).toHaveBeenCalled();
			expect(authServiceSpy).toHaveBeenCalledOnceWith(geoResourceId);
			expect(result).toBeTruthy();
			expect(result.content).toBe('<b>hello</b>');
		});

		it('should load a GeoResourceInfo for an imported OafGeoResource', async () => {
			const geoResourceId = 'http://some.url||collectionId';
			spyOn(geoResourceService, 'byId')
				.withArgs(geoResourceId)
				.and.returnValue(new OafGeoResource(geoResourceId, 'label', 'http://some.url', 'collectionId'));
			const backendUrl = 'https://backend.url/';
			const expectedArgs0 = backendUrl + 'georesource/info/external/oaf';
			const expectedPayLoad = '{"url":"http://some.url","collectionId":"collectionId"}';
			const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
			const authServiceSpy = spyOn(geoResourceService, 'getAuthResponseInterceptorForGeoResource').and.returnValue(responseInterceptor);
			const httpServiceSpy = spyOn(httpService, 'post')
				.withArgs(expectedArgs0, expectedPayLoad, MediaType.JSON, { response: [responseInterceptor] })
				.and.resolveTo(new Response('<b>hello</b>', { status: 200 }));

			const result = await loadBvvGeoResourceInfo(geoResourceId);

			expect(configServiceSpy).toHaveBeenCalled();
			expect(httpServiceSpy).toHaveBeenCalled();
			expect(authServiceSpy).toHaveBeenCalledOnceWith(geoResourceId);
			expect(result).toBeTruthy();
			expect(result.content).toBe('<b>hello</b>');
		});

		it('should load a GeoResourceInfo for an imported and BAA-authenticated WmsGeoResource', async () => {
			const geoResourceId = 'http://some.url||foo';
			const oafGeoResource = new WmsGeoResource(geoResourceId, 'label', 'http://some.url', 'layer', 'format').setAuthenticationType(
				GeoResourceAuthenticationType.BAA
			);
			spyOn(geoResourceService, 'byId').withArgs(geoResourceId).and.returnValue(oafGeoResource);
			const baaCredentialServiceSpy = spyOn(baaCredentialService, 'get')
				.withArgs('http://some.url')
				.and.returnValue({ username: 'username', password: 'password' });
			const backendUrl = 'https://backend.url/';
			const expectedArgs0 = backendUrl + 'georesource/info/external/wms';
			const expectedPayLoad = '{"url":"http://some.url","layers":["layer"],"username":"username","password":"password"}';
			const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
			const httpServiceSpy = spyOn(httpService, 'post')
				.withArgs(expectedArgs0, expectedPayLoad, MediaType.JSON, { response: [] })
				.and.resolveTo(new Response('<b>hello</b>', { status: 200 }));

			const result = await loadBvvGeoResourceInfo(geoResourceId);

			expect(configServiceSpy).toHaveBeenCalled();
			expect(httpServiceSpy).toHaveBeenCalled();
			expect(baaCredentialServiceSpy).toHaveBeenCalled();
			expect(result).toBeTruthy();
			expect(result.content).toBe('<b>hello</b>');
		});

		it('should load a GeoResourceInfo for an imported and BAA-authenticated OafGeoResource', async () => {
			const geoResourceId = 'http://some.url||collectionId';
			const oafGeoResource = new OafGeoResource(geoResourceId, 'label', 'http://some.url', 'collectionId').setAuthenticationType(
				GeoResourceAuthenticationType.BAA
			);
			spyOn(geoResourceService, 'byId').withArgs(geoResourceId).and.returnValue(oafGeoResource);
			const baaCredentialServiceSpy = spyOn(baaCredentialService, 'get')
				.withArgs('http://some.url')
				.and.returnValue({ username: 'username', password: 'password' });
			const backendUrl = 'https://backend.url/';
			const expectedArgs0 = backendUrl + 'georesource/info/external/oaf';
			const expectedPayLoad = '{"url":"http://some.url","collectionId":"collectionId","username":"username","password":"password"}';
			const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
			const httpServiceSpy = spyOn(httpService, 'post')
				.withArgs(expectedArgs0, expectedPayLoad, MediaType.JSON, { response: [] })
				.and.resolveTo(new Response('<b>hello</b>', { status: 200 }));

			const result = await loadBvvGeoResourceInfo(geoResourceId);

			expect(configServiceSpy).toHaveBeenCalled();
			expect(httpServiceSpy).toHaveBeenCalled();
			expect(baaCredentialServiceSpy).toHaveBeenCalled();
			expect(result).toBeTruthy();
			expect(result.content).toBe('<b>hello</b>');
		});

		it('should throw an error a external BAA-authenticated GeoResource with missing credential', async () => {
			const geoResourceId = 'http://some.url||foo';
			const url = 'http://some.url';
			const wmsGeoResource = new WmsGeoResource(geoResourceId, 'label', url, 'layer', 'format').setAuthenticationType(
				GeoResourceAuthenticationType.BAA
			);
			spyOn(geoResourceService, 'byId').withArgs(geoResourceId).and.returnValue(wmsGeoResource);
			spyOn(baaCredentialService, 'get').withArgs('http://some.url').and.returnValue(null);
			const backendUrl = 'https://backend.url/';
			spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);

			await expectAsync(loadBvvGeoResourceInfo(geoResourceId)).toBeRejectedWithError(
				`GeoResourceInfoResult for '${geoResourceId}' could not be loaded: No credential available`
			);
		});

		it('should return null when backend provides empty payload', async () => {
			const geoResourceId = '914c9263-5312-453e-b3eb-5104db1bf788';
			spyOn(geoResourceService, 'byId')
				.withArgs(geoResourceId)
				.and.returnValue(new WmsGeoResource(geoResourceId, 'label', 'url', 'layer', 'format'));
			const backendUrl = 'https://backend.url/';
			const expectedArgs0 = backendUrl + 'georesource/info/' + geoResourceId;
			const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
			const httpServiceSpy = spyOn(httpService, 'get')
				.withArgs(expectedArgs0)
				.and.resolveTo(new Response(JSON.stringify(), { status: 204 }));

			const result = await loadBvvGeoResourceInfo('914c9263-5312-453e-b3eb-5104db1bf788');

			expect(configServiceSpy).toHaveBeenCalled();
			expect(httpServiceSpy).toHaveBeenCalled();
			expect(result).toBe(null);
		});

		it('should reject when backend request cannot be fulfilled', async () => {
			const geoResourceId = '914c9263-5312-453e-b3eb-5104db1bf788';
			spyOn(geoResourceService, 'byId')
				.withArgs(geoResourceId)
				.and.returnValue(new WmsGeoResource(geoResourceId, 'label', 'url', 'layer', 'format'));
			const backendUrl = 'https://backend.url/';
			const expectedArgs0 = backendUrl + 'georesource/info/' + geoResourceId;
			const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
			const httpServiceSpy = spyOn(httpService, 'get')
				.withArgs(expectedArgs0)
				.and.resolveTo(new Response(null, { status: 500 }));

			const errorMessage = "GeoResourceInfoResult for '914c9263-5312-453e-b3eb-5104db1bf788' could not be loaded: Http-Status 500";

			await expectAsync(loadBvvGeoResourceInfo('914c9263-5312-453e-b3eb-5104db1bf788')).toBeRejectedWithError(errorMessage);
			expect(configServiceSpy).toHaveBeenCalled();
			expect(httpServiceSpy).toHaveBeenCalled();
		});

		it('should return NULL for an unsupported imported GeoResource', async () => {
			const geoResourceId = 'http://some.url||foo';
			spyOn(geoResourceService, 'byId')
				.withArgs(geoResourceId)
				.and.returnValue(new VectorGeoResource(geoResourceId, 'label', VectorSourceType.KML));

			const result = await loadBvvGeoResourceInfo(geoResourceId);

			expect(result).toBeNull();
		});
	});

	describe('lastModifiedGeoResourceInfo provider', () => {
		const lastModified = 123456789;
		const geoResource = new VectorGeoResource('geoResourceId', 'label', VectorSourceType.DRAW).setLastModified(lastModified);
		const geoResourceWithoutLastModified = new VectorGeoResource('otherGeoResourceId', 'label', VectorSourceType.DRAW);

		it('loads a GeoResourceInfoResult with a LastModifiedItem component as content', async () => {
			const geoResourceServiceSpy = spyOn(geoResourceService, 'byId').withArgs('geoResourceId').and.returnValue(geoResource);

			const result = await lastModifiedGeoResourceInfo('geoResourceId');

			expect(geoResourceServiceSpy).toHaveBeenCalled();
			expect(result).toBeTruthy();
			expect(isTemplateResult(result.content)).toBeTrue();
			expect(result.content.strings[0]).toContain('ba-last-modified-item');
			expect(result.content.values.includes('geoResourceId')).toBeTrue();
			expect(result.content.values.includes(lastModified)).toBeTrue();
		});

		it('returns NULL for a GeoResource without lastModified timestamp', async () => {
			const geoResourceServiceSpy = spyOn(geoResourceService, 'byId').withArgs('otherGeoResourceId').and.returnValue(geoResourceWithoutLastModified);

			const result = await lastModifiedGeoResourceInfo('otherGeoResourceId');

			expect(geoResourceServiceSpy).toHaveBeenCalled();
			expect(result).toBeNull();
		});

		it('returns NULL for a non-VectorGeoResource', async () => {
			const geoResourceId = 'geoResourceId';
			const wmsGeoResource = new WmsGeoResource(geoResourceId, 'label', 'url', 'layer', 'format');
			const geoResourceServiceSpy = spyOn(geoResourceService, 'byId').withArgs(geoResourceId).and.returnValue(wmsGeoResource);

			const result = await lastModifiedGeoResourceInfo(geoResourceId);
			expect(geoResourceServiceSpy).toHaveBeenCalled();
			expect(result).toBeNull();
		});
	});
});
