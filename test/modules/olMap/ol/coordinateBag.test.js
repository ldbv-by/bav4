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
		const coordinateMunich = [11, 48];
		const coordinateParis = [2, 48];
		const coordinateBeijing = [116, 40];
		it('does NOT creates geometries for ZERO or ONE point', () => {
			const instance = new CoordinateBag();

			const emptyGeometry = instance.createGeometry();
			expect(emptyGeometry).toBeInstanceOf(MultiLineString);
			expect(emptyGeometry.getCoordinates()).toEqual([]);
			instance.add(coordinateMunich);

			const afterFirstPointGeometry = instance.createGeometry();
			expect(afterFirstPointGeometry).toBeInstanceOf(MultiLineString);
			expect(afterFirstPointGeometry.getCoordinates()).toEqual([]);
		});

		it('creates a geometry for 2 points', () => {
			const instance = new CoordinateBag();

			instance.add(coordinateMunich);
			instance.add(coordinateParis);

			const afterSecondPointGeometry = instance.createGeometry();
			const pointCount = afterSecondPointGeometry.getCoordinates()[0].length;
			const firstPoint = afterSecondPointGeometry.getCoordinates()[0][0];
			const secondPoint = afterSecondPointGeometry.getCoordinates()[0][1];

			expect(afterSecondPointGeometry).toBeInstanceOf(MultiLineString);
			expect(pointCount).toBe(2);
			expect(firstPoint).toEqual([1224514.3987260093, 6106854.83488507]);
			expect(secondPoint).toEqual([222638.98158654716, 6106854.83488507]);
		});

		it('creates a geometry for 3 points over date shift border left', () => {
			const instance = new CoordinateBag();

			instance.add(coordinateMunich);
			instance.add([coordinateBeijing[0] - 360, coordinateBeijing[1]]);
			instance.add([coordinateParis[0] - 360, coordinateBeijing[1]]);

			const geometry = instance.createGeometry();
			const pointCount = geometry.getCoordinates()[0].length;

			expect(geometry).toBeInstanceOf(MultiLineString);
			expect(pointCount).toBe(3);
		});
	});
});
