import { CoordinateRepresentations } from '../../../src/domain/coordinateRepresentation';
import { bvvStringifyFunction } from '../../../src/services/provider/stringifyCoords.provider';

describe('StringifyCoord provider', () => {
	describe('BVV specific provider', () => {
		const coordinateService = {
			transform() {}
		};
		describe('for global CoordinateRepresentations', () => {
			it('stringifies a coordinate for WGS84', () => {
				const coord3857 = [10000, 20000];
				const coord4326 = [11.572457, 48.140212, 0];
				const transformFn = jasmine.createSpy().withArgs(coord3857, 3857, 4326).and.returnValue(coord4326);

				expect(bvvStringifyFunction(coord3857, CoordinateRepresentations.WGS84, transformFn, { digits: 3 })).toBe('48.140, 11.572');
				expect(bvvStringifyFunction(coord3857, CoordinateRepresentations.WGS84, transformFn)).toBe('48.14021, 11.57246');
			});

			it('stringifies a coordinate for MGRS', () => {
				const coord3857 = [10000, 20000];
				const coord4326 = [11.572457, 48.140212, 0];
				const transformFn = jasmine.createSpy().withArgs(coord3857, 3857, 4326).and.returnValue(coord4326);

				expect(bvvStringifyFunction(coord3857, CoordinateRepresentations.MGRS, transformFn, { digits: 3 })).toBe('pending support for global MGRS');
			});
		});

		describe('for local projected CoordinateRepresentations', () => {
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

				expect(bvvStringifyFunction(coord3857, { label: 'UTM32', code: 25832, digits: 0, global: false, type: 'utm' }, transformFn)).toBe(
					'32U 567962, 5539295'
				);
				expect(
					bvvStringifyFunction(coord3857, { label: 'UTM32', code: 25832, digits: 0, global: false, type: 'utm' }, transformFn, { digits: 3 })
				).toBe('32U 567962.000, 5539295.000');
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

				expect(bvvStringifyFunction(coord3857, { label: 'UTM32', code: 25832, digits: 0, global: false, type: 'utm' }, transformFn)).toBe(
					'32T 604250, 5294651'
				);
				expect(
					bvvStringifyFunction(coord3857, { label: 'UTM32', code: 25832, digits: 0, global: false, type: 'utm' }, transformFn, { digits: 3 })
				).toBe('32T 604250.000, 5294651.000');
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

				expect(bvvStringifyFunction(coord3857, { label: 'UTM33', code: 25833, digits: 0, global: false, type: 'utm' }, transformFn)).toBe(
					'33U 290052, 5531414'
				);
				expect(
					bvvStringifyFunction(coord3857, { label: 'UTM33', code: 25833, digits: 0, global: false, type: 'utm' }, transformFn, { digits: 3 })
				).toBe('33U 290052.000, 5531414.000');
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

				expect(bvvStringifyFunction(coord3857, { label: 'UTM33', code: 25833, digits: 0, global: false, type: 'utm' }, transformFn)).toBe(
					'33T 327250, 5305507'
				);
				expect(
					bvvStringifyFunction(coord3857, { label: 'UTM33', code: 25833, digits: 0, global: false, type: 'utm' }, transformFn, { digits: 3 })
				).toBe('33T 327250.000, 5305507.000');
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

				expect(bvvStringifyFunction(coord3857, { label: 'UTM33', code: 25833, digits: 0, global: false, type: 'utm' }, transformFn)).toBe(
					'33 327250, 5305507'
				);
				expect(
					bvvStringifyFunction(coord3857, { label: 'UTM33', code: 25833, digits: 0, global: false, type: 'utm' }, transformFn, { digits: 3 })
				).toBe('33 327250.000, 5305507.000');
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

				expect(bvvStringifyFunction(coord3857, { label: 'UTM33', code: 25833, digits: 0, global: false, type: 'utm' }, transformFn)).toBe(
					'33 327250, 5305507'
				);
				expect(
					bvvStringifyFunction(coord3857, { label: 'UTM33', code: 25833, digits: 0, global: false, type: 'utm' }, transformFn, { digits: 3 })
				).toBe('33 327250.000, 5305507.000');
			});
		});
	});
});
