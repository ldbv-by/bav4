import { VectorSourceType } from '../../src/domain/geoResources';
import { Geometry } from '../../src/domain/geometry';

describe('Geometry', () => {
	it('provides a constructor and getters for properties', () => {
		const geometry = new Geometry('data', VectorSourceType.GEOJSON);

		expect(geometry.data).toBe('data');
		expect(geometry.sourceType).toBe(VectorSourceType.GEOJSON);
		expect(new Geometry('data').sourceType).toBeNull();
	});
});
