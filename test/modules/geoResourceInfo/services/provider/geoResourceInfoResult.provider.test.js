import { $injector } from '../../../../../src/injection';
import { loadBvvGeoResourceInfo } from '../../../../../src/modules/geoResourceInfo/services/provider/geoResourceInfoResult.provider';
import { GeoResourceAuthenticationType, VectorGeoResource, VectorSourceType, WmsGeoResource } from '../../../../../src/domain/geoResources';
import { MediaType } from '../../../../../src/domain/mediaTypes';

describe('GeoResourceInfo provider', () => {
	const configService = {
		getValueAsPath: () => {}
	};

	const httpService = {
		get: async () => {},
		post: async () => {}
	};

	const geoResourceService = {
		byId: () => {}
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

	it('should load a GeoResourceInfo', async () => {
		const geoResourceId = '914c9263-5312-453e-b3eb-5104db1bf788';
		spyOn(geoResourceService, 'byId')
			.withArgs(geoResourceId)
			.and.returnValue(new WmsGeoResource(geoResourceId, 'label', 'url', 'layer', 'format'));
		const backendUrl = 'https://backend.url/';
		const expectedArgs0 = backendUrl + 'georesource/info/' + geoResourceId;
		const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
		const httpServiceSpy = spyOn(httpService, 'get')
			.withArgs(expectedArgs0, { timeout: 5000 })
			.and.returnValue(Promise.resolve(new Response('<b>hello</b>', { status: 200 })));

		const result = await loadBvvGeoResourceInfo('914c9263-5312-453e-b3eb-5104db1bf788');

		expect(configServiceSpy).toHaveBeenCalled();
		expect(httpServiceSpy).toHaveBeenCalled();
		expect(result).toBeTruthy();
		expect(result.content.length > 0).toBeTrue();
		expect(result.content).toBe('<b>hello</b>');
	});

	it('should load a GeoResourceInfo for an imported WmsGeoResource', async () => {
		const geoResourceId = 'http://some.url||foo';
		spyOn(geoResourceService, 'byId')
			.withArgs(geoResourceId)
			.and.returnValue(new WmsGeoResource(geoResourceId, 'label', 'http://some.url', 'layer', 'format'));
		const backendUrl = 'https://backend.url/';
		const expectedArgs0 = backendUrl + 'georesource/info/external/wms';
		const expectedPayLoad = '{"url":"http://some.url","layers":["layer"]}';
		const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
		const httpServiceSpy = spyOn(httpService, 'post')
			.withArgs(expectedArgs0, expectedPayLoad, MediaType.JSON, { timeout: 5000 })
			.and.returnValue(Promise.resolve(new Response('<b>hello</b>', { status: 200 })));

		const result = await loadBvvGeoResourceInfo(geoResourceId);

		expect(configServiceSpy).toHaveBeenCalled();
		expect(httpServiceSpy).toHaveBeenCalled();
		expect(result).toBeTruthy();
		expect(result.content).toBe('<b>hello</b>');
	});

	it('should load a GeoResourceInfo for an imported and BAA-authenticated WmsGeoResource', async () => {
		const geoResourceId = 'http://some.url||foo';
		const wmsGeoResource = new WmsGeoResource(geoResourceId, 'label', 'http://some.url', 'layer', 'format').setAuthenticationType(
			GeoResourceAuthenticationType.BAA
		);
		spyOn(geoResourceService, 'byId').withArgs(geoResourceId).and.returnValue(wmsGeoResource);
		const baaCredentialServiceSpy = spyOn(baaCredentialService, 'get')
			.withArgs('http://some.url')
			.and.returnValue({ username: 'username', password: 'password' });
		const backendUrl = 'https://backend.url/';
		const expectedArgs0 = backendUrl + 'georesource/info/external/wms';
		const expectedPayLoad = '{"url":"http://some.url","layers":["layer"],"username":"username","password":"password"}';
		const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
		const httpServiceSpy = spyOn(httpService, 'post')
			.withArgs(expectedArgs0, expectedPayLoad, MediaType.JSON, { timeout: 5000 })
			.and.returnValue(Promise.resolve(new Response('<b>hello</b>', { status: 200 })));

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
			`No credential available for GeoResource with id '${geoResourceId}' and url '${url}'`
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
			.withArgs(expectedArgs0, { timeout: 5000 })
			.and.returnValue(Promise.resolve(new Response(JSON.stringify(), { status: 204 })));

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
			.withArgs(expectedArgs0, { timeout: 5000 })
			.and.returnValue(Promise.resolve(new Response(null, { status: 500 })));

		const errorMessage = "GeoResourceInfoResult for '914c9263-5312-453e-b3eb-5104db1bf788' could not be loaded";

		try {
			await loadBvvGeoResourceInfo('914c9263-5312-453e-b3eb-5104db1bf788');
			throw new Error('Promise should not be resolved');
		} catch (err) {
			expect(configServiceSpy).toHaveBeenCalled();
			expect(httpServiceSpy).toHaveBeenCalled();
			expect(err.message).toBe(errorMessage);
		}
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
