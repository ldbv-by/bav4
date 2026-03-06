import { loadBvvDefinitions } from '../../../src/services/provider/proj4.provider';
import { get } from 'ol/proj';

describe('Proj4 provider', () => {
	describe('BVV specific provider', () => {
		it('registers BVV specific definitions', () => {
			const srids = loadBvvDefinitions();

			expect(srids).toEqual([25832, 25833, 31468]);
			expect(get('EPSG:25832').getCode()).toBe('EPSG:25832');
			expect(get('EPSG:25833').getCode()).toBe('EPSG:25833');
			expect(get('EPSG:31468').getCode()).toBe('EPSG:31468');
		});
	});
});
