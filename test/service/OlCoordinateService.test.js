/* eslint-disable no-undef */
import { OlCoordinateService } from '../../src/services/OlCoordinateService';
import { fromLonLat, toLonLat, transformExtent } from 'ol/proj';

describe('OlCoordinateService', () => {

	let instanceUnderTest;
	beforeEach(() => {
		instanceUnderTest = new OlCoordinateService();
	});

	describe('transforms coordinates', () => {

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

		it('from EPSG:3857 to EPSG:25832', () => {

			expect(() => instanceUnderTest.to25832([1288239.2412306187, 6130212.561641981])).toThrowError(/Not yet implemented/);
		});

		it('from EPSG:25832 to EPSG:3857', () => {

			expect(() => instanceUnderTest.from25832([676696, 5367913])).toThrowError(/Not yet implemented/);
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
			const initialExtent3857 =  [1288239.2412306187, 6130212.561641981, 1299371.190309946, 6146910.663709761];
			const extent4326 = transformExtent(initialExtent3857, 'EPSG:3857', 'EPSG:4326');

			const extent3857 = instanceUnderTest.fromLonLatExtent(extent4326);

			expect(extent3857[0]).toBeCloseTo(initialExtent3857[0], 3);
			expect(extent3857[1]).toBeCloseTo(initialExtent3857[1], 3);
			expect(extent3857[2]).toBeCloseTo(initialExtent3857[2], 3);
			expect(extent3857[3]).toBeCloseTo(initialExtent3857[3], 3);
		});
	});

	describe('stringifies', () => {

		it('lon/lat coordinates', () => {
			const initialCooord4326 = [11.57245, 48.14021];

			const string = instanceUnderTest.stringifyYX(initialCooord4326, 3);

			expect(string).toBe('11.572, 48.140');
		});
	});
});