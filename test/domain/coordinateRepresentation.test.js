import { CoordinateRepresentations } from '../../src/domain/coordinateRepresentation';

describe('CoordinateRepresentations', () => {
	it('provides an enum of all available types', () => {
		expect(Object.keys(CoordinateRepresentations).length).toBe(3);
		expect(CoordinateRepresentations.WGS84).toEqual({ label: 'WGS84', code: 4326, digits: 5, global: true, type: 'wgs84' });
		expect(CoordinateRepresentations.UTM).toEqual({ label: 'UTM', code: null, digits: 0, global: true, type: 'utm' });
		expect(CoordinateRepresentations.MGRS).toEqual({ label: 'MGRS', code: null, digits: 0, global: true, type: 'mgrs' });
	});
});
