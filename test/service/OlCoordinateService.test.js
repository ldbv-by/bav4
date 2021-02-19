/* eslint-disable no-undef */
import { OlCoordinateService } from '../../src/services/OlCoordinateService';
import { fromLonLat, toLonLat, transformExtent } from 'ol/proj';
import proj4 from 'proj4';
import { register } from 'ol/proj/proj4';

describe('OlCoordinateService', () => {

	let instanceUnderTest;
	beforeEach(() => {
		const proj4Provider = () => {
			proj4.defs('EPSG:25832', '+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +axis=neu');
			proj4.defs('EPSG:25833', '+proj=utm +zone=33 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +axis=neu');
			register(proj4);
		};

		const stringifyCoordsProvider = () => {
			return coordinate => coordinate[0] + ', ' + coordinate[1];
		};

		instanceUnderTest = new OlCoordinateService(proj4Provider, stringifyCoordsProvider);
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
				})
					.toThrowError(/Unsupported SRID: 25834/);
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
	});

	describe('stringifiy', () => {

		it('stringifies with the default provider lon/lat coordinates', () => {
			const initialCooord4326 = [11.57245, 48.14021];

			const string = instanceUnderTest.stringify(initialCooord4326, 4326, 3);

			expect(string).toBe('11.57245, 48.14021');
		});
	});
});