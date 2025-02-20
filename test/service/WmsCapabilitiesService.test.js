import { WmsCapabilitiesService } from '../../src/services/WmsCapabilitiesService';
import { $injector } from '../../src/injection';
import { bvvCapabilitiesProvider } from '../../src/services/provider/wmsCapabilities.provider';

describe('WmsCapabilitiesService', () => {
	const geoResourceServiceMock = {
		byId: () => null
	};

	beforeAll(() => {
		$injector.registerSingleton('GeoResourceService', geoResourceServiceMock);
	});

	describe('init', () => {
		it('initializes the service with custom provider', () => {
			const customProvider = async () => {};
			const instanceUnderTest = new WmsCapabilitiesService(customProvider);
			expect(instanceUnderTest._wmsCapabilitiesProvider).toBeDefined();
			expect(instanceUnderTest._wmsCapabilitiesProvider).toEqual(customProvider);
		});

		it('initializes the service with default provider', () => {
			const instanceUnderTest = new WmsCapabilitiesService();
			expect(instanceUnderTest._wmsCapabilitiesProvider).toEqual(bvvCapabilitiesProvider);
		});
	});

	describe('extractWmsLayerItems method', () => {
		it('return empty list when unknown goeresource id', async () => {
			const instanceUnderTest = new WmsCapabilitiesService();

			const byIdSpy = spyOn(geoResourceServiceMock, 'byId').withArgs('id1').and.returnValue(null);

			expect(await instanceUnderTest.getWmsLayers('id1')).toEqual([]);
			expect(byIdSpy).toHaveBeenCalled();
		});

		it('return empty list when goeresource has no _layers element', async () => {
			const instanceUnderTest = new WmsCapabilitiesService();

			const byIdSpy = spyOn(geoResourceServiceMock, 'byId').withArgs('id1').and.returnValue({ id: 'id1' });

			expect(await instanceUnderTest.getWmsLayers('id1')).toEqual([]);
			expect(byIdSpy).toHaveBeenCalled();
		});

		it('calls capabilites provider to get the wms capabilities', async () => {
			const instanceUnderTest = new WmsCapabilitiesService();

			spyOn(geoResourceServiceMock, 'byId').withArgs('id1').and.returnValue({
				id: 'id1',
				_url: 'url42',
				_layers: 'l1,l2'
			});

			let actualUrl = null;
			instanceUnderTest._wmsCapabilitiesProvider = async (url) => {
				actualUrl = url;

				return [];
			};

			await instanceUnderTest.getWmsLayers('id1');

			expect(actualUrl).toEqual('url42');
		});

		it('maps wms resources to  WmsCapabilitiesServiceitems', async () => {
			const instanceUnderTest = new WmsCapabilitiesService();

			spyOn(geoResourceServiceMock, 'byId').withArgs('id1').and.returnValue({
				_id: 'id1',
				_url: 'url42',
				_layers: 'l1,l2'
			});

			instanceUnderTest._wmsCapabilitiesProvider = async () => [
				{ _label: 'name1', _layers: 'l1', _extraParams: { legendUrl: 'url1', minResolution: 0, maxResolution: 1 } },
				{ _label: 'name2', _layers: 'l2', _extraParams: { legendUrl: 'url2', minResolution: 0, maxResolution: 1 } },
				{ _label: 'name3', _layers: 'l3', _extraParams: { legendUrl: 'url3', minResolution: 0, maxResolution: 1 } }
			];

			const actual = await instanceUnderTest.getWmsLayers('id1');

			expect(actual).toEqual([
				{ title: 'name1', legendUrl: 'url1', minResolution: 0, maxResolution: 1 },
				{ title: 'name2', legendUrl: 'url2', minResolution: 0, maxResolution: 1 }
			]);
		});

		it('implements memoization for capablitiesProvider', async () => {
			const instanceUnderTest = new WmsCapabilitiesService();

			spyOn(geoResourceServiceMock, 'byId')
				.withArgs('id1')
				.and.returnValue({
					_id: 'id1',
					_url: 'url42',
					_layers: 'l1'
				})
				.withArgs('id2')
				.and.returnValue({
					_id: 'id2',
					_url: 'url42',
					_layers: 'l2'
				});

			let providerCalls = 0;
			instanceUnderTest._wmsCapabilitiesProvider = async () => {
				providerCalls++;

				return [
					{ _label: 'name1', _layers: 'l1', _extraParams: { legendUrl: 'url1', minResolution: 0, maxResolution: 1 } },
					{ _label: 'name2', _layers: 'l2', _extraParams: { legendUrl: 'url2', minResolution: 0, maxResolution: 1 } }
				];
			};

			const resultRunOne = await instanceUnderTest.getWmsLayers('id1');
			const resultRunTwo = await instanceUnderTest.getWmsLayers('id2');

			expect(resultRunOne).toEqual([{ title: 'name1', legendUrl: 'url1', minResolution: 0, maxResolution: 1 }]);
			expect(resultRunTwo).toEqual([{ title: 'name2', legendUrl: 'url2', minResolution: 0, maxResolution: 1 }]);

			expect(providerCalls).toEqual(1);
		});

		it('do not call provider more than once for an unavaible url', async () => {
			const instanceUnderTest = new WmsCapabilitiesService();

			spyOn(geoResourceServiceMock, 'byId').withArgs('id1').and.returnValue({
				_id: 'id1',
				_url: 'url1',
				_layers: 'l'
			});

			let providerCalls = 0;
			instanceUnderTest._wmsCapabilitiesProvider = async () => {
				providerCalls++;
				throw 'url is not available';
			};

			const result1 = await instanceUnderTest.getWmsLayers('id1');
			const result2 = await instanceUnderTest.getWmsLayers('id1');

			expect(result1).toEqual([]);
			expect(result1).toEqual(result2);

			expect(providerCalls).toEqual(1);
		});
	});
});
