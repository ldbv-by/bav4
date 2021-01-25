/* eslint-disable no-undef */
import { BvvGeoResourceService } from '../../src/services/BvvGeoResourceService';

describe('BvvGeoResourceService', () => {

	describe('all', () => {

		it('provides all GeoResources', async () => {
			const service = new BvvGeoResourceService();

			const geoResources = await service.all();

			expect(geoResources.length).toBe(4);
		});
	});

	describe('byId', () => {

		it('provides a GeoResource by id', async () => {
			const service = new BvvGeoResourceService();

			const geoResource = await service.byId('dop80');

			expect(geoResource).toBeTruthy();
		});

		it('provides a rejected Promise when GeoResource is not found', (done) => {
			const service = new BvvGeoResourceService();

			service.byId('unknownId').then(() => {
				done(new Error('Promise should not be resolved'));
			}, (reason) => {
				expect(reason).toBe('No GeoResource for unknownId found');
				done();
			});
		});
	});
});