/* eslint-disable no-undef */
import { OlCoordinateService } from '../../src/services/OlCoordinateService';
import { fromLonLat, toLonLat } from 'ol/proj';



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

	});

	describe('stringifies', () => {


		it('lon/lat coordinates', () => {
			const initialCooord4326 = [11.57245, 48.14021];

			const string = instanceUnderTest.stringifyYX(initialCooord4326, 3);

			expect(string).toBe('11.572, 48.140');

		});


	});
});