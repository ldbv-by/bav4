import { fromLonLat } from 'ol/proj';
import { CoordinateBag } from '../../../../src/modules/olMap/ol/geodesic/coordinateBag';

import { MultiLineString } from 'ol/geom';

describe('CoordinateBag', () => {
	describe('constructor', () => {
		it('initializes an instance', () => {
			const instance = new CoordinateBag();

			expect(instance).toBeInstanceOf(CoordinateBag);
		});
	});

	describe('when points added', () => {
		it('creates geometries', () => {
			const coordinateMunich = fromLonLat([11.60221, 48.15629]);
			const coordinateParis = fromLonLat([2.192, 48.86656]);

			// const lineMunich_Paris = new LineString([fromLonLat([11.60221, 48.15629]), fromLonLat([2.192, 48.86656])]);
			// const polygon = new Polygon([[fromLonLat([9, 48]), fromLonLat([11, 48]), fromLonLat([10, 47])]]);

			const instance = new CoordinateBag();

			expect(instance.createGeometry()).toBeInstanceOf(MultiLineString);
			instance.add(coordinateMunich);

			expect(instance.createGeometry()).toBeInstanceOf(MultiLineString);

			instance.add(coordinateParis);

			expect(instance.createGeometry()).toBeInstanceOf(MultiLineString);
		});
	});
});
