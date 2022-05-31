import { $injector } from '../../../src/injection';
import { WmsGeoResource } from '../../../src/services/domain/geoResources';
import { bvvCapabilitiesProvider } from '../../../src/services/provider/wmsCapabilities.provider';

const Default_Capabilities_Result = {
	'title': 'The Title',
	'provider': 'The Provider',
	'serviceType': 'WMS_1_1_1',
	'formatsGetMap': ['image/png'],
	'formatsGetFeatureInfo': ['text/html'],
	'formatsGetLegendGraphic': ['image/png'],
	'onlineResourceGetMap': 'https://online.resource/GetMap?',
	'onlineResourceGetFeatureInfo': 'https://online.resource/GetFeatureInfo?',
	'onlineResourceGetLegendGraphic': 'https://online.resource/GetLegendGraphic?',
	'metadataUrlService': 'metadataUrlService',
	layers: [{
		'name': 'layer0',
		'title': 'Layer 0',
		'description': 'The description of layer 0',
		'minResolution': 8192.0,
		'maxResolution': 0.0,
		'legendUrl': 'https://legend.url/0',
		'metadataUrl': 'https://metadata.url/0',
		'referenceSystems': [
			{
				'code': 31467,
				'urn': false,
				'axisOrderLatLong': false,
				'value': 'EPSG:31467'
			},
			{
				'code': 3857,
				'urn': false,
				'axisOrderLatLong': false,
				'value': 'EPSG:3857'
			},
			{
				'code': 31468,
				'urn': false,
				'axisOrderLatLong': true,
				'value': 'EPSG:31468'
			}
		]
	}, {
		'name': 'layer1',
		'title': 'Layer 1',
		'description': 'The description of layer 1',
		'minResolution': 8192.0,
		'maxResolution': 0.0,
		'legendUrl': 'https://legend.url/1',
		'metadataUrl': 'https://metadata.url/1',
		'referenceSystems': [
			{
				'code': 31467,
				'urn': false,
				'axisOrderLatLong': false,
				'value': 'EPSG:31467'
			},
			{
				'code': 3857,
				'urn': false,
				'axisOrderLatLong': false,
				'value': 'EPSG:3857'
			},
			{
				'code': 31468,
				'urn': false,
				'axisOrderLatLong': true,
				'value': 'EPSG:31468'
			}
		]
	}, {
		'name': 'layer2',
		'title': 'Layer 2',
		'description': 'The description of layer 2',
		'minResolution': 8192.0,
		'maxResolution': 0.0,
		'legendUrl': 'https://legend.url/1',
		'metadataUrl': 'https://metadata.url/1',
		'referenceSystems': [
			{
				'code': 31467,
				'urn': false,
				'axisOrderLatLong': false,
				'value': 'EPSG:31467'
			},
			{
				'code': 31468,
				'urn': false,
				'axisOrderLatLong': true,
				'value': 'EPSG:31468'
			}
		]
	}] }
    ;

describe('bvvCapabilitiesProvider', () => {
	const configService = {
		getValueAsPath() { }
	};

	const httpService = {
		async post() { }
	};

	beforeAll(() => {
		$injector
			.registerSingleton('ConfigService', configService)
			.registerSingleton('HttpService', httpService);
	});

	it('use services to build a backend request', () => {
		const url = 'https://some.url/wms';

		const responseMock = { ok: true, status: 200, json: () => {
			return { layers: [] };
		} };
		const configSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue('BACKEND_URL/');
		const httpSpy = spyOn(httpService, 'post').withArgs('BACKEND_URL/wms/getCapabilities', { url: url, username: null, password: null }).and .resolveTo(responseMock);

		bvvCapabilitiesProvider(url);

		expect(configSpy).toHaveBeenCalled();
		expect(httpSpy).toHaveBeenCalled();
	});

	it('use services to build a backend request with credentials', () => {
		const url = 'https://some.url/wms';
		const username = 'foo';
		const password = 'bar';
		const responseMock = { ok: true, status: 200, json: () => {
			return { layers: [] };
		} };
		const configSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue('BACKEND_URL/');
		const httpSpy = spyOn(httpService, 'post').withArgs('BACKEND_URL/wms/getCapabilities', { url: url, username: username, password: password }).and .resolveTo(responseMock);

		bvvCapabilitiesProvider(url, { username: username, password: password });

		expect(configSpy).toHaveBeenCalled();
		expect(httpSpy).toHaveBeenCalled();
	});

	it('maps geoResources from layers', async () => {
		const url = 'https://some.url/wms';
		const username = 'foo';
		const password = 'bar';
		const responseMock = { ok: true, status: 200, json: () => {
			return Default_Capabilities_Result;
		} };
		spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue('BACKEND_URL/');
		spyOn(httpService, 'post').withArgs('BACKEND_URL/wms/getCapabilities', { url: url, username: username, password: password }).and .resolveTo(responseMock);

		const wmsGeoResources = await bvvCapabilitiesProvider(url, { username: username, password: password });

		expect(wmsGeoResources).toHaveSize(2);
		expect(wmsGeoResources).toEqual(jasmine.arrayWithExactContents([jasmine.any(WmsGeoResource), jasmine.any(WmsGeoResource)]));
	});

	it('recognize extraParams from layers', async () => {
		const url = 'https://some.url/wms';
		const username = 'foo';
		const password = 'bar';
		const responseMock = { ok: true, status: 200, json: () => {
			return { ...Default_Capabilities_Result, maxHeight: 2000, maxWidth: 2000 };
		} };
		spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue('BACKEND_URL/');
		spyOn(httpService, 'post').withArgs('BACKEND_URL/wms/getCapabilities', { url: url, username: username, password: password }).and .resolveTo(responseMock);

		const wmsGeoResources = await bvvCapabilitiesProvider(url, { username: username, password: password });

		expect(wmsGeoResources).toHaveSize(2);
		expect(wmsGeoResources).toEqual(jasmine.arrayWithExactContents([
			jasmine.objectContaining({ extraParams: { maxHeight: 2000, maxWidth: 2000 } }),
			jasmine.objectContaining({ extraParams: { maxHeight: 2000, maxWidth: 2000 } })
		]));
	});

	it('throws an error on failed request', async () => {
		const url = 'https://some.url/wms';
		const username = 'foo';
		const password = 'bar';
		const failedResponseMock = { ok: false, status: 420 };
		spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue('BACKEND_URL/');
		spyOn(httpService, 'post').withArgs('BACKEND_URL/wms/getCapabilities', { url: url, username: username, password: password }).and.resolveTo(failedResponseMock);

		await expectAsync(bvvCapabilitiesProvider(url, { username: username, password: password })).toBeRejectedWithError('GeoResource for \'https://some.url/wms\' could not be loaded: Http-Status 420');
	});

	it('returns empty list for 404-response', async () => {
		const url = 'https://some.url/wms';
		const username = 'foo';
		const password = 'bar';
		const emptyResponseMock = { ok: false, status: 404 };
		spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue('BACKEND_URL/');
		spyOn(httpService, 'post').withArgs('BACKEND_URL/wms/getCapabilities', { url: url, username: username, password: password }).and.resolveTo(emptyResponseMock);

		const wmsGeoResources = await bvvCapabilitiesProvider(url, { username: username, password: password });

		expect(wmsGeoResources).toEqual([]);
	});
});

