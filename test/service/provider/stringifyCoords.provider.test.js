import { $injector } from '../../../src/injection';
import { defaultStringifyFunction, bvvStringifyFunction } from '../../../src/services/provider/stringifyCoords.provider';

describe('StringifyCoord provider', () => {

	describe('default provider', () => {

		it('stringifies a 4326 coordinate', () => {

			const coord4326 = [11.57245, 48.14021];

			const formatedString = defaultStringifyFunction(4326)(coord4326, { digits: 3 });

			expect(formatedString).toBe('48.140, 11.572');
		});

		it('stringifies a coordinate', () => {

			const coord = [1234.5678, 9876.54321];
			const srid = 1234;
			const formatedString = defaultStringifyFunction(srid)(coord, { digits: 3 });

			expect(formatedString).toBe('1234.568, 9876.543');
		});
	});
	describe('BVV specific provider', () => {

		const coordinateService = {
			transform() { }
		};

		beforeAll(() => {
			$injector
				.registerSingleton('CoordinateService', coordinateService);
		});

		it('stringifies a 4326 coordinate', () => {

			const coord4326 = [11.57245, 48.14021];

			const formatedString = bvvStringifyFunction(4326)(coord4326, { digits: 3 });

			expect(formatedString).toBe('48.140, 11.572');
		});


		it('stringifies a 25832 zone U coordinate', () => {

			spyOn(coordinateService, 'transform').and.returnValue([9.94835, 50.00210]);
			const coord25832 = [567962, 5539295];
			const formatedString = bvvStringifyFunction(25832)(coord25832);

			expect(formatedString).toBe('32U 567962, 5539295');
		});

		it('stringifies a 25832 zone T coordinate', () => {

			spyOn(coordinateService, 'transform').and.returnValue([10.39210, 47.79677]);
			const coord25832 = [604250, 5294651];
			const formatedString = bvvStringifyFunction(25832)(coord25832);

			expect(formatedString).toBe('32T 604250, 5294651');
		});

		it('stringifies a 25833 zone U coordinate', () => {

			spyOn(coordinateService, 'transform').and.returnValue([12.07646, 49.89823]);
			const coord25832 = [290052, 5531414];
			const formatedString = bvvStringifyFunction(25833)(coord25832);

			expect(formatedString).toBe('33U 290052, 5531414');
		});

		it('stringifies a 25833 zone T coordinate', () => {

			spyOn(coordinateService, 'transform').and.returnValue([12.68948, 47.87963]);
			const coord25832 = [327250, 5305507];
			const formatedString = bvvStringifyFunction(25833)(coord25832);

			expect(formatedString).toBe('33T 327250, 5305507');
		});

		it('stringifies a 25833 coordinate with a latitude value > 54°', () => {

			spyOn(coordinateService, 'transform').and.returnValue([12.68948, 54.87963]);
			const coord25832 = [327250, 5305507];
			const formatedString = bvvStringifyFunction(25833)(coord25832);

			expect(formatedString).toBe('33 327250, 5305507');
		});

		it('stringifies a 25833 coordinate with a latitude value < 42°', () => {

			spyOn(coordinateService, 'transform').and.returnValue([12.68948, 41.87963]);
			const coord25832 = [327250, 5305507];
			const formatedString = bvvStringifyFunction(25833)(coord25832);

			expect(formatedString).toBe('33 327250, 5305507');
		});
	});
});
