import { UnavailableGeoResourceError } from '@src/domain/errors';
import { AggregateGeoResource, GeoResourceAuthenticationType, WmsGeoResource, XyzGeoResource } from '@src/domain/geoResources';
import { $injector } from '@src/injection';
import { CsLayerService } from '@src/modules/csGlobe/services/CsLayerService';
import { TestUtils } from '@test/test-utils';
import { expect } from 'vitest';

describe('CsLayerService', () => {
	const setup = () => {
		return new CsLayerService();
	};

	const geoResourceService = {
		byId: () => {}
	};
	const baaCredentialService = {
		get: () => {}
	};

	beforeEach(() => {
		TestUtils.setupStoreAndDi({});
		$injector.registerSingleton('GeoResourceService', geoResourceService).registerSingleton('BaaCredentialService', baaCredentialService);
	});

	describe('toCsLayer', () => {
		describe('GeoResource requires a BAA Authentication', () => {
			it('logs an error statement when credential is not available', () => {
				const url = 'https://some.url';
				const credential = null;
				const baaCredentialServiceSpy = vi.spyOn(baaCredentialService, 'get').mockReturnValue(credential);
				const instanceUnderTest = setup();
				const id = 'id';
				const geoResourceId = 'geoResourceId';
				const wmsGeoResource = new WmsGeoResource(geoResourceId, 'label', url, 'layer', 'image/png').setAuthenticationType(
					GeoResourceAuthenticationType.BAA
				);
				expect(() => {
					instanceUnderTest.toCsLayer(id, wmsGeoResource);
				}).toThrow(
					new UnavailableGeoResourceError(
						`No credential available for GeoResource with id '${wmsGeoResource.id}' and url '${wmsGeoResource.url}'`,
						geoResourceId
					)
				);
				expect(baaCredentialServiceSpy).toHaveBeenCalledWith(url);
			});
		});

		it('converts a WmsGeoResource to an imageryLayer proxy', () => {
			const instanceUnderTest = setup();
			const createWebMapServiceProviderSpy = vi.spyOn(instanceUnderTest, '_createWebMapServiceImageryProvider');
			const id = 'id';
			const geoResourceId = 'geoResourceId';
			const wmsGeoResource = new WmsGeoResource(geoResourceId, 'label', 'https://some.url', 'layer', 'image/png');
			const wmsImageryLayer = instanceUnderTest.toCsLayer(id, wmsGeoResource);
			const wmsProvider = wmsImageryLayer.imageryProvider;

			expect(wmsImageryLayer.id).toBe(id);
			expect(wmsImageryLayer.geoResourceId).toBe(geoResourceId);
			expect(wmsProvider.url).toBe('https://some.url/'); // ending slash is added automatically by cesium.
			expect(wmsProvider.minimumLevel).toBe(0);
			expect(wmsProvider.maximumLevel).toBeUndefined();
			expect(wmsProvider.layers).toBe('layer');
			expect(createWebMapServiceProviderSpy).toHaveBeenCalledExactlyOnceWith({
				url: wmsGeoResource.url,
				layers: wmsGeoResource.layers,
				parameters: {
					format: wmsGeoResource.format,
					version: '1.1.1',
					...wmsGeoResource.extraParams
				}
			});
		});

		it('converts a XyzGeoResource to an imageryLayer proxy', () => {
			const instanceUnderTest = setup();
			const createUrlTemplateProviderSpy = vi.spyOn(instanceUnderTest, '_createUrlTemplateImageryProvider');
			const id = 'id';
			const geoResourceId = 'geoResourceId';
			const xyzGeoResource = new XyzGeoResource(geoResourceId, 'label', 'https://some/layer/{z}/{x}/{y}');
			const xyzImageryLayer = instanceUnderTest.toCsLayer(id, xyzGeoResource);
			const xyzImageryProvider = xyzImageryLayer.imageryProvider;

			expect(xyzImageryLayer.id).toBe(id);
			expect(xyzImageryLayer.geoResourceId).toBe(geoResourceId);
			expect(xyzImageryProvider.minimumLevel).toBe(0);
			expect(xyzImageryProvider.maximumLevel).toBe(undefined);
			expect(createUrlTemplateProviderSpy).toHaveBeenCalledExactlyOnceWith({
				url: 'https://{s}/layer/{z}/{x}/{y}',
				hasAlphaChannel: true,
				subdomains: ['some']
			});
		});

		it('converts a XyzGeoResource to an imageryLayer proxy containing an array of urls', () => {
			const instanceUnderTest = setup();
			const createUrlTemplateProviderSpy = vi.spyOn(instanceUnderTest, '_createUrlTemplateImageryProvider');
			const id = 'id';
			const geoResourceId = 'geoResourceId';
			const xyzGeoResource = new XyzGeoResource(geoResourceId, 'label', ['https://some1/layer/{z}/{x}/{y}', 'https://some2/layer/{z}/{x}/{y}']);
			const xyzImageryLayer = instanceUnderTest.toCsLayer(id, xyzGeoResource);
			const xyzImageryProvider = xyzImageryLayer.imageryProvider;

			expect(xyzImageryLayer.id).toBe(id);
			expect(xyzImageryLayer.geoResourceId).toBe(geoResourceId);
			expect(xyzImageryProvider.minimumLevel).toBe(0);
			expect(xyzImageryProvider.maximumLevel).toBe(undefined);
			expect(createUrlTemplateProviderSpy).toHaveBeenCalledExactlyOnceWith({
				url: 'https://{s}/layer/{z}/{x}/{y}',
				hasAlphaChannel: true,
				subdomains: ['some1', 'some2']
			});
		});

		it('converts a AggregateGeoResource to an imageryLayer array', () => {
			const instanceUnderTest = setup();
			const id = 'id';
			const xyzGeoResource0 = new XyzGeoResource('geoResourceId1', 'label', 'https://some{1-2}/layer/{z}/{x}/{y}');
			const xyzGeoResource1 = new XyzGeoResource('geoResourceId1', 'label', 'https://some{1-2}/layer/{z}/{x}/{y}');
			vi.spyOn(geoResourceService, 'byId').mockImplementation((id) => {
				switch (id) {
					case xyzGeoResource0.id:
						return xyzGeoResource0;
					case xyzGeoResource1.id:
						return xyzGeoResource1;
				}
			});

			const aggregateGeoResource = new AggregateGeoResource('geoResourceId0', 'label', [xyzGeoResource0.id, xyzGeoResource1.id]);
			const imageryLayers = instanceUnderTest.toCsLayer(id, aggregateGeoResource);

			expect(imageryLayers).toHaveLength(2);
			expect(imageryLayers[0].id).toBe(id);
			expect(imageryLayers[0].geoResourceId).toBe(xyzGeoResource0.id);
			expect(imageryLayers[1].id).toBe(id);
			expect(imageryLayers[1].geoResourceId).toBe(xyzGeoResource1.id);
		});

		it('throws an error when GeoResource type is not supported', () => {
			const instanceUnderTest = setup();
			const id = 'id';
			expect(() => {
				instanceUnderTest.toCsLayer(id, {
					getType() {
						return Symbol.for('Unknown');
					}
				});
			}).toThrow('GeoResource type "Unknown" currently not supported');
		});
	});
});
