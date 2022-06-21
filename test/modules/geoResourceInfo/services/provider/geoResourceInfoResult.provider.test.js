import { $injector } from '../../../../../src/injection';
import { loadBvvGeoResourceInfo } from '../../../../../src/modules/geoResourceInfo/services/provider/geoResourceInfoResult.provider';
import { GeoResourceAuthenticationType } from '../../../../../src/services/domain/geoResources';
import { MediaType } from '../../../../../src/services/HttpService';

describe('GeoResourceInfo provider', () => {

	const configService = {
		getValueAsPath: () => { }
	};

	const httpService = {
		get: async () => { },
		post: async () => { }
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

	it('should load a internal GeoResourceInfo', async () => {

		const geoResourceId = '914c9263-5312-453e-b3eb-5104db1bf788';
		spyOn(geoResourceService, 'byId').withArgs(geoResourceId).and.returnValue({ id: geoResourceId });
		const backendUrl = 'https://backend.url/';
		const expectedArgs0 = backendUrl + 'georesource/info/' + geoResourceId;
		const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
		const httpServiceSpy = spyOn(httpService, 'get').withArgs(expectedArgs0).and.returnValue(Promise.resolve(
			new Response('<b>hello</b>', { status: 200 })
		));

		const result = await loadBvvGeoResourceInfo('914c9263-5312-453e-b3eb-5104db1bf788');

		expect(configServiceSpy).toHaveBeenCalled();
		expect(httpServiceSpy).toHaveBeenCalled();
		expect(result).toBeTruthy();
		expect(result.content.length > 0).toBeTrue();
		expect(result.content).toBe('<b>hello</b>');
	});

	it('should load a external GeoResourceInfo', async () => {

		const geoResourceId = '914c9263-5312-453e-b3eb-5104db1bf788';
		spyOn(geoResourceService, 'byId').withArgs(geoResourceId).and.returnValue({ id: geoResourceId, label: 'foo', url: 'http://some.url/', importedByUser: true });
		const backendUrl = 'https://backend.url/';
		const expectedArgs0 = backendUrl + 'georesource/info/external/wms';
		const expectedPayLoad = '{"url":"http://some.url/","layers":["foo"]}';
		const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
		const httpServiceSpy = spyOn(httpService, 'post').withArgs(expectedArgs0, expectedPayLoad, MediaType.JSON).and.returnValue(Promise.resolve(
			new Response('<b>hello</b>', { status: 200 })
		));

		const result = await loadBvvGeoResourceInfo('914c9263-5312-453e-b3eb-5104db1bf788');

		expect(configServiceSpy).toHaveBeenCalled();
		expect(httpServiceSpy).toHaveBeenCalled();
		expect(result).toBeTruthy();
		expect(result.content.length > 0).toBeTrue();
		expect(result.content).toBe('<b>hello</b>');
	});

	it('should load a external GeoResourceInfo from a BAA-authenticated georesource', async () => {

		const geoResourceId = '914c9263-5312-453e-b3eb-5104db1bf788';
		spyOn(geoResourceService, 'byId').withArgs(geoResourceId).and.returnValue({ id: geoResourceId, label: 'foo', url: 'http://some.url/', importedByUser: true, authenticationType: GeoResourceAuthenticationType.BAA });
		const baaCredentialServiceSpy = spyOn(baaCredentialService, 'get').withArgs('http://some.url/').and.returnValue({ username: 'username', password: 'password' });
		const backendUrl = 'https://backend.url/';
		const expectedArgs0 = backendUrl + 'georesource/info/external/wms';
		const expectedPayLoad = '{"url":"http://some.url/","layers":["foo"],"username":"username","password":"password"}';
		const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
		const httpServiceSpy = spyOn(httpService, 'post').withArgs(expectedArgs0, expectedPayLoad, MediaType.JSON).and.returnValue(Promise.resolve(
			new Response('<b>hello</b>', { status: 200 })
		));

		const result = await loadBvvGeoResourceInfo('914c9263-5312-453e-b3eb-5104db1bf788');

		expect(configServiceSpy).toHaveBeenCalled();
		expect(httpServiceSpy).toHaveBeenCalled();
		expect(baaCredentialServiceSpy).toHaveBeenCalled();
		expect(result).toBeTruthy();
		expect(result.content.length > 0).toBeTrue();
		expect(result.content).toBe('<b>hello</b>');
	});

	it('should return null when backend provides empty payload', async () => {

		const geoResourceId = '914c9263-5312-453e-b3eb-5104db1bf788';
		spyOn(geoResourceService, 'byId').withArgs(geoResourceId).and.returnValue({ id: geoResourceId });
		const backendUrl = 'https://backend.url/';
		const expectedArgs0 = backendUrl + 'georesource/info/' + geoResourceId;
		const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
		const httpServiceSpy = spyOn(httpService, 'get').withArgs(expectedArgs0).and.returnValue(Promise.resolve(
			new Response(JSON.stringify(), { status: 404 })
		));

		const result = await loadBvvGeoResourceInfo('914c9263-5312-453e-b3eb-5104db1bf788');

		expect(configServiceSpy).toHaveBeenCalled();
		expect(httpServiceSpy).toHaveBeenCalled();
		expect(result).toBe(null);
	});

	it('should reject when backend request cannot be fulfilled', async () => {

		const geoResourceId = '914c9263-5312-453e-b3eb-5104db1bf788';
		spyOn(geoResourceService, 'byId').withArgs(geoResourceId).and.returnValue({ id: geoResourceId });
		const backendUrl = 'https://backend.url/';
		const expectedArgs0 = backendUrl + 'georesource/info/' + geoResourceId;
		const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
		const httpServiceSpy = spyOn(httpService, 'get').withArgs(expectedArgs0).and.returnValue(Promise.resolve(
			new Response(null, { status: 500 })
		));

		const errorMessage = 'GeoResourceInfoResult for \'914c9263-5312-453e-b3eb-5104db1bf788\' could not be loaded';

		try {
			await loadBvvGeoResourceInfo('914c9263-5312-453e-b3eb-5104db1bf788');
			throw new Error('Promise should not be resolved');
		}
		catch (err) {
			expect(configServiceSpy).toHaveBeenCalled();
			expect(httpServiceSpy).toHaveBeenCalled();
			expect(err.message).toBe(errorMessage);
		}
	});
});
