import { CoordinateBag } from '../../../../src/modules/olMap/ol/geodesic/coordinateBag';

describe('CoordinateBag', () => {
	describe('constructor', () => {
		it('initializes an instance with correct parameters', () => {
			const instance = new CoordinateBag();

			expect(instance).toBeInstanceOf(CoordinateBag);
			expect(instance.lastCoordinate).toBeNull();
		});
	});
});
