import { CoordinateBag } from '../../../../src/modules/olMap/ol/geodesic/coordinateBag';

describe('CoordinateBag', () => {
	describe('constructor', () => {
		it('initializes an instance', () => {
			const instance = new CoordinateBag();

			expect(instance).toBeInstanceOf(CoordinateBag);
			expect(instance.lastCoordinate).toBeNull();
			expect(instance.lineStringIndex).toBe(0);
			expect(instance.lineStrings).toEqual([[]]);

			expect(instance.subsegments).toEqual([[]]);
			expect(instance.subsegments).toEqual([[]]);
			expect(instance.segmentIndex).toBe(-1);
			expect(instance.segmentIndices).toEqual([]);

			expect(instance.polygons).toEqual({});
			expect(instance.worldIndex).toBe(0);
		});
	});
});
