/* eslint-disable no-undef */
import { BvvGeoResourceService } from '../../src/services/BvvGeoResourceService';

describe('BvvGeoResourceService', () => {

	describe('init', () => {

		it('initializes the service', async () => {
			const service = new BvvGeoResourceService();

			expect(service._georesources).toBeNull();

			await service.init();

			expect(service._georesources).not.toBeNull();
		});
	});

	describe('all', () => {

		it('provides all GeoResources', async () => {
			const service = new BvvGeoResourceService();

			const geoResources = await service.all();

			expect(geoResources.length).toBe(6);
		});
	});

	describe('byId', () => {

		it('provides a GeoResource by id', async () => {
			const service = new BvvGeoResourceService();
			await service.init();

			const geoResource = service.byId('dop80');

			expect(geoResource).toBeTruthy();
		});

		it('provides null if for an unknown id', async () => {
			const service = new BvvGeoResourceService();
			await service.init();

			const geoResource = service.byId('something');

			expect(geoResource).toBeNull();
		});

		it('throws an error when service hat not been initialized', async () => {
			const service = new BvvGeoResourceService();

			expect(() => {
				service.byId('unknownId');
			})
				.toThrowError(/GeoResourceService not yet initialized/);
		});
	});
});