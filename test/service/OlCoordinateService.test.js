/* eslint-disable no-undef */
import { CoordinateSimplificationTarget, OlCoordinateService } from '../../src/services/OlCoordinateService';
import { fromLonLat, toLonLat, transformExtent } from 'ol/proj';
import proj4 from 'proj4';
import { register } from 'ol/proj/proj4';
import { bvvStringifyFunction } from '../../src/services/provider/stringifyCoords.provider';
import { $injector } from '../../src/injection';
import { GlobalCoordinateRepresentations } from '../../src/domain/coordinateRepresentation';
import { PROFILE_GEOMETRY_SIMPLIFY_MAX_COUNT_COORDINATES } from '../../src/modules/olMap/utils/olGeometryUtils';

describe('CoordinateSimplificationTarget', () => {
	it('provides an enum of all available target types', () => {
		expect(Object.keys(CoordinateSimplificationTarget).length).toBe(1);
		expect(Object.isFrozen(CoordinateSimplificationTarget)).toBeTrue();
		expect(CoordinateSimplificationTarget.ELEVATION_PROFILE).toBe('elevationProfile');
	});
});

describe('OlCoordinateService', () => {
	const projectionServiceMock = {
		getProjections() {}
	};

	beforeAll(() => {
		proj4.defs('EPSG:25832', '+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +axis=neu');
		proj4.defs('EPSG:25833', '+proj=utm +zone=33 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +axis=neu');
		register(proj4);
		$injector.registerSingleton('ProjectionService', projectionServiceMock);
	});

	describe('constructor', () => {
		it('initializes the service', async () => {
			const stringifyCoordsProvider = jasmine.createSpy();

			const instanceUnderTest = new OlCoordinateService(stringifyCoordsProvider);

			expect(instanceUnderTest._stringifyFunction).toEqual(stringifyCoordsProvider);
		});

		it('initializes the service with default provider', async () => {
			const instanceUnderTest = new OlCoordinateService();
			expect(instanceUnderTest._stringifyFunction).toEqual(bvvStringifyFunction);
		});
	});

	describe('methods', () => {
		let instanceUnderTest;

		const setup = (stringifyCoordsProvider = () => {}) => {
			spyOn(projectionServiceMock, 'getProjections').and.returnValue([4326, 3857, 25832, 25833]);

			instanceUnderTest = new OlCoordinateService(stringifyCoordsProvider);
		};

		describe('transforms coordinates', () => {
			describe('with default projection', () => {
				it('from EPSG:4326 to EPSG:3857', () => {
					setup();
					const initialCooord4326 = [11.57245, 48.14021];
					const coord3857 = fromLonLat(initialCooord4326);

					const coord4326 = instanceUnderTest.toLonLat(coord3857);

					expect(coord4326[0]).toBeCloseTo(initialCooord4326[0], 3);
					expect(coord4326[1]).toBeCloseTo(initialCooord4326[1], 3);
				});

				it('from EPSG:3857 to EPSG:4326', () => {
					setup();
					const initialCooord3857 = [1288239.2412306187, 6130212.561641981];
					const coord4326 = toLonLat(initialCooord3857);

					const coord3857 = instanceUnderTest.fromLonLat(coord4326);

					expect(coord3857[0]).toBeCloseTo(initialCooord3857[0], 3);
					expect(coord3857[1]).toBeCloseTo(initialCooord3857[1], 3);
				});
			});

			describe('with custom projection', () => {
				it('from custom EPSG (here 25823) to custom EPSG (here 25833)', () => {
					setup();
					const coord25832 = [1288239.2412306187, 6130212.561641981];
					const coord25833 = instanceUnderTest.transform(coord25832, 25832, 25833);

					expect(coord25833.length).toBe(2);
					expect(coord25833).not.toEqual(coord25832);
				});

				it('throws an error when srid is not supported', () => {
					setup();
					const coord25832 = [1288239.2412306187, 6130212.561641981];

					expect(() => {
						instanceUnderTest.transform(coord25832, 25832, 25834);
					}).toThrowError(/Unsupported SRID: 25834/);
				});
			});
		});

		describe('transforms extents', () => {
			it('from EPSG:4326 to EPSG:3857', () => {
				setup();
				const initialExtent4326 = [11.57245, 48.14021, 11.67245, 48.24021];
				const extent3857 = transformExtent(initialExtent4326, 'EPSG:4326', 'EPSG:3857');

				const extent4326 = instanceUnderTest.toLonLatExtent(extent3857);

				expect(extent4326[0]).toBeCloseTo(initialExtent4326[0], 3);
				expect(extent4326[1]).toBeCloseTo(initialExtent4326[1], 3);
				expect(extent4326[2]).toBeCloseTo(initialExtent4326[2], 3);
				expect(extent4326[3]).toBeCloseTo(initialExtent4326[3], 3);
			});

			it('transforms from EPSG:3857 to EPSG:4326', () => {
				setup();
				const initialExtent3857 = [1288239.2412306187, 6130212.561641981, 1299371.190309946, 6146910.663709761];
				const extent4326 = transformExtent(initialExtent3857, 'EPSG:3857', 'EPSG:4326');

				const extent3857 = instanceUnderTest.fromLonLatExtent(extent4326);

				expect(extent3857[0]).toBeCloseTo(initialExtent3857[0], 3);
				expect(extent3857[1]).toBeCloseTo(initialExtent3857[1], 3);
				expect(extent3857[2]).toBeCloseTo(initialExtent3857[2], 3);
				expect(extent3857[3]).toBeCloseTo(initialExtent3857[3], 3);
			});

			describe('with custom projection', () => {
				it('from custom EPSG (here 25823) to custom EPSG (here 25833)', () => {
					setup();
					const extent25832 = [1288239.2412306187, 6130212.561641981, 1289239.2412306187, 6132212.561641981];
					const extent25833 = instanceUnderTest.transformExtent(extent25832, 25832, 25833);

					expect(extent25833.length).toBe(4);
					expect(extent25832).not.toEqual(extent25833);
				});

				it('throws an error when srid is not supported', () => {
					setup();
					const extent25832 = [1288239.2412306187, 6130212.561641981, 1289239.2412306187, 6132212.561641981];

					expect(() => {
						instanceUnderTest.transformExtent(extent25832, 25832, 25834);
					}).toThrowError(/Unsupported SRID: 25834/);
				});
			});
		});

		describe('stringifiy', () => {
			it('stringifies a coordinate', () => {
				const stringifyCoordProvider = jasmine.createSpy().and.callFake((coordinate, coordinateRepresentation, transformFn) => {
					transformFn(); /**Fake call of the transformFn */
					return '21, 42';
				});
				setup(stringifyCoordProvider);
				const transformMethodSpy = spyOn(instanceUnderTest, 'transform');
				const coord3857 = [11111, 22222];

				const string = instanceUnderTest.stringify(coord3857, GlobalCoordinateRepresentations.UTM, { digits: 2 });

				expect(string).toBe('21, 42');
				expect(stringifyCoordProvider).toHaveBeenCalledOnceWith(coord3857, GlobalCoordinateRepresentations.UTM, jasmine.any(Function), { digits: 2 });
				expect(transformMethodSpy).toHaveBeenCalled();
			});
		});

		describe('buffer', () => {
			it('increases an extent by the provided value', () => {
				setup();
				const extent = [10, 10, 20, 20];

				const buffededExtent = instanceUnderTest.buffer(extent, 10);

				expect(buffededExtent).toEqual([0, 0, 30, 30]);
			});
		});

		describe('containsCoordinate', () => {
			it('checks if the passed coordinate is contained or on the edge of the extent', () => {
				setup();
				const extent = [10, 10, 20, 20];

				expect(instanceUnderTest.containsCoordinate(extent, [10, 10])).toBeTrue();
				expect(instanceUnderTest.containsCoordinate(extent, [15, 15])).toBeTrue();
				expect(instanceUnderTest.containsCoordinate(extent, [9, 9])).toBeFalse();
			});
		});

		describe('simplify', () => {
			it('simplifies an array of coordinate', () => {
				setup();
				const coordinatesMaxCountExceeded = [];
				const coordinatesMaxCount = [];

				for (let index = 0; index <= PROFILE_GEOMETRY_SIMPLIFY_MAX_COUNT_COORDINATES; index++) {
					1;
					coordinatesMaxCountExceeded.push([0, index]);
				}
				for (let index = 0; index < PROFILE_GEOMETRY_SIMPLIFY_MAX_COUNT_COORDINATES; index++) {
					coordinatesMaxCount.push([0, index]);
				}

				expect(instanceUnderTest.simplify(coordinatesMaxCountExceeded, CoordinateSimplificationTarget.ELEVATION_PROFILE).length).toBe(2);
				expect(instanceUnderTest.simplify(coordinatesMaxCount, CoordinateSimplificationTarget.ELEVATION_PROFILE).length).toBe(
					PROFILE_GEOMETRY_SIMPLIFY_MAX_COUNT_COORDINATES
				);
				expect(() => instanceUnderTest.simplify({})).toThrowError('Cannot simplify coordinate, value is not a Coordinates type');
				expect(() => instanceUnderTest.simplify(undefined)).toThrowError('Cannot simplify coordinate, value is not a Coordinates type');
				expect(() => instanceUnderTest.simplify(null)).toThrowError('Cannot simplify coordinate, value is not a Coordinates type');
				expect(() => instanceUnderTest.simplify(1)).toThrowError('Cannot simplify coordinate, value is not a Coordinates type');
				expect(() => instanceUnderTest.simplify('1')).toThrowError('Cannot simplify coordinate, value is not a Coordinates type');
				expect(() => instanceUnderTest.simplify([1, 2])).toThrowError('Cannot simplify coordinate, value is not a Coordinates type');
				expect(() =>
					instanceUnderTest.simplify([
						[1, 2],
						[1, 2, 3]
					])
				).toThrowError('Cannot simplify coordinate, value is not a Coordinates type');
			});

			it('throws an error when target type is not supported', () => {
				setup();

				expect(() => {
					instanceUnderTest.simplify([], 'any unknown type');
				}).toThrowError(/Unsupported simplification type: any unknown type/);
			});
		});

		describe('toCoordinate', () => {
			it('converts a CoordinateLike to a Coordinate', () => {
				setup();

				expect(instanceUnderTest.toCoordinate([1, 2, 3])).toEqual([1, 2]);
				expect(instanceUnderTest.toCoordinate([1, 2])).toEqual([1, 2]);
				expect(
					instanceUnderTest.toCoordinate([
						[1, 2],
						[11, 22]
					])
				).toEqual([
					[1, 2],
					[11, 22]
				]);
				expect(
					instanceUnderTest.toCoordinate([
						[1, 2, 3],
						[11, 22, 33]
					])
				).toEqual([
					[1, 2],
					[11, 22]
				]);
				expect(() => instanceUnderTest.toCoordinate(['1', 2, 3])).toThrowError(
					'Cannot convert value to coordinate, value is not a CoordinateLike type'
				);
				expect(() => instanceUnderTest.toCoordinate({})).toThrowError('Cannot convert value to coordinate, value is not a CoordinateLike type');
				expect(() => instanceUnderTest.toCoordinate('foo')).toThrowError('Cannot convert value to coordinate, value is not a CoordinateLike type');
				expect(() => instanceUnderTest.toCoordinate([])).toThrowError('Cannot convert value to coordinate, value is not a CoordinateLike type');
				expect(() => instanceUnderTest.toCoordinate(1)).toThrowError('Cannot convert value to coordinate, value is not a CoordinateLike type');
				expect(() => instanceUnderTest.toCoordinate(undefined)).toThrowError(
					'Cannot convert value to coordinate, value is not a CoordinateLike type'
				);
				expect(() => instanceUnderTest.toCoordinate(null)).toThrowError('Cannot convert value to coordinate, value is not a CoordinateLike type');
			});
		});
	});
});
