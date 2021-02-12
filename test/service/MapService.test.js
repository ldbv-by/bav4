/* eslint-disable no-undef */
import { MapService } from '../../src/services/MapService';
import { $injector } from '../../src/injection';

describe('MapService', () => {


	const coordinateServiceMock = {
		toLonLatExtent() { }
	};

	beforeAll(() => {
		$injector
			.registerSingleton('CoordinateService', coordinateServiceMock);
	});

	const setup = () => {
		const definitionsProvider = () => {
			return {
				defaultExtent: [0, 1, 2, 3]
			};
		};
		return new MapService(definitionsProvider);
	};


	describe('provides an extent', () => {

		it('for 3857', () => {
			const instanceUnderTest = setup();

			expect(instanceUnderTest.getDefaultMapExtent()).toEqual([0, 1, 2, 3]);
		});

		it('for 4326', () => {
			const instanceUnderTest = setup();
			spyOn(coordinateServiceMock, 'toLonLatExtent').withArgs([0, 1, 2, 3]).and.returnValue([4, 5, 6, 7]);

			expect(instanceUnderTest.getDefaultMapExtent(4326)).toEqual([4, 5, 6, 7]);
		});

		it('throws an exception for an unsupporteed srid', () => {
			const instanceUnderTest = setup();

			expect(() => {
				instanceUnderTest.getDefaultMapExtent(21);
			})
				.toThrowError(/Unsupported SRID 21/);
		});
	});

	it('provides a default srid for the view', () => {
		const instanceUnderTest = setup();

		expect(instanceUnderTest.getDefaultSridForView()).toBe(4326);
	});

	it('provides the internal srid of the map', () => {
		const instanceUnderTest = setup();

		expect(instanceUnderTest.getSrid()).toBe(3857);
	});

	it('provides a srid for geodetic tasks', () => {
		const instanceUnderTest = setup();

		expect(instanceUnderTest.getDefaultGeodeticSrid()).toBe(25832);
	});
});

