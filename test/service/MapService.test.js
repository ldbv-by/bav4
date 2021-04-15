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
				defaultExtent: [0, 1, 2, 3],
				srid: 3857,
				defaultSridForView: 4326,
				sridDefinitionsForView: () => [{ label: 'WGS88', code: 4326 }, { label: 'Something', code: 9999 }],
				defaultGeodeticSrid: 9999
			};
		};
		return new MapService(definitionsProvider);
	};

	describe('constructor', () => {
		it('sets default providers', async () => {
			const service = new MapService();

			expect(service._definitions).toBeDefined();
		});
	});

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

	it('provides an array of srids for the view', () => {
		const instanceUnderTest = setup();

		expect(instanceUnderTest.getSridDefinitionsForView()).toEqual([{ label: 'WGS88', code: 4326 }, { label: 'Something', code: 9999 }]);
	});

	it('provides the internal srid of the map', () => {
		const instanceUnderTest = setup();

		expect(instanceUnderTest.getSrid()).toBe(3857);
	});

	it('provides a srid for geodetic tasks', () => {
		const instanceUnderTest = setup();

		expect(instanceUnderTest.getDefaultGeodeticSrid()).toBe(9999);
	});
});

