import { GlobalCoordinateRepresentations } from '../../src/domain/coordinateRepresentation';

describe('CoordinateRepresentations', () => {
	it('provides an enum of all available types', () => {
		expect(Object.keys(GlobalCoordinateRepresentations).length).toBe(3);
		expect(GlobalCoordinateRepresentations.WGS84).toEqual({ label: 'WGS84', code: 4326, digits: 5, global: true, type: 'wgs84' });
		expect(GlobalCoordinateRepresentations.UTM).toEqual({ label: 'UTM', code: null, digits: 0, global: true, type: 'utm' });
		expect(GlobalCoordinateRepresentations.MGRS).toEqual({ label: 'MGRS', code: null, digits: 0, global: true, type: 'mgrs' });
	});
});
