import { BvvCoordinateRepresentations, GlobalCoordinateRepresentations } from '../../../src/domain/coordinateRepresentation';
import { bvvStringifyFunction } from '../../../src/services/provider/stringifyCoords.provider';

describe('StringifyCoord provider', () => {
	describe('BVV specific provider', () => {
		const coordinateService = {
			transform() {}
		};
		describe('for global GlobalCoordinateRepresentations', () => {
			it('stringifies a coordinate for WGS84', () => {
				const coord3857 = [10000, 20000];
				const coord4326 = [11.572457, 48.140212, 0];
				const transformFn = jasmine.createSpy().withArgs(coord3857, 3857, 4326).and.returnValue(coord4326);

				expect(bvvStringifyFunction(coord3857, GlobalCoordinateRepresentations.WGS84, transformFn, { digits: 3 })).toBe('48.140, 11.572');
				expect(bvvStringifyFunction(coord3857, GlobalCoordinateRepresentations.WGS84, transformFn)).toBe('48.14021, 11.57246');
				expect(bvvStringifyFunction(coord3857, GlobalCoordinateRepresentations.SphericalMercator, transformFn)).toBe('10000.000000, 20000.000000');
			});

			it('stringifies a coordinate for SphericalMercator', () => {
				const coord3857 = [10000, 20000];
				const coord4326 = [0, 0, 0];
				const transformFn = jasmine.createSpy().withArgs(coord3857, 3857, 4326).and.returnValue(coord4326);

				expect(bvvStringifyFunction(coord3857, GlobalCoordinateRepresentations.SphericalMercator, transformFn)).toBe('10000.000000, 20000.000000');
			});

			it('stringifies a coordinate for UTM', () => {
				const coord3857 = [10000, 20000];
				const coord4326 = [0, 0, 0];
				const transformFn = jasmine.createSpy().withArgs(coord3857, 3857, 4326).and.returnValue(coord4326);

				expect(bvvStringifyFunction(coord3857, GlobalCoordinateRepresentations.UTM, transformFn)).toBe('31N 166021 0');
			});

			it('stringifies a coordinate for MGRS', () => {
				const coord3857 = [10000, 20000];
				const coord4326 = [0, 0, 0];
				const transformFn = jasmine.createSpy().withArgs(coord3857, 3857, 4326).and.returnValue(coord4326);

				expect(bvvStringifyFunction(coord3857, GlobalCoordinateRepresentations.MGRS, transformFn)).toBe('31NAA6602100000');
			});
		});

		describe('for local projected GlobalCoordinateRepresentations', () => {
			it('stringifies a coordinate for 25832 zone U', () => {
				const coord3857 = [10000, 20000];
				spyOn(coordinateService, 'transform').and.returnValue([9.94835, 50.0021]);
				const transformFn = jasmine.createSpy().and.callFake((coordinate, sourceSrid, targetSrid) => {
					switch (targetSrid) {
						case 25832:
							return [567962, 5539295];
						case 4326:
							return [9.94835, 50.0021];
					}
				});

				expect(bvvStringifyFunction(coord3857, BvvCoordinateRepresentations.UTM32, transformFn)).toBe('32U 567962, 5539295');
				expect(bvvStringifyFunction(coord3857, BvvCoordinateRepresentations.UTM32, transformFn, { digits: 3 })).toBe('32U 567962.000, 5539295.000');
			});

			it('stringifies a coordinate for 25832 zone T', () => {
				const coord3857 = [10000, 20000];
				spyOn(coordinateService, 'transform').and.returnValue([9.94835, 50.0021]);
				const transformFn = jasmine.createSpy().and.callFake((coordinate, sourceSrid, targetSrid) => {
					switch (targetSrid) {
						case 25832:
							return [604250, 5294651];
						case 4326:
							return [10.3921, 47.79677];
					}
				});

				expect(bvvStringifyFunction(coord3857, BvvCoordinateRepresentations.UTM32, transformFn)).toBe('32T 604250, 5294651');
				expect(bvvStringifyFunction(coord3857, BvvCoordinateRepresentations.UTM32, transformFn, { digits: 3 })).toBe('32T 604250.000, 5294651.000');
			});

			it('stringifies a coordinate for 25833 zone U', () => {
				const coord3857 = [10000, 20000];
				spyOn(coordinateService, 'transform').and.returnValue([9.94835, 50.0021]);
				const transformFn = jasmine.createSpy().and.callFake((coordinate, sourceSrid, targetSrid) => {
					switch (targetSrid) {
						case 25833:
							return [290052, 5531414];
						case 4326:
							return [12.07646, 49.89823];
					}
				});

				expect(bvvStringifyFunction(coord3857, BvvCoordinateRepresentations.UTM33, transformFn)).toBe('33U 290052, 5531414');
				expect(bvvStringifyFunction(coord3857, BvvCoordinateRepresentations.UTM33, transformFn, { digits: 3 })).toBe('33U 290052.000, 5531414.000');
			});

			it('stringifies a coordinate for 25833 zone T', () => {
				const coord3857 = [10000, 20000];
				spyOn(coordinateService, 'transform').and.returnValue([9.94835, 50.0021]);
				const transformFn = jasmine.createSpy().and.callFake((coordinate, sourceSrid, targetSrid) => {
					switch (targetSrid) {
						case 25833:
							return [327250, 5305507];
						case 4326:
							return [12.68948, 47.87963];
					}
				});

				expect(bvvStringifyFunction(coord3857, BvvCoordinateRepresentations.UTM33, transformFn)).toBe('33T 327250, 5305507');
				expect(bvvStringifyFunction(coord3857, BvvCoordinateRepresentations.UTM33, transformFn, { digits: 3 })).toBe('33T 327250.000, 5305507.000');
			});

			it('stringifies a coordinate for 25833 with a latitude value > 54°', () => {
				const coord3857 = [10000, 20000];
				spyOn(coordinateService, 'transform').and.returnValue([9.94835, 50.0021]);
				const transformFn = jasmine.createSpy().and.callFake((coordinate, sourceSrid, targetSrid) => {
					switch (targetSrid) {
						case 25833:
							return [327250, 5305507];
						case 4326:
							return [12.68948, 54.87963];
					}
				});

				expect(bvvStringifyFunction(coord3857, BvvCoordinateRepresentations.UTM33, transformFn)).toBe('33 327250, 5305507');
				expect(bvvStringifyFunction(coord3857, BvvCoordinateRepresentations.UTM33, transformFn, { digits: 3 })).toBe('33 327250.000, 5305507.000');
			});

			it('stringifies a 25833 coordinate with a latitude value < 42°', () => {
				const coord3857 = [10000, 20000];
				spyOn(coordinateService, 'transform').and.returnValue([9.94835, 50.0021]);
				const transformFn = jasmine.createSpy().and.callFake((coordinate, sourceSrid, targetSrid) => {
					switch (targetSrid) {
						case 25833:
							return [327250, 5305507];
						case 4326:
							return [12.68948, 41.87963];
					}
				});

				expect(bvvStringifyFunction(coord3857, BvvCoordinateRepresentations.UTM33, transformFn)).toBe('33 327250, 5305507');
				expect(bvvStringifyFunction(coord3857, BvvCoordinateRepresentations.UTM33, transformFn, { digits: 3 })).toBe('33 327250.000, 5305507.000');
			});
		});
	});
});
