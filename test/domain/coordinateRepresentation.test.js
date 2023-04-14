import { BvvCoordinateRepresentations, GlobalCoordinateRepresentations } from '../../src/domain/coordinateRepresentation';

describe('GlobalCoordinateRepresentations', () => {
	it('provides an enum of all available types', () => {
		expect(Object.keys(GlobalCoordinateRepresentations).length).toBe(3);
		expect(GlobalCoordinateRepresentations.WGS84).toEqual({ label: 'WGS84', code: 4326, digits: 5, global: true, group: 'wgs84' });
		expect(GlobalCoordinateRepresentations.UTM).toEqual({ label: 'UTM', code: null, digits: 0, global: true, group: 'utm' });
		expect(GlobalCoordinateRepresentations.MGRS).toEqual({ label: 'MGRS', code: null, digits: 0, global: true, group: 'mgrs' });
	});
});

describe('BvvCoordinateRepresentations', () => {
	it('provides an enum of all available types', () => {
		expect(Object.keys(BvvCoordinateRepresentations).length).toBe(2);
		expect(BvvCoordinateRepresentations.UTM32).toEqual({ label: 'UTM32', code: 25832, digits: 0, global: false, group: 'utm' });
		expect(BvvCoordinateRepresentations.UTM33).toEqual({ label: 'UTM33', code: 25833, digits: 0, global: false, group: 'utm' });
	});
});
