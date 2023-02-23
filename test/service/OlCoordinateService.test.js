/* eslint-disable no-undef */
import { OlCoordinateService } from '../../src/services/OlCoordinateService';
import { fromLonLat, toLonLat, transformExtent } from 'ol/proj';
import proj4 from 'proj4';
import { register } from 'ol/proj/proj4';
import { bvvStringifyFunction } from '../../src/services/provider/stringifyCoords.provider';
import { $injector } from '../../src/injection';

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

		beforeEach(() => {
			spyOn(projectionServiceMock, 'getProjections').and.returnValue([4326, 3857, 25832, 25833]);
			const stringifyCoordsProvider = () => {
				return (coordinate) => coordinate[0] + ', ' + coordinate[1];
			};

			instanceUnderTest = new OlCoordinateService(stringifyCoordsProvider);
		});

		describe('transforms coordinates', () => {
			describe('with default projection', () => {
				it('from EPSG:4326 to EPSG:3857', () => {
					const initialCooord4326 = [11.57245, 48.14021];
					const coord3857 = fromLonLat(initialCooord4326);

					const coord4326 = instanceUnderTest.toLonLat(coord3857);

					expect(coord4326[0]).toBeCloseTo(initialCooord4326[0], 3);
					expect(coord4326[1]).toBeCloseTo(initialCooord4326[1], 3);
				});

				it('from EPSG:3857 to EPSG:4326', () => {
					const initialCooord3857 = [1288239.2412306187, 6130212.561641981];
					const coord4326 = toLonLat(initialCooord3857);

					const coord3857 = instanceUnderTest.fromLonLat(coord4326);

					expect(coord3857[0]).toBeCloseTo(initialCooord3857[0], 3);
					expect(coord3857[1]).toBeCloseTo(initialCooord3857[1], 3);
				});
			});

			describe('with custom projection', () => {
				it('from custom EPSG (here 25823) to custom EPSG (here 25833)', () => {
					const coord25832 = [1288239.2412306187, 6130212.561641981];
					const coord25833 = instanceUnderTest.transform(coord25832, 25832, 25833);

					expect(coord25833.length).toBe(2);
					expect(coord25833).not.toEqual(coord25832);
				});

				it('throws an error when srid is not supported', () => {
					const coord25832 = [1288239.2412306187, 6130212.561641981];

					expect(() => {
						instanceUnderTest.transform(coord25832, 25832, 25834);
					}).toThrowError(/Unsupported SRID: 25834/);
				});
			});
		});

		describe('transforms extents', () => {
			it('from EPSG:4326 to EPSG:3857', () => {
				const initialExtent4326 = [11.57245, 48.14021, 11.67245, 48.24021];
				const extent3857 = transformExtent(initialExtent4326, 'EPSG:4326', 'EPSG:3857');

				const extent4326 = instanceUnderTest.toLonLatExtent(extent3857);

				expect(extent4326[0]).toBeCloseTo(initialExtent4326[0], 3);
				expect(extent4326[1]).toBeCloseTo(initialExtent4326[1], 3);
				expect(extent4326[2]).toBeCloseTo(initialExtent4326[2], 3);
				expect(extent4326[3]).toBeCloseTo(initialExtent4326[3], 3);
			});

			it('transforms from EPSG:3857 to EPSG:4326', () => {
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
					const extent25832 = [1288239.2412306187, 6130212.561641981, 1289239.2412306187, 6132212.561641981];
					const extent25833 = instanceUnderTest.transformExtent(extent25832, 25832, 25833);

					expect(extent25833.length).toBe(4);
					expect(extent25832).not.toEqual(extent25833);
				});

				it('throws an error when srid is not supported', () => {
					const extent25832 = [1288239.2412306187, 6130212.561641981, 1289239.2412306187, 6132212.561641981];

					expect(() => {
						instanceUnderTest.transformExtent(extent25832, 25832, 25834);
					}).toThrowError(/Unsupported SRID: 25834/);
				});
			});
		});

		describe('stringifiy', () => {
			it('stringifies with the default provider lon/lat coordinates', () => {
				const initialCooord4326 = [11.57245, 48.14021];

				const string = instanceUnderTest.stringify(initialCooord4326, 4326, 3);

				expect(string).toBe('11.57245, 48.14021');
			});
		});

		describe('buffer', () => {
			it('increases an extent by the provided value', () => {
				const extent = [10, 10, 20, 20];

				const buffededExtent = instanceUnderTest.buffer(extent, 10);

				expect(buffededExtent).toEqual([0, 0, 30, 30]);
			});
		});
	});
});
